import { Request, Response } from "express";
import * as tournamentService from "../services/tournament.service";

export const createTournament = async (req: Request, res: Response) => {
    const tournament = await tournamentService.createTournament(req.body);
    res.status(201).json({ status: "success", data: tournament });
};

export const getTournaments = async (_req: Request, res: Response) => {
    const tournaments = await tournamentService.getTournaments();
    res.status(200).json({ status: "success", data: tournaments });
};

export const getTournamentById = async (req: Request, res: Response) => {
    const tournament = await tournamentService.getTournamentById(req.params.id as string);
    res.status(200).json({ status: "success", data: tournament });
};

export const registerForTournament = async (req: Request, res: Response) => {
    const registration = await tournamentService.registerTeam(req.params.id as string, req.body.teamId, req.body.roster);
    res.status(201).json({ status: "success", data: registration });
};
