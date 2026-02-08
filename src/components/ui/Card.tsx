import { motion } from 'framer-motion';
import { theme } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  animate?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, padding = '24px', animate = true, style, onClick }: CardProps) {
  const Component = animate ? motion.div : 'div';
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <Component
      {...animateProps}
      onClick={onClick}
      style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding,
        boxShadow: theme.shadows.card,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

export function GlassCard({ children, padding = '24px', style, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: theme.borderRadius.lg,
        border: '1px solid rgba(255, 255, 255, 0.25)',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
