import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { GameProvider } from './context/GameContext';
import { Home } from './pages/Home';
import { GameSetup } from './pages/GameSetup';
import { Join } from './pages/Join';
import { Lobby } from './pages/Lobby';
import { Round } from './pages/Round';
import { Results } from './pages/Results';

function GameLayout() {
  return (
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
