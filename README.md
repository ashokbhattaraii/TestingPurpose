# OMUS Monorepo

> **O**ffice **M**anagement **U**nified **S**ystem — Turborepo monorepo with Next.js frontend and NestJS backend.

---

## Repository Structure

```
OMUS/
├── apps/
│   ├── web/              # @omus/web   — Next.js 16 (React 19, Tailwind CSS)
│   └── api/              # @omus/api   — NestJS 11 (Prisma, Passport JWT, Supabase)
├── packages/             # Shared packages (types, config, utils — planned)
├── .gitignore
├── .npmrc
├── package.json          # Root workspace + Turborepo scripts
├── turbo.json            # Turborepo pipeline config
└── README.md
```

---

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Monorepo** | Turborepo + pnpm workspaces                     |
| **Frontend** | Next.js 16, React 19, Tailwind CSS, ShadCN, React Query |
| **Backend**  | NestJS 11, Prisma ORM, Passport JWT, Socket.io  |
| **Auth**     | Supabase Auth + Rumsan Office Identity          |
| **Database** | PostgreSQL via Supabase Pooler                  |
| **Language** | TypeScript (strict)                             |

---

## Prerequisites

- **Node.js** >= 20 (Targeting Node 24 per config)
- **pnpm** >= 10

---

## Getting Started

### 1. Clone & install all dependencies

```bash
git clone <repo-url> omus
cd omus
pnpm install
```

### 2. Set up environment variables

Copy the `.env.example` to `.env` in the root (or relevant apps). Note that the API requires `DATABASE_URL` for Prisma and `RS_USER_URL` for Rumsan Identity.

### 3. Database Sync

```bash
# Generate Prisma Client
pnpm run db:generate

# Sync schema with dev database
pnpm run db:push
```

---

## Available Scripts

Run all commands from the **monorepo root** using `pnpm`.

### 🔵 Development

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm run dev`     | Run **all** apps in parallel (watch) |
| `pnpm run dev:web` | Run **frontend** only                |
| `pnpm run dev:api` | Run **backend** only                 |

### 🟢 Build

| Command             | Description               |
| ------------------- | ------------------------- |
| `pnpm run build`    | Build **all** apps        |
| `pnpm run build:web`| Build frontend only       |
| `pnpm run build:api`| Build backend only        |

### 🗄️ Database Management

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm run db:generate` | Update Prisma Client types        |
| `pnpm run db:push`     | Push schema changes to DB (dev)   |
| `pnpm run db:studio`   | Open Prisma Studio (GUI)          |
| `pnpm run migrate`     | Create a new migration file       |

### 🚀 Start (Production)

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm run start`      | Start **all** apps (needs build)   |

### 🧹 Lint & Format

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `pnpm run lint`       | Lint **all** apps               |
| `pnpm run format`     | Format all (Prettier)           |

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit with conventional commits: `feat:`, `fix:`, `chore:`, etc.
3. Open a Pull Request against `main`
