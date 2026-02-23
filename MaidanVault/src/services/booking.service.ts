import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateBookingInput, ListBookingsInput } from "../validators/booking.validator";
import { Role } from "@prisma/client";

export class BookingService {
    /**
     * Create a new booking slot at a Venue.
     * Implements Overlap validation.
     */
    async create(data: CreateBookingInput, userId: string) {
        // 1. Verify Venue exists
        const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });
        if (!venue) throw new AppError("Venue not found", 404);

        // 2. Check for Overlaps
        const overlap = await prisma.booking.findFirst({
            where: {
                venueId: data.venueId,
                AND: [
                    { startTime: { lt: data.endTime } },
                    { endTime: { gt: data.startTime } }
                ]
            }
        });

        if (overlap) {
            throw new AppError("This venue is already booked for the selected time slot.", 409);
        }

        // 3. Dynamic Price Calculation (Duration in Hours * pricePerHour)
        const durationHours = (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60 * 60);
        const totalPrice = venue.pricePerHour ? (venue.pricePerHour * durationHours) : 0;

        // 4. Create the Booking
        const booking = await prisma.booking.create({
            data: {
                ...data,
                userId,
                totalPrice,
            },
            include: {
                venue: { select: { id: true, name: true, location: true } },
                team: { select: { id: true, name: true } },
                match: { select: { id: true, status: true } },
            }
        });

        return booking;
    }

    /**
     * List all bookings with pagination and optional filtering
     */
    async list(query: ListBookingsInput) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (query.venueId) whereClause.venueId = query.venueId;
        if (query.userId) whereClause.userId = query.userId;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { startTime: "asc" },
                include: {
                    venue: { select: { name: true, pricePerHour: true } },
                    user: { select: { name: true, email: true } }
                },
            }),
            prisma.booking.count({ where: whereClause }),
        ]);

        return {
            data: bookings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Cancel a booking. Allowed only for the User who made it OR the Venue Owner/Admin.
     */
    async cancel(bookingId: string, userId: string, role: Role) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { venue: true }
        });

        if (!booking) throw new AppError("Booking not found", 404);

        const isOwner = booking.userId === userId;
        const isVenueOwner = booking.venue.ownerId === userId;
        const isAdmin = role === "ADMIN";

        if (!isOwner && !isVenueOwner && !isAdmin) {
            throw new AppError("You do not have permission to cancel this booking", 403);
        }

        // We "cancel" by simply deleting it for now.
        // In a real billing system we might update the status to CANCELLED and refund.
        await prisma.booking.delete({ where: { id: bookingId } });

        return { id: bookingId, status: "CANCELLED" };
    }
}

export const bookingService = new BookingService();
