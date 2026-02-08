import { motion } from 'framer-motion';
import type { Award } from '../../types';
import { theme } from '../../utils/theme';

interface AwardCardProps {
  award: Award;
  delay?: number;
}

export function AwardCard({ award, delay = 0 }: AwardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: '20px',
        textAlign: 'center',
        boxShadow: theme.shadows.card,
        flex: 1,
        minWidth: '100px',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{award.emoji}</div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: '13px',
          color: theme.colors.purple,
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {award.title}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: '15px',
          color: theme.colors.darkText,
          marginBottom: '2px',
        }}
      >
        {award.playerName}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: '12px',
          color: theme.colors.mediumGray,
        }}
      >
        {award.value}
      </div>
    </motion.div>
  );
}

export function computeAwards(players: import('../../types').Player[]): Award[] {
  if (players.length === 0) return [];

  const awards: Award[] = [];

  // Hottest Streak
  const streakPlayer = [...players].sort((a, b) => b.bestStreak - a.bestStreak)[0];
  if (streakPlayer.bestStreak > 0) {
    awards.push({
      title: 'Hottest Streak',
      description: 'Longest answer streak',
      emoji: '🔥',
      playerName: streakPlayer.name,
      value: `${streakPlayer.bestStreak} in a row`,
    });
  }

  // Sharpshooter
  const accuracyPlayer = [...players]
    .filter((p) => p.totalAnswers > 0)
    .sort((a, b) => b.correctAnswers / b.totalAnswers - a.correctAnswers / a.totalAnswers)[0];
  if (accuracyPlayer) {
    const pct = Math.round((accuracyPlayer.correctAnswers / accuracyPlayer.totalAnswers) * 100);
    awards.push({
      title: 'Sharpshooter',
      description: 'Highest accuracy',
      emoji: '🎯',
      playerName: accuracyPlayer.name,
      value: `${pct}% accuracy`,
    });
  }

  // Speed Demon
  const speedPlayer = [...players]
    .filter((p) => p.fastestAnswer !== null)
    .sort((a, b) => (a.fastestAnswer ?? Infinity) - (b.fastestAnswer ?? Infinity))[0];
  if (speedPlayer && speedPlayer.fastestAnswer !== null) {
    awards.push({
      title: 'Speed Demon',
      description: 'Fastest correct answer',
      emoji: '⚡',
      playerName: speedPlayer.name,
      value: `${speedPlayer.fastestAnswer.toFixed(1)}s`,
    });
  }

  return awards;
}
