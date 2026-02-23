import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { venueService } from "../services/venue.service";

export const createVenue = catchAsync(async (req: Request, res: Response) => {
    // `req.user` is guaranteed by the authenticate middleware
    const userId = req.user!.userId;

    const venue = await venueService.create(req.body, userId);

    res.status(201).json({
        status: "success",
        data: venue,
    });
});

export const listVenues = catchAsync(async (req: Request, res: Response) => {
    const venues = await venueService.list(req.query as any);

    res.status(200).json({
        status: "success",
        data: venues,
    });
});

export const getVenueDetails = catchAsync(async (req: Request, res: Response) => {
    const venueId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const venue = await venueService.getDetails(venueId);

    res.status(200).json({
        status: "success",
        data: venue,
    });
});
