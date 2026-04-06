FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @workops/web --docker

FROM base AS installer
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@workops/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy only what's needed
COPY --from=installer --chown=appuser:appgroup /app/apps/web/.next ./apps/web/.next
COPY --from=installer --chown=appuser:appgroup /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=appuser:appgroup /app/apps/web/package.json ./apps/web/package.json
COPY --from=installer --chown=appuser:appgroup /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=installer --chown=appuser:appgroup /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=installer --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=installer --chown=appuser:appgroup /app/package.json ./package.json

USER appuser
EXPOSE 3000

WORKDIR /app/apps/web
CMD ["pnpm", "start"]