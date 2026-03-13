# OMUS — Detailed Project Context for AI Assistant

This document contains a comprehensive architectural and operational overview of the **OMUS** project. Use this context to understand the application layout, tech stack, and established patterns before making changes or answering questions.

## 1. Project Identity
- **Name**: OMUS
- **Type**: Full-stack monorepo application
- **Engine**: Turborepo (`^2.8.10`)
- **Frontend**: Next.js App Router (React) — `@omus/web`
- **Backend**: NestJS (Node.js) — `@omus/api`
- **Database Layer**: PostgreSQL + Prisma ORM (`^6.19.2`)
- **Package Manager**: npm (`^10.0.0`) with workspaces (Node `>=18`)

## 2. High-Level Architecture
OMUS follows a strict separation of concerns via a monorepo setup:
- **Presentation Layer**: Next.js UI rendering and client-side routing.
- **Client Logic**: React Context providers and custom hooks.
- **Transport**: JSON over HTTP REST.
- **Application Layer**: NestJS feature modules, controllers, and services.
- **Data Access & Persistence**: Prisma Client querying PostgreSQL.

## 3. Monorepo Organization
- `apps/web/`: Next.js frontend application.
- `apps/api/`: NestJS backend application.
- `packages/config/`: Shared ESLint, TS, Prettier configurations.
- `packages/types/`: Shared TypeScript types and interfaces for E2E consistency.
- `packages/utils/`: Shared utilities, formatters, and constants.

## 4. Frontend Architecture (`@omus/web`)
- **Routing**: Next.js App Router (`app/` directory). Uses Route Groups `(auth)`, `(dashboard)`, dynamic routes, and nested layouts.
- **Components**: Separated into `ui/` (atomic), `layout/` (structural), `forms/` (domain), and `shared/` (cross-cutting).
  - Defaults to Server Components. Uses `'use client'` strictly for interactive UI, state, or hooks.
- **State Management**: Local component state (`useState`) + custom hooks (`useFetch`, `useAuth`, `useForm`) + Context API (`AuthContext`, `ThemeContext`). No Redux/Zustand is used.
- **Data Fetching**: Hook-based (`useFetch`) wrapping a centralized API client (`lib/api.ts`).
- **Styling**: Tailwind CSS integration with global CSS variables and CSS modules optionally.
- **Icons**: `react-feather` and `react-icons`.

## 5. Backend Architecture (`@omus/api`)
- **Framework**: NestJS, using strongly encapsulated Feature Modules (`Controller` -> `Service` -> `Prisma`).
- **Dependency Injection**: Services and Prisma are injected via constructors.
- **Data Validation (DTOs)**: `class-validator` and `class-transformer` are enforced globally via `ValidationPipe`.
- **API Patterns**: Standard RESTful endpoints, returning consistent JSON responses. Error handling is caught by global exception filters.
- **Common Utilities**: Custom decorators (`@CurrentUser`), Guards for Roles/Auth (`JwtAuthGuard`), and logging interceptors.

## 6. Authentication & Authorization Flow
- **Flow**: Web App sends credentials or handles Google OAuth -> NestJS validates user details and signs a JWT -> Web App stores JWT for subsequent API requests.
- **Guards**: Backend routes act on tokens via `JwtAuthGuard`, `JwtStrategy`, and optionally `RolesGuard`. Frontend routes act on `useAuth` loading & authenticated states.

## 7. Database Layer (Prisma + PostgreSQL)
- **Schema**: Located at `apps/api/prisma/schema.prisma`. Database is hosted on Supabase.
- **Models**: Use UUID primary keys, automatic timestamps (`createdAt`, `updatedAt`), and bidirectional relations.
- **Model specific (User)**: The `User` model handles core fields such as `email`, `role`, and additional profile metadata like `org_unit`, `job_title`, `department`, `employment_type`.
- **Workflow**: `npm run db:generate` to generate types, `npm run db:push` for dev syncing, `npm run migrate` for versioned schema upgrades. Prisma Service is exposed globally in the Nest API.

## 8. Turborepo Orchestration
- Managed via `turbo.json`.
- Benefits from task graph dependencies, aggressive build caching, filter-based runs (`--filter=@omus/web`), and parallel execution of frontend and backend.

## 9. Strengths & Hard Rules to Follow
1. **Domain Isolation**: Maintain one feature per module in NestJS.
2. **Hook Simplicity**: Keep one hook per concern in React.
3. **DRY Types**: Keep shared types in `packages/types/` (never duplicate frontend/backend interfaces).
4. **Validation**: Use DTOs for all incoming backend payloads (never trust `req.body`).
5. **No Hardcoded Secrets**: Rely on environment variables directly (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`).
