import { Request, Response } from "express";
import { matchService } from "../services/match.service";
import { catchAsync } from "../utils/catchAsync";
import { CreateMatchInput, ListMatchesInput, UpdateMatchScoreInput } from "../validators/match.validator";
import { Role } from "@prisma/client";

export const createMatch = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const body = req.body as CreateMatchInput;

    const match = await matchService.create(body, userId);

    res.status(201).json({
        status: "success",
        data: match,
    });
});

export const listMatches = catchAsync(async (req: Request, res: Response) => {
    const result = await matchService.list(req.query as any as ListMatchesInput);

    res.status(200).json({
        status: "success",
        ...result,
    });
});

export const updateMatchScore = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.id as string;
    const userId = req.user!.userId;
    const role = req.user!.role as Role;
    const body = req.body as UpdateMatchScoreInput;

    const result = await matchService.updateScore(matchId, body, userId, role);

    res.status(200).json({
        status: "success",
        data: result,
    });
});
