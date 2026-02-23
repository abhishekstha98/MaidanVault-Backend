import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { register, login, refresh } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from "../validators/auth.validator";

const router: RouterType = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new player or venue owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Successfully created user
 */
router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWTs
 *     description: Returns access token in JSON body and HTTP-Only cookie for refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     description: Reads HTTP-Only `refreshToken` cookie if body is blank.
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       200:
 *         description: Generated new tokens
 */
router.post("/refresh", validate(refreshSchema), refresh);

export default router;
