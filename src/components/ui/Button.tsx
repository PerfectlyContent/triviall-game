import { motion } from 'framer-motion';
import { theme } from '../../utils/theme';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'coral';
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
  },
  secondary: {
    background: theme.colors.white,
    color: theme.colors.darkText,
    border: `2px solid ${theme.colors.lightGray}`,
  },
  outline: {
    background: 'transparent',
    color: theme.colors.white,
    border: `2px solid ${theme.colors.white}`,
  },
  coral: {
    background: theme.gradients.coral,
    color: theme.colors.white,
    border: 'none',
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
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily: theme.fonts.display,
        fontWeight: 700,
        borderRadius: theme.borderRadius.lg,
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
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
