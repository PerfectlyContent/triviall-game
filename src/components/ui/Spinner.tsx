import { theme } from '../../utils/theme';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 40, color = theme.colors.white }: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}30`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
