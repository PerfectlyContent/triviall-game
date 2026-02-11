import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GlassCard } from '../components/ui/Card';
import { EmojiPicker } from '../components/ui/EmojiPicker';
import { PlayerCard } from '../components/game/PlayerCard';
import { useTranslation } from '../i18n';
import { theme } from '../utils/theme';
import type { AgeGroup } from '../types';

export function Lobby() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { game } = state;
  const { t } = useTranslation();

  const [addName, setAddName] = useState('');
  const [addAge, setAddAge] = useState<AgeGroup>('adult');
  const [addKidAge, setAddKidAge] = useState<number>(8);
  const [addAvatar, setAddAvatar] = useState('😎');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLocal = game.settings.mode === 'local';
  const isOnline = game.settings.mode === 'online';
  const iAmHost = actions.isHost();
  const canStart = game.players.length >= 2;

  // Online mode: auto-navigate non-host clients to /round when game starts
  // (game_start broadcast sets status to 'playing')
  useEffect(() => {
    if (isOnline && game.status === 'playing') {
      navigate('/round');
    }
  }, [isOnline, game.status, navigate]);

  const handleAddPlayer = () => {
    if (!addName.trim()) return;
    actions.addLocalPlayer({
      name: addName.trim(),
      age: addAge,
      kidAge: addAge === 'kid' ? addKidAge : null,
      avatarEmoji: addAvatar,
    });
    setAddName('');
    setAddAvatar('🤩');
    setShowAddForm(false);
  };

  const handleStart = () => {
    actions.startGame();
    navigate('/round');
  };

  const copyCode = async () => {
    if (game.roomCode) {
      await navigator.clipboard.writeText(game.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.gradients.teal,
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { actions.resetGame(); navigate('/'); }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: theme.colors.white,
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ←
        </motion.button>
        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '24px',
            color: theme.colors.white,
          }}
        >
          {t('lobby.title')}
        </h2>
      </div>

      {/* Room Code (Online) */}
      {!isLocal && game.roomCode && (
        <GlassCard style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '8px',
            }}
          >
            {t('lobby.shareCode')}
          </p>
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: '48px',
              color: theme.colors.white,
              letterSpacing: '12px',
              marginBottom: '12px',
            }}
          >
            {game.roomCode}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: theme.borderRadius.full,
              padding: '8px 24px',
              color: theme.colors.white,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {copied ? `✓ ${t('lobby.copied')}` : `📋 ${t('lobby.copyCode')}`}
          </motion.button>
        </GlassCard>
      )}

      {/* Game Info */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {[
          `${game.settings.rounds} ${t('lobby.rounds')}`,
          `${game.settings.subjects.length} ${t('lobby.subjects')}`,
          game.settings.mode === 'local' ? t('lobby.sameDevice') : t('lobby.online'),
        ].map((tag) => (
          <span
            key={tag}
            style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: theme.borderRadius.full,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: '12px',
              color: theme.colors.white,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Players */}
      <div style={{ marginBottom: '20px' }}>
        <h3
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            fontSize: '16px',
            color: theme.colors.white,
            marginBottom: '12px',
          }}
        >
          {t('lobby.players')} ({game.players.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AnimatePresence>
            {game.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                showReady={!isLocal}
                onRemove={
                  isLocal && !player.isHost
                    ? () => actions.removePlayer(player.id)
                    : undefined
                }
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Player (Local) */}
      {isLocal && (
        <>
          {!showAddForm ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: theme.borderRadius.lg,
                border: `2px dashed rgba(255,255,255,0.4)`,
                background: 'transparent',
                color: theme.colors.white,
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              {t('lobby.addPlayer')}
            </motion.button>
          ) : (
            <Card style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder={t('lobby.playerName')}
                  maxLength={20}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${theme.colors.lightGray}`,
                    fontSize: '15px',
                    fontFamily: theme.fonts.body,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {(['kid', 'adult'] as AgeGroup[]).map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAddAge(a)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: theme.borderRadius.sm,
                      border: addAge === a ? `2px solid ${theme.colors.primaryTeal}` : `2px solid ${theme.colors.lightGray}`,
                      background: addAge === a ? `${theme.colors.primaryTeal}15` : theme.colors.white,
                      cursor: 'pointer',
                      fontFamily: theme.fonts.body,
                      fontWeight: 700,
                      fontSize: '13px',
                      color: theme.colors.darkText,
                    }}
                  >
                    {a === 'kid' ? `🧒 ${t('setup.kid')}` : `🧑 ${t('setup.adult')}`}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {addAge === 'kid' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', marginBottom: '12px' }}
                  >
                    <label
                      style={{
                        fontFamily: theme.fonts.display,
                        fontWeight: 700,
                        fontSize: '13px',
                        color: theme.colors.darkText,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {t('lobby.age')}
                    </label>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {[6, 7, 8, 9, 10, 11, 12].map((a) => (
                        <motion.button
                          key={a}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setAddKidAge(a)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: theme.borderRadius.md,
                            border: addKidAge === a
                              ? `2px solid ${theme.colors.primaryTeal}`
                              : `2px solid ${theme.colors.lightGray}`,
                            background: addKidAge === a ? `${theme.colors.primaryTeal}15` : theme.colors.white,
                            cursor: 'pointer',
                            fontFamily: theme.fonts.display,
                            fontWeight: 800,
                            fontSize: '14px',
                            color: addKidAge === a ? theme.colors.primaryTeal : theme.colors.darkText,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {a}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ marginBottom: '14px' }}>
                <EmojiPicker selected={addAvatar} onSelect={setAddAvatar} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowAddForm(false)}
                >
                  {t('lobby.cancel')}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!addName.trim()}
                  onClick={handleAddPlayer}
                >
                  {t('lobby.add')}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Start Button / Ready Toggle */}
      {isOnline && !iAmHost ? (
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '16px',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {t('lobby.waitingHost')}
        </div>
      ) : (
        <Button
          variant="coral"
          size="lg"
          fullWidth
          disabled={!canStart}
          onClick={handleStart}
        >
          {canStart ? `🚀 ${t('lobby.startGame')}` : t('lobby.needPlayers')}
        </Button>
      )}
    </div>
  );
}
