import { z } from "zod";
import { CreatorType, ChallengeStatus } from "@prisma/client";

export const createChallengeSchema = z.object({
    matchRequestId: z.string().uuid("Invalid MatchRequest ID"),
    challengerType: z.nativeEnum(CreatorType),
    challengerId: z.string().uuid("Invalid Challenger ID")
});

export const updateChallengeStatusSchema = z.object({
    status: z.nativeEnum(ChallengeStatus)
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeStatusInput = z.infer<typeof updateChallengeStatusSchema>;
