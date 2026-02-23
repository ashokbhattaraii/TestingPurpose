# OMUS Monorepo

> **O**ffice **M**anagement **U**nified **S**ystem — Turborepo monorepo with Next.js frontend and NestJS backend.

---

## Repository Structure

```
OMUS/
├── apps/
│   ├── web/              # @omus/web   — Next.js 16 (React 19, Tailwind CSS)
│   └── api/              # @omus/api   — NestJS 11 (Prisma, Passport JWT, Supabase)
├── packages/             # Shared packages (types, config, utils — future)
├── .gitignore
├── .npmrc
├── package.json          # Root workspace + Turborepo scripts
├── turbo.json            # Turborepo pipeline config
└── README.md
```

---

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Monorepo** | Turborepo + npm workspaces              |
| **Frontend** | Next.js 16, React 19, Tailwind CSS, ShadCN |
| **Backend**  | NestJS 11, Prisma ORM, Passport JWT     |
| **Database** | PostgreSQL via Supabase                 |
| **Language** | TypeScript (strict)                     |

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 10

---

## Getting Started

### 1. Clone & install all dependencies

```bash
git clone <repo-url> omus
cd omus
npm install
```

### 2. Set up environment variables

```bash
# Frontend
cp apps/web/.env.example apps/web/.env

# Backend
cp apps/api/.env.example apps/api/.env
```

---

## Available Scripts

Run all commands from the **monorepo root**.

### 🔵 Development

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Run **all** apps in parallel (watch) |
| `npm run dev:web`  | Run **frontend** only                |
| `npm run dev:api`  | Run **backend** only                 |

### 🟢 Build

| Command             | Description               |
| ------------------- | ------------------------- |
| `npm run build`     | Build **all** apps        |
| `npm run build:web` | Build frontend only       |
| `npm run build:api` | Build backend only        |

### 🚀 Start (Production)

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run start`      | Start **all** apps (needs build)   |
| `npm run start:web`  | Start frontend (needs build)       |
| `npm run start:api`  | Start backend (needs build)        |

### 🧹 Lint & Format

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `npm run lint`       | Lint **all** apps               |
| `npm run lint:web`   | Lint frontend only              |
| `npm run lint:api`   | Lint backend only               |
| `npm run format`     | Format all (Prettier)           |
| `npm run format:api` | Format backend only             |

### 🧪 Test

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run test`       | Run all unit tests                   |
| `npm run test:web`   | Run frontend tests                   |
| `npm run test:api`   | Run backend unit tests               |
| `npm run test:e2e`   | Run backend end-to-end tests         |

### 🗑️ Clean

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run clean`      | Clean build artifacts in all apps   |
| `npm run clean:web`  | Clean frontend `.next/`             |
| `npm run clean:api`  | Clean backend `dist/`               |

---

## Turborepo Remote Cache (Optional)

Speed up CI/CD with Turborepo remote caching:

```bash
npx turbo login
npx turbo link
```

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit with conventional commits: `feat:`, `fix:`, `chore:`, etc.
3. Open a Pull Request against `main`
