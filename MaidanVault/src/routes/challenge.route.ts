import { Router } from "express";
import { createChallenge, updateChallengeStatus } from "../controllers/challenge.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createChallengeSchema, updateChallengeStatusSchema } from "../validators/challenge.validator";

const router = Router();

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Challenge a Match Request
 *     tags: [Matchmaking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallengeInput'
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", authenticate, validate(createChallengeSchema), createChallenge);

/**
 * @swagger
 * /challenges/{id}/status:
 *   patch:
 *     summary: Respond to a Challenge
 *     description: Accepting a challenge generates a Match and declines other pending challenges.
 *     tags: [Matchmaking]
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
 *             $ref: '#/components/schemas/UpdateChallengeStatusInput'
 *     responses:
 *       200:
 *         description: Status Updated (and Match Factory fired if ACCEPTED)
 */
router.patch("/:id/status", authenticate, validate(updateChallengeStatusSchema), updateChallengeStatus);

export default router;
