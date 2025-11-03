# ============================================
# DOCKERFILE ROBUSTO PARA API - MATEATLETAS
# ============================================
# Estrategia: Build en monorepo, deploy standalone
# Node 20.19.0 (requerido por Vite 7.x)
# ============================================

ARG NODE_VERSION=20.19.0

# ============================================
# STAGE 1: Builder - Compila en contexto monorepo
# ============================================
FROM node:${NODE_VERSION}-alpine AS builder

# Dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /monorepo

# Copiar configuración npm
COPY package.json package-lock.json .npmrc ./

# Copiar todos los package.json para workspaces
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/shared/package.json ./packages/shared/

# Instalar TODAS las dependencias del monorepo
RUN npm ci --legacy-peer-deps

# Copiar TODO el código fuente
COPY . .

# Build contracts
RUN npm run build --workspace=packages/contracts --if-present

# Generar Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN npm run build --workspace=apps/api

# ============================================
# STAGE 2: Runner - Standalone API sin monorepo
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner

# Dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

# Usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

ENV NODE_ENV=production

# Copiar SOLO lo necesario para ejecutar la API
# 1. Package.json de la API
COPY --from=builder --chown=nestjs:nodejs /monorepo/apps/api/package*.json ./

# 2. Prisma
COPY --from=builder --chown=nestjs:nodejs /monorepo/apps/api/prisma ./prisma/

# 3. Código compilado
COPY --from=builder --chown=nestjs:nodejs /monorepo/apps/api/dist ./dist/

# 4. Copiar node_modules completo del builder (ya tiene todo instalado correctamente)
COPY --from=builder --chown=nestjs:nodejs /monorepo/node_modules ./node_modules

# 5. Crear directorio logs con permisos correctos ANTES de cambiar a usuario nestjs
RUN mkdir -p logs && chown -R nestjs:nodejs logs

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
