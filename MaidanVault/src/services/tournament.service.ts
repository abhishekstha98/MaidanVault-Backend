import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";

export const createTournament = async (data: any) => {
    return prisma.tournament.create({ data });
};

export const getTournaments = async () => {
    return prisma.tournament.findMany({
        include: { _count: { select: { registrations: true } } }
    });
};

export const getTournamentById = async (id: string) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: { registrations: { include: { team: true } } }
    });
    if (!tournament) throw new AppError("Tournament not found", 404);
    return tournament;
};

export const registerTeam = async (tournamentId: string, teamId: string, roster: string[]) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { _count: { select: { registrations: true } } }
    });

    if (!tournament) throw new AppError("Tournament not found", 404);
    if (tournament.status !== "UPCOMING") throw new AppError("Registration is closed", 400);
    if (tournament._count.registrations >= tournament.maxTeams) throw new AppError("Tournament is full", 400);

    const existing = await prisma.tournamentRegistration.findUnique({
        where: { tournamentId_teamId: { tournamentId, teamId } }
    });
    if (existing) throw new AppError("Team is already registered", 409);

    return prisma.tournamentRegistration.create({
        data: {
            tournamentId,
            teamId,
            roster,
            paymentStatus: "COMPLETED" // Fast-track testing
        }
    });
};
