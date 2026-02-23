import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
    userId: string;
    role: string;
}

export interface RefreshTokenPayload {
    userId: string;
}

/**
 * Parse a duration string like "15m", "7d", "1h" into seconds.
 */
function parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration format: ${duration}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "s": return value;
        case "m": return value * 60;
        case "h": return value * 3600;
        case "d": return value * 86400;
        default: throw new Error(`Unknown duration unit: ${unit}`);
    }
}

/**
 * Generate a short-lived access token (default 15m).
 * Contains userId and role for RBAC support.
 */
export const signAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
        expiresIn: parseDurationToSeconds(env.ACCESS_TOKEN_EXPIRES_IN),
    });
};

/**
 * Generate a long-lived refresh token (default 7d).
 * Contains only userId for minimal exposure.
 */
export const signRefreshToken = (payload: RefreshTokenPayload): string => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn: parseDurationToSeconds(env.REFRESH_TOKEN_EXPIRES_IN),
    });
};

/**
 * Verify and decode an access token.
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

/**
 * Verify and decode a refresh token.
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};

