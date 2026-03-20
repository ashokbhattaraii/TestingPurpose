# WorkOps Monorepo

> **WorkOps** — A modern, full-stack monorepo for office utility and facility management.

---

## 🚀 Quick Start

Get the project up and running in minutes.

### 1. Clone the repository
```bash
git clone <repo-url> omus
cd omus
```

### 2. Install dependencies
Make sure you have [pnpm](https://pnpm.io/installation) installed.
```bash
pnpm install
```

### 3. Setup Environment Variables
Copy the root `.env.example` (if present) or create `.env` files in `apps/web` and `apps/api`.
- **API**: Requires `DATABASE_URL` (PostgreSQL) and `RS_USER_URL` (Identity).
- **Web**: Requires `NEXT_PUBLIC_API_URL`.

### 4. Database Setup
```bash
# Generate Prisma Client types
pnpm run db:generate

# Sync schema to your database
pnpm run db:push
```

### 5. Start Developing
```bash
pnpm run dev
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Monorepo** | Turborepo + pnpm workspaces                     |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS |
| **Backend**  | NestJS 11, Prisma ORM, Socket.io                |
| **Auth**     | Supabase Auth + Rumsan Office Identity          |
| **Database** | PostgreSQL                                      |
| **Language** | TypeScript (Strict Mode)                        |

---

## 🏗️ Repository Structure

```text
WorkOps/
├── apps/
│   ├── web/              # @omus/web   — Frontend Dashboard
│   └── api/              # @omus/api   — REST & Real-time API
├── packages/             # Shared logic (Planned)
├── package.json          # Root workspace scripts
├── turbo.json            # Build pipeline configuration
└── README.md             # This guide
```

---

## 📜 Available Scripts

Run these from the **root directory**.

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Starts both Web and API in watch mode |
| `pnpm run build` | Builds all applications for production |
| `pnpm run lint` | Runs ESLint across the entire monorepo |
| `pnpm run format` | Formats code using Prettier |
| `pnpm run db:studio` | Opens Prisma Studio to view/edit data |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit changes: `git commit -m "feat: added awesome feature"`
3. Push and open a Pull Request.
