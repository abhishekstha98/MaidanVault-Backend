import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateChallengeInput, UpdateChallengeStatusInput } from "../validators/challenge.validator";

export class ChallengeService {
    async create(data: CreateChallengeInput, userId: string) {
        const matchRequest = await prisma.matchRequest.findUnique({ where: { id: data.matchRequestId } });
        if (!matchRequest) throw new AppError("MatchRequest not found", 404);
        if (matchRequest.status !== "OPEN") throw new AppError("This request is no longer open.", 400);

        // Prevent challenging yourself
        if (matchRequest.creatorId === data.challengerId) {
            throw new AppError("You cannot challenge your own match request.", 400);
        }

        if (data.challengerType === "TEAM") {
            const team = await prisma.team.findFirst({ where: { id: data.challengerId, captainId: userId } });
            if (!team) throw new AppError("You can only challenge on behalf of teams you captain.", 403);
        } else if (data.challengerId !== userId) {
            throw new AppError("You can only create individual challenges for yourself.", 403);
        }

        const existingChallenge = await prisma.challenge.findFirst({
            where: { matchRequestId: data.matchRequestId, challengerId: data.challengerId }
        });
        if (existingChallenge) throw new AppError("You have already challenged this request.", 409);

        const challenge = await prisma.challenge.create({ data });
        return challenge;
    }

    async updateStatus(id: string, data: UpdateChallengeStatusInput, userId: string) {
        const challenge = await prisma.challenge.findUnique({
            where: { id },
            include: { matchRequest: true }
        });
        if (!challenge) throw new AppError("Challenge not found", 404);

        const mr = challenge.matchRequest;

        // Security check: Only the original MatchRequest creator can Accept/Decline
        if (mr.creatorType === "TEAM") {
            const team = await prisma.team.findFirst({ where: { id: mr.creatorId, captainId: userId } });
            if (!team) throw new AppError("Only the original team captain can respond to challenges.", 403);
        } else if (mr.creatorId !== userId) {
            throw new AppError("Only the original creator can respond to challenges.", 403);
        }

        if (challenge.status !== "PENDING") {
            throw new AppError("This challenge has already been processed.", 400);
        }

        // --- MATCH FACTORY LOGIC ---
        if (data.status === "ACCEPTED") {
            // Note: Our Match model currently only supports Team vs Team logic based on schema.prisma
            if (mr.creatorType !== "TEAM" || challenge.challengerType !== "TEAM") {
                throw new AppError("Currently, only TEAM vs TEAM matches can be auto-instantiated into formal Matches.", 400);
            }

            // 1. Transaction to safely execute all mutations
            const [updatedChallenge, match, _updatedMatchRequest, declinedChallenges] = await prisma.$transaction([
                // Update specific challenge
                prisma.challenge.update({ where: { id }, data: { status: "ACCEPTED" } }),
                // Create Match
                prisma.match.create({
                    data: {
                        homeTeamId: mr.creatorId,
                        awayTeamId: challenge.challengerId,
                        venueId: mr.venueId,
                        scheduledAt: mr.scheduledAt,
                        status: "SCHEDULED"
                    }
                }),
                // Update Request
                prisma.matchRequest.update({ where: { id: mr.id }, data: { status: "MATCHED" } }),
                // Decline all other pending challenges for this request
                prisma.challenge.updateMany({
                    where: { matchRequestId: mr.id, status: "PENDING", id: { not: id } },
                    data: { status: "DECLINED" }
                })
            ]);

            return { challenge: updatedChallenge, match, declinedCount: declinedChallenges.count };
        } else {
            // Simply DECLINE this specific challenge
            const updatedChallenge = await prisma.challenge.update({
                where: { id },
                data: { status: data.status }
            });
            return { challenge: updatedChallenge };
        }
    }
}

export const challengeService = new ChallengeService();
