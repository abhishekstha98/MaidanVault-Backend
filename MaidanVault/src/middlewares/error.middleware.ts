import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Global error-handling middleware.
 * - Operational errors (thrown via AppError): sends the error message with the appropriate status code.
 * - Unknown/programmer errors: logs the full error and sends a generic 500 response to avoid leaking internals.
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        // Operational, trusted error — safe to send details to client
        logger.warn({ statusCode: err.statusCode, message: err.message }, "Operational error");
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }

    // Unknown or programmer error — do NOT leak details
    logger.error({ err }, "Unexpected error");

    const statusCode = 500;
    const message =
        env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message || "An unexpected error occurred";

    res.status(statusCode).json({
        status: "error",
        message,
        ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};
