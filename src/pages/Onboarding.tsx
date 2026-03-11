import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../utils/theme';
import { Button } from '../components/ui/Button';

const SCREENS = [
  {
    emoji: '🧠',
    title: 'Welcome to TriviAll',
    subtitle: 'The trivia game where everyone gets a fair challenge',
    features: [
      { icon: '🎯', text: 'AI-powered questions adapted to your level' },
      { icon: '👨‍👩‍👧‍👦', text: 'Kids & adults play together fairly' },
      { icon: '🌍', text: 'Available in 5 languages' },
    ],
  },
  {
    emoji: '⚡',
    title: 'Challenge Your Brain',
    subtitle: 'Compete across 12 exciting subjects',
    features: [
      { icon: '🔬', text: 'Science, History, Music & more' },
      { icon: '🏆', text: 'Earn streaks & climb the leaderboard' },
      { icon: '📱', text: 'Play locally or online with friends' },
    ],
  },
  {
    emoji: '🎉',
    title: 'Ready to Play?',
    subtitle: 'Start with 3 free games on us',
    features: [
      { icon: '🆓', text: '3 free games to try everything' },
      { icon: '💎', text: 'Unlimited games for just $2.99/week' },
      { icon: '🚀', text: 'Cancel anytime, no commitments' },
    ],
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function Onboarding() {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next >= 0 && next < SCREENS.length) {
      setPage([next, newDirection]);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('hasOnboarded', 'true');
    navigate('/auth');
  };

  const handleSkip = () => {
    localStorage.setItem('hasOnboarded', 'true');
    navigate('/auth');
  };

  const screen = SCREENS[page];
  const isLast = page === SCREENS.length - 1;

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Skip button */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 20,
            padding: '8px 12px',
          }}
        >
          Skip
        </motion.button>
      )}

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -5000) paginate(1);
              else if (swipe > 5000) paginate(-1);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Big emoji */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '80px', marginBottom: '24px' }}
            >
              {screen.emoji}
            </motion.div>

            {/* Title */}
            <h1
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: '28px',
                color: theme.colors.white,
                margin: '0 0 8px',
                lineHeight: 1.2,
              }}
            >
              {screen.title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '15px',
                color: 'rgba(255,255,255,0.7)',
                margin: '0 0 32px',
                maxWidth: '280px',
              }}
            >
              {screen.subtitle}
            </p>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
              {screen.features.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{feature.icon}</span>
                  <span
                    style={{
                      fontFamily: theme.fonts.body,
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: 'left',
                    }}
                  >
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingBottom: '16px' }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SCREENS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === page ? 24 : 8,
                background: i === page ? theme.colors.white : 'rgba(255,255,255,0.3)',
              }}
              transition={{ duration: 0.3 }}
              style={{
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setPage([i, i > page ? 1 : -1])}
            />
          ))}
        </div>

        {/* Action button */}
        {isLast ? (
          <Button variant="coral" size="lg" fullWidth onClick={handleGetStarted}>
            Get Started
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => paginate(1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
