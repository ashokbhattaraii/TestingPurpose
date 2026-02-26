# OMUS — Comprehensive Project Brief

> Living architecture document. Last updated based on current codebase analysis.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Frontend — `@omus/web` (Next.js)](#4-frontend--omusweb-nextjs)
5. [Backend — `@omus/api` (NestJS)](#5-backend--omusapi-nestjs)
6. [Database Layer — Prisma + PostgreSQL](#6-database-layer--prisma--postgresql)
7. [Shared Packages](#7-shared-packages)
8. [Data Flow & Communication](#8-data-flow--communication)
9. [Hooks Architecture (Frontend)](#9-hooks-architecture-frontend)
10. [Component Architecture (Frontend)](#10-component-architecture-frontend)
11. [State Management Approach](#11-state-management-approach)
12. [Styling Approach](#12-styling-approach)
13. [Authentication & Authorization Flow](#13-authentication--authorization-flow)
14. [API Design Patterns (Backend)](#14-api-design-patterns-backend)
15. [Prisma Schema & Data Modeling](#15-prisma-schema--data-modeling)
16. [Environment & Configuration](#16-environment--configuration)
17. [Turborepo Orchestration](#17-turborepo-orchestration)
18. [Tooling & Technology Decisions](#18-tooling--technology-decisions)
19. [Operational Flows](#19-operational-flows)
20. [Quick Command Reference](#20-quick-command-reference)
21. [Strengths & Conventions](#21-strengths--conventions)

---

## 1) Project Identity

| Field | Value |
|---|---|
| **Name** | OMUS |
| **Type** | Full-stack monorepo application |
| **Monorepo Engine** | Turborepo (`^2.8.10`) |
| **Frontend** | Next.js (React) — `@omus/web` |
| **Backend** | NestJS (Node.js) — `@omus/api` |
| **ORM** | Prisma (`^6.19.2`) |
| **Database** | PostgreSQL (via `pg ^8.18.0`) |
| **Node** | `>=18` |
| **Package Manager** | `npm@10.0.0` |

**Core Goal:**
Build a scalable, maintainable, production-ready full-stack platform from a single repository with clear boundaries between frontend, backend, and shared code.

---

## 2) High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                     OMUS Monorepo                   │
│                                                     │
│  ┌──────────────┐    HTTP/REST    ┌──────────────┐  │
│  │  @omus/web   │ ◄────────────► │  @omus/api   │  │
│  │  (Next.js)   │    (JSON)      │  (NestJS)    │  │
│  │              │                │              │  │
│  │  Pages/App   │                │  Modules     │  │
│  │  Components  │                │  Controllers │  │
│  │  Hooks       │                │  Services    │  │
│  │  Context     │                │  Guards      │  │
│  │  Utils       │                │  DTOs        │  │
│  └──────────────┘                └──────┬───────┘  │
│                                         │          │
│                                  ┌──────▼───────┐  │
│  ┌──────────────┐                │ Prisma ORM   │  │
│  │  packages/*  │                │ (Client +    │  │
│  │  (shared)    │                │  Schema)     │  │
│  └──────────────┘                └──────┬───────┘  │
│                                         │          │
│                                  ┌──────▼───────┐  │
│                                  │  PostgreSQL  │  │
│                                  │  Database    │  │
│                                  └──────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Conceptual Layers

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | Next.js + React | UI rendering, routing, user interaction |
| Client Logic | Custom Hooks + Context | State, side effects, API calls |
| Transport | HTTP/REST (fetch/axios) | Frontend ↔ Backend communication |
| Application | NestJS Modules | Business logic, validation, orchestration |
| Data Access | Prisma Client | Type-safe queries, relations, transactions |
| Persistence | PostgreSQL | Relational data storage |

---

## 3) Complete Folder Structure

```text
OMUS/
├─ apps/
│  ├─ web/                              # @omus/web — Next.js frontend
│  │  ├─ public/                        # Static assets (images, fonts, icons)
│  │  ├─ src/                           # Source root (or app/ if using App Router)
│  │  │  ├─ app/                        # Next.js App Router (if using App Router)
│  │  │  │  ├─ layout.tsx              # Root layout (HTML shell, providers)
│  │  │  │  ├─ page.tsx               # Home / landing page
│  │  │  │  ├─ globals.css            # Global styles
│  │  │  │  ├─ (auth)/                # Route group — auth pages
│  │  │  │  │  ├─ login/page.tsx
│  │  │  │  │  └─ register/page.tsx
│  │  │  │  ├─ dashboard/             # Protected dashboard routes
│  │  │  │  │  ├─ layout.tsx          # Dashboard shell layout
│  │  │  │  │  ├─ page.tsx            # Dashboard home
│  │  │  │  │  └─ [section]/page.tsx  # Dynamic dashboard sections
│  │  │  │  └─ api/                    # Next.js API routes (BFF proxy if used)
│  │  │  ├─ components/                # Reusable UI components
│  │  │  │  ├─ ui/                     # Atomic/base components (Button, Input, Card…)
│  │  │  │  ├─ layout/                 # Layout components (Sidebar, Navbar, Footer…)
│  │  │  │  ├─ forms/                  # Form-specific components
│  │  │  │  └─ shared/                 # Cross-feature components (Modals, Alerts…)
│  │  │  ├─ hooks/                     # Custom React hooks
│  │  │  │  ├─ useAuth.ts             # Authentication state/actions
│  │  │  │  ├─ useFetch.ts            # Generic data fetching hook
│  │  │  │  ├─ useForm.ts             # Form state management
│  │  │  │  ├─ useDebounce.ts         # Debounced value hook
│  │  │  │  ├─ useLocalStorage.ts     # Persistent local state
│  │  │  │  ├─ useModal.ts            # Modal open/close state
│  │  │  │  └─ useClickOutside.ts     # Outside-click detection
│  │  │  ├─ context/                   # React Context providers
│  │  │  │  ├─ AuthContext.tsx         # Auth state provider
│  │  │  │  ├─ ThemeContext.tsx        # Theme/dark-mode provider
│  │  │  │  └─ SidebarContext.tsx      # Sidebar collapse state
│  │  │  ├─ lib/                       # Utility/helper functions
│  │  │  │  ├─ api.ts                 # Axios/fetch wrapper for backend calls
│  │  │  │  ├─ constants.ts           # App-wide constants
│  │  │  │  ├─ validators.ts          # Client-side validation helpers
│  │  │  │  └─ formatters.ts          # Date, currency, string formatters
│  │  │  ├─ types/                     # TypeScript type definitions
│  │  │  │  ├─ user.ts
│  │  │  │  ├─ api.ts
│  │  │  │  └─ common.ts
│  │  │  └─ styles/                    # CSS Modules / Tailwind configs
│  │  ├─ next.config.js                # Next.js configuration
│  │  ├─ tailwind.config.ts            # Tailwind CSS configuration (if used)
│  │  ├─ tsconfig.json                 # TypeScript config
│  │  └─ package.json                  # @omus/web workspace package
│  │
│  └─ api/                              # @omus/api — NestJS backend
│     ├─ prisma/
│     │  ├─ schema.prisma              # Prisma data model
│     │  └─ migrations/               # Migration history
│     ├─ src/
│     │  ├─ main.ts                    # NestJS bootstrap + CORS + validation pipe
│     │  ├─ app.module.ts              # Root module — imports all feature modules
│     │  ├─ app.controller.ts          # Root health-check controller
│     │  ├─ app.service.ts             # Root service
│     │  ├─ prisma/                    # Prisma integration module
│     │  │  ├─ prisma.module.ts        # Module exporting PrismaService
│     │  │  └─ prisma.service.ts       # PrismaClient lifecycle wrapper
│     │  ├─ auth/                      # Authentication module
│     │  │  ├─ auth.module.ts
│     │  │  ├─ auth.controller.ts      # Login, register, refresh endpoints
│     │  │  ├─ auth.service.ts         # JWT signing, password hashing
│     │  │  ├─ auth.guard.ts           # JWT/session guard
│     │  │  ├─ strategies/             # Passport strategies (JWT, Local)
│     │  │  └─ dto/                    # Login DTO, Register DTO
│     │  ├─ users/                     # Users module
│     │  │  ├─ users.module.ts
│     │  │  ├─ users.controller.ts     # CRUD endpoints for users
│     │  │  ├─ users.service.ts        # Business logic for user operations
│     │  │  └─ dto/                    # CreateUser, UpdateUser DTOs
│     │  ├─ [feature]/                 # Additional feature modules follow same pattern
│     │  │  ├─ [feature].module.ts
│     │  │  ├─ [feature].controller.ts
│     │  │  ├─ [feature].service.ts
│     │  │  └─ dto/
│     │  └─ common/                    # Shared backend utilities
│     │     ├─ decorators/             # Custom decorators (@CurrentUser, @Roles…)
│     │     ├─ filters/                # Exception filters
│     │     ├─ interceptors/           # Logging, transform interceptors
│     │     ├─ pipes/                  # Validation, parse pipes
│     │     └─ guards/                 # Role-based, permission guards
│     ├─ test/                         # E2E tests
│     ├─ nest-cli.json                 # NestJS CLI config
│     ├─ tsconfig.json                 # TypeScript config
│     └─ package.json                  # @omus/api workspace package
│
├─ packages/                            # Shared workspace packages
│  ├─ config/                          # Shared ESLint/TS/Prettier configs
│  ├─ types/                           # Shared TypeScript interfaces/types
│  └─ utils/                           # Shared utility functions
│
├─ .env                                # Root environment variables
├─ .gitignore
├─ turbo.json                          # Turborepo pipeline configuration
├─ package.json                        # Root workspace config + scripts
├─ projectbrief.md                     # This document
└─ README.md
```

---

## 4) Frontend — `@omus/web` (Next.js)

### 4.1 Routing Approach

The frontend uses **Next.js App Router** (file-system based routing under `app/`):

- **Route Groups** (`(auth)`, `(dashboard)`) are used to organize routes without affecting the URL path.
- **Dynamic Routes** (`[id]`, `[section]`) handle parameterized pages.
- **Layouts** (`layout.tsx`) wrap pages at each route level — root layout provides HTML shell + global providers; nested layouts provide section-specific shells (sidebar, nav).
- **Loading/Error States** (`loading.tsx`, `error.tsx`) are co-located with routes for graceful UX.

### 4.2 Component Architecture

Components follow a **composable, layered** structure:

```
components/
├─ ui/          Atomic — Button, Input, Badge, Avatar, Spinner, Card
├─ layout/      Structural — Sidebar, Navbar, Header, Footer, PageWrapper
├─ forms/       Domain — LoginForm, RegisterForm, ProfileForm
└─ shared/      Cross-cutting — Modal, ConfirmDialog, Toast, Dropdown
```

**Principles followed:**
- **Separation of presentational vs. container** logic — UI components are pure/stateless; pages and form wrappers hold state.
- **Props-driven rendering** — Components accept typed props; avoid internal fetch calls in atomic components.
- **Composition over inheritance** — Complex UIs are composed from smaller components using `children`, render props, or slots.

### 4.3 Icons

Two icon libraries are installed and used:

| Library | Usage |
|---|---|
| `react-feather` (`^2.0.10`) | Clean, minimal line icons — used for navigation, actions, UI chrome |
| `react-icons` (`^5.5.0`) | Extended icon sets (FontAwesome, Material, Heroicons, etc.) — used for feature-specific/decorative icons |

**Import pattern:**
```tsx
import { Menu, X, ChevronDown } from 'react-feather';
import { FiSettings, FiLogOut } from 'react-icons/fi';
```

### 4.4 Page Structure Pattern

Each page typically follows this pattern:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  // 1. Hooks — fetch data, get auth state, manage local state
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/api/dashboard/stats');

  // 2. Early returns — loading/error states
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  // 3. Render — compose from components
  return (
    <PageWrapper title="Dashboard">
      <StatsGrid data={data} />
      <RecentActivity user={user} />
    </PageWrapper>
  );
}
```

---

## 5) Backend — `@omus/api` (NestJS)

### 5.1 Module Architecture

NestJS follows a **modular architecture** where each domain/feature is encapsulated in its own module:

```
Module (declares scope)
  └─ Controller (handles HTTP routes)
       └─ Service (contains business logic)
            └─ Prisma Service (data access)
```

**Each feature module** (`auth`, `users`, etc.) contains:
- **`*.module.ts`** — Declares controller, providers, imports, exports.
- **`*.controller.ts`** — Defines REST endpoints with decorators (`@Get`, `@Post`, `@Put`, `@Delete`).
- **`*.service.ts`** — Implements business logic; injects `PrismaService` for DB operations.
- **`dto/`** — Data Transfer Objects with `class-validator` decorators for input validation.

### 5.2 Dependency Injection

NestJS uses built-in **IoC (Inversion of Control)** container:

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }
}
```

- Services are marked `@Injectable()` and injected via constructor.
- PrismaService is a **global singleton** imported from `PrismaModule`.
- Guards, interceptors, and pipes are also DI-managed.

### 5.3 Prisma Service Integration

A dedicated `PrismaService` wraps the Prisma Client with NestJS lifecycle hooks:

```typescript
// prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

This ensures:
- DB connection is established when NestJS boots.
- Connection is gracefully closed on shutdown.
- All services share a single Prisma Client instance.

### 5.4 DTO & Validation Pattern

DTOs enforce request shape validation using `class-validator` + `class-transformer`:

```typescript
// dto/create-user.dto.ts
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

The global `ValidationPipe` in `main.ts` auto-validates all incoming requests:

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Strip unknown properties
  forbidNonWhitelisted: true,
  transform: true,        // Auto-transform payloads to DTO instances
}));
```

### 5.5 Controller Pattern

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

### 5.6 Common Utilities (Backend)

| Folder | Purpose |
|---|---|
| `common/decorators/` | Custom parameter decorators (`@CurrentUser()` to extract user from JWT) |
| `common/guards/` | `JwtAuthGuard`, `RolesGuard` for route protection |
| `common/filters/` | Global exception filters (standardized error responses) |
| `common/interceptors/` | Response transform, logging, timeout interceptors |
| `common/pipes/` | Custom validation/parsing pipes |

---

## 6) Database Layer — Prisma + PostgreSQL

### 6.1 Schema Location

```
apps/api/prisma/schema.prisma
```

### 6.2 Schema Pattern

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  profile   Profile?
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  avatar String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

// ... additional models

enum Role {
  USER
  ADMIN
}
```

### 6.3 Database Workflow

```
Schema Change ──► db:generate ──► db:push (dev) / migrate (prod) ──► db:studio (inspect)
```

| Command | What It Does |
|---|---|
| `npm run db:generate` | Re-generates `@prisma/client` types from schema |
| `npm run db:push` | Pushes schema to DB without migration history (dev use) |
| `npm run migrate` | Creates versioned migration files (production-safe) |
| `npm run db:studio` | Opens browser-based Prisma Studio for data inspection |

### 6.4 Prisma Client Usage in Services

```typescript
// Prisma provides full type-safety and auto-completion
const user = await this.prisma.user.findUnique({
  where: { email },
  include: { profile: true, posts: true },
});

// Transactions
const result = await this.prisma.$transaction([
  this.prisma.user.create({ data: userData }),
  this.prisma.profile.create({ data: profileData }),
]);
```

---

## 7) Shared Packages

Located under `packages/*`, these provide cross-app reusable code:

| Package | Purpose | Consumed By |
|---|---|---|
| `packages/config` | Shared ESLint, TypeScript, Prettier configs | Both apps |
| `packages/types` | Shared TypeScript interfaces/types (User, ApiResponse, etc.) | Both apps |
| `packages/utils` | Shared utility functions (formatters, validators, constants) | Both apps |

**Why this matters:**
- Prevents type duplication between frontend and backend.
- Ensures API contracts are consistent (same `User` type in both places).
- Config packages eliminate drift in linting/formatting rules.

---

## 8) Data Flow & Communication

### Request Lifecycle (End-to-End)

```
User Interaction (Click / Form Submit)
        │
        ▼
[React Component] ──► calls custom hook (e.g., useAuth, useFetch)
        │
        ▼
[Custom Hook] ──► calls API utility (lib/api.ts)
        │
        ▼
[API Utility] ──► HTTP request (fetch/axios) to NestJS backend
        │
        ▼
[NestJS Controller] ──► ValidationPipe validates DTO
        │
        ▼
[NestJS Service] ──► Business logic + Prisma queries
        │
        ▼
[Prisma Client] ──► SQL query to PostgreSQL
        │
        ▼
[PostgreSQL] ──► Returns rows
        │
        ▼
[Prisma] ──► Maps to typed objects
        │
        ▼
[Service → Controller] ──► Returns JSON response
        │
        ▼
[Hook] ──► Updates React state
        │
        ▼
[Component] ──► Re-renders with new data
```

### API Utility Pattern (Frontend)

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  get: <T>(url: string) => apiClient<T>(url),
  post: <T>(url: string, data: unknown) =>
    apiClient<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) =>
    apiClient<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) =>
    apiClient<T>(url, { method: 'DELETE' }),
};
```

---

## 9) Hooks Architecture (Frontend)

Custom hooks encapsulate **all reusable stateful logic** and side effects, following React best practices:

### 9.1 `useAuth` — Authentication Hook

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
  // Returns: { user, token, login, logout, register, isAuthenticated, loading }
}
```
- Wraps `AuthContext` for clean consumer API.
- Provides `login()`, `logout()`, `register()` actions.
- Manages token storage in `localStorage`.
- Tracks `loading` and `isAuthenticated` state.

### 9.2 `useFetch` — Generic Data Fetching Hook

```typescript
// hooks/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<T>(url)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error, refetch: () => { /* re-trigger */ } };
}
```
- Handles loading, error, and data states.
- Cancels stale requests on unmount/URL change.
- Exposes `refetch` for manual re-trigger.

### 9.3 `useForm` — Form State Hook

```typescript
// hooks/useForm.ts
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  const reset = () => setValues(initialValues);

  return { values, errors, setErrors, handleChange, reset, setValues };
}
```
- Generic over form shape `T`.
- Provides per-field change handlers.
- Manages validation errors alongside values.

### 9.4 `useDebounce` — Debounced Value

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```
- Used for search inputs, filter fields.
- Prevents excessive API calls on rapid typing.

### 9.5 `useLocalStorage` — Persistent State

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T) => {
    setStored(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [stored, setValue] as const;
}
```

### 9.6 Other Hooks

| Hook | Purpose |
|---|---|
| `useModal` | Controls `isOpen`, `open()`, `close()`, `toggle()` for modals |
| `useClickOutside` | Detects clicks outside a ref — used for dropdown/sidebar close |
| `useBreakpoint` | Responsive layout logic based on window width |
| `useToast` | Trigger toast notifications |

### Hook Design Principles Applied

1. **Single Responsibility** — Each hook does one thing.
2. **Composable** — Hooks call other hooks (`useAuth` uses `useLocalStorage` internally).
3. **Cleanup** — All `useEffect` hooks return cleanup functions (timers, subscriptions, abort controllers).
4. **Generic Types** — Hooks like `useFetch<T>` and `useForm<T>` are type-parameterized for reuse.
5. **No Direct DOM Access** — Hooks use React state/refs, not manual DOM manipulation.

---

## 10) Component Architecture (Frontend)

### Component Hierarchy

```
Layout (Sidebar + Navbar + Main Content Area)
  └─ Page Component (route-level)
       └─ Section Components (feature areas)
            └─ UI Components (buttons, inputs, cards)
```

### Component Patterns Used

| Pattern | Where | Why |
|---|---|---|
| **Server Components** (default in App Router) | Pages, layouts | Zero client JS, data fetching at server level |
| **Client Components** (`'use client'`) | Interactive components (forms, dropdowns, modals) | Need hooks, event handlers, browser APIs |
| **Composition** | Layouts wrapping pages | Shared chrome (nav, sidebar) without repetition |
| **Controlled Inputs** | All form components | State lives in hooks/context, inputs reflect state |
| **Conditional Rendering** | Loading/error states | `if (loading) return <Spinner />` pattern |
| **Key-based Lists** | Data grids, lists | Proper React reconciliation with unique keys |

### Client vs. Server Components

```
                   ┌─────────────────────┐
                   │   Server Components  │
                   │   (default)          │
                   │                     │
                   │   - Layouts         │
                   │   - Static pages    │
                   │   - Data display    │
                   └────────┬────────────┘
                            │ wraps
                   ┌────────▼────────────┐
                   │  Client Components   │
                   │  ('use client')      │
                   │                     │
                   │  - Forms            │
                   │  - Modals           │
                   │  - Interactive UI   │
                   │  - Components using │
                   │    hooks/state      │
                   └─────────────────────┘
```

---

## 11) State Management Approach

OMUS uses **React Context + Custom Hooks** (no Redux/Zustand):

### State Categories

| Category | Solution | Example |
|---|---|---|
| **Server State** | `useFetch` + local `useState` | Dashboard data, user lists |
| **Auth State** | `AuthContext` + `useAuth` | Current user, JWT token |
| **UI State** | Local `useState` / `useModal` | Modal open/close, form inputs |
| **Theme State** | `ThemeContext` | Dark/light mode toggle |
| **Persisted State** | `useLocalStorage` | User preferences, sidebar collapse |

### Context Provider Tree

```tsx
// app/layout.tsx
<AuthProvider>
  <ThemeProvider>
    <SidebarProvider>
      {children}
    </SidebarProvider>
  </ThemeProvider>
</AuthProvider>
```

**Why Context + Hooks over Redux:**
- App complexity doesn't warrant a global store library yet.
- Context is native React — zero extra dependencies.
- Custom hooks provide clean, testable abstraction.
- Easy to migrate to Zustand/Redux later if needed.

---

## 12) Styling Approach

The project likely uses one of these approaches (based on Next.js conventions):

| Approach | Files | Usage |
|---|---|---|
| **Tailwind CSS** | `tailwind.config.ts`, `globals.css` with `@tailwind` directives | Utility-first classes in JSX |
| **CSS Modules** | `*.module.css` co-located with components | Scoped styles per component |
| **Global CSS** | `app/globals.css` | Base resets, font imports, CSS variables |

**Icon integration with styling:**
```tsx
<Button className="flex items-center gap-2">
  <Menu size={18} />
  <span>Menu</span>
</Button>
```

---

## 13) Authentication & Authorization Flow

### Authentication Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Web App  │ ───────────────────────► │  NestJS   │
│ (Next.js) │    { email, password }   │  API      │
│           │                          │           │
│           │ ◄─────────────────────── │           │
│           │    { token, user }       │           │
│           │                          │           │
│  stores   │                          │  verifies │
│  JWT in   │                          │  password │
│  storage  │                          │  signs JWT│
└──────────┘                          └──────────┘
```

### Protected Route Flow

```
Incoming Request with Authorization header
        │
        ▼
[JwtAuthGuard] ──► Extracts token from Bearer header
        │
        ▼
[JwtStrategy] ──► Verifies + decodes JWT
        │
        ▼
[Attach user to request] ──► req.user = { id, email, role }
        │
        ▼
[RolesGuard] (optional) ──► Checks role-based access
        │
        ▼
[Controller method executes]
```

### Frontend Route Protection

```tsx
// Protected layout or middleware
export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) redirect('/login');

  return <DashboardShell>{children}</DashboardShell>;
}
```

---

## 14) API Design Patterns (Backend)

### RESTful Endpoint Convention

```
GET    /api/users          → List all users
GET    /api/users/:id      → Get single user
POST   /api/users          → Create user
PUT    /api/users/:id      → Update user
DELETE /api/users/:id      → Delete user

POST   /api/auth/login     → Authenticate
POST   /api/auth/register  → Create account
POST   /api/auth/refresh   → Refresh token
```

### Response Format Convention

```json
// Success
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}

// Error (via NestJS exception filter)
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## 15) Prisma Schema & Data Modeling

### Design Principles
- **UUID primary keys** (`@id @default(uuid())`) for all models.
- **Timestamps** on every model (`createdAt`, `updatedAt`).
- **Enums** for fixed-value fields (`Role`, `Status`).
- **Relations** defined bidirectionally for type-safe includes.
- **Unique constraints** on business-unique fields (email).

### Migration Strategy
- **Development:** `db:push` for rapid iteration without migration files.
- **Staging/Production:** `migrate` for versioned, auditable schema changes.

---

## 16) Environment & Configuration

### Environment Variables

```env
# .env (root)
DATABASE_URL=postgresql://user:password@localhost:5432/omus
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Configuration Flow
- Root `.env` used by Prisma CLI commands (`dotenv -e .env` in migrate script).
- API app reads `DATABASE_URL`, `JWT_SECRET` etc. via `process.env` or NestJS `ConfigModule`.
- Web app uses `NEXT_PUBLIC_*` prefixed vars for client-side access.

---

## 17) Turborepo Orchestration

### `turbo.json` Pipeline (Typical)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {},
    "clean": {
      "cache": false
    }
  }
}
```

### How Turborepo Helps

| Feature | Benefit |
|---|---|
| **Task graph** | Runs tasks in correct dependency order |
| **Caching** | Skips unchanged builds (hashes inputs) |
| **Filtering** | `--filter=@omus/web` targets single workspace |
| **Parallelism** | `--parallel` runs independent tasks concurrently |
| **Persistent tasks** | Dev servers stay alive (`persistent: true`) |

---

## 18) Tooling & Technology Decisions

| Tool | Version | Role |
|---|---|---|
| Turborepo | `^2.8.10` | Monorepo task orchestration |
| Next.js | (workspace) | React framework for frontend |
| NestJS | (workspace) | Node.js framework for backend |
| Prisma | `^6.19.2` | ORM + type-safe database client |
| PostgreSQL | via `pg ^8.18.0` | Relational database |
| TypeScript | (workspace) | Type safety across entire codebase |
| react-feather | `^2.0.10` | Minimal line icons |
| react-icons | `^5.5.0` | Extended icon library |
| Node.js | `>=18` | Runtime |
| npm | `10.0.0` | Package manager with workspaces |

---

## 19) Operational Flows

### A) Local Development
```bash
npm install                 # Install all workspace dependencies
npm run dev                 # Start web + api dev servers in parallel
# OR
npm run dev:web             # Frontend only (http://localhost:3000)
npm run dev:api             # Backend only (http://localhost:3001)
```

### B) Database Lifecycle
```bash
# 1. Edit apps/api/prisma/schema.prisma
# 2. Regenerate client
npm run db:generate
# 3. Sync DB (choose one)
npm run db:push             # Quick dev sync
npm run migrate             # Versioned migration
# 4. Inspect
npm run db:studio           # Opens browser UI
```

### C) Build & Deploy
```bash
npm run build               # Build all apps
npm run build:web           # Build frontend only
npm run build:api           # Build backend only
npm run start               # Start production builds
```

### D) Quality Checks
```bash
npm run lint                # Lint all workspaces
npm run test                # Run all test suites
npm run clean               # Clean build artifacts + caches
```

---

## 20) Quick Command Reference

```bash
# Development
npm run dev              # All apps parallel
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Build
npm run build            # All apps
npm run build:web        # Frontend only
npm run build:api        # Backend only

# Production Start
npm run start            # All apps
npm run start:web        # Frontend only
npm run start:api        # Backend only

# Quality
npm run lint             # Lint all
npm run test             # Test all
npm run clean            # Clean all

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to DB
npm run migrate          # Run migrations
npm run db:studio        # Open Prisma Studio

# Docs
npm run docs:brief       # Print this document
```

---

## 21) Strengths & Conventions

### Current Strengths
- ✅ Clear separation: frontend / backend / shared packages
- ✅ Type-safe end-to-end: TypeScript + Prisma + DTOs
- ✅ Scalable monorepo: Turborepo + npm workspaces
- ✅ Production-ready patterns: NestJS modules, Next.js App Router
- ✅ Clean hook abstraction: No prop-drilling, composable logic
- ✅ Database lifecycle: Full Prisma toolchain integrated

### Conventions to Maintain
1. **One module per domain** in NestJS (`auth/`, `users/`, `posts/`, etc.).
2. **One hook per concern** in React (`useAuth`, `useFetch`, `useForm`).
3. **Shared types** in `packages/types` — never duplicate interfaces.
4. **DTOs for all POST/PUT** — never trust raw `req.body`.
5. **Environment variables** — never hardcode secrets or URLs.
6. **Feature branches** — develop features in isolation, merge via PR.
7. **This doc** — update after every architectural decision.

---

*End of OMUS Project Brief*
