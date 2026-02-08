import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmojiPicker } from '../components/ui/EmojiPicker';
import { theme } from '../utils/theme';
import type { AgeGroup } from '../types';

export function Join() {
  const navigate = useNavigate();
  const { actions, state } = useGame();

  const [roomCode, setRoomCode] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeGroup>('adult');
  const [avatar, setAvatar] = useState('😎');
  const [step, setStep] = useState<'code' | 'profile'>('code');
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeInput = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!char && value === '') {
      const newCode = [...roomCode];
      newCode[index] = '';
      setRoomCode(newCode);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }
    if (!char) return;

    const newCode = [...roomCode];
    newCode[index] = char[0];
    setRoomCode(newCode);

    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !roomCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return;
    setError('');
    try {
      await actions.joinGame(roomCode.join(''), {
        name: name.trim(),
        age,
        avatarEmoji: avatar,
      });
      navigate('/lobby');
    } catch {
      setError('Room not found. Check the code and try again.');
    }
  };

  const code = roomCode.join('');
  const isCodeComplete = code.length === 4;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.gradients.teal,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => (step === 'profile' ? setStep('code') : navigate('/'))}
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
          Join Game
        </h2>
      </div>

      {step === 'code' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: '16px',
                color: theme.colors.darkText,
                marginBottom: '20px',
              }}
            >
              Enter Room Code
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              {roomCode.map((char, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  value={char}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  autoFocus={i === 0}
                  style={{
                    width: '56px',
                    height: '64px',
                    textAlign: 'center',
                    fontSize: '28px',
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${char ? theme.colors.primaryTeal : theme.colors.lightGray}`,
                    outline: 'none',
                    color: theme.colors.darkText,
                    textTransform: 'uppercase',
                    transition: 'border-color 0.2s',
                  }}
                />
              ))}
            </div>

            {error && (
              <p
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: theme.colors.error,
                  marginBottom: '12px',
                }}
              >
                {error}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isCodeComplete}
              onClick={() => setStep('profile')}
            >
              Next
            </Button>
          </Card>
        </motion.div>
      )}

      {step === 'profile' && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: '14px',
                  color: theme.colors.darkText,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: theme.borderRadius.md,
                  border: `2px solid ${theme.colors.lightGray}`,
                  fontSize: '16px',
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: '14px',
                  color: theme.colors.darkText,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Age Group
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['kid', 'adult'] as AgeGroup[]).map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAge(a)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: theme.borderRadius.md,
                      border: age === a ? `2px solid ${theme.colors.primaryTeal}` : `2px solid ${theme.colors.lightGray}`,
                      background: age === a ? `${theme.colors.primaryTeal}15` : theme.colors.white,
                      cursor: 'pointer',
                      fontFamily: theme.fonts.display,
                      fontWeight: 700,
                      fontSize: '14px',
                      color: theme.colors.darkText,
                    }}
                  >
                    {a === 'kid' ? '🧒 Kid' : '🧑 Adult'}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: '14px',
                  color: theme.colors.darkText,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Choose Avatar
              </label>
              <EmojiPicker selected={avatar} onSelect={setAvatar} />
            </div>

            <Button
              variant="coral"
              size="lg"
              fullWidth
              disabled={!name.trim() || state.isLoading}
              onClick={handleJoin}
            >
              {state.isLoading ? 'Joining...' : '🎮 Join Game'}
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
