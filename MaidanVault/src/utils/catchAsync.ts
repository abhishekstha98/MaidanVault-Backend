import { Request, Response, NextFunction } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

/**
 * Wraps an async route handler to catch rejected promises
 * and forward the error to Express's error-handling middleware.
 */
export const catchAsync = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };
};
