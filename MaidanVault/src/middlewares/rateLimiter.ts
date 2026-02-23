import rateLimit from "express-rate-limit";

/**
 * Rate limiter: max 100 requests per 15-minute window per IP.
 * Customize windowMs and max based on your application's needs.
 */
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: "error",
        message: "Too many requests, please try again later.",
    },
});
