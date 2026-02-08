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

  // Load question when entering loading phase
  useEffect(() => {
    if (phase === 'loading') {
      actions.loadQuestion().then(() => {
        setPhase('turn-intro');
      });
    }
  }, [phase]);

  // Show turn intro briefly then move to question
  useEffect(() => {
    if (phase === 'turn-intro') {
      const timer = setTimeout(() => {
        setPhase('question');
        setTimerRunning(true);
        answerTimeRef.current = Date.now();
      }, game.settings.mode === 'local' ? 2000 : 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, game.settings.mode]);

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer || phase !== 'question') return;

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

    setTimeout(() => {
      setPhase('result');
    }, 800);
  }, [selectedAnswer, phase, actions]);

  const handleTimeout = useCallback(() => {
    if (selectedAnswer || phase !== 'question') return;

    setTimerRunning(false);
    setSelectedAnswer('__timeout__');

    const answerResult = actions.submitAnswer('__timeout__', game.currentQuestion?.timeLimit ?? 20);
    setResult(answerResult);
    incorrectFeedback();

    setTimeout(() => {
      setPhase('result');
    }, 800);
  }, [selectedAnswer, phase, actions, game.currentQuestion]);

  const handleContinue = () => {
    // Check if game is over
    if (actions.isGameOver()) {
      actions.endGame();
      navigate('/results');
      return;
    }

    // Move to next turn
    actions.nextTurn();

    // Reset state for next question
    setPhase('loading');
    setSelectedAnswer(null);
    setResult(null);
    setPointsAnimation(null);
    setTimerRunning(false);
  };

  const getBackgroundGradient = () => {
    if (game.currentQuestion) {
      return theme.subjectGradients[game.currentQuestion.subject] || theme.gradients.teal;
    }
    return theme.gradients.teal;
  };

  if (!currentPlayer) {
    navigate('/');
    return null;
  }

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

        {phase === 'question' && game.currentQuestion && (
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
            {currentPlayer.name}'s Turn
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
          {currentPlayer.score} pts
        </span>
        {currentPlayer.streak >= 2 && (
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
            🔥 {currentPlayer.streak} streak
          </motion.span>
        )}
      </div>

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
              }}
            >
              Generating question...
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
              🎯 {currentPlayer.name}'s Turn
            </h2>
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Get ready!
            </p>
          </motion.div>
        )}

        {/* Question */}
        {(phase === 'question' || phase === 'result') && game.currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
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

                <Button
                  variant="coral"
                  size="lg"
                  fullWidth
                  onClick={handleContinue}
                >
                  {actions.isGameOver() ? '🏆 See Results' : '➡️ Continue'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
