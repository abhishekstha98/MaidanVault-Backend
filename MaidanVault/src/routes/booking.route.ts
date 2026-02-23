import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { createBooking, listBookings, cancelBooking } from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBookingSchema, listBookingsSchema } from "../validators/booking.validator";

const router: RouterType = Router();

// Create booking: Requires authentication
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a Booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Successfully created
 */
router.post("/", authenticate, validate(createBookingSchema, "body"), createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: List Bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", validate(listBookingsSchema, "query"), listBookings);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cancelled
 */
router.patch("/:id/cancel", authenticate, cancelBooking);

export default router;
