import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../../types';
import { theme } from '../../utils/theme';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  revealed: boolean;
  correctAnswer: string | null;
  selectedAnswer: string | null;
}

export function QuestionCard({ question, onAnswer, revealed, correctAnswer, selectedAnswer }: QuestionCardProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const selected = selectedAnswer ?? localSelected;

  const handleSelect = (option: string) => {
    if (revealed || selected) return;
    setLocalSelected(option);
    onAnswer(option);
  };

  const getOptionStyle = (option: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      padding: '14px 20px',
      borderRadius: theme.borderRadius.md,
      border: '2px solid #E8E8F0',
      fontSize: '16px',
      fontFamily: theme.fonts.body,
      fontWeight: 700,
      cursor: revealed || selected ? 'default' : 'pointer',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.3s ease',
    };

    if (revealed) {
      if (option === correctAnswer) {
        return {
          ...base,
          background: theme.gradients.green,
          color: theme.colors.white,
          border: '2px solid transparent',
          boxShadow: theme.shadows.glow(theme.colors.mintGreen),
        };
      }
      if (option === selected && option !== correctAnswer) {
        return {
          ...base,
          background: theme.gradients.pink,
          color: theme.colors.white,
          border: '2px solid transparent',
        };
      }
      return { ...base, background: '#F5F5FA', color: '#999', border: '2px solid #E8E8F0' };
    }

    if (option === selected) {
      return {
        ...base,
        background: theme.gradients.yellow,
        color: theme.colors.darkText,
        border: '2px solid #FFD93D',
        boxShadow: '0 4px 12px rgba(255,217,61,0.3)',
      };
    }

    return { ...base, background: theme.colors.white, color: theme.colors.darkText };
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          boxShadow: theme.shadows.card,
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '14px' }}>
            {theme.subjectEmojis[question.subject]}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: '13px',
              color: theme.colors.mediumGray,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {question.subject}
          </span>
        </div>
        <p
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '20px',
            color: theme.colors.darkText,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {question.text}
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option, i) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            whileHover={!revealed && !selected ? { scale: 1.02 } : {}}
            whileTap={!revealed && !selected ? { scale: 0.98 } : {}}
            onClick={() => handleSelect(option)}
            style={getOptionStyle(option)}
          >
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: revealed && option === correctAnswer
                  ? 'rgba(255,255,255,0.3)'
                  : selected === option
                    ? 'rgba(0,0,0,0.1)'
                    : theme.colors.lightGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {optionLabels[i]}
            </span>
            <span style={{ flex: 1 }}>{option}</span>
            {revealed && option === correctAnswer && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ fontSize: '20px' }}
              >
                ✓
              </motion.span>
            )}
            {selected === option && !revealed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ fontSize: '18px' }}
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {revealed && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: theme.borderRadius.md,
              backdropFilter: 'blur(5px)',
            }}
          >
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: '14px',
                color: theme.colors.darkText,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              💡 {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
