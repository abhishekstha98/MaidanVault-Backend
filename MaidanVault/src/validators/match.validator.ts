import { z } from "zod";
import { MatchStatus } from "@prisma/client";

const futureDate = z.coerce.date().refine((date) => date > new Date(), {
    message: "Date must be in the future",
});

export const createMatchSchema = z.object({
    homeTeamId: z.string().uuid("Invalid Home Team ID"),
    awayTeamId: z.string().uuid("Invalid Away Team ID"),
    venueId: z.string().uuid("Invalid Venue ID").optional(),
    scheduledAt: futureDate,
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "A team cannot play against itself",
    path: ["awayTeamId"]
});

export const listMatchesSchema = z.object({
    teamId: z.string().uuid().optional(),
    status: z.nativeEnum(MatchStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
});

export const updateMatchScoreSchema = z.object({
    homeScore: z.string().optional(),
    awayScore: z.string().optional(),
    status: z.nativeEnum(MatchStatus).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type ListMatchesInput = z.infer<typeof listMatchesSchema>;
export type UpdateMatchScoreInput = z.infer<typeof updateMatchScoreSchema>;
