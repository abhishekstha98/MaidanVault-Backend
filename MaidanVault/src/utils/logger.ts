import pino from "pino";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
    level: isProduction ? "info" : "debug",
    ...(isProduction
        ? {
            // Production: structured JSON to stdout (default behavior)
            formatters: {
                level: (label) => ({ level: label }),
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        }
        : {
            // Development: pretty-print for readability
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },
        }),
});
