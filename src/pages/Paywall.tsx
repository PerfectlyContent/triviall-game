import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../services/stripe';
import { theme } from '../utils/theme';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: '♾️', text: 'Unlimited games' },
  { icon: '🔬', text: 'All 12 subjects' },
  { icon: '🌐', text: 'Online multiplayer' },
  { icon: '🧠', text: 'AI-powered questions' },
  { icon: '👨‍👩‍👧‍👦', text: 'Kid-friendly mode' },
  { icon: '🏆', text: 'Streaks & leaderboards' },
];

export function Paywall() {
  const navigate = useNavigate();
  const { isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already pro, redirect to home
  if (isPro) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '24px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '56px', marginBottom: '12px' }}
        >
          🔒
        </motion.div>
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '24px',
            color: theme.colors.white,
            margin: '0 0 8px',
          }}
        >
          You've used all 3 free games!
        </h1>
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0,
          }}
        >
          Upgrade to keep playing
        </p>
      </motion.div>

      {/* Pricing card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
          marginBottom: '20px',
        }}
      >
        {/* Pro badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#1A1A2E',
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            PRO
          </span>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: '48px',
              color: theme.colors.darkText,
            }}
          >
            $7.99
          </span>
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '16px',
              color: theme.colors.mediumGray,
            }}
          >
            /month
          </span>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{feature.icon}</span>
              <span
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: theme.colors.darkText,
                }}
              >
                {feature.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Subscribe button */}
        <Button variant="coral" size="lg" fullWidth onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Opening checkout...' : 'Subscribe Now'}
        </Button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '13px',
              color: theme.colors.error,
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            {error}
          </motion.p>
        )}

        <p
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: '12px',
            color: theme.colors.mediumGray,
            textAlign: 'center',
            marginTop: '12px',
            marginBottom: 0,
          }}
        >
          Cancel anytime. Powered by Stripe.
        </p>
      </motion.div>

      {/* Maybe later */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          padding: '12px',
        }}
      >
        Maybe later
      </motion.button>
    </div>
  );
}
