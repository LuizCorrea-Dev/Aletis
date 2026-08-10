# Dockerfile para Aletis Monorepo (pnpm + Turbo + Next.js)
# Usa shamefully-hoist para garantir que o Docker resolva os módulos corretamente

# ─────────────────────────────────────────────
# Stage 1: Build completo
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar pnpm via npm
RUN npm install -g pnpm@10 --ignore-scripts

# Copiar manifestos e configurações primeiro (melhor uso de cache do Docker)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/

# Instalar todas as dependências (shamefully-hoist garante flat node_modules)
RUN pnpm install

# Copiar todo o código fonte
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build do Next.js
RUN pnpm --filter web build

# ─────────────────────────────────────────────
# Stage 2: Runner de produção (leve - standalone)
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar apenas os arquivos necessários do build standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
