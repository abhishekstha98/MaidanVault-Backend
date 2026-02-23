# MaidanVault Backend

A highly resilient backend orchestrator connecting venues, teams, and players across diverse sports using robust Matchmaking queues and Real-Time WebSocket engines.

## Prerequisites

1. **[Node.js](https://nodejs.org/)** (v18+ recommended)
2. **[Git](https://git-scm.com/)**
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Used to spin up Redis and optional databases)
4. A preferred package manager: `pnpm` (recommended), `npm`, or `yarn`.

---

## 🚀 Getting Started

Follow these steps to initialize the MaidanVault backend on a brand new local machine:

### 1. Clone the Repository
Open your terminal and clone the repository locally:
```bash
git clone https://github.com/abhishekstha98/MaidanVault-Backend.git
cd MaidanVault-Backend
```

### 2. Install Dependencies
Run the installation process to download all required packages:
```bash
pnpm install
```

### 3. Environment Configuration
Create your local environment file by cloning the provided example:
```bash
cp .env.example .env
```
Open the `.env` file and **strictly ensure** the following:
* Change `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` to secure unique strings.
* Make sure `DATABASE_URL` accurately points to your local running PostgreSQL database.
* Keep `REDIS_URL` as `redis://localhost:6379` if installing Redis via the included Docker container.

### 4. Spin up Infrastructure (Redis)
The application utilizes Redis exclusively for its Matchmaking Engine. Boot the required Docker container in the background:
```bash
docker-compose up -d
```
*(Wait 5 seconds for the `redis:alpine` image to successfully pull and start on port 6379).*

### 5. Database Migration & Prisma Generation
We must hydrate your empty database instance with our table schemas and force Prisma to map its strictly-typed client to your local `node_modules`:
```bash
npx prisma db push
npx prisma generate
```

### 6. Start the Development Server
Launch the compiler and boot up the API in development mode!
```bash
pnpm run dev
```

If successful, you will see `🚀 Server running on port 3000 in development mode` and `⚡️ Connected to Redis` in your terminal logs!

---

## 🔎 API & Documentation 
Once the server boot has stabilized, we strongly recommend navigating immediately to the Swagger Documentation to interact with the routes:

**Swagger Engine:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Features Mapped
- **Authentication**: Secure JWT Cookie handling (Access + Refresh endpoints).
- **Core Entities**: Full CRUD for Venues, Teams, and Matches.
- **Matchmaking Engine**: Synchronous MatchRequest architecture bridging into `Challenge` workflows. Advanced `socket.io` endpoints map seamlessly onto `ioredis` to construct algorithmic matchmaking lobbies in Real Time.
