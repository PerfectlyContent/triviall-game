import { motion } from 'framer-motion';
import { theme } from '../../utils/theme';
import { AVATAR_EMOJIS } from '../../utils/theme';

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '6px',
      }}
    >
      {AVATAR_EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(emoji)}
          style={{
            width: '100%',
            aspectRatio: '1',
            fontSize: '22px',
            borderRadius: theme.borderRadius.md,
            border: selected === emoji ? `3px solid ${theme.colors.primaryTeal}` : '2px solid transparent',
            background: selected === emoji ? `${theme.colors.primaryTeal}15` : theme.colors.lightGray,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
