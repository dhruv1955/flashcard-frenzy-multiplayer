export type UUID = string;

export interface UserProfile {
  id: UUID;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface QuestionOption {
  id: UUID;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: UUID;
  prompt: string;
  options: QuestionOption[];
  timeLimitSeconds: number; // per-question timer
}

export type GameStatus = 'waiting' | 'in_progress' | 'completed';

export interface Game {
  id: UUID;
  hostUserId: UUID;
  status: GameStatus;
  currentQuestionIndex: number;
  questionSetId?: UUID;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  players: UUID[]; // user ids
}

export interface PlayerScore {
  userId: UUID;
  correct: number;
  incorrect: number;
  totalTimeMs: number; // sum of response times
  lastUpdatedAt: string;
}

export interface RealtimeGameEvent<TType extends string = string, TPayload = unknown> {
  id: UUID;
  type: TType;
  payload: TPayload;
  occurredAt: string;
}


