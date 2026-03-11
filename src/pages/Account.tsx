import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createPortalSession } from '../services/stripe';
import { theme } from '../utils/theme';
import { Button } from '../components/ui/Button';

export function Account() {
  const navigate = useNavigate();
  const { user, profile, isPro, gamesRemaining, signOut } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  if (!user || !profile) {
    navigate('/auth', { replace: true });
    return null;
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Failed to open subscription portal');
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const displayName = profile.display_name || user.email?.split('@')[0] || 'Player';
  const avatarUrl = profile.avatar_url;

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
      }}
    >
      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.white,
          zIndex: 20,
        }}
      >
        ←
      </motion.button>

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{
          marginTop: '60px',
          marginBottom: '12px',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          />
        ) : (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              border: '3px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              color: theme.colors.white,
              fontFamily: theme.fonts.display,
              fontWeight: 900,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </motion.div>

      {/* Name */}
      <h1
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: '24px',
          color: theme.colors.white,
          margin: '0 0 4px',
        }}
      >
        {displayName}
      </h1>

      <p
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 24px',
        }}
      >
        {user.email}
      </p>

      {/* Stats card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          marginBottom: '16px',
        }}
      >
        {/* Subscription status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '15px',
              color: theme.colors.darkText,
            }}
          >
            Plan
          </span>
          <span
            style={{
              background: isPro
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : 'rgba(0,0,0,0.06)',
              color: isPro ? '#1A1A2E' : theme.colors.mediumGray,
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isPro ? 'PRO' : 'FREE'}
          </span>
        </div>

        {/* Games played */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '15px',
              color: theme.colors.darkText,
            }}
          >
            Games Played
          </span>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: '18px',
              color: theme.colors.darkText,
            }}
          >
            {profile.games_played}
          </span>
        </div>

        {/* Free games remaining (only for free tier) */}
        {!isPro && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '15px',
                color: theme.colors.darkText,
              }}
            >
              Free Games Left
            </span>
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: '18px',
                color: gamesRemaining > 0 ? theme.colors.success : theme.colors.error,
              }}
            >
              {gamesRemaining}
            </span>
          </div>
        )}

        {/* Action button */}
        {isPro ? (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? 'Opening...' : 'Manage Subscription'}
          </Button>
        ) : (
          <Button variant="coral" size="md" fullWidth onClick={() => navigate('/paywall')}>
            Upgrade to Pro
          </Button>
        )}
        {portalError && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: '13px',
              color: theme.colors.error,
              textAlign: 'center',
              marginTop: '8px',
              marginBottom: 0,
            }}
          >
            {portalError}
          </p>
        )}
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ width: '100%', maxWidth: '340px', marginTop: '8px' }}
      >
        <Button variant="glass" size="md" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
