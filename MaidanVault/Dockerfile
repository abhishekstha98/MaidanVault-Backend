# Stage 1: Build
FROM node:18-alpine AS builder

# Enable corepack for pnpm support
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript
RUN pnpm run build

# Stage 2: Production Run
FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Only cache production runtime dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma migrations for Safe Container execution
COPY prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy built outputs
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Start command uses secure production script applying sequential SQL schemas
CMD ["pnpm", "run", "start:prod"]
