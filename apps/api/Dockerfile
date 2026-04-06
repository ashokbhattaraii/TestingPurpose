FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS builder
COPY . .
RUN pnpm dlx turbo prune @workops/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@workops/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=installer --chown=appuser:appgroup /app ./

# Copy migration entrypoint
COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser
EXPOSE 4000

WORKDIR /app/apps/api
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]