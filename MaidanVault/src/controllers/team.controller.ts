import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { teamService } from "../services/team.service";

export const createTeam = catchAsync(async (req: Request, res: Response) => {
    // `req.user` is guaranteed to exist due to the authenticate middleware
    const userId = req.user!.userId;

    const team = await teamService.create(req.body, userId);

    res.status(201).json({
        status: "success",
        data: team,
    });
});

export const listTeams = catchAsync(async (req: Request, res: Response) => {
    const result = await teamService.list(req.query as any);

    res.status(200).json({
        status: "success",
        ...result,
    });
});

export const getTeamDetails = catchAsync(async (req: Request, res: Response) => {
    const teamId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const team = await teamService.getDetails(teamId);

    res.status(200).json({
        status: "success",
        data: team,
    });
});
