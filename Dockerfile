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
COPY --from=deps /monorepo/.yarn ./.yarn

# Prisma expects its CLI and generated client to live inside the api workspace
# node_modules directory. The Yarn hoisting setup keeps the actual packages in
# the monorepo root, so we create workspace-level symlinks that point back to
# those hoisted copies before running any Prisma commands.
RUN mkdir -p apps/api/node_modules \
    && ln -sfn ../../node_modules/prisma apps/api/node_modules/prisma \
    && ln -sfn ../../node_modules/@prisma apps/api/node_modules/@prisma

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
RUN mkdir -p apps/api/node_modules \
    && ln -sfn ../../node_modules/prisma apps/api/node_modules/prisma \
    && ln -sfn ../../node_modules/@prisma apps/api/node_modules/@prisma

COPY --from=builder /monorepo/apps/api/dist ./apps/api/dist
COPY --from=builder /monorepo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /monorepo/apps/api/package.json ./apps/api/
COPY --from=builder /monorepo/package.json ./

EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]

# Rebuild: 20251103-145500

