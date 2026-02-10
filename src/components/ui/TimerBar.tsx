import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../utils/theme';

interface TimerBarProps {
  duration: number;
  onTimeout: () => void;
  isRunning: boolean;
}

export function TimerBar({ duration, onTimeout, isRunning }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef<number>(Date.now());
  const hasTimedOut = useRef(false);

  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    hasTimedOut.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasTimedOut.current) {
        hasTimedOut.current = true;
        clearInterval(interval);
        onTimeout();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, duration, onTimeout]);

  const progress = timeLeft / duration;
  const seconds = Math.ceil(timeLeft);

  const getColor = () => {
    if (progress > 0.5) return theme.colors.mintGreen;
    if (progress > 0.25) return theme.colors.brightYellow;
    return theme.colors.error;
  };

  const isUrgent = progress <= 0.25;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '14px',
      }}
    >
      {/* Progress bar track */}
      <div
        style={{
          flex: 1,
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: '4px',
            background: getColor(),
            width: `${progress * 100}%`,
            transition: 'width 0.05s linear, background 0.3s ease',
          }}
        />
      </div>

      {/* Countdown number */}
      <motion.span
        animate={isUrgent ? { scale: [1, 1.15, 1] } : {}}
        transition={isUrgent ? { repeat: Infinity, duration: 0.6 } : {}}
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: '18px',
          color: getColor(),
          minWidth: '28px',
          textAlign: 'center',
        }}
      >
        {seconds}
      </motion.span>
    </div>
  );
}
