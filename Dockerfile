# ---------- BASE ----------
    FROM node:22-alpine AS base

    WORKDIR /app
    
    RUN npm install -g pnpm prisma
    
    # ---------- DEPS ----------
    FROM base AS deps
    
    COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
    
    # Prisma precisa existir antes do pnpm install
    # pois o postinstall executa prisma generate
    COPY prisma ./prisma
    COPY prisma.config.ts ./
    
    RUN pnpm install --frozen-lockfile
    
    # ---------- PRISMA ----------
    FROM base AS prisma
    
    COPY --from=deps /app/node_modules ./node_modules
    
    COPY . .
    
    RUN npx prisma generate
    
    # ---------- BUILDER ----------
    FROM base AS builder
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY --from=prisma /app/src/generated ./src/generated
    
    COPY . .
    
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
    
    RUN pnpm build:local
    
    # ---------- RUNNER ----------
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV HOSTNAME=0.0.0.0
    ENV PORT=3000
    
    # Prisma no runtime
    RUN npm install -g prisma && \
        npm install @prisma/client
    
    # Standalone do Next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    
    # Prisma
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
    
    # Prisma generated
    COPY --from=prisma /app/src/generated ./src/generated
    
    # Entrypoint
    COPY docker-entrypoint.sh ./
    
    RUN chmod +x docker-entrypoint.sh
    
    EXPOSE 3000
    
    ENTRYPOINT ["./docker-entrypoint.sh"]