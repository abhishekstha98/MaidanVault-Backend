import bcrypt from "bcrypt";
import prisma from "../data-access/prismaClient";
import { AppError } from "../utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

export class AuthService {
    /**
     * Register a new user.
     */
    async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError("A user with this email already exists.", 409);
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                phone: data.phone,
                location: data.location,
                bio: data.bio,
            },
        });

        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login an existing user.
     */
    async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError("Invalid email or password.", 401);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError("Invalid email or password.", 401);
        }

        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isProMember: user.isProMember,
                rewardPoints: user.rewardPoints,
                profileCompletionPct: user.profileCompletionPct,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh tokens using a valid refresh token.
     * Returns a new access token and refresh token pair.
     */
    async refresh(refreshToken: string) {
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError("Invalid or expired refresh token.", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            throw new AppError("User no longer exists.", 401);
        }

        const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
        const newRefreshToken = signRefreshToken({ userId: user.id });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}

export const authService = new AuthService();
