import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { theme } from '../utils/theme';

const floatingShapes = [
  { size: 120, top: '10%', left: '-5%', delay: 0 },
  { size: 80, top: '25%', right: '-3%', delay: 1 },
  { size: 60, top: '55%', left: '10%', delay: 2 },
  { size: 100, top: '70%', right: '5%', delay: 0.5 },
  { size: 40, top: '85%', left: '25%', delay: 1.5 },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.gradients.purple,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: shape.size,
            height: shape.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            top: shape.top,
            left: shape.left,
            right: shape.right,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '52px',
            color: theme.colors.white,
            textShadow: `
              0 2px 0 #5a67d8,
              0 4px 0 #4c51bf,
              0 6px 0 #434190,
              0 8px 15px rgba(0,0,0,0.3)
            `,
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          TRIVIA
          <br />
          GAME
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 700,
          fontSize: '28px',
          background: 'linear-gradient(135deg, #00D4C8, #FFD93D, #FF6B8A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        TriviAll
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Fair play for everyone
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          maxWidth: '320px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          variant="coral"
          size="lg"
          fullWidth
          onClick={() => navigate('/setup')}
        >
          🎮 Host New Game
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate('/join')}
        >
          🔗 Join Game
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        style={{
          fontFamily: theme.fonts.body,
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          position: 'absolute',
          bottom: '20px',
        }}
      >
        Powered by AI
      </motion.p>
    </div>
  );
}
