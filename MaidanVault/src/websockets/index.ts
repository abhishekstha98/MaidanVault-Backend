import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { logger } from "../utils/logger";
import { socketAuth, AuthenticatedSocket } from "../middlewares/socketAuth";
import { QueueService } from "../services/queue.service";

export const initWebSockets = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    // Enforce JWT Auth
    io.use(socketAuth);

    const queueService = new QueueService(io);

    io.on("connection", (socket: AuthenticatedSocket) => {
        const userId = socket.user!.id;
        logger.info(`[Socket Connected] User ${userId} (Socket ${socket.id})`);

        socket.on("join_queue", async (payload: { sportType: string; skillLevel: string; teamId?: string }) => {
            try {
                await queueService.joinQueue({
                    socketId: socket.id,
                    userId,
                    teamId: payload.teamId,
                    sportType: payload.sportType,
                    skillLevel: payload.skillLevel,
                    joinedAt: Date.now()
                });
                socket.emit("queue_joined", { status: "success" });
            } catch (error) {
                logger.error({ error }, "Error joining queue");
                socket.emit("queue_error", { message: "Failed to join queue" });
            }
        });

        socket.on("leave_queue", async () => {
            await queueService.leaveQueue(socket.id);
            socket.emit("queue_left", { status: "success" });
        });

        socket.on("accept_match", async (payload: { matchId: string }) => {
            try {
                const result = await queueService.acceptMatch(socket.id, payload.matchId, userId);
                socket.emit("match_accepted", { status: "pending_opponent" });

                if (result.confirmed) {
                    // Instantiate a generic formal Match in Postgres via Prisma
                    // We can emit 'match_confirmed' to both
                    io.to(result.matchData.p1Socket).emit("match_confirmed", { matchId: payload.matchId });
                    io.to(result.matchData.p2Socket).emit("match_confirmed", { matchId: payload.matchId });
                }
            } catch (err: any) {
                socket.emit("queue_error", { message: err.message });
            }
        });

        socket.on("decline_match", async (payload: { matchId: string }) => {
            await queueService.declineMatch(socket.id, payload.matchId, userId);
            socket.emit("match_declined", { status: "success" });
        });

        socket.on("disconnect", async () => {
            logger.info(`[Socket Disconnected] (Socket ${socket.id})`);
            await queueService.leaveQueue(socket.id);
        });
    });

    // Start background matching worker loop
    setInterval(() => {
        queueService.processQueues().catch(err => {
            logger.error({ err }, "Error processing matchmaking queues");
        });
    }, 5000);

    return io;
};
