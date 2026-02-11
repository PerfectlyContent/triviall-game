import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question, Subject } from '../../types';
import type { TranslationKey } from '../../i18n/translations';
import { useTranslation } from '../../i18n';
import { theme } from '../../utils/theme';

const SUBJECT_TRANSLATION_KEYS: Record<Subject, TranslationKey> = {
  Science: 'subject.Science',
  History: 'subject.History',
  Gaming: 'subject.Gaming',
  Movies: 'subject.Movies',
  Music: 'subject.Music',
  Sports: 'subject.Sports',
  Nature: 'subject.Nature',
  Food: 'subject.Food',
  Travel: 'subject.Travel',
  'Pop Culture': 'subject.PopCulture',
  Art: 'subject.Art',
  Tech: 'subject.Tech',
};

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  revealed: boolean;
  correctAnswer: string | null;
  selectedAnswer: string | null;
}

export function QuestionCard({ question, onAnswer, revealed, correctAnswer, selectedAnswer }: QuestionCardProps) {
  const { t } = useTranslation();
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
      padding: '12px 18px',
      borderRadius: '50px',
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
          padding: '20px',
          boxShadow: theme.shadows.card,
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            flexDirection: 'row',
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
            {t(SUBJECT_TRANSLATION_KEYS[question.subject as Subject])}
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

    </div>
  );
}
