import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { createTeam, listTeams, getTeamDetails } from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTeamSchema, listTeamsSchema } from "../validators/team.validator";

const router: RouterType = Router();

// Create team: Protected via authentication
/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new Team
 *     tags: [Teams]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeamInput'
 *     responses:
 *       201:
 *         description: Successfully created team
 */
router.post("/", authenticate, validate(createTeamSchema, "body"), createTeam);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List Teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", validate(listTeamsSchema, "query"), listTeams);

// Get specific team
router.get("/:id", getTeamDetails);

export default router;
