import { z } from "zod";
import { CreatorType, SportType, SkillLevel, RequestStatus } from "@prisma/client";

const futureDate = z.coerce.date().refine((date) => date > new Date(), {
    message: "Date must be in the future",
});

export const createMatchRequestSchema = z.object({
    creatorType: z.nativeEnum(CreatorType),
    creatorId: z.string().uuid("Invalid Creator ID"),
    sportType: z.nativeEnum(SportType),
    gameMode: z.string().min(1, "Game mode is required (e.g., 5v5)"),
    skillLevel: z.nativeEnum(SkillLevel),
    preferredLocation: z.string().min(1, "Preferred location is required"),
    scheduledAt: futureDate,
    venueId: z.string().uuid("Invalid Venue ID").optional(),
    isUrgent: z.boolean().optional(),
    notes: z.string().optional()
});

export const updateMatchRequestStatusSchema = z.object({
    status: z.nativeEnum(RequestStatus)
});

export type CreateMatchRequestInput = z.infer<typeof createMatchRequestSchema>;
export type UpdateMatchRequestStatusInput = z.infer<typeof updateMatchRequestStatusSchema>;
