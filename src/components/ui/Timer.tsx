import { useState, useEffect, useRef } from 'react';
import { theme } from '../../utils/theme';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isRunning: boolean;
  size?: number;
}

export function Timer({ duration, onTimeout, isRunning, size = 60 }: TimerProps) {
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
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, duration, onTimeout]);

  const progress = timeLeft / duration;
  const circumference = 2 * Math.PI * ((size - 6) / 2);
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return theme.colors.mintGreen;
    if (progress > 0.25) return theme.colors.brightYellow;
    return theme.colors.error;
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 6) / 2}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 6) / 2}
          fill="none"
          stroke={getColor()}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: size * 0.35,
          color: theme.colors.white,
        }}
      >
        {Math.ceil(timeLeft)}
      </div>
    </div>
  );
}
