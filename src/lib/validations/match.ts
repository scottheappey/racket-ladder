import { z } from 'zod';

/**
 * Match creation validation schema
 */
export const CreateMatchSchema = z.object({
  seasonId: z.string().cuid(),
  playerAId: z.string().cuid(),
  playerBId: z.string().cuid(),
  scheduledAt: z.string().datetime().optional()
}).refine(data => data.playerAId !== data.playerBId, {
  message: "Players must be different",
  path: ["playerBId"]
});

/**
 * Match result submission schema
 */
export const SubmitResultSchema = z.object({
  matchId: z.string().cuid(),
  winnerId: z.string().cuid(),
  setsJson: z.string(), // JSON string of set scores like "[6,4,6,3]"
  playedAt: z.string().datetime().optional()
});

/**
 * Match query/filter schema
 */
export const MatchFilterSchema = z.object({
  seasonId: z.string().cuid().optional(),
  playerId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'PLAYED', 'WALKOVER', 'CANCELLED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

/**
 * Bulk match creation schema (for tournaments/round-robin)
 */
export const CreateBulkMatchesSchema = z.object({
  seasonId: z.string().cuid(),
  playerIds: z.array(z.string().cuid()).min(2),
  format: z.enum(['ROUND_ROBIN', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION']),
  scheduledStartDate: z.string().datetime().optional(),
  courtIds: z.array(z.string()).optional(),
  matchDurationMinutes: z.number().int().min(30).max(180).default(90)
});

export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;
export type SubmitResultInput = z.infer<typeof SubmitResultSchema>;
export type MatchFilterInput = z.infer<typeof MatchFilterSchema>;
