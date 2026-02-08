export type GameMode = 'local' | 'online';
export type GameStatus = 'lobby' | 'playing' | 'finished';
export type AgeGroup = 'kid' | 'adult';
export type QuestionType = 'multiple_choice' | 'true_false' | 'complete_phrase' | 'estimation';

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
    },
    players: [],
    currentRound: 1,
    currentPlayerTurnIndex: 0,
    currentQuestion: null,
    questionHistory: [],
    roundResults: [],
  };
}
