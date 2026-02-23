import { redis } from "../utils/redis";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

interface QueueTicket {
    socketId: string;
    userId: string;
    teamId?: string;
    sportType: string;
    skillLevel: string;
    joinedAt: number;
}

export class QueueService {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    private getQueueKey(sportType: string, skillLevel: string) {
        return `queue:${sportType}:${skillLevel}`;
    }

    async joinQueue(ticket: QueueTicket) {
        const queueKey = this.getQueueKey(ticket.sportType, ticket.skillLevel);
        const ticketStr = JSON.stringify(ticket);

        // 1. Add to specific queue using atomic List Push
        await redis.rpush(queueKey, ticketStr);
        // 2. Add reverse mapping to easily remove via socket disconnect
        await redis.set(`socket_queue_map:${ticket.socketId}`, ticketStr);

        logger.info(`[Socket ${ticket.socketId}] Joined Queue: ${queueKey}`);
    }

    async leaveQueue(socketId: string) {
        const ticketStr = await redis.get(`socket_queue_map:${socketId}`);
        if (!ticketStr) return; // Not in queue

        const ticket: QueueTicket = JSON.parse(ticketStr);
        const queueKey = this.getQueueKey(ticket.sportType, ticket.skillLevel);

        // Remove exact string match from list (count = 0 means remove all occurrences)
        await redis.lrem(queueKey, 0, ticketStr);
        await redis.del(`socket_queue_map:${socketId}`);

        logger.info(`[Socket ${socketId}] Left Queue: ${queueKey}`);
    }

    // Interval to process queues
    async processQueues() {
        // Find all queue keys
        const keys = await redis.keys("queue:*:*");
        if (!keys.length) return;

        for (const key of keys) {
            // Check list length
            const length = await redis.llen(key);
            if (length >= 2) {
                // Pop the two oldest tickets from the left of the list
                const ticket1Str = await redis.lpop(key);
                const ticket2Str = await redis.lpop(key);

                if (ticket1Str && ticket2Str) {
                    const ticket1: QueueTicket = JSON.parse(ticket1Str);
                    const ticket2: QueueTicket = JSON.parse(ticket2Str);

                    // If they are the same user/team, just requeue one and discard duplicate ideally
                    // But we trust authorization/socket map allows 1 per socket

                    const matchId = uuidv4();

                    // Cleanup reverse mapping
                    await redis.del(`socket_queue_map:${ticket1.socketId}`);
                    await redis.del(`socket_queue_map:${ticket2.socketId}`);

                    // Save pending match state in Redis
                    await redis.setex(`pending_match:${matchId}`, 30, JSON.stringify({
                        p1: ticket1.userId, p1Socket: ticket1.socketId, p1Accepted: false,
                        p2: ticket2.userId, p2Socket: ticket2.socketId, p2Accepted: false,
                        sportType: ticket1.sportType,
                        skillLevel: ticket1.skillLevel
                    }));

                    // Emit to clients
                    this.io.to(ticket1.socketId).emit("match_found", { matchId, opponentId: ticket2.userId });
                    this.io.to(ticket2.socketId).emit("match_found", { matchId, opponentId: ticket1.userId });

                    logger.info(`[Match Found] ${matchId}: ${ticket1.userId} vs ${ticket2.userId}`);
                } else {
                    // Requeue if one was empty
                    if (ticket1Str) await redis.rpush(key, ticket1Str);
                }
            }
        }
    }

    async acceptMatch(_socketId: string, matchId: string, userId: string): Promise<{ confirmed: boolean; matchData?: any }> {
        const key = `pending_match:${matchId}`;
        const matchDataStr = await redis.get(key);
        if (!matchDataStr) {
            throw new Error("Match expired or does not exist");
        }

        const matchData = JSON.parse(matchDataStr);
        let isP1 = false;

        if (matchData.p1 === userId) {
            matchData.p1Accepted = true;
            isP1 = true;
        } else if (matchData.p2 === userId) {
            matchData.p2Accepted = true;
        } else {
            throw new Error("Unauthorized to accept this match");
        }

        if (matchData.p1Accepted && matchData.p2Accepted) {
            // Both accepted!
            await redis.del(key);
            logger.info(`[Match Confirmed] Both players ready for ${matchId}`);
            // Let the controller handle Postgres insertion, or we can just return success flag
            return { confirmed: true, matchData };
        } else {
            // Update redis state
            await redis.setex(key, 30, JSON.stringify(matchData));
            const opponentSocket = isP1 ? matchData.p2Socket : matchData.p1Socket;
            this.io.to(opponentSocket).emit("opponent_accepted", { matchId });
            return { confirmed: false };
        }
    }

    async declineMatch(_socketId: string, matchId: string, userId: string) {
        const key = `pending_match:${matchId}`;
        const matchDataStr = await redis.get(key);
        if (!matchDataStr) return;

        const matchData = JSON.parse(matchDataStr);
        await redis.del(key);

        // Put the other player back in front of the queue
        const isP1 = matchData.p1 === userId;
        const otherSocket = isP1 ? matchData.p2Socket : matchData.p1Socket;
        const otherUserId = isP1 ? matchData.p2 : matchData.p1;

        // Emulate ticket
        const ticket: QueueTicket = {
            socketId: otherSocket,
            userId: otherUserId,
            sportType: matchData.sportType,
            skillLevel: matchData.skillLevel,
            joinedAt: Date.now()
        };

        const queueKey = this.getQueueKey(ticket.sportType, ticket.skillLevel);
        const ticketStr = JSON.stringify(ticket);

        // Re-add to FRONT of list (LPUSH) because they were already waiting
        await redis.lpush(queueKey, ticketStr);
        await redis.set(`socket_queue_map:${otherSocket}`, ticketStr);

        // Notify the innocent party
        this.io.to(otherSocket).emit("match_cancelled", { reason: "Opponent declined, you are back in priority queue" });
        logger.info(`[Match Declined] ${matchId} by ${userId}. Other player re-queued.`);
    }
}
