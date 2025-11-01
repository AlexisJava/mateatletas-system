# 🚀 Deployment Guide - Mateatletas Monorepo

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Railway (Backend)](#railway-backend---appsapi)
- [Vercel (Frontend)](#vercel-frontend---appsweb)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)
- [Validación](#validación)

---

## 🏗️ Arquitectura

```
Mateatletas-Ecosystem/
├── apps/
│   ├── api/          # Backend NestJS → Railway (Docker)
│   └── web/          # Frontend Next.js → Vercel (Serverless)
├── packages/
│   ├── contracts/    # Schemas compartidos (Zod)
│   └── shared/       # Utilidades compartidas
├── Dockerfile        # Multi-stage para Railway
├── .dockerignore     # Optimización Docker
├── package.json      # Root con workspaces
└── package-lock.json # DEBE estar sincronizado
```

**Stack Tecnológico:**
- Node.js: ≥20.19.0 (requerido por Vite 7.x)
- npm: ≥10.0.0
- Framework Backend: NestJS + Prisma
- Framework Frontend: Next.js 15.5.4
- Database: PostgreSQL (Railway)

---

## 🛤️ Railway (Backend - apps/api)

### Requisitos de Versión

⚠️ **CRÍTICO**: Railway con Nixpacks NO soporta Node.js 20.19.0.
**Solución**: Usar Dockerfile (incluido en este repo).

### Paso 1: Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Conecta tu repositorio

### Paso 2: Agregar PostgreSQL

1. En tu proyecto, click "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway configurará automáticamente `DATABASE_URL`

### Paso 3: Configurar Builder

⚠️ **MUY IMPORTANTE**:

1. Ve a tu servicio → "Settings"
2. En "Builder", cambia de "Nixpacks" a **"Dockerfile"**
3. Click "Save"

### Paso 4: Configurar Build Args

En "Settings" → "Build" → "Builder Arguments":

```
APP_NAME=api
```

### Paso 5: Variables de Entorno

En "Variables" tab, agrega:

```bash
# Entorno
NODE_ENV=production

# Base de Datos (automático con PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (CRÍTICO: generar uno seguro)
JWT_SECRET=<GENERAR_CON_COMANDO_ABAJO>
JWT_EXPIRATION=1h

# URLs
FRONTEND_URL=https://tu-dominio-frontend.vercel.app
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
PORT=3001

# MercadoPago (Producción)
MERCADOPAGO_ACCESS_TOKEN=APP-xxxx
MERCADOPAGO_PUBLIC_KEY=APP-xxxx

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
```

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 6: Deploy

1. Push a tu rama main en GitHub
2. Railway detectará el cambio y deployará automáticamente
3. El Dockerfile ejecutará:
   - Stage 1: Instalar dependencias
   - Stage 2: Build de contracts + API + Prisma
   - Stage 3: Runtime optimizado

### Verificación

Una vez deployado, verifica:

```bash
curl https://tu-dominio.up.railway.app/api/health
```

Debería retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T..."
}
```

---

## ▲ Vercel (Frontend - apps/web)

### Requisitos

- Vercel soporta Node 20.x nativamente
- NO usar Dockerfile en Vercel
- Vercel lee `engines` de package.json

### Paso 1: Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import tu repositorio de GitHub

### Paso 2: Configurar Proyecto

**Framework Preset**: Next.js

**Root Directory**:
```
apps/web
```

**Build Command**:
```bash
npm run build
```

**Output Directory**:
```
.next
```

**Install Command**:
```bash
npm install --legacy-peer-deps --workspace=apps/web --include-workspace-root
```

### Paso 3: Variables de Entorno

En "Settings" → "Environment Variables":

```bash
# CRÍTICO: URL del backend en Railway
NEXT_PUBLIC_API_URL=https://tu-dominio-railway.up.railway.app/api

# Opcional
NEXT_PUBLIC_BACKEND_URL=https://tu-dominio-railway.up.railway.app
```

### Paso 4: Configuración Avanzada

En "Settings" → "General":

**Node.js Version**:
- Automático (lee de package.json engines)
- O especificar: `20.x`

**Build & Development Settings**:
- Framework: Next.js
- Output Directory: `.next`

### Paso 5: Deploy

1. Vercel deployará automáticamente en cada push a main
2. Pull Requests generan preview deployments

### Verificación

Visita tu URL de Vercel y verifica que:
- ✅ La aplicación carga
- ✅ Puede conectarse al backend (check DevTools Network)

---

## 💻 Local Development

### Requisitos

```bash
node --version   # Debe ser ≥ 20.19.0
npm --version    # Debe ser ≥ 10.0.0
```

### Instalación

```bash
# Clonar repo
git clone <tu-repo>
cd Mateatletas-Ecosystem

# Instalar dependencias
npm install --legacy-peer-deps

# Verificar instalación
npm ci  # Debe completar sin errores
```

### Iniciar Desarrollo

```bash
# Opción 1: Ambas apps en paralelo
npm run dev

# Opción 2: Solo frontend
npm run dev:web

# Opción 3: Solo backend
npm run dev:api
```

**Puertos:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

### Build Local

```bash
# Test build completo
npm run build

# Build solo frontend
npm run build:web

# Build solo backend
npm run build:api
```

---

## 🐳 Docker Local (Simular Railway)

### Build

```bash
# Backend (API)
npm run docker:build:api

# Frontend (Web)
npm run docker:build:web
```

### Run

```bash
# Backend
npm run docker:run:api

# Frontend
npm run docker:run:web
```

### Verificación de Versión

```bash
# Verificar que usa Node 20.19.0
docker run mateatletas-api node -v
# Output: v20.19.0
```

---

## 🔧 Troubleshooting

### Error: npm ci fails - package.json and package-lock.json out of sync

**Causa**: package-lock.json desincronizado

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
git push
```

### Error: EBADENGINE - Vite requires Node >=20.19.0

**Causa**: Versión de Node incorrecta

**Solución Railway**:
- ✅ Usar Dockerfile (ya incluido)
- ✅ Cambiar Builder a "Dockerfile" en Settings

**Solución Vercel**:
- ✅ Verificar package.json engines: `"node": ">=20.19.0"`
- ✅ Vercel usará Node 20.x automáticamente

**Solución Local**:
```bash
# Usar nvm
nvm install 20.19.0
nvm use 20.19.0
```

### Error: Railway build fails - missing dependencies

**Causa**: Dockerfile no copia correctamente

**Solución**:
1. Verificar que `.dockerignore` no excluye package.json
2. Verificar que `Dockerfile` copia todos los package.json de workspaces
3. Push de nuevo

### Error: Vercel build timeout

**Causa**: Build demasiado pesado

**Solución**:
1. Verificar que Install Command use `--workspace=apps/web`
2. Aumentar timeout en Settings (Pro plan)
3. Optimizar dependencias

### Error: CORS en producción

**Causa**: `FRONTEND_URL` mal configurada en Railway

**Solución**:
1. Verificar que `FRONTEND_URL` en Railway sea EXACTAMENTE la URL de Vercel
2. Sin trailing slash: ✅ `https://app.vercel.app`, ❌ `https://app.vercel.app/`
3. Re-deploy Railway después de cambiar

### Error: Prisma migrations fail

**Causa**: DATABASE_URL no configurada

**Solución**:
1. Verificar que PostgreSQL service esté corriendo
2. Verificar variable `DATABASE_URL` esté configurada
3. En Railway logs, buscar errores de conexión a DB

---

## ✅ Validación

### Checklist Pre-Deploy

```bash
# 1. Verificar versión de Node
node --version  # ≥20.19.0

# 2. Verificar sincronización
npm ci  # Debe completar sin errores

# 3. Verificar build local
npm run build  # Debe completar exitosamente

# 4. Verificar Docker build (opcional)
npm run docker:build:api  # Debe completar sin errores

# 5. Verificar engines en package.json
cat package.json | grep -A 2 '"engines"'
# Debe mostrar: "node": ">=20.19.0"
```

### Checklist Post-Deploy

**Railway:**
- [ ] Builder configurado como "Dockerfile"
- [ ] Build args incluyen `APP_NAME=api`
- [ ] Todas las variables de entorno configuradas
- [ ] PostgreSQL service corriendo
- [ ] Health check responde: `/api/health`
- [ ] Logs no muestran errores

**Vercel:**
- [ ] Root Directory: `apps/web`
- [ ] Install Command correcto
- [ ] Variables de entorno configuradas
- [ ] `NEXT_PUBLIC_API_URL` apunta a Railway
- [ ] Build exitoso
- [ ] Preview deployment funciona

---

## 📊 Métricas de Performance

**Docker Image Size:**
- Backend (API): ~150-200 MB
- Frontend (Web): ~180-220 MB

**Build Times (aprox):**
- Railway (API): 4-6 minutos
- Vercel (Web): 2-4 minutos
- Local build: 1-2 minutos

---

## 🔗 Enlaces Útiles

- [Railway Dashboard](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Docs - Dockerfile](https://docs.railway.app/deploy/dockerfiles)
- [Vercel Docs - Monorepos](https://vercel.com/docs/monorepos)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)

---

## 📞 Soporte

**Problemas con:**
- Railway: [Railway Help](https://help.railway.app)
- Vercel: [Vercel Support](https://vercel.com/support)
- Docker: [Docker Docs](https://docs.docker.com)

---

**Última actualización**: 2025-11-01
**Versión de Node requerida**: ≥20.19.0
**Compatibilidad**: Railway (Dockerfile) + Vercel (Serverless)
