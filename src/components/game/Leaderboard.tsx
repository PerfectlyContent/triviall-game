import { AnimatePresence } from 'framer-motion';
import type { Player } from '../../types';
import { useTranslation } from '../../i18n';
import { PlayerCard } from './PlayerCard';
import { theme } from '../../utils/theme';

interface LeaderboardProps {
  players: Player[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  const { t } = useTranslation();
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h3
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: '18px',
          color: theme.colors.white,
          marginBottom: '12px',
          textAlign: 'center',
        }}
      >
        {t('leaderboard.title')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {sorted.map((player, i) => (
            <PlayerCard
              key={player.id}
              player={player}
              rank={i + 1}
              showScore
              isActive={i === 0}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
