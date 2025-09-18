export type UUID = string;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionDoc {
  id: UUID;
  question: string;
  answer: string;
  category?: string;
  difficulty?: Difficulty;
  createdAt: string;
}

export type GameStatus = 'waiting' | 'in_progress' | 'completed';

export interface GameDoc {
  id: UUID;
  players: UUID[]; // user ids
  currentQuestion?: UUID; // question id
  scores: Record<UUID, number>;
  status: GameStatus;
  createdAt: string;
  endedAt?: string;
  // extended state for gameplay
  maxPlayers?: number; // default 6
  questionQueue?: UUID[]; // preselected 10 question ids
  currentIndex?: number; // 0-based index into questionQueue
  currentQuestionStartedAt?: string; // ISO timestamp
  answeredPlayerIds?: UUID[]; // who already answered current question
  firstCorrectPlayerId?: UUID | null; // winner for current question
  // per-question submission log for history
  submissions?: Array<{
    questionId: UUID;
    playerId: UUID;
    answer: string;
    correct: boolean;
    timeMs?: number;
    at: string;
  }>;
}

export interface GameHistoryDoc {
  gameId: UUID;
  playerId: UUID;
  answers: Array<{ questionId: UUID; correct: boolean; timeMs?: number; answer?: string }>;
  finalScore: number;
  duration: number; // milliseconds
  accuracy: number; // 0..1
  createdAt?: string;
}

// Supabase tables - shapes for reference when publishing realtime updates
export interface ActiveGameRow {
  id: UUID;
  game_state: unknown; // serialized state snapshot
  players: UUID[];
  current_question_id: UUID | null;
  scores: Record<UUID, number>;
  status: GameStatus;
}

export interface GameEventRow {
  id: UUID;
  game_id: UUID;
  player_id: UUID | null;
  event_type: string;
  data: unknown;
  timestamp: string;
}


