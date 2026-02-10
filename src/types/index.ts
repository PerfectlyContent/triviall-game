export type GameMode = 'local' | 'online';
export type GameStatus = 'lobby' | 'playing' | 'finished';
export type AgeGroup = 'kid' | 'adult';
export type QuestionType = 'multiple_choice' | 'true_false' | 'complete_phrase' | 'estimation';

export type Language = 'en' | 'he' | 'ru' | 'de' | 'pl' | 'es';

export const LANGUAGES: { code: Language; nativeName: string; flag: string; rtl: boolean }[] = [
  { code: 'en', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'he', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'pl', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸', rtl: false },
];

export type Subject =
  | 'Science' | 'History' | 'Gaming' | 'Movies' | 'Music'
  | 'Sports' | 'Nature' | 'Food' | 'Travel' | 'Pop Culture'
  | 'Art' | 'Tech';

export const ALL_SUBJECTS: Subject[] = [
  'Science', 'History', 'Gaming', 'Movies', 'Music',
  'Sports', 'Nature', 'Food', 'Travel', 'Pop Culture',
  'Art', 'Tech',
];

export const QUESTION_TYPES: QuestionType[] = [
  'multiple_choice', 'true_false', 'complete_phrase', 'estimation',
];

export interface Player {
  id: string;
  name: string;
  age: AgeGroup;
  kidAge: number | null; // 6-12 when age === 'kid', null for adults
  avatarEmoji: string;
  difficulty: number;
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAnswers: number;
  fastestAnswer: number | null;
  isReady: boolean;
  isHost: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: Subject;
  difficulty: number;
  timeLimit: number;
}

export interface GameSettings {
  mode: GameMode;
  subjects: Subject[];
  rounds: 3 | 5 | 10;
  defaultDifficulty: number;
  language: Language;
}

export interface RoundResult {
  playerId: string;
  round: number;
  questionId: string;
  answer: string | null;
  isCorrect: boolean;
  timeElapsed: number;
  pointsEarned: number;
}

export interface GameState {
  id: string;
  roomCode: string | null;
  hostId: string;
  status: GameStatus;
  settings: GameSettings;
  players: Player[];
  currentRound: number;
  currentRoundSubject: Subject | null;
  currentPlayerTurnIndex: number;
  currentQuestion: Question | null;
  questionHistory: string[];
  roundResults: RoundResult[];
}

export interface Award {
  title: string;
  description: string;
  emoji: string;
  playerName: string;
  value: string;
}

export function createDefaultPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: '',
    name: '',
    age: 'adult',
    kidAge: null,
    avatarEmoji: '😀',
    difficulty: 5,
    score: 0,
    lives: 3,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    fastestAnswer: null,
    isReady: false,
    isHost: false,
    ...overrides,
  };
}

export function createDefaultGameState(): GameState {
  return {
    id: '',
    roomCode: null,
    hostId: '',
    status: 'lobby',
    settings: {
      mode: 'local',
      subjects: [...ALL_SUBJECTS],
      rounds: 5,
      defaultDifficulty: 5,
      language: 'en',
    },
    players: [],
    currentRound: 1,
    currentRoundSubject: null,
    currentPlayerTurnIndex: 0,
    currentQuestion: null,
    questionHistory: [],
    roundResults: [],
  };
}
