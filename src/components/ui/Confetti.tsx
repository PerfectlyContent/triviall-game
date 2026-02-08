import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function Confetti() {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#00D4C8', '#FF6B8A', '#FFD93D', '#8B5CF6', '#FF9F43', '#00D9A5'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return null;
}

export function confettiBurst() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00D4C8', '#FF6B8A', '#FFD93D', '#8B5CF6', '#FF9F43'],
  });
}
