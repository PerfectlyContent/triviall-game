import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { QuestionCard } from '../components/game/QuestionCard';
import { Timer } from '../components/ui/Timer';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { confettiBurst } from '../components/ui/Confetti';
import { correctFeedback, incorrectFeedback, streakFeedback } from '../utils/feedback';
import { theme } from '../utils/theme';

type Phase = 'loading' | 'turn-intro' | 'question' | 'result';

// How long to show the result before auto-advancing (online mode)
const RESULT_DISPLAY_MS = 3000;

export function Round() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { game } = state;

  const [phase, setPhase] = useState<Phase>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    points: number;
    multiplier: number;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState<number | null>(null);
  const answerTimeRef = useRef<number>(0);

  const currentPlayer = actions.getCurrentPlayer();
  const isOnline = game.settings.mode === 'online';
  const isMyTurn = !isOnline || (currentPlayer && state.myPlayerId === currentPlayer.id);

  // Track question ID to detect new questions arriving (the ONE watcher for online mode)
  const prevQuestionIdRef = useRef<string | null>(null);

  // Helper: reset all UI state for next turn
  const resetForNextTurn = useCallback(() => {
    setPhase('loading');
    setSelectedAnswer(null);
    setResult(null);
    setPointsAnimation(null);
    setTimerRunning(false);
  }, []);

  // ============================
  // LOADING PHASE (local mode only)
  // ============================
  // In online mode, question generation is triggered by GameContext (host generates after
  // startGame or advance_turn). Round.tsx just waits for the question to arrive.
  useEffect(() => {
    if (phase !== 'loading') return;

    if (!isOnline) {
      // Local mode: generate question and transition
      const id = setTimeout(() => {
        actions.loadQuestion().then(() => setPhase('turn-intro'));
      }, 50);
      return () => clearTimeout(id);
    }

    // Online mode: do nothing here. The question arrives via broadcast,
    // which dispatches SET_TURN_AND_QUESTION, and the watcher below handles the transition.
  }, [phase, isOnline]);

  // ============================
  // ONLINE: Question arrives via broadcast (single watcher)
  // ============================
  // This is the ONE effect that drives all online phase transitions when a new question arrives.
  // It handles: initial question after game start, and new questions after advance_turn.
  // Works for both host (who dispatches SET_QUESTION locally) and non-host (who receives SET_TURN_AND_QUESTION via broadcast).
  useEffect(() => {
    if (!isOnline) return;
    if (!game.currentQuestion) return;

    // Only transition when we see a NEW question (different ID)
    if (game.currentQuestion.id !== prevQuestionIdRef.current) {
      prevQuestionIdRef.current = game.currentQuestion.id;

      // If we're not already in turn-intro or question phase, reset and start fresh
      if (phase === 'loading' || phase === 'result') {
        setSelectedAnswer(null);
        setResult(null);
        setPointsAnimation(null);
        setTimerRunning(false);
        setPhase('turn-intro');
      }
    }
  }, [game.currentQuestion?.id, isOnline, phase]);

  // ============================
  // ALL CLIENTS: Game ended via realtime
  // ============================
  useEffect(() => {
    if (game.status === 'finished') {
      navigate('/results');
    }
  }, [game.status, navigate]);

  // ============================
  // TURN INTRO → QUESTION
  // ============================
  useEffect(() => {
    if (phase === 'turn-intro') {
      const delay = isOnline ? 1500 : 2000;
      const timer = setTimeout(() => {
        setPhase('question');
        setTimerRunning(true);
        answerTimeRef.current = Date.now();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [phase, isOnline]);

  // ============================
  // ONLINE: Non-answering players see result when someone answers (via broadcast)
  // ============================
  const prevResultCountRef = useRef(game.roundResults.length);
  useEffect(() => {
    if (!isOnline) return;
    if (game.roundResults.length > prevResultCountRef.current) {
      prevResultCountRef.current = game.roundResults.length;
      // If I wasn't the one answering, show me the result
      if (!isMyTurn && (phase === 'question' || phase === 'loading' || phase === 'turn-intro')) {
        setTimerRunning(false);
        const latestResult = game.roundResults[game.roundResults.length - 1];
        setResult({
          isCorrect: latestResult.isCorrect,
          points: latestResult.pointsEarned,
          multiplier: 1,
          correctAnswer: game.currentQuestion?.correctAnswer ?? '',
          explanation: game.currentQuestion?.explanation ?? '',
        });
        setSelectedAnswer(latestResult.answer ?? '__other__');
        setTimeout(() => setPhase('result'), 300);
      }
    }
  }, [game.roundResults.length, isOnline, isMyTurn, phase, game.currentQuestion]);

  // ============================
  // ANSWER HANDLER (only the answering player)
  // ============================
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer || phase !== 'question' || !isMyTurn) return;

    const timeElapsed = (Date.now() - answerTimeRef.current) / 1000;
    setSelectedAnswer(answer);
    setTimerRunning(false);

    const answerResult = actions.submitAnswer(answer, timeElapsed);
    setResult(answerResult);

    if (answerResult.isCorrect) {
      correctFeedback();
      confettiBurst();
      if (answerResult.multiplier > 1) {
        streakFeedback(Math.round(answerResult.multiplier * 2));
      }
      setPointsAnimation(answerResult.points);
    } else {
      incorrectFeedback();
    }

    setTimeout(() => setPhase('result'), 800);
  }, [selectedAnswer, phase, isMyTurn, actions]);

  // ============================
  // TIMEOUT HANDLER
  // ============================
  const handleTimeout = useCallback(() => {
    if (selectedAnswer || phase !== 'question') return;
    if (!isMyTurn) return; // only the answering player handles timeout

    setTimerRunning(false);
    setSelectedAnswer('__timeout__');

    const answerResult = actions.submitAnswer('__timeout__', game.currentQuestion?.timeLimit ?? 20);
    setResult(answerResult);
    incorrectFeedback();

    setTimeout(() => setPhase('result'), 800);
  }, [selectedAnswer, phase, isMyTurn, actions, game.currentQuestion]);

  // ============================
  // ONLINE: AUTO-ADVANCE after result (the answering player drives the turn)
  // ============================
  useEffect(() => {
    if (!isOnline) return;
    if (phase !== 'result') return;
    if (!isMyTurn) return; // only the answering player auto-advances

    const timer = setTimeout(() => {
      if (actions.isGameOver()) {
        actions.endGame();
        navigate('/results');
      } else {
        // Answering player advances the turn → broadcasts advance_turn → host generates question
        actions.nextTurn();
        resetForNextTurn();
      }
    }, RESULT_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [phase, isOnline, isMyTurn, actions, navigate, resetForNextTurn]);

  // ============================
  // LOCAL MODE: Continue button handler (pass-and-play)
  // ============================
  const handleContinue = () => {
    if (actions.isGameOver()) {
      actions.endGame();
      navigate('/results');
      return;
    }
    actions.nextTurn();
    resetForNextTurn();
  };

  // ============================
  // RENDERING
  // ============================
  const getBackgroundGradient = () => {
    if (game.currentQuestion) {
      return theme.subjectGradients[game.currentQuestion.subject] || theme.gradients.teal;
    }
    return theme.gradients.teal;
  };

  const myPlayer = isOnline ? game.players.find(p => p.id === state.myPlayerId) : null;

  // Redirect if no current player (use useEffect to avoid setState-during-render)
  useEffect(() => {
    if (!currentPlayer) {
      navigate('/');
    }
  }, [currentPlayer, navigate]);

  if (!currentPlayer) {
    return null;
  }

  const getLoadingMessage = () => {
    if (!isOnline) return 'Generating question...';
    if (isMyTurn) return 'Generating your question...';
    return `Waiting for ${currentPlayer.name}'s turn...`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: getBackgroundGradient(),
        padding: '20px',
        position: 'relative',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '14px',
            color: theme.colors.white,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Round {Math.min(game.currentRound, game.settings.rounds)}/{game.settings.rounds}
        </div>

        {phase === 'question' && game.currentQuestion && isMyTurn && (
          <Timer
            duration={game.currentQuestion.timeLimit}
            onTimeout={handleTimeout}
            isRunning={timerRunning}
            size={52}
          />
        )}
      </div>

      {/* Player turn indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: theme.borderRadius.full,
            padding: '6px 16px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{currentPlayer.avatarEmoji}</span>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '14px',
              color: theme.colors.white,
            }}
          >
            {isMyTurn ? 'Your Turn' : `${currentPlayer.name}'s Turn`}
          </span>
        </div>
      </div>

      {/* Lives */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '20px',
        }}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} style={{ fontSize: '18px', opacity: i < currentPlayer.lives ? 1 : 0.3 }}>
            ❤️
          </span>
        ))}
      </div>

      {/* Score & Streak */}
      {(() => {
        const displayPlayer = isOnline && myPlayer ? myPlayer : currentPlayer;
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {displayPlayer.score} pts
            </span>
            {displayPlayer.streak >= 2 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: '14px',
                  color: theme.colors.brightYellow,
                }}
              >
                🔥 {displayPlayer.streak} streak
              </motion.span>
            )}
          </div>
        );
      })()}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* Loading */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              gap: '16px',
            }}
          >
            <Spinner size={48} />
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: '16px',
                color: theme.colors.white,
                textAlign: 'center',
              }}
            >
              {getLoadingMessage()}
            </p>
          </motion.div>
        )}

        {/* Turn Intro */}
        {phase === 'turn-intro' && (
          <motion.div
            key="intro"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '64px' }}>{currentPlayer.avatarEmoji}</span>
            <h2
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: '28px',
                color: theme.colors.white,
                textAlign: 'center',
              }}
            >
              {isMyTurn ? '🎯 Your Turn!' : `🎯 ${currentPlayer.name}'s Turn`}
            </h2>
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {isMyTurn ? 'Get ready!' : 'Watch and wait...'}
            </p>
          </motion.div>
        )}

        {/* Question + Result */}
        {(phase === 'question' || phase === 'result') && game.currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ position: 'relative' }}
          >
            {/* Watching overlay for non-answering players */}
            {isOnline && !isMyTurn && phase === 'question' && (
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  borderRadius: theme.borderRadius.lg,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>👀</span>
                <p
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 700,
                    fontSize: '18px',
                    color: theme.colors.white,
                    textAlign: 'center',
                  }}
                >
                  {currentPlayer.name} is answering...
                </p>
              </div>
            )}

            <QuestionCard
              question={game.currentQuestion}
              onAnswer={handleAnswer}
              revealed={phase === 'result'}
              correctAnswer={result?.correctAnswer ?? null}
              selectedAnswer={selectedAnswer}
            />

            {/* Points animation */}
            <AnimatePresence>
              {pointsAnimation && phase === 'result' && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -60, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  style={{
                    position: 'fixed',
                    top: '40%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    fontSize: '36px',
                    color: theme.colors.brightYellow,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  +{pointsAnimation}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result feedback */}
            {phase === 'result' && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '20px' }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: theme.borderRadius.lg,
                    background: result.isCorrect
                      ? 'rgba(0, 217, 165, 0.2)'
                      : 'rgba(255, 107, 138, 0.2)',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>
                    {result.isCorrect ? '🎉' : '😅'}
                  </span>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 800,
                      fontSize: '18px',
                      color: theme.colors.white,
                      marginTop: '4px',
                    }}
                  >
                    {result.isCorrect
                      ? result.multiplier > 1
                        ? `Amazing! ${result.multiplier}x streak!`
                        : 'Correct!'
                      : 'Not quite!'}
                  </p>
                </div>

                {/* LOCAL MODE: show Continue button (pass-and-play needs manual advance) */}
                {/* ONLINE MODE: auto-advances after 3 seconds — show a countdown hint */}
                {isOnline ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '12px',
                      fontFamily: theme.fonts.body,
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    Next turn in a moment...
                  </div>
                ) : (
                  <Button
                    variant="coral"
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                  >
                    {actions.isGameOver() ? '🏆 See Results' : '➡️ Continue'}
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
