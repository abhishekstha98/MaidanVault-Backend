import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { createVenue, listVenues, getVenueDetails } from "../controllers/venue.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createVenueSchema, listVenuesSchema } from "../validators/venue.validator";

const router: RouterType = Router();

// Create venue: Protected via authentication AND strict RBAC limiting it to specific roles
/**
 * @swagger
 * /venues:
 *   post:
 *     summary: Create a new Venue
 *     tags: [Venues]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVenueInput'
 *     responses:
 *       201:
 *         description: Successfully created venue
 */
router.post(
    "/",
    authenticate,
    authorize("VENUE_OWNER", "ADMIN"),
    validate(createVenueSchema, "body"),
    createVenue
);

/**
 * @swagger
 * /venues:
 *   get:
 *     summary: List Venues
 *     tags: [Venues]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", validate(listVenuesSchema, "query"), listVenues);

// Get specific venue
router.get("/:id", getVenueDetails);

export default router;
