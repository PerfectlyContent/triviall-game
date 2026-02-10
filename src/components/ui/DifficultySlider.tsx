import { useTranslation } from '../../i18n';
import { theme } from '../../utils/theme';

interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: boolean;
}

export function DifficultySlider({ value, onChange, label = true }: DifficultySliderProps) {
  const { t } = useTranslation();
  const getLabel = () => {
    if (value <= 3) return t('difficulty.easy');
    if (value <= 6) return t('difficulty.medium');
    return t('difficulty.hard');
  };

  const getColor = () => {
    if (value <= 3) return theme.colors.mintGreen;
    if (value <= 6) return theme.colors.brightYellow;
    return theme.colors.coralPink;
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: '14px',
              color: theme.colors.darkText,
            }}
          >
            {t('difficulty.label')}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: '14px',
              color: getColor(),
            }}
          >
            {value}/10 - {getLabel()}
          </span>
        </div>
      )}
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          appearance: 'none',
          background: `linear-gradient(to right, ${theme.colors.mintGreen}, ${theme.colors.brightYellow}, ${theme.colors.coralPink})`,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
