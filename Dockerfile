# syntax = docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@4.10.3 --activate
WORKDIR /monorepo

FROM base AS deps
# Copiar archivos de configuración de Yarn
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copiar TODO el código de los packages primero (necesario para workspaces file:)
COPY packages ./packages
RUN ls -la packages/contracts/

# Copiar solo package.json de apps (para optimizar cache)
COPY apps/api/package.json ./apps/api/

# Ahora sí, instalar con lockfile inmutable
RUN yarn install --immutable

FROM base AS builder
WORKDIR /monorepo

# Copiar node_modules y .yarn desde deps
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/.yarn ./.yarn

# Copiar TODO el código fuente
COPY . .

# Generar Prisma client y buildear
RUN yarn workspace api prisma generate
RUN yarn workspace api build

FROM base AS runner
WORKDIR /monorepo
ENV NODE_ENV=production

# Copiar solo lo necesario para runtime
COPY --from=builder /monorepo/node_modules ./node_modules
COPY --from=builder /monorepo/apps/api/dist ./apps/api/dist
COPY --from=builder /monorepo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /monorepo/apps/api/package.json ./apps/api/
COPY --from=builder /monorepo/package.json ./

EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]

# Rebuild: 20251103-121500

