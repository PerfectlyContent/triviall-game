import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
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

  if (!user) {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    return <Navigate to={hasOnboarded ? '/auth' : '/onboarding'} replace />;
  }

  return <>{children}</>;
}
