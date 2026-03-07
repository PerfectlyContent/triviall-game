import { motion } from 'framer-motion';
import { theme } from '../../utils/theme';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'coral' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: theme.gradients.teal,
    color: theme.colors.white,
    border: 'none',
    boxShadow: `
      0 6px 0 #00B4D8,
      0 8px 20px rgba(0, 212, 200, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.3)
    `,
  },
  secondary: {
    background: theme.colors.white,
    color: '#1E3A5F', // Darker text for readability
    border: 'none',
    boxShadow: `
      0 6px 0 #E0E0EF,
      0 8px 20px rgba(0,0,0,0.1)
    `,
  },
  outline: {
    background: 'transparent',
    color: theme.colors.white,
    border: `2px solid ${theme.colors.white}`,
  },
  coral: {
    background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)',
    color: theme.colors.white,
    border: 'none',
    boxShadow: `
      0 6px 0 #D94E6B,
      0 8px 20px rgba(255,107,138,0.4),
      inset 0 1px 0 rgba(255,255,255,0.3)
    `,
  },
  glass: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: theme.colors.white,
    border: '2px solid rgba(255,255,255,0.4)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 20px', fontSize: '14px' },
  md: { padding: '12px 28px', fontSize: '16px' },
  lg: { padding: '16px 36px', fontSize: '18px' },
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  // Add an extra Y translation on hover/tap to make the 3D buttons feel tactile
  const is3D = variant === 'primary' || variant === 'coral';

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, y: is3D ? -2 : 0 }}
      whileTap={disabled ? {} : { scale: 0.97, y: is3D ? 2 : 0 }}
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        borderRadius: '18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: theme.shadows.button,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'opacity 0.2s',
        position: 'relative',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
