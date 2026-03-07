import { useState, createContext, useContext, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { motion } from 'framer-motion';
import { GameProvider } from './context/GameContext';
import { I18nProvider } from './i18n';
import { Home } from './pages/Home';
import { GameSetup } from './pages/GameSetup';
import { Join } from './pages/Join';
import { Lobby } from './pages/Lobby';
import { Round } from './pages/Round';
import { Results } from './pages/Results';
import type { Language } from './types';

// Shared language state context — sits above GameProvider so Home page can use it
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => { },
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// --- floating particles ---
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.15,
}));

function GameLayout() {
  const [language, setLanguage] = useState<Language>('en');
  const handleSetLanguage = useCallback((lang: Language) => setLanguage(lang), []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      <I18nProvider language={language}>
        <GameProvider>
          <div
            style={{
              maxWidth: '430px',
              margin: '0 auto',
              minHeight: '100vh',
              background: 'linear-gradient(180deg, #4A9AE8 0%, #3578D8 35%, #2B62C4 65%, #1E4FA8 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── Background particles ── */}
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() > 0.5 ? 10 : -10, 0],
                  opacity: [p.opacity, p.opacity * 1.5, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.4)',
                  top: `${p.y}%`,
                  left: `${p.x}%`,
                  pointerEvents: 'none',
                  filter: 'blur(0.5px)',
                }}
              />
            ))}

            <Outlet />
          </div>
        </GameProvider>
      </I18nProvider>
    </LanguageContext.Provider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: GameLayout,
    children: [
      { index: true, Component: Home },
      { path: 'setup', Component: GameSetup },
      { path: 'join', Component: Join },
      { path: 'lobby', Component: Lobby },
      { path: 'round', Component: Round },
      { path: 'results', Component: Results },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
