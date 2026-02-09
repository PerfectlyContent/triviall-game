import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
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
      // Prevent duplicate players
      const existingIds = new Set(state.game.players.map(p => p.id));
      if (existingIds.has(action.payload.id)) {
        return state;
      }
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
    loadQuestion: () => Promise<void>;
    submitAnswer: (answer: string, timeElapsed: number) => { isCorrect: boolean; points: number; multiplier: number; correctAnswer: string; explanation: string };
    nextTurn: () => void;
    endGame: () => void;
    resetGame: () => void;
    getCurrentPlayer: () => Player | undefined;
    isGameOver: () => boolean;
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
    dispatch({ type: 'SET_LOADING', payload: false });

    // For online mode, create in Supabase
    if (settings.mode === 'online' && roomCode) {
      try {
        const dbGame = await db.createGame({
          room_code: roomCode,
          host_id: playerId,
          settings: settings as unknown as object,
        });
        gameState.id = dbGame.id;
        await db.addPlayer({
          game_id: dbGame.id,
          name: playerData.name,
          age: playerData.age,
          avatar_emoji: playerData.avatarEmoji,
          difficulty: settings.defaultDifficulty,
          is_host: true,
        });

        // Subscribe to realtime
        channelRef.current = db.subscribeToGame(roomCode, dbGame.id, {
          onGameUpdate: (payload) => {
            if (payload.status) dispatch({ type: 'SET_STATUS', payload: payload.status as GameStatus });
            if (payload.current_question) dispatch({ type: 'SET_QUESTION', payload: payload.current_question as unknown as Question });
          },
          onPlayerJoin: (payload) => {
            const newPlayer = createDefaultPlayer({
              id: payload.id as string,
              name: payload.name as string,
              age: payload.age as AgeGroup,
              avatarEmoji: payload.avatar_emoji as string,
              difficulty: payload.difficulty as number,
            });
            dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
          },
          onPlayerUpdate: (payload) => {
            dispatch({
              type: 'UPDATE_PLAYER',
              payload: {
                id: payload.id as string,
                updates: {
                  score: payload.score as number,
                  isReady: payload.is_ready as boolean,
                },
              },
            });
          },
          onBroadcast: () => {},
        });

        dispatch({ type: 'SET_GAME', payload: { ...gameState, id: dbGame.id } });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      }
    }

    // Store my player ID properly via dispatch
    dispatch({ type: 'SET_MY_PLAYER_ID', payload: playerId });
    return playerId;
  }, []);

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

      // Subscribe to realtime
      channelRef.current = db.subscribeToGame(roomCode, game.id, {
        onGameUpdate: (payload) => {
          if (payload.status) dispatch({ type: 'SET_STATUS', payload: payload.status as GameStatus });
          if (payload.current_question) dispatch({ type: 'SET_QUESTION', payload: payload.current_question as unknown as Question });
        },
        onPlayerJoin: (payload) => {
          // Avoid duplicate - don't add if player already exists
          const existingIds = new Set(mappedPlayers.map(p => p.id));
          if (existingIds.has(payload.id as string)) return;

          const newPlayer = createDefaultPlayer({
            id: payload.id as string,
            name: payload.name as string,
            age: payload.age as AgeGroup,
            avatarEmoji: payload.avatar_emoji as string,
            difficulty: payload.difficulty as number,
          });
          dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
        },
        onPlayerUpdate: (payload) => {
          dispatch({
            type: 'UPDATE_PLAYER',
            payload: {
              id: payload.id as string,
              updates: {
                score: payload.score as number,
                isReady: payload.is_ready as boolean,
              },
            },
          });
        },
        onBroadcast: () => {},
      });

      // Broadcast that this player joined so other clients get immediate notification
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
  }, []);

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
    if (state.myPlayerId) {
      dispatch({ type: 'UPDATE_PLAYER', payload: { id: state.myPlayerId, updates: { isReady: ready } } });
      if (state.game.settings.mode === 'online') {
        db.updatePlayer(state.myPlayerId, { is_ready: ready }).catch(console.error);
      }
    }
  }, [state.myPlayerId, state.game.settings.mode]);

  const startGame = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'playing' });
    dispatch({ type: 'SET_ROUND', payload: 1 });
    if (state.game.settings.mode === 'online') {
      db.updateGame(state.game.id, { status: 'playing', current_round: 1 }).catch(console.error);
    }
  }, [state.game.id, state.game.settings.mode]);

  const loadQuestion = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const currentPlayer = state.game.players[state.game.currentPlayerTurnIndex];
    if (!currentPlayer) return;

    const subjects = state.game.settings.subjects;
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    try {
      const question = await generateQuestion({
        subject,
        difficulty: currentPlayer.difficulty,
        age: currentPlayer.age,
        previousQuestions: state.game.questionHistory,
      });
      dispatch({ type: 'SET_QUESTION', payload: question });

      if (state.game.settings.mode === 'online') {
        db.updateGame(state.game.id, { current_question: question as unknown as object }).catch(console.error);
      }
    } catch {
      const fallback = getFallbackQuestion(subject);
      dispatch({ type: 'SET_QUESTION', payload: fallback });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.game]);

  const submitAnswer = useCallback((answer: string, timeElapsed: number) => {
    const question = state.game.currentQuestion!;
    const currentPlayer = state.game.players[state.game.currentPlayerTurnIndex];
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
      round: state.game.currentRound,
      questionId: question.id,
      answer,
      isCorrect,
      timeElapsed,
      pointsEarned: points,
    };
    dispatch({ type: 'RECORD_RESULT', payload: result });

    return { isCorrect, points, multiplier, correctAnswer: question.correctAnswer, explanation: question.explanation };
  }, [state.game]);

  const nextTurn = useCallback(() => {
    dispatch({ type: 'NEXT_TURN' });
  }, []);

  const isGameOver = useCallback(() => {
    const totalTurns = state.game.settings.rounds * state.game.players.length;
    const completedTurns = state.game.roundResults.length;
    return completedTurns >= totalTurns;
  }, [state.game]);

  const endGame = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'finished' });
    if (state.game.settings.mode === 'online') {
      db.updateGame(state.game.id, { status: 'finished' }).catch(console.error);
    }
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, [state.game.id, state.game.settings.mode]);

  const resetGame = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const getCurrentPlayer = useCallback(() => {
    return state.game.players[state.game.currentPlayerTurnIndex];
  }, [state.game.players, state.game.currentPlayerTurnIndex]);

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
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
