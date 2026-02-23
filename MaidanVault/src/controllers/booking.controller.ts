import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import { catchAsync } from "../utils/catchAsync";
import { CreateBookingInput, ListBookingsInput } from "../validators/booking.validator";
import { Role } from "@prisma/client";

export const createBooking = catchAsync(async (req: Request, res: Response) => {
    // req.user is guaranteed to exist due to the authenticate middleware
    const userId = req.user!.userId;
    const body = req.body as CreateBookingInput;

    const booking = await bookingService.create(body, userId);

    res.status(201).json({
        status: "success",
        data: booking,
    });
});

export const listBookings = catchAsync(async (req: Request, res: Response) => {
    // Note: Zod middleware handles validation and type coercion. 
    // Express parses query as string dictionary, but our Service layer explicitly handles `Number()` conversions.
    const result = await bookingService.list(req.query as any as ListBookingsInput);

    res.status(200).json({
        status: "success",
        ...result,
    });
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.id as string;
    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await bookingService.cancel(bookingId, userId, role);

    res.status(200).json({
        status: "success",
        data: result,
    });
});
