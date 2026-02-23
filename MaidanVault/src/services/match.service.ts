import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { CreateMatchInput, ListMatchesInput, UpdateMatchScoreInput } from "../validators/match.validator";
import { Role } from "@prisma/client";

export class MatchService {
    /**
     * Schedule a new Match between two teams.
     */
    async create(data: CreateMatchInput, userId: string) {
        // Must verify that the requester is the logic captain of the Home Team
        const homeTeam = await prisma.team.findUnique({ where: { id: data.homeTeamId } });
        if (!homeTeam) throw new AppError("Home Team not found", 404);

        const awayTeam = await prisma.team.findUnique({ where: { id: data.awayTeamId } });
        if (!awayTeam) throw new AppError("Away Team not found", 404);

        if (homeTeam.captainId !== userId) {
            throw new AppError("Only the captain of the home team can schedule a match.", 403);
        }

        const match = await prisma.match.create({
            data: {
                ...data,
                status: "SCHEDULED"
            },
            include: {
                homeTeam: { select: { id: true, name: true } },
                awayTeam: { select: { id: true, name: true } },
                venue: { select: { id: true, name: true } }
            }
        });

        return match;
    }

    /**
     * List all matches with optional filtering by team or status.
     */
    async list(query: ListMatchesInput) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (query.status) whereClause.status = query.status;
        if (query.teamId) {
            whereClause.OR = [
                { homeTeamId: query.teamId },
                { awayTeamId: query.teamId }
            ];
        }

        const [matches, total] = await Promise.all([
            prisma.match.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { scheduledAt: "asc" },
                include: {
                    homeTeam: { select: { name: true, logoUrl: true } },
                    awayTeam: { select: { name: true, logoUrl: true } },
                    venue: { select: { name: true } }
                },
            }),
            prisma.match.count({ where: whereClause }),
        ]);

        return {
            data: matches,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Updates the score and resolves the match to COMPLETED. 
     * Handles winRate recalculations for the participating teams.
     */
    async updateScore(matchId: string, data: UpdateMatchScoreInput, userId: string, role: Role) {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { homeTeam: true, awayTeam: true }
        });

        if (!match) throw new AppError("Match not found", 404);

        // Security check: only captains or global admins can resolve a track
        const isHomeCaptain = match.homeTeam.captainId === userId;
        const isAwayCaptain = match.awayTeam.captainId === userId;
        if (!isHomeCaptain && !isAwayCaptain && role !== "ADMIN") {
            throw new AppError("Only team captains or admins can update match scores.", 403);
        }

        if (match.status === "COMPLETED" && role !== "ADMIN") {
            throw new AppError("Match is already completed and cannot be re-scored by captains.", 400);
        }

        const updatedMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                status: "COMPLETED"
            }
        });

        // Fire & Forget recalculation of team statistics
        // In a real application, you might do this via a Queue or event bus
        await this.recalculateTeamStats(match.homeTeamId);
        await this.recalculateTeamStats(match.awayTeamId);

        return updatedMatch;
    }

    /**
     * Recalculates `matchesPlayed` and `winRate` for a specific Team UUID.
     */
    private async recalculateTeamStats(teamId: string) {
        const completedMatches = await prisma.match.findMany({
            where: {
                OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
                status: "COMPLETED"
            },
            select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true }
        });

        const totalPlayed = completedMatches.length;
        if (totalPlayed === 0) return;

        let wins = 0;
        for (const match of completedMatches) {
            // Very simplistic string scoring parsing: Try to extract a leading number for wins logic.
            // E.g. "150/4" -> 150. "2" -> 2.
            const homeVal = match.homeScore ? parseInt(String(match.homeScore)) : 0;
            const awayVal = match.awayScore ? parseInt(String(match.awayScore)) : 0;

            const isHome = match.homeTeamId === teamId;
            if (isHome && homeVal > awayVal) wins++;
            else if (!isHome && awayVal > homeVal) wins++;
        }

        const winRate = Number((wins / totalPlayed).toFixed(2));

        await prisma.team.update({
            where: { id: teamId },
            data: { matchesPlayed: totalPlayed, winRate }
        });
    }
}

export const matchService = new MatchService();
