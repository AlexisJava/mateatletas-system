# syntax = docker/dockerfile:1
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@4.10.3 --activate
WORKDIR /monorepo

FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/api/package.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/shared/package.json ./packages/shared/
RUN yarn install --immutable

FROM base AS builder
WORKDIR /monorepo
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/.yarn ./.yarn
COPY . .
RUN yarn workspace api prisma generate
RUN yarn workspace api build

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
