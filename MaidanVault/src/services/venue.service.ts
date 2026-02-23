import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateVenueInput, ListVenuesInput } from "../validators/venue.validator";

export class VenueService {
    /**
     * Create a new venue. 
     * Handled by users with VENUE_OWNER or ADMIN roles.
     */
    async create(data: CreateVenueInput, ownerId: string) {
        const venue = await prisma.venue.create({
            data: {
                name: data.name,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                sportTypes: data.sportTypes,
                images: data.images || [],
                pricePerHour: data.pricePerHour,
                ownerId,
            },
            include: {
                owner: { select: { id: true, name: true, phone: true } },
            },
        });

        return venue;
    }

    /**
     * List venues, optionally filtered by sportType.
     */
    async list(query: ListVenuesInput) {
        const { sportType } = query;

        const whereClause = sportType
            ? { sportTypes: { has: sportType } }
            : {};

        const venues = await prisma.venue.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                owner: { select: { name: true, phone: true } },
            },
        });

        return venues;
    }

    /**
     * Get specific venue details.
     */
    async getDetails(id: string) {
        const venue = await prisma.venue.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, phone: true } },
            },
        });

        if (!venue) {
            throw new AppError("Venue not found.", 404);
        }

        return venue;
    }
}

export const venueService = new VenueService();
