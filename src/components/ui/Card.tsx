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
  if (!animate) {
    return (
      <div
        onClick={onClick}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.95)', // Slightly transparent white
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px', // Rounder corners
        padding,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset', // Outer shadow + inner border
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
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
