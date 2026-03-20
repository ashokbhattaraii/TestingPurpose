# OMUS Web (@omus/web)

> Next.js 16 frontend for the Office Management Unified System.

## Features

- **Service Request Dashboard**: Visual tracking of issues and supplies requests.
- **Analytics Visualization**: Real-time charts for request distribution and status.
- **Role-based UI**: Dynamic layouts for Admins and Employees.
- **Real-time Updates**: Socket.io integration for instant notifications.
- **Modern UI**: Built with Tailwind CSS and Radix UI primitives (via ShadCN).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: React Context + TanStack Query (v5)
- **Styling**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React + React Feather
- **Real-time**: Socket.io Client

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Ensure `.env.local` contains:
   - `NEXT_PUBLIC_API_URL`: Backend API endpoint.
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: For Google OAuth.

## Development

```bash
pnpm run dev
```

## Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```