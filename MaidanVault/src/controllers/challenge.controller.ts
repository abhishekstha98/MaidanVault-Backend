import { Request, Response } from "express";
import { challengeService } from "../services/challenge.service";
import { catchAsync } from "../utils/catchAsync";
import { CreateChallengeInput, UpdateChallengeStatusInput } from "../validators/challenge.validator";

export const createChallenge = catchAsync(async (req: Request, res: Response) => {
    const data: CreateChallengeInput = req.body;
    const result = await challengeService.create(data, req.user!.userId);
    res.status(201).json({ status: "success", data: result });
});

export const updateChallengeStatus = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateChallengeStatusInput = req.body;
    const result = await challengeService.updateStatus(String(req.params.id), data, req.user!.userId);
    res.status(200).json({ status: "success", data: result });
});
