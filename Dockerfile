# syntax = docker/dockerfile:1

# Etapa base
FROM node:20.19.0-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /monorepo

# Etapa de dependencias
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/api/package.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/shared/package.json ./packages/shared/
RUN yarn install --frozen-lockfile

# Etapa de build
FROM base AS builder
WORKDIR /monorepo
COPY --from=deps /monorepo/node_modules ./node_modules
COPY . .
RUN yarn workspace api prisma generate
RUN yarn workspace api build

# Etapa de producción
FROM base AS runner
WORKDIR /monorepo
ENV NODE_ENV=production
COPY --from=builder /monorepo/node_modules ./node_modules
COPY --from=builder /monorepo/apps/api/dist ./apps/api/dist
COPY --from=builder /monorepo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /monorepo/apps/api/package.json ./apps/api/
COPY --from=builder /monorepo/package.json ./
EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]
