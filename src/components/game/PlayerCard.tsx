import { motion } from 'framer-motion';
import type { Player } from '../../types';
import { useTranslation } from '../../i18n';
import { theme } from '../../utils/theme';

interface PlayerCardProps {
  player: Player;
  isActive?: boolean;
  showScore?: boolean;
  showReady?: boolean;
  onRemove?: () => void;
  rank?: number;
}

export function PlayerCard({ player, isActive = false, showScore = false, showReady = false, onRemove, rank }: PlayerCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: isActive ? `${theme.colors.primaryTeal}15` : theme.colors.white,
        borderRadius: theme.borderRadius.md,
        border: isActive ? `2px solid ${theme.colors.primaryTeal}` : '2px solid transparent',
        boxShadow: isActive ? theme.shadows.glow(theme.colors.primaryTeal) : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}
    >
      {rank !== undefined && (
        <span
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '16px',
            color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : theme.colors.mediumGray,
            minWidth: '24px',
          }}
        >
          {rank}
        </span>
      )}

      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: theme.colors.lightGray,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          border: isActive ? `2px solid ${theme.colors.primaryTeal}` : '2px solid transparent',
        }}
      >
        {player.avatarEmoji}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            fontSize: '15px',
            color: theme.colors.darkText,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {player.name}
          {player.isHost && (
            <span
              style={{
                fontSize: '10px',
                background: theme.colors.brightYellow,
                color: theme.colors.darkText,
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 800,
              }}
            >
              {t('player.host')}
            </span>
          )}
          {player.age === 'kid' && (
            <span
              style={{
                fontSize: '10px',
                background: theme.colors.primaryTeal,
                color: theme.colors.white,
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 800,
              }}
            >
              {t('player.kid')}
            </span>
          )}
        </div>
        {showScore && (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '13px',
              color: theme.colors.mediumGray,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{player.score} {t('results.pts')}</span>
            {player.streak >= 2 && (
              <span style={{ color: theme.colors.orange }}>
                🔥 {player.streak}
              </span>
            )}
          </div>
        )}
      </div>

      {showReady && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: player.isReady ? theme.colors.mintGreen : theme.colors.lightGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'background 0.3s',
          }}
        >
          {player.isReady ? '✓' : '⏳'}
        </div>
      )}

      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: theme.colors.error,
            color: theme.colors.white,
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
}
