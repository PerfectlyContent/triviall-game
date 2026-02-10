import { motion } from 'framer-motion';
import type { Award } from '../../types';
import type { Language } from '../../types';
import { translations } from '../../i18n/translations';
import type { TranslationKey } from '../../i18n/translations';
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

export function computeAwards(players: import('../../types').Player[], language: Language = 'en'): Award[] {
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let s = translations[language]?.[key] ?? translations.en[key] ?? key;
    if (params) for (const [k, v] of Object.entries(params)) s = s.replace('{' + k + '}', String(v));
    return s;
  };

  if (players.length === 0) return [];

  const awards: Award[] = [];

  // Hottest Streak
  const streakPlayer = [...players].sort((a, b) => b.bestStreak - a.bestStreak)[0];
  if (streakPlayer.bestStreak > 0) {
    awards.push({
      title: t('award.hottestStreak'),
      description: t('award.longestStreak'),
      emoji: '🔥',
      playerName: streakPlayer.name,
      value: t('award.inARow', { n: streakPlayer.bestStreak }),
    });
  }

  // Sharpshooter
  const accuracyPlayer = [...players]
    .filter((p) => p.totalAnswers > 0)
    .sort((a, b) => b.correctAnswers / b.totalAnswers - a.correctAnswers / a.totalAnswers)[0];
  if (accuracyPlayer) {
    const pct = Math.round((accuracyPlayer.correctAnswers / accuracyPlayer.totalAnswers) * 100);
    awards.push({
      title: t('award.sharpshooter'),
      description: t('award.highestAccuracy'),
      emoji: '🎯',
      playerName: accuracyPlayer.name,
      value: t('award.accuracyValue', { n: pct }),
    });
  }

  // Speed Demon
  const speedPlayer = [...players]
    .filter((p) => p.fastestAnswer !== null)
    .sort((a, b) => (a.fastestAnswer ?? Infinity) - (b.fastestAnswer ?? Infinity))[0];
  if (speedPlayer && speedPlayer.fastestAnswer !== null) {
    awards.push({
      title: t('award.speedDemon'),
      description: t('award.fastestAnswer'),
      emoji: '⚡',
      playerName: speedPlayer.name,
      value: t('award.speedValue', { n: speedPlayer.fastestAnswer.toFixed(1) }),
    });
  }

  return awards;
}
