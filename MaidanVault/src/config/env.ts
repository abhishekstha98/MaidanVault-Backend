import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file before validation
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().int().positive().default(3000),

    DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
    REDIS_URL: z.string().url({ message: "REDIS_URL must be a valid URL" }).default("redis://localhost:6379"),

    // JWT
    ACCESS_TOKEN_SECRET: z.string().min(16, "ACCESS_TOKEN_SECRET must be at least 16 characters"),
    REFRESH_TOKEN_SECRET: z.string().min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(parsed.error.format(), null, 2)
    );
    process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
