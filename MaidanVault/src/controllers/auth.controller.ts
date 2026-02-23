import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { authService } from "../services/auth.service";
import { env } from "../config/env";

const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (Align with JWT expiry)
};

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    const { refreshToken, ...data } = result;

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
        status: "success",
        data,
    });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    const { refreshToken, ...data } = result;

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
        status: "success",
        data,
    });
});

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    const result = await authService.refresh(token);
    const { refreshToken, ...data } = result;

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
        status: "success",
        data,
    });
});
