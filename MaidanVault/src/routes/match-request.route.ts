import { Router } from "express";
import { createMatchRequest, listMatchRequests, updateMatchRequestStatus } from "../controllers/match-request.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createMatchRequestSchema, updateMatchRequestStatusSchema } from "../validators/match-request.validator";

const router = Router();

/**
 * @swagger
 * /match-requests:
 *   post:
 *     summary: Create public Match Request
 *     tags: [Matchmaking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatchRequestInput'
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", authenticate, validate(createMatchRequestSchema), createMatchRequest);

/**
 * @swagger
 * /match-requests:
 *   get:
 *     summary: List open requests
 *     tags: [Matchmaking]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", listMatchRequests);

/**
 * @swagger
 * /match-requests/{id}/status:
 *   patch:
 *     summary: Update request status
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
 *             $ref: '#/components/schemas/UpdateMatchRequestStatusInput'
 *     responses:
 *       200:
 *         description: OK
 */
router.patch("/:id/status", authenticate, validate(updateMatchRequestStatusSchema), updateMatchRequestStatus);

export default router;
