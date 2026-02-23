import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

/**
 * Generic validation middleware that validates request body, query,
 * or params against a Zod schema.
 */
export const validate = (schema: ZodSchema, source: "body" | "query" | "params" = "body") => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((issue: z.ZodIssue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            throw new AppError(
                `Validation failed: ${errors.map((e) => `${e.field} - ${e.message}`).join("; ")}`,
                400
            );
        }

        // Safely map the parsed data back to the request.
        // For body, we can safely overwrite.
        // For query/params, Express uses getters/setters that can throw if replaced,
        // so we clear and mutate the existing object.
        if (source === "body") {
            req.body = result.data;
        } else {
            Object.keys(req[source]).forEach((key) => delete req[source][key]);
            Object.assign(req[source], result.data);
        }
        next();
    };
};
