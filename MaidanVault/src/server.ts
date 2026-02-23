import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { initWebSockets } from "./websockets";

const startServer = (): void => {
    const server = app.listen(env.PORT, () => {
        logger.info(
            `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
        );
    });

    // Initialize Socket.io on the generic HTTP server
    initWebSockets(server);

    // ─── Graceful Shutdown ───────────────────────────────────────────────────
    const shutdown = (signal: string) => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
            logger.info("HTTP server closed");
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error("Could not close connections in time, forcefully shutting down");
            process.exit(1);
        }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // ─── Catch Unhandled Errors ──────────────────────────────────────────────
    process.on("unhandledRejection", (reason: unknown) => {
        logger.fatal({ reason }, "Unhandled Rejection — shutting down");
        server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error: Error) => {
        logger.fatal({ error }, "Uncaught Exception — shutting down");
        server.close(() => process.exit(1));
    });
};

startServer();
