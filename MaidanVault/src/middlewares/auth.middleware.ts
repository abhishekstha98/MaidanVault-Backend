import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

/**
 * Middleware to protect routes by verifying the JWT access token.
 * Extracts token from `Authorization: Bearer <token>` header.
 * Populates `req.user` with { userId, role }.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication required. Please provide a valid token.", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        throw new AppError("Invalid or expired token.", 401);
    }
};

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Restricts access to users with specified roles.
 *
 * Usage: `authorize("ADMIN", "VENUE_OWNER")`
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new AppError("Authentication required.", 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError("You do not have permission to perform this action.", 403);
        }

        next();
    };
};
