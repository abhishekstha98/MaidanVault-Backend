import { Request, Response } from "express";
import { matchRequestService } from "../services/match-request.service";
import { catchAsync } from "../utils/catchAsync";
import { CreateMatchRequestInput, UpdateMatchRequestStatusInput } from "../validators/match-request.validator";

export const createMatchRequest = catchAsync(async (req: Request, res: Response) => {
    const data: CreateMatchRequestInput = req.body;
    const result = await matchRequestService.create(data, req.user!.userId);
    res.status(201).json({ status: "success", data: result });
});

export const listMatchRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await matchRequestService.list(req.query);
    res.status(200).json({ status: "success", data: result });
});

export const updateMatchRequestStatus = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateMatchRequestStatusInput = req.body;
    const result = await matchRequestService.updateStatus(String(req.params.id), data, req.user!.userId);
    res.status(200).json({ status: "success", data: result });
});
