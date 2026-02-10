import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { QuestionCard } from '../components/game/QuestionCard';
import { TimerBar } from '../components/ui/TimerBar';
import { confettiBurst } from '../components/ui/Confetti';
import { correctFeedback, incorrectFeedback, streakFeedback } from '../utils/feedback';
import { getResultMessage } from '../utils/resultMessages';
import { getRandomFunFact } from '../utils/funFacts';
import { useTranslation } from '../i18n';
import { useLanguage } from '../App';
import { theme } from '../utils/theme';
import type { TranslationKey } from '../i18n/translations';
import type { Subject } from '../types';

const SUBJECT_TRANSLATION_KEYS: Record<Subject, TranslationKey> = {
  'Science': 'subject.Science', 'History': 'subject.History', 'Gaming': 'subject.Gaming',
  'Movies': 'subject.Movies', 'Music': 'subject.Music', 'Sports': 'subject.Sports',
  'Nature': 'subject.Nature', 'Food': 'subject.Food', 'Travel': 'subject.Travel',
  'Pop Culture': 'subject.PopCulture', 'Art': 'subject.Art', 'Tech': 'subject.Tech',
};

type Phase = 'loading' | 'turn-intro' | 'question' | 'result';

// How long to show the result before auto-advancing (online mode)
const RESULT_DISPLAY_MS = 3000;

export function Round() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { game } = state;
  const { t, isRTL } = useTranslation();
  const { language } = useLanguage();

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
  const [resultMessage, setResultMessage] = useState<{ emoji: string; text: string } | null>(null);
  const [funFact, setFunFact] = useState<string>('');
  const answerTimeRef = useRef<number>(0);

  const currentPlayer = actions.getCurrentPlayer();
  const isOnline = game.settings.mode === 'online';
  const isMyTurn = !isOnline || (currentPlayer && state.myPlayerId === currentPlayer.id);

  // Track question ID to detect new questions arriving (the ONE watcher for online mode)
  const prevQuestionIdRef = useRef<string | null>(null);

  // Track whether THIS client answered the current question (used for auto-advance guard)
  const iAnsweredRef = useRef(false);

  // Helper: reset all UI state for next turn
  const resetForNextTurn = useCallback(() => {
    setPhase('loading');
    setSelectedAnswer(null);
    setResult(null);
    setPointsAnimation(null);
    setResultMessage(null);
    setTimerRunning(false);
    iAnsweredRef.current = false;
  }, []);

  // ============================
  // FUN FACT during loading
  // ============================
  useEffect(() => {
    if (phase !== 'loading') return;
    // Pick one fact per loading screen — no rotation
    setFunFact(getRandomFunFact(game.currentRoundSubject, language));
  }, [phase, game.currentRoundSubject]);

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
      iAnsweredRef.current = false; // Reset for new question

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
        setResultMessage(getResultMessage(latestResult.isCorrect, 1, false, language));
        setTimeout(() => setPhase('result'), 300);
      }
    }
  }, [game.roundResults.length, isOnline, isMyTurn, phase, game.currentQuestion]);

  // ============================
  // ANSWER HANDLER (only the answering player)
  // ============================
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer || phase !== 'question' || !isMyTurn) return;

    iAnsweredRef.current = true; // Mark that THIS client answered
    const timeElapsed = (Date.now() - answerTimeRef.current) / 1000;
    setSelectedAnswer(answer);
    setTimerRunning(false);

    const answerResult = actions.submitAnswer(answer, timeElapsed);
    setResult(answerResult);
    setResultMessage(getResultMessage(answerResult.isCorrect, answerResult.multiplier, false, language));

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

    iAnsweredRef.current = true; // Mark that THIS client answered (timeout)
    setTimerRunning(false);
    setSelectedAnswer('__timeout__');

    const answerResult = actions.submitAnswer('__timeout__', game.currentQuestion?.timeLimit ?? 20);
    setResult(answerResult);
    setResultMessage(getResultMessage(false, 1, true, language));
    incorrectFeedback();

    setTimeout(() => setPhase('result'), 800);
  }, [selectedAnswer, phase, isMyTurn, actions, game.currentQuestion]);

  // ============================
  // ONLINE: AUTO-ADVANCE after result (ONLY the player who answered drives the turn)
  // ============================
  useEffect(() => {
    if (!isOnline) return;
    if (phase !== 'result') return;
    if (!iAnsweredRef.current) return; // only the player who actually answered auto-advances

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
  }, [phase, isOnline, actions, navigate, resetForNextTurn]);

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
    if (!isOnline) return t('round.generating');
    if (isMyTurn) return t('round.generatingYours');
    return t('round.waitingFor', { name: currentPlayer.name });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: getBackgroundGradient(),
        padding: '16px',
        position: 'relative',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Top Bar: Round + Player Turn + Subject — single compact row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {t('round.round')} {Math.min(game.currentRound, game.settings.rounds)}/{game.settings.rounds}
        </div>

        {/* Current player pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: theme.borderRadius.full,
            padding: '4px 12px',
          }}
        >
          <span style={{ fontSize: '16px' }}>{currentPlayer.avatarEmoji}</span>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '13px',
              color: theme.colors.white,
            }}
          >
            {isOnline && isMyTurn ? t('round.yourTurn') : currentPlayer.name}
          </span>
        </div>

        {/* Current round subject */}
        {game.currentRoundSubject ? (
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '12px',
              color: theme.colors.white,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: theme.borderRadius.full,
              padding: '3px 10px',
            }}
          >
            {t(SUBJECT_TRANSLATION_KEYS[game.currentRoundSubject])}
          </div>
        ) : <div />}
      </div>

      {/* Standings — correct answers per player */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        {game.players.map((p) => {
          const isActive = p.id === currentPlayer.id;
          const isMe = isOnline && p.id === state.myPlayerId;
          return (
            <span
              key={p.id}
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: isActive ? 800 : 600,
                fontSize: '12px',
                color: isActive || isMe ? theme.colors.white : 'rgba(255,255,255,0.6)',
              }}
            >
              {p.avatarEmoji} {p.correctAnswers}✓
            </span>
          );
        })}
      </div>

      {/* Main Content — pushed down slightly for breathing room */}
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
              minHeight: '70vh',
              gap: '0',
              padding: '0 8px',
            }}
          >
            {/* Big subject emoji with pulse */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '64px', marginBottom: '12px' }}
            >
              {game.currentRoundSubject ? theme.subjectEmojis[game.currentRoundSubject] : '🧠'}
            </motion.div>

            {/* Loading message with animated dots */}
            <p
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '16px',
                color: theme.colors.white,
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              {getLoadingMessage()}
            </p>

            {/* Fun fact card — white frosted glass */}
            <AnimatePresence mode="wait">
              <motion.div
                key={funFact}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: theme.borderRadius.lg,
                  padding: '24px 24px 20px',
                  maxWidth: '360px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: theme.gradients.yellow,
                    borderRadius: '50px',
                    padding: '4px 14px',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>💡</span>
                  <span
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 800,
                      fontSize: '11px',
                      color: theme.colors.darkText,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {t('round.didYouKnow')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: theme.fonts.body,
                    fontWeight: 700,
                    fontSize: '16px',
                    color: theme.colors.darkText,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {funFact}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Three bouncing dots loader */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '28px' }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.6)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Turn Intro */}
        {phase === 'turn-intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              gap: '0',
            }}
          >
            {/* Avatar with glow ring */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                boxShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '56px',
                marginBottom: '20px',
              }}
            >
              {currentPlayer.avatarEmoji}
            </motion.div>

            {/* Player name */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: '32px',
                color: theme.colors.white,
                textAlign: 'center',
                margin: '0 0 6px',
              }}
            >
              {isOnline && isMyTurn ? t('round.yourTurnIntro') : t('round.playerTurn', { name: currentPlayer.name })}
            </motion.h2>

            {/* Get ready text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '15px',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 0 28px',
              }}
            >
              {isOnline && !isMyTurn ? t('round.watchWait') : t('round.getReady')}
            </motion.p>

            {/* Subject card */}
            {game.currentRoundSubject && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: theme.borderRadius.lg,
                  padding: '20px 32px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              >
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>
                  {theme.subjectEmojis[game.currentRoundSubject]}
                </span>
                <p
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 800,
                    fontSize: '18px',
                    color: theme.colors.darkText,
                    margin: 0,
                  }}
                >
                  {t(SUBJECT_TRANSLATION_KEYS[game.currentRoundSubject!])}
                </p>
              </motion.div>
            )}
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
                  {t('round.isAnswering', { name: currentPlayer.name })}
                </p>
              </div>
            )}

            {/* Timer bar */}
            {phase === 'question' && isMyTurn && (
              <TimerBar
                duration={game.currentQuestion.timeLimit}
                onTimeout={handleTimeout}
                isRunning={timerRunning}
              />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ marginTop: '16px', textAlign: 'center' }}
              >
                {/* Feedback text — no box, just centered text */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px' }}>
                    {resultMessage?.emoji ?? (result.isCorrect ? '🎉' : '😅')}
                  </span>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 800,
                      fontSize: '18px',
                      color: theme.colors.white,
                      margin: '4px 0 0',
                    }}
                  >
                    {resultMessage?.text ?? (result.isCorrect ? t('round.correct') : t('round.notQuite'))}
                  </p>
                </div>

                {/* Difficulty adjuster — small centered pill */}
                {isMyTurn && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '14px',
                      padding: '6px 14px',
                      borderRadius: '50px',
                      background: 'rgba(255,255,255,0.12)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.fonts.body,
                        fontWeight: 600,
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {t('round.difficulty')}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => actions.setPlayerDifficulty(currentPlayer.id, currentPlayer.difficulty - 1)}
                      disabled={currentPlayer.difficulty <= 1}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: theme.colors.white,
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: currentPlayer.difficulty <= 1 ? 'default' : 'pointer',
                        opacity: currentPlayer.difficulty <= 1 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </motion.button>
                    <span
                      style={{
                        fontFamily: theme.fonts.display,
                        fontWeight: 800,
                        fontSize: '14px',
                        color: theme.colors.white,
                        minWidth: '16px',
                        textAlign: 'center',
                      }}
                    >
                      {currentPlayer.difficulty}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => actions.setPlayerDifficulty(currentPlayer.id, currentPlayer.difficulty + 1)}
                      disabled={currentPlayer.difficulty >= 10}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: theme.colors.white,
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: currentPlayer.difficulty >= 10 ? 'default' : 'pointer',
                        opacity: currentPlayer.difficulty >= 10 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </motion.button>
                  </div>
                )}

                {/* Continue / auto-advance */}
                {isOnline ? (
                  <p
                    style={{
                      fontFamily: theme.fonts.body,
                      fontWeight: 600,
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      margin: 0,
                    }}
                  >
                    {t('round.nextTurn')}
                  </p>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleContinue}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '50px',
                      border: 'none',
                      background: theme.colors.white,
                      color: theme.colors.darkText,
                      fontFamily: theme.fonts.display,
                      fontWeight: 800,
                      fontSize: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    {actions.isGameOver() ? `🏆 ${t('round.seeResults')}` : `${t('round.continue')} ${isRTL ? '←' : '→'}`}
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
