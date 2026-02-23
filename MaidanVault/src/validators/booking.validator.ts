import { z } from "zod";
import { SportType } from "@prisma/client";

// Ensure start time is in the future
const futureDate = z.coerce.date().refine((date) => date > new Date(), {
    message: "Date must be in the future",
});

export const createBookingSchema = z.object({
    venueId: z.string().uuid("Invalid Venue ID"),
    teamId: z.string().uuid("Invalid Team ID").optional(),
    matchId: z.string().uuid("Invalid Match ID").optional(),
    sportType: z.nativeEnum(SportType, { message: "Invalid sport type" }),
    startTime: futureDate,
    endTime: futureDate,
}).refine((data) => data.startTime < data.endTime, {
    message: "endTime must be after startTime",
    path: ["endTime"]
});

export const listBookingsSchema = z.object({
    venueId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ListBookingsInput = z.infer<typeof listBookingsSchema>;
