# 🚀 Checklist de Deploy Frontend-Backend: Mateatletas System

**Autor:** Generado por Claude Code
**Fecha:** 2025-11-02
**Propósito:** Guía completa para evitar problemas de conectividad entre Next.js (Vercel) y NestJS (Railway)

---

## 📋 Índice

1. [Backend (Railway)](#backend-railway)
2. [Frontend (Vercel)](#frontend-vercel)
3. [Verificación Final](#verificación-final)
4. [Problemas Comunes](#problemas-comunes)
5. [Troubleshooting](#troubleshooting)

---

## Backend (Railway)

### 1️⃣ Variables de Entorno

Verifica que TODAS estas variables estén configuradas en Railway:

#### Variables Críticas

```bash
# Ver todas las variables
railway variables --json
```

- [ ] **FRONTEND_URL** (⚠️ MUY IMPORTANTE)
  ```
  Valor correcto: https://www.dominio.com,https://dominio-preview.vercel.app
  ```
  - ✅ Debe incluir TODOS los dominios (custom domain + preview URLs)
  - ✅ Separados por coma (sin espacios)
  - ✅ **Incluir https://** (no olvidar el protocolo)
  - ❌ NO usar `*` en producción (inseguro)
  - ❌ NO truncar URLs (verificar con `railway variables --json`)

- [ ] **DATABASE_URL**
  ```
  postgresql://usuario:password@host:5432/dbname
  ```

- [ ] **JWT_SECRET**
  - ✅ Debe ser diferente del environment de desarrollo
  - ✅ Mínimo 32 caracteres
  - ✅ Generado aleatoriamente (no usar valores predecibles)

- [ ] **NODE_ENV**
  ```
  production
  ```

- [ ] **MERCADOPAGO_ACCESS_TOKEN**
  - ✅ Usar token de producción (no TEST-)
  - ✅ Verificar permisos del token

#### Variables Opcionales pero Recomendadas

- [ ] **PORT** (Railway lo asigna automáticamente si no está configurado)
- [ ] **JWT_EXPIRES_IN** (default: `7d`)
- [ ] **LOG_LEVEL** (default: `info`, opciones: `error`, `warn`, `info`, `debug`)

#### Comando para configurar variables

```bash
railway variables --set "FRONTEND_URL=https://www.mateatletasclub.com.ar,https://preview-xxx.vercel.app"
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_SECRET=tu-secret-seguro-de-al-menos-32-caracteres"
```

---

### 2️⃣ Configuración de CORS en main.ts

Ubicación: `apps/api/src/main.ts` (líneas 65-104)

#### Verificar implementación:

```typescript
// ✅ CORRECTO - Implementación actual
const isProduction = process.env.NODE_ENV === 'production';

const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : [];

const allowedOrigins = isProduction
  ? frontendUrls.length > 0
    ? frontendUrls
    : ['*'] // Fallback temporal (⚠️ cambiar después)
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      ...frontendUrls,
    ].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permitir requests sin origin

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  credentials: true, // ⚠️ CRÍTICO para httpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

#### Checklist de CORS:

- [ ] Lee `FRONTEND_URL` correctamente
- [ ] Soporta múltiples URLs (split por coma)
- [ ] Tiene fallback en desarrollo (localhost:3000, localhost:3001)
- [ ] Loguea cuando bloquea requests (`logger.warn`)
- [ ] `credentials: true` está habilitado
- [ ] `allowedHeaders` incluye `Content-Type` y `Authorization`

---

### 3️⃣ Endpoints Públicos (sin autenticación)

Los siguientes endpoints **NO deben requerir autenticación**:

#### Health Check

- [ ] `GET /api` - Root endpoint (responde "Hello World")
- [ ] `GET /api/health` - Health check endpoint
- [ ] `GET /api/health/ready` - Readiness probe
- [ ] `GET /api/health/live` - Liveness probe

#### Autenticación

- [ ] `POST /api/auth/register` - Registro de tutores
- [ ] `POST /api/auth/login` - Login de tutores
- [ ] `POST /api/auth/estudiante/login` - Login de estudiantes

#### Swagger

- [ ] `GET /api/docs` - Documentación Swagger

#### Verificar que NO tengan guards:

```bash
# Buscar decoradores @UseGuards en endpoints públicos
grep -n "@UseGuards" apps/api/src/auth/auth.controller.ts
```

❌ Si los endpoints de login tienen `@UseGuards(JwtAuthGuard)`, REMOVER el guard.

---

### 4️⃣ Deployment en Railway

#### Comandos

```bash
# Push a GitHub (Railway auto-deploya desde GitHub)
git add .
git commit -m "feat: configurar CORS y variables de entorno"
git push origin main

# O deploy manual
railway up --detach

# Ver logs en tiempo real
railway logs --deployment

# Ver estado del servicio
railway status
```

#### Verificar deployment exitoso:

```bash
# Esperar a ver este mensaje en los logs:
# "[NestApplication] Nest application successfully started"

# Verificar que el servicio responde
curl https://tu-backend.railway.app/api
# Debería responder: "Hello World!"
```

---

## Frontend (Vercel)

### 1️⃣ Variables de Entorno en Vercel

#### Acceder a configuración:

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto
3. Settings → Environment Variables

#### Variables requeridas:

- [ ] **NEXT_PUBLIC_API_URL**
  ```
  https://mateatletas-system-production.up.railway.app/api
  ```
  - ✅ Debe apuntar a Railway (NO a localhost)
  - ✅ Incluir `/api` al final
  - ✅ Usar `https://` (no `http://`)
  - ✅ Marcar en **"Production"** environment
  - ✅ También agregar en "Preview" y "Development" si es necesario

- [ ] **NEXT_PUBLIC_RPM_SUBDOMAIN** (Ready Player Me)
  ```
  demo
  ```

- [ ] **NEXT_PUBLIC_RPM_APP_ID** (Ready Player Me)
  ```
  6901874930e533f99f442a89
  ```

#### ⚠️ IMPORTANTE: Redeploy después de configurar variables

```bash
# Desde la terminal local
cd apps/web
vercel --prod

# O desde Vercel dashboard:
# Deployments → ... (tres puntos) → Redeploy
```

---

### 2️⃣ Custom Domain en Vercel

#### Configurar dominio:

1. Vercel Dashboard → Settings → Domains
2. Agregar dominio: `www.mateatletasclub.com.ar`
3. Copiar DNS records que Vercel proporciona

#### Verificar DNS:

```bash
# Verificar que el dominio resuelve a Vercel
dig www.mateatletasclub.com.ar

# Debería mostrar CNAME a cname.vercel-dns.com
```

#### Checklist de dominio:

- [ ] Dominio agregado en Vercel
- [ ] DNS configurado correctamente
- [ ] SSL activo (https)
- [ ] Certificado SSL válido (no self-signed)
- [ ] Ambas versiones funcionan:
  - [ ] `https://www.mateatletasclub.com.ar`
  - [ ] `https://mateatletasclub.com.ar` (sin www)

---

### 3️⃣ Configuración de API Client

Ubicación: `apps/web/src/lib/axios.ts`

#### Verificar implementación correcta:

```typescript
// ✅ CORRECTO
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⚠️ CRÍTICO para httpOnly cookies
});
```

#### Checklist de axios:

- [ ] `baseURL` usa `process.env.NEXT_PUBLIC_API_URL`
- [ ] Tiene fallback a `localhost:3001/api` en desarrollo
- [ ] `withCredentials: true` está habilitado
- [ ] `timeout` configurado (10 segundos recomendado)

---

### 4️⃣ Uso Consistente de apiClient

⚠️ **PROBLEMA COMÚN:** Usar `fetch` nativo en lugar de `apiClient`

#### Buscar usos incorrectos:

```bash
# Buscar fetch() nativo en el código
grep -r "fetch(" apps/web/src --include="*.ts" --include="*.tsx"

# Buscar axios sin import
grep -r "axios\." apps/web/src --include="*.ts" --include="*.tsx"
```

#### ❌ INCORRECTO (encontrado en `cursos.store.ts:63`):

```typescript
// ❌ Usa ruta relativa, va a Vercel en lugar de Railway
const response = await fetch('/api/productos?tipo=Curso&soloActivos=true');
```

#### ✅ CORRECTO:

```typescript
// ✅ Usa apiClient, va a Railway correctamente
import { apiClient } from '@/lib/axios';

const data = await apiClient.get<Producto[]>('/productos', {
  params: { tipo: 'Curso', soloActivos: true }
});
```

---

## Verificación Final

### 1️⃣ Test de Conectividad Backend

```bash
# Test 1: Health check
curl https://tu-backend.railway.app/api
# Esperado: "Hello World!" (200 OK)

# Test 2: Health endpoint
curl https://tu-backend.railway.app/api/health
# Esperado: {"status":"ok","timestamp":"..."} (200 OK)

# Test 3: Endpoint protegido (debe retornar 401)
curl https://tu-backend.railway.app/api/auth/profile
# Esperado: 401 Unauthorized
```

### 2️⃣ Test de CORS

```bash
# Test preflight OPTIONS request
curl -X OPTIONS \
  -H "Origin: https://www.mateatletasclub.com.ar" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://tu-backend.railway.app/api/auth/login \
  -v

# Verificar en la respuesta:
# ✅ Access-Control-Allow-Origin: https://www.mateatletasclub.com.ar
# ✅ Access-Control-Allow-Credentials: true
# ✅ Access-Control-Allow-Methods: POST
```

### 3️⃣ Test de Login desde Frontend

1. Abrir https://www.mateatletasclub.com.ar
2. Abrir DevTools (F12) → Network tab
3. Intentar login
4. Verificar request de login:

#### ✅ Request correcto:

```
Request URL: https://tu-backend.railway.app/api/auth/estudiante/login
Status: 200 OK (o 401 si credenciales inválidas)
Headers:
  - Origin: https://www.mateatletasclub.com.ar
  - Content-Type: application/json
Response Headers:
  - Access-Control-Allow-Origin: https://www.mateatletasclub.com.ar
  - Access-Control-Allow-Credentials: true
  - Set-Cookie: auth-token=...; HttpOnly; Secure
```

#### ❌ Request incorrecto:

```
# Problema 1: Va a sí mismo (Vercel)
Request URL: https://www.mateatletasclub.com.ar/api/auth/estudiante/login
Status: 404 Not Found
Causa: Frontend no usa NEXT_PUBLIC_API_URL

# Problema 2: Error CORS
Request URL: https://tu-backend.railway.app/api/auth/estudiante/login
Status: (failed) CORS error
Causa: Falta dominio en FRONTEND_URL del backend

# Problema 3: Error 405 Method Not Allowed
Request URL: https://tu-backend.railway.app/api/auth/estudiante/login
Status: 405
Causa: Guards bloqueando endpoint público

# Problema 4: Mixed Content
Status: blocked:mixed-content
Causa: Frontend usa https pero backend http
```

---

## Problemas Comunes

### 🔴 Error 1: CORS Bloqueado

**Síntoma:**
```
Access to XMLHttpRequest at 'https://backend.railway.app/api/auth/login'
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Causas posibles:**

1. **FRONTEND_URL no incluye el dominio del frontend**
   ```bash
   # Verificar
   railway variables --json | grep FRONTEND_URL

   # Fix
   railway variables --set "FRONTEND_URL=https://www.mateatletasclub.com.ar,https://preview.vercel.app"
   railway up --detach
   ```

2. **FRONTEND_URL está truncada**
   ```bash
   # Verificar en JSON (no en tabla que trunca)
   railway variables --json | jq '.FRONTEND_URL'
   ```

3. **Falta el protocolo https://**
   ```bash
   # ❌ INCORRECTO
   FRONTEND_URL=www.mateatletasclub.com.ar

   # ✅ CORRECTO
   FRONTEND_URL=https://www.mateatletasclub.com.ar
   ```

---

### 🔴 Error 2: Request va a Vercel en lugar de Railway (405)

**Síntoma:**
```
POST https://www.mateatletasclub.com.ar/api/auth/login 405 (Method Not Allowed)
```

**Causas:**

1. **NEXT_PUBLIC_API_URL no configurada en Vercel**
   - Ir a Vercel → Settings → Environment Variables
   - Agregar `NEXT_PUBLIC_API_URL` con valor de Railway
   - Redeploy

2. **Código usa fetch() relativo en lugar de apiClient**
   ```typescript
   // ❌ INCORRECTO
   fetch('/api/auth/login', {...})

   // ✅ CORRECTO
   apiClient.post('/auth/login', {...})
   ```

3. **Variable no se refresca en build**
   ```bash
   # En Vercel dashboard:
   # Deployments → Redeploy (checkbox "Use existing build cache" DESACTIVADO)
   ```

---

### 🔴 Error 3: Error 401 en endpoints públicos

**Síntoma:**
```
POST /api/auth/login 401 Unauthorized
```

**Causas:**

1. **Guards globales bloqueando endpoints públicos**
   - Verificar que login/register NO tengan `@UseGuards(JwtAuthGuard)`
   - Si hay guards globales, usar `@Public()` decorator

2. **CSRF protection bloqueando requests**
   ```typescript
   // Verificar en logs de Railway:
   // "CSRF: Request sin Origin/Referer"

   // Fix: Agregar Origin header en requests
   ```

---

### 🔴 Error 4: Error 400 en login de estudiante

**Síntoma:**
```
POST /api/auth/estudiante/login 400 Bad Request
```

**Causas:**

1. **Campos faltantes o inválidos en request**
   ```json
   // LoginEstudianteDto requiere:
   {
     "username": "string (min 3 chars)",
     "password": "string (min 8 chars)"
   }
   ```

2. **Propiedades extra (forbidNonWhitelisted)**
   ```json
   // ❌ INCORRECTO
   {
     "username": "juan123",
     "password": "password123",
     "rememberMe": true  // ← No permitido en DTO
   }
   ```

3. **Validación de tipos fallida**
   - Ver logs en Railway para detalles exactos del error
   - Buscar: `[VALIDATION ERROR]`

---

### 🔴 Error 5: Mixed Content (HTTPS → HTTP)

**Síntoma:**
```
Mixed Content: The page at 'https://frontend.vercel.app' was loaded over HTTPS,
but requested an insecure resource 'http://backend.railway.app/api'
```

**Fix:**
```bash
# Cambiar NEXT_PUBLIC_API_URL de http:// a https://
# En Vercel → Environment Variables
NEXT_PUBLIC_API_URL=https://backend.railway.app/api
```

---

## Troubleshooting

### Ver logs de Railway en tiempo real

```bash
# Logs completos
railway logs --deployment

# Filtrar por tipo
railway logs --deployment | grep "ERROR"
railway logs --deployment | grep "WARN"
railway logs --deployment | grep "CORS"

# Ver últimas 50 líneas
railway logs --deployment | tail -50
```

### Ver variables de entorno actuales

```bash
# Railway
railway variables --json

# Vercel (requiere vercel link primero)
cd apps/web
vercel link
vercel env ls
```

### Verificar que el backend esté corriendo

```bash
# Health check simple
curl https://tu-backend.railway.app/api

# Con detalles de headers
curl -v https://tu-backend.railway.app/api

# Test CORS completo
curl -v -X OPTIONS \
  -H "Origin: https://www.mateatletasclub.com.ar" \
  -H "Access-Control-Request-Method: POST" \
  https://tu-backend.railway.app/api/auth/login
```

### Verificar DNS de frontend

```bash
# Ver registros DNS
dig www.mateatletasclub.com.ar

# Ver certificado SSL
curl -vI https://www.mateatletasclub.com.ar 2>&1 | grep "subject:"
```

---

## 📝 Resumen de Comandos Útiles

```bash
# ========================================
# RAILWAY
# ========================================

# Ver variables
railway variables --json

# Configurar variable
railway variables --set "KEY=value"

# Deploy manual
railway up --detach

# Ver logs
railway logs --deployment

# Ver estado
railway status

# ========================================
# VERCEL
# ========================================

# Link proyecto local a Vercel
vercel link

# Ver variables
vercel env ls

# Agregar variable
vercel env add NEXT_PUBLIC_API_URL production

# Deploy manual
vercel --prod

# ========================================
# TESTING
# ========================================

# Test backend health
curl https://backend.railway.app/api

# Test CORS
curl -X OPTIONS \
  -H "Origin: https://frontend.vercel.app" \
  https://backend.railway.app/api/auth/login -v

# Ver DNS
dig www.dominio.com

# ========================================
# BÚSQUEDA DE PROBLEMAS EN CÓDIGO
# ========================================

# Buscar fetch() relativo
grep -r "fetch(" apps/web/src --include="*.ts"

# Buscar URLs hardcodeadas
grep -r "http://" apps/web/src --include="*.ts"

# Verificar guards en endpoints públicos
grep -n "@UseGuards" apps/api/src/auth/auth.controller.ts
```

---

## ✅ Checklist Final Pre-Deploy

### Backend (Railway)

- [ ] Todas las variables de entorno configuradas
- [ ] FRONTEND_URL incluye TODOS los dominios (custom + preview)
- [ ] CORS configurado correctamente en main.ts
- [ ] Endpoints públicos NO tienen guards
- [ ] Backend responde en /api/health
- [ ] Logs no muestran errores CORS

### Frontend (Vercel)

- [ ] NEXT_PUBLIC_API_URL configurada en Vercel
- [ ] Custom domain configurado y SSL activo
- [ ] axios.ts usa correctamente NEXT_PUBLIC_API_URL
- [ ] TODO el código usa apiClient (no fetch relativo)
- [ ] Redeploy después de configurar variables

### Testing

- [ ] curl /api responde "Hello World!"
- [ ] CORS test retorna headers correctos
- [ ] Login desde frontend funciona
- [ ] No hay errores en DevTools → Network
- [ ] No hay mixed content warnings

---

**🎉 Si todos los checks están ✅, el deploy debería funcionar perfectamente!**

---

*Generado por Claude Code - 2025-11-02*
