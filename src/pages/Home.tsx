import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../types';
import { theme } from '../utils/theme';
import { Button } from '../components/ui/Button';
/* ─── how-to-play steps ─── */
const STEPS = [
  { num: 1, icon: '✏️', label: 'Create', color: '#FFE0B2', iconBg: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' },
  { num: 2, icon: '🔗', label: 'Share', color: '#F8BBD0', iconBg: 'linear-gradient(135deg, #E91E63 0%, #FF5252 100%)' },
  { num: 3, icon: '🎮', label: 'Play', color: '#C8E6C9', iconBg: 'linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%)' },
];

export function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { profile, isPro, gamesRemaining, canPlay } = useAuth();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        height: '100vh',
        padding: '0 24px 32px',
      }}
    >

      {/* ── Account button (top-left) ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/account')}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 20,
          color: theme.colors.white,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
        }}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          (profile?.display_name || 'U').charAt(0).toUpperCase()
        )}
      </motion.button>

      {/* ── Free games / Pro badge ── */}
      {isPro ? (
        <div
          style={{
            position: 'absolute',
            top: '68px',
            left: '16px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#1A1A2E',
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '10px',
            padding: '3px 10px',
            borderRadius: '12px',
            letterSpacing: '0.5px',
            zIndex: 20,
          }}
        >
          PRO
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '68px',
            left: '16px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '12px',
            zIndex: 20,
          }}
        >
          {gamesRemaining > 0 ? `${gamesRemaining} free game${gamesRemaining !== 1 ? 's' : ''} left` : 'No free games left'}
        </div>
      )}

      {/* ── Ambient radial sweep behind title ── */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '350px',
          background: 'radial-gradient(ellipse at center, rgba(160,230,255,0.4) 0%, rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Language selector ── */}
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 20,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLangDropdown(!showLangDropdown)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
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
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(20px)',
                minWidth: '170px',
                border: '1px solid rgba(255,255,255,0.5)',
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
                    background: language === lang.code ? 'rgba(74,154,232,0.12)' : 'transparent',
                    color: '#1E3A5F',
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
                    <span style={{ marginInlineStart: 'auto', fontSize: '14px', color: '#3578D8' }}>✓</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hero illustration ── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.1 }}
        style={{
          marginTop: '60px',
          width: '180px',
          height: '180px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.img
          src="/hero-illustration.png"
          alt="TriviAll"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))',
          }}
        />
      </motion.div>

      {/* ── Title: White with Cyan/Teal 3D extrusion ── */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.25 }}
        style={{ textAlign: 'center', marginTop: '-10px', position: 'relative', zIndex: 2 }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '56px',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            WebkitTextStroke: '2px #FFFFFF',
            /* Hand-crafted 3D shadow matching the reference */
            textShadow: `
              -1px 1px 0 #A8F0FF,
              -2px 2px 0 #5CE1FF,
              -3px 3px 0 #18C9ED,
              -4px 4px 0 #00A6C7,
              -5px 5px 0 #0087A3,
              -6px 6px 0 #00607A,
              -7px 7px 12px rgba(0, 0, 0, 0.4),
              0 0 40px rgba(160,230,255,0.6)
            `,
            lineHeight: 1,
            letterSpacing: '1px',
            margin: 0,
            transform: 'perspective(500px) rotateX(10deg) rotateY(-5deg)',
          }}
        >
          TriviAll
        </h1>
      </motion.div>

      {/* ── Tagline ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: '14px',
          color: 'rgba(255,255,255,0.9)',
          marginTop: '32px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        Fair play for everyone ✨
      </motion.p>

      {/* ── How to Play cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '320px',
          justifyContent: 'center',
        }}
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            whileHover={{ y: -4, scale: 1.04 }}
            style={{
              flex: 1,
              background: step.color,
              borderRadius: '20px',
              padding: '18px 8px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {/* Step badge */}
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-4px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: step.iconBg,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: theme.fonts.display,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {step.num}
            </div>

            {/* Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {step.icon}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '13px',
                color: '#2D3748',
                letterSpacing: '0.3px',
              }}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Connector dots between cards ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        style={{
          display: 'flex',
          gap: '4px',
          marginTop: '-50px',
          marginBottom: '26px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </motion.div>

      {/* ── Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '320px',
          position: 'relative',
          zIndex: 2,
          marginTop: '28px',
        }}
      >
        <Button variant="coral" size="lg" fullWidth onClick={() => navigate(canPlay ? '/setup' : '/paywall')}>
          🎮 {t('home.hostGame')}
        </Button>

        <Button variant="glass" size="lg" fullWidth onClick={() => navigate(canPlay ? '/join' : '/paywall')}>
          🔗 {t('home.joinGame')}
        </Button>
      </motion.div>

      {/* ── Footer ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2 }}
        style={{
          fontFamily: theme.fonts.body,
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: 'auto',
          paddingTop: '24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {t('home.poweredBy')}
      </motion.p>
    </div>
  );
}
