# syntax = docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@4.10.3 --activate
WORKDIR /monorepo

FROM base AS deps
# Copiar archivos de configuración de Yarn
# Force rebuild: nmHoistingLimits workspaces
COPY package.json yarn.lock .yarnrc.yml ./
RUN cat .yarnrc.yml
COPY .yarn ./.yarn

# Copiar TODO el código de los packages primero (necesario para workspaces)
COPY packages ./packages

# Copiar TODOS los package.json de apps (Yarn necesita saber que existen TODOS los workspaces)
# Aunque solo buildeemos api, el lockfile fue generado con ambos workspaces presentes
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Ahora sí, instalar con lockfile inmutable (sin inconsistencias)
RUN yarn install --immutable

FROM base AS builder
WORKDIR /monorepo

# Copiar node_modules y .yarn desde deps
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /monorepo/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=deps /monorepo/.yarn ./.yarn

# Copiar TODO el código fuente
COPY . .

# Generar Prisma client y buildear
RUN yarn workspace api prisma generate

# Buildear packages compartidos ANTES de buildear apps
RUN yarn workspace @mateatletas/contracts build

# Ahora sí buildear la API
RUN yarn workspace api build

FROM base AS runner
WORKDIR /monorepo
ENV NODE_ENV=production

# Copiar deps de producción (sin Prisma client aún, se sobrescribirá)
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
# Skip postinstall en producción (prisma generate ya se ejecutó en builder)
RUN yarn workspaces focus api --production --ignore-scripts

# Copiar schema y Prisma Client GENERADO desde builder
COPY --from=builder /monorepo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /monorepo/apps/api/node_modules/@prisma/client ./apps/api/node_modules/@prisma/client
COPY --from=builder /monorepo/apps/api/node_modules/.prisma/client ./apps/api/node_modules/.prisma/client

# Copiar código compilado
COPY --from=builder /monorepo/apps/api/dist ./apps/api/dist
COPY --from=builder /monorepo/packages/contracts/dist ./packages/contracts/dist

EXPOSE 8080
CMD ["node", "apps/api/dist/src/main.js"]

# Rebuild: 20251103-145500

