import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Confetti } from '../components/ui/Confetti';
import { computeAwards } from '../components/game/AwardCard';
import { useTranslation } from '../i18n';
import { useLanguage } from '../App';
import { theme } from '../utils/theme';

export function Results() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { game } = state;
  const { t } = useTranslation();
  const { language } = useLanguage();

  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
  const awards = computeAwards(game.players, language);

  const handlePlayAgain = () => {
    actions.playAgain();
    actions.startGame();
    navigate('/round');
  };

  const handleNewGame = () => {
    actions.resetGame();
    navigate('/');
  };

  if (!winner) {
    navigate('/');
    return null;
  }

  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.gradients.purple,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Confetti />

      {/* Winner section */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: '44px' }}>👑</span>

        {/* Winner avatar */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: theme.gradients.yellow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '42px',
            margin: '8px auto 12px',
            boxShadow: '0 4px 20px rgba(255,217,61,0.5)',
          }}
        >
          {winner.avatarEmoji}
        </motion.div>

        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '28px',
            color: theme.colors.white,
            margin: '0 0 4px',
          }}
        >
          {isTie ? t('results.tie') : t('results.wins', { name: winner.name })}
        </h1>
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
          }}
        >
          {winner.score} {t('results.pts')} · {winner.correctAnswers}/{winner.totalAnswers} {t('results.correct')}
          {winner.bestStreak > 1 && ` · 🔥${winner.bestStreak} ${t('results.streak')}`}
        </p>
      </motion.div>

      {/* Other players (if more than 1) */}
      {sortedPlayers.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: theme.borderRadius.lg,
            padding: '4px 0',
            marginBottom: '16px',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {sortedPlayers.slice(1).map((player, i) => {
            const rank = i + 2;
            const accuracy = player.totalAnswers > 0
              ? Math.round((player.correctAnswers / player.totalAnswers) * 100)
              : 0;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderBottom: i < sortedPlayers.length - 2 ? '1px solid #F0F0F5' : 'none',
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    fontSize: '16px',
                    color: rankColors[rank - 1] ?? theme.colors.mediumGray,
                    width: '20px',
                    textAlign: 'center',
                  }}
                >
                  {rank}
                </span>

                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: theme.colors.lightGray,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {player.avatarEmoji}
                </div>

                {/* Name + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
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
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {player.name}
                    </span>
                    {player.age === 'kid' && (
                      <span
                        style={{
                          fontSize: '9px',
                          background: theme.colors.primaryTeal,
                          color: theme.colors.white,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {t('results.kid')}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fonts.body,
                      fontWeight: 600,
                      fontSize: '12px',
                      color: theme.colors.mediumGray,
                    }}
                  >
                    {player.correctAnswers}/{player.totalAnswers} {t('results.correct')} · {accuracy}%
                    {player.bestStreak > 1 && ` · 🔥${player.bestStreak}`}
                  </div>
                </div>

                {/* Score */}
                <div
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    fontSize: '18px',
                    color: theme.colors.darkText,
                    flexShrink: 0,
                  }}
                >
                  {player.score}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: theme.colors.mediumGray,
                      marginInlineStart: '2px',
                    }}
                  >
                    {t('results.pts')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {awards.map((award, i) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.1, type: 'spring', stiffness: 200 }}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: theme.borderRadius.md,
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{award.emoji}</div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px',
                  lineHeight: 1.2,
                }}
              >
                {award.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 700,
                  fontSize: '12px',
                  color: theme.colors.white,
                }}
              >
                {award.playerName}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {award.value}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePlayAgain}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '50px',
            border: 'none',
            background: theme.colors.white,
            color: theme.colors.darkText,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '17px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          🔄 {t('results.playAgain')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNewGame}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '50px',
            border: '2px solid rgba(255,255,255,0.25)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {t('results.newGame')}
        </motion.button>
      </motion.div>
    </div>
  );
}
