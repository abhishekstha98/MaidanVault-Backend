import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ExtendedError } from "socket.io/dist/namespace";

export interface SocketUser {
    id: string;
    role: string;
}

export interface AuthenticatedSocket extends Socket {
    user?: SocketUser;
}

export const socketAuth = (
    socket: AuthenticatedSocket,
    next: (err?: ExtendedError) => void
) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as SocketUser;
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error("Authentication error: Invalid token"));
    }
};
