import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { createMatch, listMatches, updateMatchScore } from "../controllers/match.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createMatchSchema, listMatchesSchema, updateMatchScoreSchema } from "../validators/match.validator";

const router: RouterType = Router();

// Create match: Requires authentication (Must be home team captain)
/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Schedule a formal Match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatchInput'
 *     responses:
 *       201:
 *         description: Success
 */
router.post("/", authenticate, validate(createMatchSchema, "body"), createMatch);

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: List formal Matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", validate(listMatchesSchema, "query"), listMatches);

/**
 * @swagger
 * /matches/{id}/score:
 *   patch:
 *     summary: Update Score & Finish Match
 *     tags: [Matches]
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
 *             $ref: '#/components/schemas/UpdateMatchScoreInput'
 *     responses:
 *       200:
 *         description: Score updated
 */
router.patch("/:id/score", authenticate, validate(updateMatchScoreSchema, "body"), updateMatchScore);

export default router;
