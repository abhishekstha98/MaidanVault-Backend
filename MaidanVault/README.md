# MaidanVault Backend

A highly resilient backend orchestrator connecting venues, teams, and players across diverse sports using robust Matchmaking queues, Real-Time WebSocket engines, Tournaments, and Gamification.

## 🌟 Core Features

- **Robust Authentication & Roles**: Highly secure JWT token pipelines passing Access and Refresh HTTP-only cookies securely across routing arrays. Admin/Captain RBAC structures implemented seamlessly.
- **Advanced Matchmaking Engine**: Fully integrated Redis-backed queue system pairing users instantaneously based on exact Sport Types and atomic Skill Levels with seamless handshake acceptance validations.
- **Match-Level Live Chat**: Complete interactive dual-authenticated Socket rooms binding text-payload emitters securely into specific Match IDs.
- **Tournaments Platform**: Organize large-scale events, dictate entry fees/prize pools, cap team slots, and bind detailed rosters through `TournamentRegistrations`.
- **Global Gamifier Hook**: Submits dynamic recursive hooks triggering on completed matches to instantaneously process individual user points (`rewardPoints`), compute overall `winRate`, and track `matchesPlayed` ratios.
- **Production Containerization Pipeline**: The engine ships fully automated through Alpine Node Dockerfiles tied specifically into sequential Postgres migrations via `docker-compose.yml`.
- **Strict Zod Validations & Swagger UI**: 100% Type-Safe API configurations mapped directly from Zod endpoint validation schemas eliminating raw YAML drift in API Documentation.

---

## 🚀 Deployment Methods

MaidanVault now fully supports both native orchestration inside **Docker Compose** as well as standard **Local Node** development.

### Method 1: Dockerized Production deployment (Recommended)
You can launch the entire stack (Postgres Database, Redis Queue, API Server, and Automated Prisma Migrations) securely inside a connected virtual network directly via docker-compose.

1. **Clone the Project**
   ```bash
   git clone https://github.com/abhishekstha98/MaidanVault-Backend.git
   cd MaidanVault-Backend
   ```

2. **Configure Environment**
   Duplicate `.env.example` into `.env`.
   ```bash
   cp .env.example .env
   ```
   > **Important for Docker:** Make sure you use the internal DNS hostnames mapped inside `.env.example` (i.e. keep `DATABASE_URL` pointing to `@postgres:5432` and `REDIS_URL` pointing to `redis://redis:6379`).

3. **Build and Launch Context**
   ```bash
   docker-compose up --build -d
   ```
   *The builder will pull all images, execute `npx prisma migrate deploy` locally to build table layouts safely, compile `tsc` strict binaries, and expose your node app.*

---

### Method 2: Local Development (Node & pnpm)

If you'd like to run the Node server directly off your machine compiler for hot-reloading development:

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   Duplicate `.env.example` into `.env`.
   ```bash
   cp .env.example .env
   ```
   > **Important for Local:** Change the host DNS pointers for `DATABASE_URL` back to `localhost:5432` and `REDIS_URL` to `localhost:6379`!

3. **Spin up Infrastructure (Redis)**
   We still recommend running your background cache dependencies using Docker. Wait 5 seconds for the `redis:alpine` container to stabilize.
   ```bash
   docker-compose up -d redis postgres
   ```

4. **Database Migration & Prisma Generation**
   Hydrate your local schema mapping structures:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   pnpm run dev
   ```
   Look for `🚀 Server running on port 3000 in development mode` in your terminal logs!

---

## 🔎 API Swagger Documentation 
Once the server boot has stabilized, we strongly recommend navigating immediately to the Swagger Documentation to interact with the routes:

**Swagger Engine:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
