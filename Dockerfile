# ── Stage 1: Base ────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ── Stage 2: Dependencies ────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 3: Prisma Generate ────────────────────────────────
FROM base AS prisma
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm exec prisma generate

# ── Stage 4: Build ───────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/src/generated ./src/generated
COPY . .

# Variável dummy para evitar erro de conexão do Prisma durante o build (prerender)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# O Next.js coleta variáveis NEXT_PUBLIC_* em build time.
# Para que o Dokploy injete elas corretamente, declaramos ARGs
# que podem ser passadas via --build-arg no deploy.
ARG NEXT_PUBLIC_NAME_CORPORATION
ARG NEXT_PUBLIC_LOGO_CORPORATION

ENV NEXT_PUBLIC_NAME_CORPORATION=$NEXT_PUBLIC_NAME_CORPORATION
ENV NEXT_PUBLIC_LOGO_CORPORATION=$NEXT_PUBLIC_LOGO_CORPORATION

RUN pnpm build

# ── Stage 5: Production ─────────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefatos do standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma (schema + migrations) para rodar migrate no entrypoint
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./

# Copiar o client gerado do Prisma para o runtime
COPY --from=prisma /app/src/generated ./src/generated
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prisma /app/node_modules/prisma ./node_modules/prisma

# Entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
