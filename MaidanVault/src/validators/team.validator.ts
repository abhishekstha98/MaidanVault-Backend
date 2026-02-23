import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().min(1, "Team name is required").max(100),
    logoUrl: z.string().url().optional(),
});

export const listTeamsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type ListTeamsInput = z.infer<typeof listTeamsSchema>;
