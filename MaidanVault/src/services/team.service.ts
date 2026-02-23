import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateTeamInput, ListTeamsInput } from "../validators/team.validator";

export class TeamService {
    /**
     * Create a new team. The user creating the team becomes the captain
     * and is automatically added to the `members` list.
     */
    async create(data: CreateTeamInput, captainId: string) {
        const existingTeam = await prisma.team.findUnique({
            where: { name: data.name },
        });

        if (existingTeam) {
            throw new AppError("A team with this name already exists.", 409);
        }

        const team = await prisma.team.create({
            data: {
                name: data.name,
                logoUrl: data.logoUrl,
                captainId,
                members: {
                    connect: { id: captainId },
                },
            },
            include: {
                captain: { select: { id: true, name: true } },
            },
        });

        return team;
    }

    /**
     * List teams with pagination.
     */
    async list(query: ListTeamsInput) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    captain: { select: { id: true, name: true } },
                    _count: { select: { members: true } },
                },
            }),
            prisma.team.count(),
        ]);

        return {
            data: teams,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get specific team details, including its members.
     */
    async getDetails(id: string) {
        const team = await prisma.team.findUnique({
            where: { id },
            include: {
                captain: { select: { id: true, name: true, bio: true } },
                members: { select: { id: true, name: true, role: true } },
            },
        });

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        return team;
    }
}

export const teamService = new TeamService();
