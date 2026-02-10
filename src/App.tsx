import { useState, createContext, useContext, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
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
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

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
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0,0,0,0.3)',
            }}
          >
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
