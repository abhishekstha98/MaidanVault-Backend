import { z } from "zod";

export const createTournamentSchema = z.object({
    body: z.object({
        name: z.string().min(3),
        sportType: z.enum(["FOOTBALL", "FUTSAL", "BASKETBALL", "BADMINTON", "CRICKET", "VOLLEYBALL"]),
        entryFee: z.number().min(0),
        prizePool: z.number().min(0),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        maxTeams: z.number().int().min(2),
    }),
});

export const registerTournamentSchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        teamId: z.string().uuid(),
        roster: z.array(z.string().uuid()).min(1),
    }),
});
