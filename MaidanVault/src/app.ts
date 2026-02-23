import express from "express";
import type { Express } from "express-serve-static-core";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

// Must be imported before any routers/validators are evaluated
import "./config/zod.openapi";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { rateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/error.middleware";
import healthRoute from "./routes/health.route";
import authRoute from "./routes/auth.route";
import teamRoute from "./routes/team.route";
import venueRoute from "./routes/venue.route";
import bookingRoute from "./routes/booking.route";
import matchRoute from "./routes/match.route";
import matchRequestRoute from "./routes/match-request.route";
import challengeRoute from "./routes/challenge.route";
import { setupSwagger } from "./config/swagger";

const app: Express = express();

// ─── Security Middlewares ────────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: env.NODE_ENV === "production" ? false : "*", // lock down in production
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(rateLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/teams", teamRoute);
app.use("/api/venues", venueRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/matches", matchRoute);
app.use("/api/match-requests", matchRequestRoute);
app.use("/api/challenges", challengeRoute);

// ─── Setup Swagger Documentation ─────────────────────────────────────────────
setupSwagger(app);

// ─── Global Error Handler (must be registered LAST) ──────────────────────────
app.use(errorHandler);

export default app;
