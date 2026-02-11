import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmojiPicker } from '../components/ui/EmojiPicker';
import { DifficultySlider } from '../components/ui/DifficultySlider';
import { useTranslation } from '../i18n';
import { useLanguage } from '../App';
import { theme } from '../utils/theme';
import type { AgeGroup, GameMode, Subject, GameSettings } from '../types';
import { ALL_SUBJECTS } from '../types';
import type { TranslationKey } from '../i18n/translations';

const STEP_KEYS: TranslationKey[] = ['setup.profile', 'setup.mode', 'setup.subjects', 'setup.settings'];

const SUBJECT_TRANSLATION_KEYS: Record<Subject, TranslationKey> = {
  'Science': 'subject.Science',
  'History': 'subject.History',
  'Gaming': 'subject.Gaming',
  'Movies': 'subject.Movies',
  'Music': 'subject.Music',
  'Sports': 'subject.Sports',
  'Nature': 'subject.Nature',
  'Food': 'subject.Food',
  'Travel': 'subject.Travel',
  'Pop Culture': 'subject.PopCulture',
  'Art': 'subject.Art',
  'Tech': 'subject.Tech',
};

export function GameSetup() {
  const navigate = useNavigate();
  const { actions } = useGame();
  const { t, isRTL } = useTranslation();
  const { language } = useLanguage();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeGroup>('adult');
  const [kidAge, setKidAge] = useState<number>(8);
  const [avatar, setAvatar] = useState('😀');
  const [mode, setMode] = useState<GameMode>('local');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rounds, setRounds] = useState<3 | 5 | 10>(5);
  const [difficulty, setDifficulty] = useState(5);

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 2) return subjects.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEP_KEYS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate('/');
  };

  const handleCreate = async () => {
    const settings: GameSettings = {
      mode,
      subjects,
      rounds,
      defaultDifficulty: difficulty,
      language,
    };
    await actions.createGame({ name: name.trim(), age, kidAge: age === 'kid' ? kidAge : null, avatarEmoji: avatar }, settings);
    navigate('/lobby');
  };

  const toggleSubject = (s: Subject) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const toggleAllSubjects = () => {
    if (subjects.length === ALL_SUBJECTS.length) setSubjects([]);
    else setSubjects([...ALL_SUBJECTS]);
  };

  const slideVariants = {
    enter: { x: isRTL ? -100 : 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: isRTL ? 100 : -100, opacity: 0 },
  };

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
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
          {isRTL ? '→' : '←'}
        </motion.button>
        <h2
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: '22px',
            color: theme.colors.white,
            flex: 1,
          }}
        >
          {t(STEP_KEYS[step])}
        </h2>
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {step + 1}/{STEP_KEYS.length}
        </span>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {STEP_KEYS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: i <= step ? theme.colors.primaryTeal : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Step 0: Profile */}
          {step === 0 && (
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
                  {t('setup.yourName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('setup.enterName')}
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
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = theme.colors.primaryTeal)}
                  onBlur={(e) => (e.target.style.borderColor = theme.colors.lightGray)}
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
                  {t('setup.ageGroup')}
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
                      {a === 'kid' ? `🧒 ${t('setup.kid')}` : `🧑 ${t('setup.adult')}`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Kid Age Picker */}
              <AnimatePresence>
                {age === 'kid' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', marginBottom: '20px' }}
                  >
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
                      {t('setup.howOld')}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[6, 7, 8, 9, 10, 11, 12].map((a) => (
                        <motion.button
                          key={a}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setKidAge(a)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: theme.borderRadius.md,
                            border: kidAge === a
                              ? `2px solid ${theme.colors.primaryTeal}`
                              : `2px solid ${theme.colors.lightGray}`,
                            background: kidAge === a ? `${theme.colors.primaryTeal}15` : theme.colors.white,
                            cursor: 'pointer',
                            fontFamily: theme.fonts.display,
                            fontWeight: 800,
                            fontSize: '16px',
                            color: kidAge === a ? theme.colors.primaryTeal : theme.colors.darkText,
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

              <div>
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
                  {t('setup.chooseAvatar')}
                </label>
                <EmojiPicker selected={avatar} onSelect={setAvatar} />
              </div>
            </Card>
          )}

          {/* Step 1: Mode */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { value: 'local' as GameMode, icon: '📱', titleKey: 'setup.sameDevice' as TranslationKey, descKey: 'setup.sameDeviceDesc' as TranslationKey },
                { value: 'online' as GameMode, icon: '🌐', titleKey: 'setup.diffDevices' as TranslationKey, descKey: 'setup.diffDevicesDesc' as TranslationKey },
              ].map((opt) => (
                <Card
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  style={{
                    border: mode === opt.value
                      ? `2px solid ${theme.colors.primaryTeal}`
                      : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '36px' }}>{opt.icon}</span>
                    <div>
                      <div
                        style={{
                          fontFamily: theme.fonts.display,
                          fontWeight: 800,
                          fontSize: '17px',
                          color: theme.colors.darkText,
                        }}
                      >
                        {t(opt.titleKey)}
                      </div>
                      <div
                        style={{
                          fontFamily: theme.fonts.body,
                          fontWeight: 600,
                          fontSize: '13px',
                          color: theme.colors.mediumGray,
                        }}
                      >
                        {t(opt.descKey)}
                      </div>
                    </div>
                    {mode === opt.value && (
                      <span style={{ marginInlineStart: 'auto', fontSize: '20px', color: theme.colors.primaryTeal }}>
                        ✓
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: Subjects */}
          {step === 2 && (
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAllSubjects}
                  style={{
                    padding: '10px 20px',
                    borderRadius: theme.borderRadius.full,
                    border: subjects.length === ALL_SUBJECTS.length
                      ? `2px solid ${theme.colors.primaryTeal}`
                      : `2px solid ${theme.colors.lightGray}`,
                    background: subjects.length === ALL_SUBJECTS.length
                      ? `${theme.colors.primaryTeal}15`
                      : theme.colors.white,
                    cursor: 'pointer',
                    fontFamily: theme.fonts.display,
                    fontWeight: 700,
                    fontSize: '14px',
                    color: theme.colors.darkText,
                    width: '100%',
                  }}
                >
                  {subjects.length === ALL_SUBJECTS.length ? `✓ ${t('setup.allSubjects')}` : t('setup.selectAll')}
                </motion.button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {ALL_SUBJECTS.map((s) => {
                  const isSelected = subjects.includes(s);
                  return (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleSubject(s)}
                      style={{
                        padding: '14px 8px',
                        borderRadius: theme.borderRadius.md,
                        border: isSelected
                          ? '2px solid transparent'
                          : `2px solid ${theme.colors.lightGray}`,
                        background: isSelected ? theme.subjectGradients[s] : theme.colors.white,
                        color: isSelected ? theme.colors.white : theme.colors.darkText,
                        cursor: 'pointer',
                        fontFamily: theme.fonts.body,
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{theme.subjectEmojis[s]}</span>
                      {t(SUBJECT_TRANSLATION_KEYS[s])}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <Card>
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 700,
                    fontSize: '14px',
                    color: theme.colors.darkText,
                    display: 'block',
                    marginBottom: '12px',
                  }}
                >
                  {t('setup.numRounds')}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {([3, 5, 10] as const).map((r) => (
                    <motion.button
                      key={r}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRounds(r)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: theme.borderRadius.md,
                        border: rounds === r
                          ? `2px solid ${theme.colors.primaryTeal}`
                          : `2px solid ${theme.colors.lightGray}`,
                        background: rounds === r ? `${theme.colors.primaryTeal}15` : theme.colors.white,
                        cursor: 'pointer',
                        fontFamily: theme.fonts.display,
                        fontWeight: 700,
                        fontSize: '16px',
                        color: theme.colors.darkText,
                        textAlign: 'center',
                      }}
                    >
                      <div>{r}</div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: theme.colors.mediumGray,
                          marginTop: '2px',
                        }}
                      >
                        {r === 3 ? t('setup.quick') : r === 5 ? t('setup.classic') : t('setup.epic')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <DifficultySlider value={difficulty} onChange={setDifficulty} />
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom buttons */}
      <div style={{ marginTop: '24px' }}>
        {step < STEP_KEYS.length - 1 ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canProceed()}
            onClick={handleNext}
          >
            {t('setup.continue')}
          </Button>
        ) : (
          <Button
            variant="coral"
            size="lg"
            fullWidth
            onClick={handleCreate}
          >
            🚀 {t('setup.createLobby')}
          </Button>
        )}
      </div>
    </div>
  );
}
