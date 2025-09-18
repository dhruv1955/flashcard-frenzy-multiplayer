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
}

export interface GameHistoryDoc {
  gameId: UUID;
  playerId: UUID;
  answers: Array<{ questionId: UUID; correct: boolean; timeMs?: number }>;
  finalScore: number;
  duration: number; // milliseconds
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


