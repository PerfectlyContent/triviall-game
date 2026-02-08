import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Confetti } from '../components/ui/Confetti';
import { Button } from '../components/ui/Button';
import { Leaderboard } from '../components/game/Leaderboard';
import { AwardCard, computeAwards } from '../components/game/AwardCard';
import { theme } from '../utils/theme';

export function Results() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { game } = state;

  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
  const awards = computeAwards(game.players);

  const handlePlayAgain = () => {
    // Reset scores but keep settings and players
    actions.resetGame();
    navigate('/setup');
  };

  const handleHome = () => {
    actions.resetGame();
    navigate('/');
  };

  if (!winner) {
    navigate('/');
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.gradients.purple,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Confetti />

      {/* Decorative shapes */}
      {[80, 120, 60].map((size, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -15, 0], rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, delay: i }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            top: `${20 + i * 30}%`,
            right: i % 2 === 0 ? '-10%' : undefined,
            left: i % 2 !== 0 ? '-5%' : undefined,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Header */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}
      >
        <span style={{ fontSize: '48px' }}>👑</span>
        <h1
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '32px',
            color: theme.colors.white,
            marginBottom: '4px',
          }}
        >
          {isTie ? "It's a Tie!" : 'Winner!'}
        </h1>
      </motion.div>

      {/* Winner Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.xl,
          padding: '24px',
          textAlign: 'center',
          boxShadow: `0 10px 40px rgba(0,0,0,0.2), ${theme.shadows.glow('#FFD93D')}`,
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: theme.gradients.yellow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '42px',
            margin: '0 auto 12px',
            boxShadow: theme.shadows.glow('#FFD93D'),
          }}
        >
          {winner.avatarEmoji}
        </motion.div>
        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '24px',
            color: theme.colors.darkText,
            marginBottom: '4px',
          }}
        >
          {winner.name}
        </h2>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: '36px',
            color: theme.colors.primaryTeal,
          }}
        >
          {winner.score}
          <span
            style={{
              fontSize: '16px',
              color: theme.colors.mediumGray,
              fontWeight: 700,
              marginLeft: '4px',
            }}
          >
            pts
          </span>
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: '13px',
            color: theme.colors.mediumGray,
            marginTop: '4px',
          }}
        >
          {winner.correctAnswers}/{winner.totalAnswers} correct
          {winner.bestStreak > 0 && ` • Best streak: ${winner.bestStreak}`}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}
      >
        <Leaderboard players={game.players} />
      </motion.div>

      {/* Awards */}
      {awards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}
        >
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
            Awards
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {awards.map((award, i) => (
              <AwardCard key={award.title} award={award} delay={0.8 + i * 0.15} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button variant="coral" size="lg" fullWidth onClick={handlePlayAgain}>
          🎮 Play Again
        </Button>
        <Button variant="outline" size="md" fullWidth onClick={handleHome}>
          🏠 Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
