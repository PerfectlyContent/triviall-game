import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../i18n';
import { useLanguage } from '../App';
import { LANGUAGES } from '../types';
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
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showLangDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangDropdown]);

  const currentLang = LANGUAGES.find((l) => l.code === language);

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
      {/* Language selector */}
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLangDropdown(!showLangDropdown)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Change language"
        >
          {currentLang?.flag ?? '🌐'}
        </motion.button>

        <AnimatePresence>
          {showLangDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '52px',
                right: '0',
                background: 'rgba(30, 20, 60, 0.95)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(20px)',
                minWidth: '160px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: language === lang.code ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: theme.colors.white,
                    fontFamily: theme.fonts.body,
                    fontWeight: language === lang.code ? 700 : 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <span style={{ marginInlineStart: 'auto', fontSize: '14px', color: theme.colors.primaryTeal }}>✓</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
          {t('home.trivia')}
          <br />
          {t('home.game')}
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
        {t('home.tagline')}
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
          🎮 {t('home.hostGame')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate('/join')}
        >
          🔗 {t('home.joinGame')}
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
        {t('home.poweredBy')}
      </motion.p>
    </div>
  );
}
