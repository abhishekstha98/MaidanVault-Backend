import { Router } from "express";
import * as tournamentController from "../controllers/tournament.controller";
import { validate } from "../middlewares/validate.middleware";
import { createTournamentSchema, registerTournamentSchema } from "../validators/tournament.validator";
import { catchAsync } from "../utils/catchAsync";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Retrieve a list of all Tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: Successfully retrieved tournaments
 */
router.get("/", catchAsync(tournamentController.getTournaments));

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Retrieve a specific Tournament by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved tournament details
 */
router.get("/:id", catchAsync(tournamentController.getTournamentById));

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new Tournament (Admin Only)
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createTournamentSchema'
 *     responses:
 *       201:
 *         description: Tournament created
 */
router.post("/", authenticate, authorize("ADMIN"), validate(createTournamentSchema), catchAsync(tournamentController.createTournament));

/**
 * @swagger
 * /api/tournaments/{id}/register:
 *   post:
 *     summary: Register a Team for a Tournament
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerTournamentSchema'
 *     responses:
 *       201:
 *         description: Successfully registered for tournament
 */
router.post("/:id/register", authenticate, validate(registerTournamentSchema), catchAsync(tournamentController.registerForTournament));

export default router;
