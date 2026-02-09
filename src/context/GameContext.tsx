import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Player, Question, GameState, GameSettings, GameStatus, RoundResult, AgeGroup } from '../types';
import { createDefaultGameState, createDefaultPlayer } from '../types';
import { calculatePoints, adjustDifficulty } from '../utils/scoring';
import { generateQuestion, getFallbackQuestion } from '../services/gemini';
import { generateRoomCode } from '../utils/roomCode';
import * as db from '../services/supabase';

// --- Action types ---
type GameAction =
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME'; payload: GameState }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; updates: Partial<Player> } }
  | { type: 'SET_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'SET_STATUS'; payload: GameStatus }
  | { type: 'SET_QUESTION'; payload: Question }
  | { type: 'RECORD_RESULT'; payload: RoundResult }
  | { type: 'NEXT_TURN' }
  | { type: 'SET_TURN_AND_QUESTION'; payload: { turnIndex: number; round: number; question: Question } }
  | { type: 'PREPARE_NEXT_TURN'; payload: { turnIndex: number; round: number } }
  | { type: 'SET_ROUND'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MY_PLAYER_ID'; payload: string };

interface ContextState {
  game: GameState;
  myPlayerId: string | null;
  isLoading: boolean;
  error: string | null;
}

function gameReducer(state: ContextState, action: GameAction): ContextState {
  switch (action.type) {
    case 'RESET_GAME':
      return { ...state, game: createDefaultGameState(), myPlayerId: null, error: null };

    case 'SET_GAME':
      return { ...state, game: action.payload };

    case 'ADD_PLAYER': {
      const existingIds = new Set(state.game.players.map(p => p.id));
      if (existingIds.has(action.payload.id)) return state;
      return {
        ...state,
        game: { ...state.game, players: [...state.game.players, action.payload] },
      };
    }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        game: {
          ...state.game,
          players: state.game.players.filter((p) => p.id !== action.payload),
        },
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        game: {
          ...state.game,
          players: state.game.players.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p,
          ),
        },
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        game: {
          ...state.game,
          settings: { ...state.game.settings, ...action.payload },
        },
      };

    case 'SET_STATUS':
      return { ...state, game: { ...state.game, status: action.payload } };

    case 'SET_QUESTION':
      return {
        ...state,
        game: {
          ...state.game,
          currentQuestion: action.payload,
          questionHistory: [...state.game.questionHistory, action.payload.text],
        },
      };

    case 'RECORD_RESULT':
      return {
        ...state,
        game: {
          ...state.game,
          roundResults: [...state.game.roundResults, action.payload],
        },
      };

    // Local mode: advance to next player (clears question)
    case 'NEXT_TURN': {
      const nextIndex = (state.game.currentPlayerTurnIndex + 1) % state.game.players.length;
      const isNewRound = nextIndex === 0;
      return {
        ...state,
        game: {
          ...state.game,
          currentPlayerTurnIndex: nextIndex,
          currentRound: isNewRound ? state.game.currentRound + 1 : state.game.currentRound,
          currentQuestion: null,
        },
      };
    }

    // Online mode: atomic turn + question (received from host broadcast)
    // Eliminates the window where turn changed but question is null
    case 'SET_TURN_AND_QUESTION':
      return {
        ...state,
        game: {
          ...state.game,
          currentPlayerTurnIndex: action.payload.turnIndex,
          currentRound: action.payload.round,
          currentQuestion: action.payload.question,
          questionHistory: [...state.game.questionHistory, action.payload.question.text],
        },
      };

    // Online mode: turn is advancing, waiting for host to generate question
    case 'PREPARE_NEXT_TURN':
      return {
        ...state,
        game: {
          ...state.game,
          currentPlayerTurnIndex: action.payload.turnIndex,
          currentRound: action.payload.round,
          currentQuestion: null,
        },
      };

    case 'SET_ROUND':
      return { ...state, game: { ...state.game, currentRound: action.payload } };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_MY_PLAYER_ID':
      return { ...state, myPlayerId: action.payload };

    default:
      return state;
  }
}

// --- Context ---
interface GameContextValue {
  state: ContextState;
  actions: {
    createGame: (playerData: { name: string; age: AgeGroup; avatarEmoji: string }, settings: GameSettings) => Promise<string>;
    joinGame: (roomCode: string, playerData: { name: string; age: AgeGroup; avatarEmoji: string }) => Promise<void>;
    addLocalPlayer: (playerData: { name: string; age: AgeGroup; avatarEmoji: string }) => void;
    removePlayer: (playerId: string) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    setReady: (ready: boolean) => void;
    startGame: () => void;
    loadQuestion: (overrides?: { turnIndex: number; round: number }) => Promise<void>;
    submitAnswer: (answer: string, timeElapsed: number) => { isCorrect: boolean; points: number; multiplier: number; correctAnswer: string; explanation: string };
    nextTurn: () => void;
    endGame: () => void;
    resetGame: () => void;
    getCurrentPlayer: () => Player | undefined;
    isGameOver: () => boolean;
    isHost: () => boolean;
  };
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    game: createDefaultGameState(),
    myPlayerId: null,
    isLoading: false,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Ref for loadQuestion so the broadcast handler can call it without circular deps
  const loadQuestionRef = useRef<(overrides?: { turnIndex: number; round: number }) => Promise<void>>(undefined);

  const amIHost = useCallback(() => {
    return state.myPlayerId === state.game.hostId;
  }, [state.myPlayerId, state.game.hostId]);

  // =============================================
  // BROADCAST-ONLY realtime callbacks
  // No more postgres_changes for games or player updates during gameplay.
  // Only postgres_changes INSERT on players (lobby backup).
  // =============================================
  const setupRealtimeCallbacks = useCallback(() => ({
    onPlayerInsert: (payload: Record<string, unknown>) => {
      const s = stateRef.current;
      // Only process player inserts during lobby
      if (s.game.status !== 'lobby') return;

      const newPlayer = createDefaultPlayer({
        id: payload.id as string,
        name: payload.name as string,
        age: payload.age as AgeGroup,
        avatarEmoji: payload.avatar_emoji as string,
        difficulty: payload.difficulty as number,
        isHost: payload.is_host as boolean || false,
      });
      dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    },

    onBroadcast: (eventType: string, payload: Record<string, unknown>) => {
      const s = stateRef.current;
      const isSelf = payload.senderId === s.myPlayerId;

      console.log('[Broadcast]', eventType, isSelf ? '(self, skip)' : '', payload);

      // Skip broadcasts we sent ourselves — we already applied the state locally
      if (isSelf) return;

      switch (eventType) {
        case 'game_start':
          dispatch({ type: 'SET_STATUS', payload: 'playing' });
          dispatch({
            type: 'PREPARE_NEXT_TURN',
            payload: { turnIndex: payload.turnIndex as number, round: payload.round as number },
          });
          break;

        case 'question':
          dispatch({
            type: 'SET_TURN_AND_QUESTION',
            payload: {
              turnIndex: payload.turnIndex as number,
              round: payload.round as number,
              question: payload.question as unknown as Question,
            },
          });
          break;

        case 'answer': {
          // Record the result
          dispatch({
            type: 'RECORD_RESULT',
            payload: {
              playerId: payload.playerId as string,
              round: payload.round as number,
              questionId: payload.questionId as string,
              answer: payload.answer as string,
              isCorrect: payload.isCorrect as boolean,
              timeElapsed: (payload.timeElapsed as number) || 0,
              pointsEarned: payload.points as number,
            },
          });
          // Update the player's score/streak from the broadcast
          dispatch({
            type: 'UPDATE_PLAYER',
            payload: {
              id: payload.playerId as string,
              updates: {
                score: payload.newScore as number,
                streak: payload.streak as number,
                correctAnswers: payload.correctAnswers as number,
                totalAnswers: payload.totalAnswers as number,
                lives: payload.lives as number,
              },
            },
          });
          break;
        }

        case 'advance_turn': {
          const nextTurnIndex = payload.nextTurnIndex as number;
          const nextRound = payload.nextRound as number;
          const amHost = s.myPlayerId === s.game.hostId;
          console.log(`[Broadcast] advance_turn: nextTurn=${nextTurnIndex} nextRound=${nextRound} amHost=${amHost}`);
          dispatch({
            type: 'PREPARE_NEXT_TURN',
            payload: { turnIndex: nextTurnIndex, round: nextRound },
          });
          // If I'm the host, generate the next question — pass turn info explicitly
          // (stateRef may not have flushed the PREPARE_NEXT_TURN dispatch yet)
          if (amHost) {
            console.log(`[Broadcast] advance_turn: HOST will generate question in 100ms`);
            setTimeout(() => {
              loadQuestionRef.current?.({ turnIndex: nextTurnIndex, round: nextRound });
            }, 100);
          }
          break;
        }

        case 'game_over':
          dispatch({ type: 'SET_STATUS', payload: 'finished' });
          break;

        case 'player_ready':
          dispatch({
            type: 'UPDATE_PLAYER',
            payload: {
              id: payload.playerId as string,
              updates: { isReady: payload.isReady as boolean },
            },
          });
          break;

        default:
          console.warn('[Broadcast] Unknown event type:', eventType);
      }
    },
  }), []);

  const createGame = useCallback(async (
    playerData: { name: string; age: AgeGroup; avatarEmoji: string },
    settings: GameSettings,
  ): Promise<string> => {
    const gameId = uuidv4();
    const playerId = uuidv4();
    const roomCode = settings.mode === 'online' ? generateRoomCode() : null;

    const hostPlayer = createDefaultPlayer({
      id: playerId,
      name: playerData.name,
      age: playerData.age,
      avatarEmoji: playerData.avatarEmoji,
      difficulty: settings.defaultDifficulty,
      isHost: true,
      isReady: true,
    });

    const gameState: GameState = {
      ...createDefaultGameState(),
      id: gameId,
      roomCode,
      hostId: playerId,
      settings,
      players: [hostPlayer],
    };

    dispatch({ type: 'SET_GAME', payload: gameState });
    dispatch({ type: 'SET_MY_PLAYER_ID', payload: playerId });

    if (settings.mode === 'online' && roomCode) {
      try {
        const dbGame = await db.createGame({
          room_code: roomCode,
          host_id: playerId,
          settings: settings as unknown as object,
        });

        await db.addPlayer({
          game_id: dbGame.id,
          name: playerData.name,
          age: playerData.age,
          avatar_emoji: playerData.avatarEmoji,
          difficulty: settings.defaultDifficulty,
          is_host: true,
        });

        const callbacks = setupRealtimeCallbacks();
        channelRef.current = db.subscribeToGame(roomCode, dbGame.id, callbacks);

        dispatch({ type: 'SET_GAME', payload: { ...gameState, id: dbGame.id } });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      }
    }

    return playerId;
  }, [setupRealtimeCallbacks]);

  const joinGame = useCallback(async (
    roomCode: string,
    playerData: { name: string; age: AgeGroup; avatarEmoji: string },
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const game = await db.getGameByRoomCode(roomCode);
      const dbPlayer = await db.addPlayer({
        game_id: game.id,
        name: playerData.name,
        age: playerData.age,
        avatar_emoji: playerData.avatarEmoji,
        difficulty: 5,
      });

      const players = await db.getPlayersForGame(game.id);
      const mappedPlayers: Player[] = players.map((p: Record<string, unknown>) =>
        createDefaultPlayer({
          id: p.id as string,
          name: p.name as string,
          age: p.age as AgeGroup,
          avatarEmoji: p.avatar_emoji as string,
          difficulty: p.difficulty as number,
          isHost: p.is_host as boolean,
          isReady: p.is_ready as boolean,
          score: p.score as number,
        }),
      );

      const gameState: GameState = {
        id: game.id,
        roomCode: game.room_code,
        hostId: game.host_id,
        status: game.status,
        settings: game.settings as GameSettings,
        players: mappedPlayers,
        currentRound: game.current_round || 1,
        currentPlayerTurnIndex: 0,
        currentQuestion: game.current_question as Question | null,
        questionHistory: [],
        roundResults: [],
      };

      dispatch({ type: 'SET_GAME', payload: gameState });
      dispatch({ type: 'SET_MY_PLAYER_ID', payload: dbPlayer.id });

      const callbacks = setupRealtimeCallbacks();
      channelRef.current = db.subscribeToGame(roomCode, game.id, callbacks);

      if (channelRef.current) {
        db.broadcastPlayerJoined(channelRef.current, {
          id: dbPlayer.id,
          name: playerData.name,
          age: playerData.age,
          avatar_emoji: playerData.avatarEmoji,
          difficulty: 5,
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setupRealtimeCallbacks]);

  const addLocalPlayer = useCallback((playerData: { name: string; age: AgeGroup; avatarEmoji: string }) => {
    const player = createDefaultPlayer({
      id: uuidv4(),
      name: playerData.name,
      age: playerData.age,
      avatarEmoji: playerData.avatarEmoji,
      difficulty: state.game.settings.defaultDifficulty,
    });
    dispatch({ type: 'ADD_PLAYER', payload: player });
  }, [state.game.settings.defaultDifficulty]);

  const removePlayer = useCallback((playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  }, []);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  }, []);

  const setReady = useCallback((ready: boolean) => {
    const s = stateRef.current;
    if (!s.myPlayerId) return;

    dispatch({ type: 'UPDATE_PLAYER', payload: { id: s.myPlayerId, updates: { isReady: ready } } });

    if (s.game.settings.mode === 'online') {
      // Broadcast ready state to all clients
      if (channelRef.current) {
        db.broadcastGameEvent(channelRef.current, 'player_ready', {
          senderId: s.myPlayerId,
          playerId: s.myPlayerId,
          isReady: ready,
        });
      }
      // DB write for persistence
      db.updatePlayer(s.myPlayerId, { is_ready: ready }).catch(() => {});
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;

    // Local dispatches
    dispatch({ type: 'SET_STATUS', payload: 'playing' });
    dispatch({ type: 'SET_ROUND', payload: 1 });
    dispatch({ type: 'PREPARE_NEXT_TURN', payload: { turnIndex: 0, round: 1 } });

    if (s.game.settings.mode === 'online') {
      // Broadcast to all clients
      if (channelRef.current) {
        db.broadcastGameEvent(channelRef.current, 'game_start', {
          senderId: s.myPlayerId,
          turnIndex: 0,
          round: 1,
        });
      }
      // DB write (persistence only, fire-and-forget)
      db.updateGame(s.game.id, {
        status: 'playing',
        current_round: 1,
      }).catch(() => {});

      // Host generates the first question immediately
      setTimeout(() => {
        loadQuestionRef.current?.({ turnIndex: 0, round: 1 });
      }, 100);
    }
  }, []);

  // loadQuestion: ONLY the host generates questions in online mode.
  // Non-host clients receive questions via the 'question' broadcast.
  // `overrides` allows callers to pass the correct turnIndex/round explicitly,
  // avoiding stale stateRef reads after dispatches haven't flushed yet.
  const loadQuestion = useCallback(async (overrides?: { turnIndex: number; round: number }) => {
    const s = stateRef.current;
    const isOnline = s.game.settings.mode === 'online';
    const iAmHost = s.myPlayerId === s.game.hostId;
    console.log(`[loadQuestion] called: isOnline=${isOnline} iAmHost=${iAmHost} overrides=${JSON.stringify(overrides)} stateTurn=${s.game.currentPlayerTurnIndex} stateRound=${s.game.currentRound}`);

    // In online mode, only host generates questions
    if (isOnline && !iAmHost) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }

    // Use overrides if provided (avoids stale stateRef after PREPARE_NEXT_TURN dispatch)
    const turnIndex = overrides?.turnIndex ?? s.game.currentPlayerTurnIndex;
    const round = overrides?.round ?? s.game.currentRound;

    dispatch({ type: 'SET_LOADING', payload: true });
    const currentPlayer = s.game.players[turnIndex];
    if (!currentPlayer) return;

    const subjects = s.game.settings.subjects;
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    let question;
    try {
      question = await generateQuestion({
        subject,
        difficulty: currentPlayer.difficulty,
        age: currentPlayer.age,
        previousQuestions: s.game.questionHistory,
      });
    } catch (err) {
      console.warn('[loadQuestion] Gemini failed, using fallback:', err);
      question = getFallbackQuestion(subject);
    }

    // Host dispatches locally
    dispatch({ type: 'SET_QUESTION', payload: question });
    dispatch({ type: 'SET_LOADING', payload: false });

    if (isOnline && channelRef.current) {
      // Broadcast atomic question event (turn + round + question together)
      db.broadcastGameEvent(channelRef.current, 'question', {
        senderId: s.myPlayerId,
        question,
        turnIndex,
        round,
      });
      // DB write (persistence only, fire-and-forget)
      db.updateGame(s.game.id, {
        current_round: round,
      }).catch(() => {});
    }
  }, []);

  // Keep loadQuestionRef in sync
  useEffect(() => { loadQuestionRef.current = loadQuestion; }, [loadQuestion]);

  const submitAnswer = useCallback((answer: string, timeElapsed: number) => {
    const s = stateRef.current;
    const question = s.game.currentQuestion!;
    const currentPlayer = s.game.players[s.game.currentPlayerTurnIndex];
    const isCorrect = answer === question.correctAnswer;
    const { points, newStreak, multiplier } = calculatePoints(isCorrect, currentPlayer.streak, timeElapsed, question.timeLimit);
    const newDifficulty = adjustDifficulty(currentPlayer.difficulty, isCorrect, newStreak);

    const updates: Partial<Player> = {
      score: currentPlayer.score + points,
      streak: newStreak,
      bestStreak: Math.max(currentPlayer.bestStreak, newStreak),
      correctAnswers: currentPlayer.correctAnswers + (isCorrect ? 1 : 0),
      totalAnswers: currentPlayer.totalAnswers + 1,
      difficulty: newDifficulty,
      lives: isCorrect ? currentPlayer.lives : Math.max(0, currentPlayer.lives - 1),
      fastestAnswer: isCorrect
        ? (currentPlayer.fastestAnswer === null ? timeElapsed : Math.min(currentPlayer.fastestAnswer, timeElapsed))
        : currentPlayer.fastestAnswer,
    };

    dispatch({ type: 'UPDATE_PLAYER', payload: { id: currentPlayer.id, updates } });

    const result: RoundResult = {
      playerId: currentPlayer.id,
      round: s.game.currentRound,
      questionId: question.id,
      answer,
      isCorrect,
      timeElapsed,
      pointsEarned: points,
    };
    dispatch({ type: 'RECORD_RESULT', payload: result });

    if (s.game.settings.mode === 'online') {
      // Broadcast answer result with full player state
      if (channelRef.current) {
        db.broadcastGameEvent(channelRef.current, 'answer', {
          senderId: currentPlayer.id,
          playerId: currentPlayer.id,
          isCorrect,
          points,
          newScore: currentPlayer.score + points,
          streak: newStreak,
          correctAnswers: currentPlayer.correctAnswers + (isCorrect ? 1 : 0),
          totalAnswers: currentPlayer.totalAnswers + 1,
          lives: isCorrect ? currentPlayer.lives : Math.max(0, currentPlayer.lives - 1),
          answer,
          questionId: question.id,
          round: s.game.currentRound,
          timeElapsed,
        });
      }
      // DB write (persistence, fire-and-forget)
      db.updatePlayer(currentPlayer.id, {
        score: currentPlayer.score + points,
        streak: newStreak,
        correct_answers: currentPlayer.correctAnswers + (isCorrect ? 1 : 0),
        total_answers: currentPlayer.totalAnswers + 1,
      }).catch(() => {});
    }

    return { isCorrect, points, multiplier, correctAnswer: question.correctAnswer, explanation: question.explanation };
  }, []);

  // nextTurn: called by answering player after result display.
  // In online mode: broadcasts advance_turn, host generates next question.
  const nextTurn = useCallback(() => {
    const s = stateRef.current;
    const nextIndex = (s.game.currentPlayerTurnIndex + 1) % s.game.players.length;
    const isNewRound = nextIndex === 0;
    const nextRound = isNewRound ? s.game.currentRound + 1 : s.game.currentRound;
    const amHost = s.myPlayerId === s.game.hostId;
    console.log(`[nextTurn] called by ${amHost ? 'HOST' : 'JOINER'}: currentTurn=${s.game.currentPlayerTurnIndex} -> nextTurn=${nextIndex} round=${nextRound}`);

    if (s.game.settings.mode === 'online') {
      // Dispatch locally: prepare for next turn (question = null while host generates)
      dispatch({ type: 'PREPARE_NEXT_TURN', payload: { turnIndex: nextIndex, round: nextRound } });

      // Broadcast advance_turn to all clients
      if (channelRef.current) {
        db.broadcastGameEvent(channelRef.current, 'advance_turn', {
          senderId: s.myPlayerId,
          nextTurnIndex: nextIndex,
          nextRound: nextRound,
        });
      }
      // DB write (persistence, fire-and-forget)
      db.updateGame(s.game.id, {
        current_round: nextRound,
      }).catch(() => {});

      // If I'm the host, generate the next question — pass turn info explicitly
      if (s.myPlayerId === s.game.hostId) {
        setTimeout(() => {
          loadQuestionRef.current?.({ turnIndex: nextIndex, round: nextRound });
        }, 100);
      }
    } else {
      // Local mode: simple NEXT_TURN dispatch
      dispatch({ type: 'NEXT_TURN' });
    }
  }, []);

  const isGameOver = useCallback(() => {
    const s = stateRef.current;
    const totalTurns = s.game.settings.rounds * s.game.players.length;
    const completedTurns = s.game.roundResults.length;
    return completedTurns >= totalTurns;
  }, []);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    dispatch({ type: 'SET_STATUS', payload: 'finished' });
    if (s.game.settings.mode === 'online') {
      if (channelRef.current) {
        db.broadcastGameEvent(channelRef.current, 'game_over', { senderId: s.myPlayerId });
      }
      db.updateGame(s.game.id, { status: 'finished' }).catch(() => {});
    }
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const getCurrentPlayer = useCallback(() => {
    return stateRef.current.game.players[stateRef.current.game.currentPlayerTurnIndex];
  }, []);

  const value: GameContextValue = {
    state,
    actions: {
      createGame,
      joinGame,
      addLocalPlayer,
      removePlayer,
      updateSettings,
      setReady,
      startGame,
      loadQuestion,
      submitAnswer,
      nextTurn,
      endGame,
      resetGame,
      getCurrentPlayer,
      isGameOver,
      isHost: amIHost,
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
