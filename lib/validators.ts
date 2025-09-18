import { z } from 'zod';

export const createGameSchema = z.object({
  playerId: z.string().min(1),
});

export const joinGameSchema = z.object({
  playerId: z.string().min(1),
  gameId: z.string().min(1),
});

export const getGameSchema = z.object({
  id: z.string().min(1),
});

export const answerSchema = z.object({
  playerId: z.string().min(1),
  answer: z.string().min(1),
});

export const historySchema = z.object({
  userId: z.string().min(1),
});


