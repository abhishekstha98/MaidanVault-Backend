import { z } from "zod";
import { SportType } from "../generated/prisma/client";

const sportTypeEnum = z.enum([
    SportType.FOOTBALL,
    SportType.FUTSAL,
    SportType.BASKETBALL,
    SportType.BADMINTON,
    SportType.CRICKET,
    SportType.VOLLEYBALL,
]);

export const createVenueSchema = z.object({
    name: z.string().min(1, "Venue name is required").max(100),
    location: z.string().min(1, "Location is required").max(255),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    sportTypes: z
        .array(sportTypeEnum)
        .min(1, "At least one sport type is required"),
    images: z.array(z.string().url()).optional(),
    pricePerHour: z.number().min(0).optional(),
});

export const listVenuesSchema = z.object({
    sportType: sportTypeEnum.optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type ListVenuesInput = z.infer<typeof listVenuesSchema>;
