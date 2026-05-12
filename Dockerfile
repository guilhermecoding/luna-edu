# ---------- BASE ----------
    FROM node:22-alpine AS base

    WORKDIR /app
    
    RUN npm install -g pnpm@9.15.9 prisma
    
    
    # ---------- DEPS ----------
    FROM base AS deps
    
    # Copia TUDO primeiro
    COPY . .
    
    # Instala dependências
    RUN pnpm install --frozen-lockfile --unsafe-perm
    
    
    # ---------- PRISMA ----------
    FROM deps AS prisma
    
    RUN npx prisma generate
    
    
    # ---------- BUILDER ----------
    FROM prisma AS builder
    
    # Build args
    ARG NEXT_PUBLIC_NAME_CORPORATION
    ARG NEXT_PUBLIC_LOGO_CORPORATION
    ARG BETTER_AUTH_TRUSTED_ORIGINS
    ARG BETTER_AUTH_SECRET
    ARG BETTER_AUTH_URL
    ARG DATABASE_URL
    ARG NEXT_PUBLIC_BUILD_MODE
    
    # Build envs
    ENV NEXT_PUBLIC_NAME_CORPORATION=$NEXT_PUBLIC_NAME_CORPORATION
    ENV NEXT_PUBLIC_LOGO_CORPORATION=$NEXT_PUBLIC_LOGO_CORPORATION
    ENV BETTER_AUTH_TRUSTED_ORIGINS=$BETTER_AUTH_TRUSTED_ORIGINS
    ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
    ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
    ENV DATABASE_URL=$DATABASE_URL
    ENV NEXT_PUBLIC_BUILD_MODE=$NEXT_PUBLIC_BUILD_MODE
    
    # Next standalone
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN pnpm build:local
    
    
    # ---------- RUNNER ----------
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # Prisma CLI no runtime
    RUN npm install -g prisma@7.7.0
    
    # Usuário
    RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
    
    # Standalone (ownership no copy — evita chown -R lento em node_modules)
    COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
    COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static
    COPY --chown=nextjs:nodejs --from=builder /app/public ./public
    
    # Prisma
    COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma
    COPY --chown=nextjs:nodejs --from=builder /app/prisma.config.ts ./prisma.config.ts
    
    # Prisma generated
    COPY --chown=nextjs:nodejs --from=builder /app/src/generated ./src/generated
    
    # package.json
    COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
    
    # node_modules necessários
    COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
    
    # Entrypoint
    COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
    
    RUN chmod +x docker-entrypoint.sh
    
    USER nextjs
    
    EXPOSE 3000
    
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    ENTRYPOINT ["sh", "./docker-entrypoint.sh"]