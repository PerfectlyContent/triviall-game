import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

type AuthMode = 'signin' | 'signup';

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detect OAuth callback params (code for PKCE, or hash tokens for implicit flow)
  const hasOAuthParams = location.search.includes('code=') || location.hash.includes('access_token');
  const [oauthTimedOut, setOauthTimedOut] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Timeout for OAuth exchange — don't hang forever
  useEffect(() => {
    if (hasOAuthParams && !user && !oauthTimedOut) {
      const timer = setTimeout(() => setOauthTimedOut(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [hasOAuthParams, user, oauthTimedOut]);

  // Show loading while auth is initializing or OAuth code exchange is in progress
  if (authLoading || (hasOAuthParams && !user && !oauthTimedOut)) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, displayName.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage('Check your email to confirm your account, then sign in.');
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) setError(result.error);
    // OAuth redirects, no need for navigation here
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '2px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.95)',
    fontFamily: theme.fonts.body,
    fontWeight: 600,
    fontSize: '15px',
    color: theme.colors.darkText,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '24px',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', marginBottom: '32px' }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '36px',
            color: theme.colors.white,
            margin: '0 0 4px',
            textShadow: `
              -1px 1px 0 #A8F0FF,
              -2px 2px 0 #5CE1FF,
              -3px 3px 0 #18C9ED,
              -4px 4px 8px rgba(0,0,0,0.3)
            `,
          }}
        >
          TriviAll
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
          {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
        </p>
      </motion.div>

      {/* Auth card */}
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
        }}
      >
        {/* Google button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: '2px solid rgba(0,0,0,0.08)',
            background: theme.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            fontSize: '15px',
            color: theme.colors.darkText,
            marginBottom: '20px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '12px',
              color: theme.colors.mediumGray,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
              autoComplete="name"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '13px',
                color: theme.colors.error,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {error}
            </motion.p>
          )}

          {successMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '13px',
                color: theme.colors.success,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {successMessage}
            </motion.p>
          )}

          <div style={{ marginTop: '4px' }}>
            <Button variant="primary" size="lg" fullWidth disabled={loading}>
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign In' : 'Create Account')
              }
            </Button>
          </div>
        </form>

        {/* Toggle mode */}
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: '13px',
            color: theme.colors.mediumGray,
            textAlign: 'center',
            marginTop: '16px',
            marginBottom: 0,
          }}
        >
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setSuccessMessage(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3578D8',
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
