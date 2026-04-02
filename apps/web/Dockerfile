FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @workops/web --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@workops/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=installer /app ./

EXPOSE 3000

CMD ["pnpm", "turbo", "run", "start", "--filter=@workops/web"]