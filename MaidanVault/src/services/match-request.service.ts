import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateMatchRequestInput, UpdateMatchRequestStatusInput } from "../validators/match-request.validator";

export class MatchRequestService {
    async create(data: CreateMatchRequestInput, userId: string) {
        if (data.creatorType === "TEAM") {
            const team = await prisma.team.findFirst({
                where: { id: data.creatorId, captainId: userId }
            });
            if (!team) throw new AppError("You can only create requests for teams you captain.", 403);
        } else if (data.creatorType === "INDIVIDUAL" && data.creatorId !== userId) {
            throw new AppError("You can only create individual requests for yourself.", 403);
        }

        const matchRequest = await prisma.matchRequest.create({
            data
        });

        return matchRequest;
    }

    async list(filters: { sportType?: string, status?: string }) {
        const where: any = {};
        if (filters.sportType) where.sportType = filters.sportType;
        if (filters.status) where.status = filters.status;

        const requests = await prisma.matchRequest.findMany({
            where,
            include: { venue: true },
            orderBy: { scheduledAt: 'asc' }
        });

        return requests;
    }

    async updateStatus(id: string, data: UpdateMatchRequestStatusInput, userId: string) {
        const request = await prisma.matchRequest.findUnique({ where: { id } });
        if (!request) throw new AppError("Match request not found", 404);

        if (request.creatorType === "TEAM") {
            const team = await prisma.team.findFirst({ where: { id: request.creatorId, captainId: userId } });
            if (!team) throw new AppError("Only the team captain can update this request.", 403);
        } else if (request.creatorId !== userId) {
            throw new AppError("Only the creator can update this request.", 403);
        }

        const updated = await prisma.matchRequest.update({
            where: { id },
            data: { status: data.status }
        });

        return updated;
    }
}

export const matchRequestService = new MatchRequestService();
