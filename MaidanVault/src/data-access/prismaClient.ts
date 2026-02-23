import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

/**
 * Singleton Prisma Client with pg driver adapter.
 *
 * Prisma v7 requires an explicit driver adapter for direct
 * database connections. PrismaPg accepts a Pool or PoolConfig.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
