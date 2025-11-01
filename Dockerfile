# ============================================
# DOCKERFILE MULTI-STAGE PARA MONOREPO
# Mateatletas - Enterprise Grade
# ============================================
# Soporta: Node 20.19.0 (requerido por Vite 7.x)
# Optimizado para: Railway deployment
# Apps disponibles: web (Next.js), api (NestJS)

ARG NODE_VERSION=20.19.0
ARG APP_NAME=api

# ============================================
# STAGE 1: Dependencies
# Instala TODAS las dependencias (prod + dev)
# ============================================
FROM node:${NODE_VERSION}-alpine AS deps

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de configuración de npm
COPY package.json package-lock.json ./
COPY .npmrc ./

# Copiar package.json de todos los workspaces
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias usando npm ci (reproducible)
# Incluye devDependencies necesarias para el build
RUN npm ci --legacy-peer-deps

# ============================================
# STAGE 2: Builder
# Compila la aplicación específica
# ============================================
FROM node:${NODE_VERSION}-alpine AS builder

ARG APP_NAME

WORKDIR /app

# Copiar node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# Copiar código fuente completo
COPY . .

# Build packages compartidos primero
RUN npm run build --workspace=packages/contracts --if-present

# Generar Prisma client si es API
RUN if [ "$APP_NAME" = "api" ]; then \
        cd apps/api && npx prisma generate; \
    fi

# Build de la app específica
RUN npm run build --workspace=apps/${APP_NAME}

# Limpiar devDependencies para reducir tamaño
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# ============================================
# STAGE 3: Runner (Imagen final optimizada)
# Solo contiene lo necesario para ejecutar
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner

ARG APP_NAME
ENV NODE_ENV=production
ENV APP_NAME=${APP_NAME}

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copiar node_modules de producción
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/packages ./packages

# Copiar archivos específicos según la app
COPY --from=builder --chown=appuser:nodejs /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/

# Si es API (NestJS)
RUN if [ "$APP_NAME" = "api" ]; then \
        mkdir -p ./apps/api/dist ./apps/api/prisma; \
    fi

# Copiar archivos compilados según la app
# Para API: dist y prisma
# Para Web: .next y public
COPY --from=builder --chown=appuser:nodejs /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist/
COPY --from=builder --chown=appuser:nodejs /app/apps/${APP_NAME}/prisma ./apps/${APP_NAME}/prisma/

# Copiar archivos de configuración necesarios
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

USER appuser

# Exponer puertos
# API: 3001, Web: 3000
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${APP_NAME === 'api' ? '3001' : '3000'}/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command dinámico según la app
CMD if [ "$APP_NAME" = "api" ]; then \
        cd apps/api && npx prisma migrate deploy && npm run start:prod; \
    else \
        cd apps/web && npm run start; \
    fi
