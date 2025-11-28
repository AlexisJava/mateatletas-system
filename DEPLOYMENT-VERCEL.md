# 🚀 Guía de Deployment - Vercel (Frontend)

## ✅ Estado Actual: PRODUCTION READY

- **Framework:** Next.js 15.5.4 con React 19
- **Build System:** Yarn 4.10.3 (Workspaces)
- **Build Status:** ✅ Compila exitosamente
- **Configuración:** ✅ [vercel.json](vercel.json) optimizado para monorepo
- **Variables de Entorno:** ✅ Documentadas y configuradas

---

## 📋 Pre-requisitos

1. **Backend desplegado en Railway** - El frontend necesita la URL del backend
2. **Cuenta de Vercel** con CLI instalado
3. **Variables de entorno** configuradas

---

## 🔧 Configuración de Vercel

### 1. Archivo vercel.json

El proyecto ya tiene [vercel.json](vercel.json) configurado correctamente:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "yarn workspace @mateatletas/contracts build && yarn workspace web build",
  "installCommand": "corepack enable && corepack prepare yarn@4.10.3 --activate && yarn set version 4.10.3 && yarn install",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1",
      "NODE_OPTIONS": "--max-old-space-size=4096",
      "YARN_ENABLE_IMMUTABLE_INSTALLS": "false"
    }
  }
}
```

**Características clave:**

- ✅ Fuerza uso de Yarn 4.10.3
- ✅ Buildea contracts antes de web (respeta dependencias)
- ✅ 4GB de memoria para builds grandes
- ✅ Desactiva installs inmutables (Vercel necesita flexibilidad)

### 2. Variables de Entorno Requeridas

Debes configurar estas variables en el dashboard de Vercel:

#### Variables Públicas (Expuestas al cliente)

```bash
# URL de la API (Railway)
NEXT_PUBLIC_API_URL=https://mateatletas-system-production.up.railway.app/api

# ReadyPlayerMe (Avatares 3D)
NEXT_PUBLIC_RPM_APP_ID=6901874930e533f99f442a89
NEXT_PUBLIC_RPM_SUBDOMAIN=demo
```

#### Variables de Servidor (Solo backend de Next.js)

```bash
# Vercel Blob Storage (para animaciones/assets)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXXXX

# Node Environment
NODE_ENV=production
```

---

## 📦 Proceso de Deploy

### Opción A: Deploy Automático (Recomendado)

1. **Conectar repositorio a Vercel:**

   ```bash
   vercel link
   ```

2. **Configurar proyecto en Vercel Dashboard:**
   - Framework Preset: Next.js
   - Root Directory: `./` (raíz del monorepo)
   - Build Command: Usar el de vercel.json (automático)
   - Output Directory: `apps/web/.next` (automático)

3. **Configurar variables de entorno:**
   - Ve a Settings → Environment Variables
   - Agrega todas las variables listadas arriba
   - **IMPORTANTE:** `NEXT_PUBLIC_API_URL` debe apuntar a Railway

4. **Deploy:**
   - Cada push a `main` desplegará automáticamente
   - Vercel detecta cambios en `apps/web/` y rebuilds

### Opción B: Deploy Manual

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod
```

---

## 🔗 Secuencia de Deployment Completa

Para un deployment exitoso de la aplicación completa:

### 1. Deploy Backend (Railway) PRIMERO

```bash
# Asegúrate de estar en la branch correcta
git checkout test/deployment-fix-complete

# Push a Railway (puede ser manual o via Railway CLI)
railway up
# O simplemente push a main si tienes deploy automático
git push origin main
```

**Espera a que termine y obtén la URL:**

- URL interna: `https://mateatletas-system.railway.internal`
- URL pública: `https://mateatletas-system-production.up.railway.app`

### 2. Configurar Variables en Vercel

Usa la URL pública de Railway para configurar:

```bash
NEXT_PUBLIC_API_URL=https://mateatletas-system-production.up.railway.app/api
```

### 3. Deploy Frontend (Vercel)

```bash
vercel --prod
```

O simplemente push si tienes deploy automático configurado.

### 4. Actualizar CORS en Railway

Una vez que Vercel te dé la URL de producción (ej: `https://mateatletas.vercel.app`), actualiza la variable `FRONTEND_URL` en Railway:

```bash
railway variables set FRONTEND_URL="https://mateatletas.vercel.app"
```

---

## 🔐 Configuración de Variables

### Cómo Agregar Variables en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable con estos scopes:
   - **Production:** Para el sitio en producción
   - **Preview:** Para branches de preview (opcional)
   - **Development:** Para desarrollo local (opcional)

### Variables Críticas

| Variable                    | Requerido   | Scope      | Descripción                    |
| --------------------------- | ----------- | ---------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL`       | ✅ Sí       | Producción | URL de la API en Railway       |
| `BLOB_READ_WRITE_TOKEN`     | ⚠️ Opcional | Producción | Para Vercel Blob (animaciones) |
| `NEXT_PUBLIC_RPM_APP_ID`    | ⚠️ Opcional | Producción | ReadyPlayerMe (avatares 3D)    |
| `NEXT_PUBLIC_RPM_SUBDOMAIN` | ⚠️ Opcional | Producción | ReadyPlayerMe subdomain        |

**Nota sobre variables opcionales:**

- `BLOB_READ_WRITE_TOKEN`: Solo necesario si usas Vercel Blob Storage
- RPM variables: Solo necesarias si usas avatares 3D de ReadyPlayerMe

---

## 🧪 Verificación Post-Deploy

Después de desplegar, verifica:

### 1. Build Logs

```bash
vercel logs --follow
```

Busca:

- ✅ "Build completed successfully"
- ✅ No hay errores de TypeScript
- ✅ Todas las páginas se generan correctamente

### 2. Runtime

Visita tu sitio y verifica:

```bash
# Abre tu sitio en el navegador
vercel open
```

Prueba:

- ✅ La página de login funciona
- ✅ Las llamadas a la API funcionan (verifica Network tab)
- ✅ No hay errores 500 en la consola
- ✅ Los assets se cargan correctamente

### 3. API Connectivity

Abre DevTools → Network y verifica:

```
Request URL: https://mateatletas-system-production.up.railway.app/api/...
Status: 200 OK
```

Si ves errores CORS, verifica que `FRONTEND_URL` en Railway incluya tu URL de Vercel.

---

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve '@mateatletas/contracts'"

**Causa:** Vercel no buildeó el package contracts antes de web.

**Solución:**

1. Verifica que [vercel.json](vercel.json) tenga:
   ```json
   "buildCommand": "yarn workspace @mateatletas/contracts build && yarn workspace web build"
   ```
2. Redeploy:
   ```bash
   vercel --prod --force
   ```

---

### Error: "Network Error" al llamar API

**Causa:** `NEXT_PUBLIC_API_URL` no está configurada o es incorrecta.

**Síntomas:**

- Console muestra: `POST https://undefined/api/auth/login failed`
- O muestra URL incorrecta

**Solución:**

1. Verifica variables en Vercel:
   ```bash
   vercel env ls
   ```
2. Debe mostrar:
   ```
   NEXT_PUBLIC_API_URL    Production
   ```
3. Si falta, agrégala:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Ingresa: https://mateatletas-system-production.up.railway.app/api
   ```
4. Redeploy para que tome efecto:
   ```bash
   vercel --prod
   ```

---

### Error: CORS al llamar API

**Síntomas:**

```
Access to fetch at 'https://railway.app/api/...' from origin 'https://vercel.app'
has been blocked by CORS policy
```

**Causa:** Railway no tiene tu URL de Vercel en `FRONTEND_URL`.

**Solución:**

1. Obtén tu URL de Vercel:
   ```bash
   vercel inspect
   ```
2. Actualiza Railway:
   ```bash
   railway variables set FRONTEND_URL="https://tu-app.vercel.app,https://www.tu-dominio.com"
   ```
3. Railway redeployará automáticamente.

---

### Build Timeout en Vercel

**Síntomas:**

- Build cancela después de 45 minutos (plan Hobby)
- Mensaje: "Build exceeded maximum time"

**Causas comunes:**

1. Yarn reinstala todo en cada build (no hay cache)
2. Build de contracts + web toma mucho tiempo

**Solución temporal (Hobby plan):**

1. Considera separar contracts en un package npm publicado
2. O usa Vercel Pro (builds más rápidos)

**Solución actual funciona porque:**

- Build time actual: ~3-5 minutos
- Dentro del límite de Hobby plan

---

### Yarn Version Mismatch

**Síntomas:**

```
error This project's package.json defines "packageManager": "yarn@4.10.3"
```

**Causa:** Vercel no ejecutó el `installCommand` correctamente.

**Solución:**
Verifica que [vercel.json](vercel.json) tenga:

```json
"installCommand": "corepack enable && corepack prepare yarn@4.10.3 --activate && yarn set version 4.10.3 && yarn install"
```

Si el problema persiste:

```bash
vercel --prod --force
```

---

### Out of Memory durante Build

**Síntomas:**

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solución:**
Ya está configurado en [vercel.json](vercel.json):

```json
"NODE_OPTIONS": "--max-old-space-size=4096"
```

Si persiste, considera:

1. Reducir tamaño de pages/components
2. Usar dynamic imports para código pesado (Three.js, Chart.js, etc.)

---

## 📊 Estructura del Deploy

### Build Output

Después de un build exitoso, Vercel genera:

```
.next/
├── static/           # Assets estáticos (hashes)
├── server/           # Código SSR
│   ├── app/         # App Router pages
│   └── chunks/      # Code-split chunks
└── BUILD_ID         # ID único del build
```

### Rutas Generadas

Vercel genera estas rutas:

- **Static (○):** Pre-renderizadas en build time
- **Dynamic (ƒ):** Server-rendered on demand

Ejemplos del output:

```
○  /login                   8.03 kB   180 kB  (Static)
ƒ  /dashboard              13.2 kB   154 kB  (Dynamic)
○  /admin/usuarios         15.6 kB   386 kB  (Static)
```

Total: **~68 rutas** generadas.

---

## 🔄 Workflow de Desarrollo Recomendado

### Para Features Nuevos

1. **Crear branch:**

   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar localmente:**

   ```bash
   yarn workspace web dev
   ```

3. **Commit y push:**

   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

4. **Preview automático en Vercel:**
   - Vercel detecta el push
   - Crea un preview deployment
   - URL: `https://mateatletas-git-feature-nueva-fun-team.vercel.app`

5. **Merge a main:**

   ```bash
   git checkout main
   git merge feature/nueva-funcionalidad
   git push origin main
   ```

6. **Deploy automático a producción** 🚀

---

## 📞 Comandos Útiles

### Vercel CLI

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver lista de deployments
vercel list

# Ver info del proyecto
vercel inspect

# Promover un preview a producción
vercel promote <deployment-url>

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add VARIABLE_NAME

# Eliminar deployment
vercel remove <deployment-id>
```

### Testing Local con Variables de Producción

```bash
# Descargar variables de producción
vercel env pull .env.local

# Correr localmente con esas variables
yarn workspace web dev
```

---

## ✅ Checklist de Deploy

Antes de hacer tu primer deploy a producción:

- [ ] Backend desplegado en Railway y funcionando
- [ ] URL de Railway obtenida (ej: `https://mateatletas-system-production.up.railway.app`)
- [ ] `NEXT_PUBLIC_API_URL` configurada en Vercel apuntando a Railway
- [ ] `BLOB_READ_WRITE_TOKEN` configurado (si usas Vercel Blob)
- [ ] Build local exitoso (`yarn workspace web build`)
- [ ] TypeScript sin errores (`yarn workspace web type-check`)
- [ ] Vercel CLI instalado y logueado
- [ ] Proyecto linkeado con `vercel link`
- [ ] Variables de entorno agregadas en Vercel Dashboard
- [ ] Deploy ejecutado: `vercel --prod`
- [ ] `FRONTEND_URL` actualizado en Railway con URL de Vercel
- [ ] Sitio verificado en navegador (login, API calls, assets)
- [ ] CORS funcionando correctamente

---

## 🌐 Dominios Personalizados

### Agregar tu Propio Dominio

1. **En Vercel Dashboard:**
   - Settings → Domains
   - Add Domain: `www.mateatletasclub.com.ar`

2. **En tu registrador de dominios:**
   - Agrega un CNAME record:
     ```
     www  →  cname.vercel-dns.com
     ```

3. **Actualizar Railway:**

   ```bash
   railway variables set FRONTEND_URL="https://www.mateatletasclub.com.ar,https://mateatletas.vercel.app"
   ```

4. **Esperar propagación DNS** (5-48 horas)

---

## 🔒 Mejores Prácticas

### Seguridad

1. **Nunca expongas variables secretas como públicas**
   - ❌ `NEXT_PUBLIC_DATABASE_URL`
   - ✅ `NEXT_PUBLIC_API_URL`

2. **Usa Vercel Environment Variables para secretos**
   - No los pongas en el código
   - No los comitees al repo

3. **Verifica CORS en Railway**
   - Solo permite tus dominios reales
   - No uses `*` en producción

### Performance

1. **Usa Vercel Analytics** (gratis en Hobby plan)

   ```bash
   # Agregar en apps/web/app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   ```

2. **Activa compresión de imágenes**
   - Next.js lo hace automáticamente con `next/image`

3. **Monitorea build times**
   - Objetivo: < 5 minutos
   - Actual: ~3-5 minutos ✅

### Monitoreo

1. **Setup de alertas en Vercel:**
   - Settings → Notifications
   - Activa "Failed Deployments"

2. **Revisa logs regularmente:**
   ```bash
   vercel logs --follow
   ```

---

## 📚 Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js 15 Deployment](https://nextjs.org/docs/deployment)
- [Yarn 4 PnP on Vercel](https://yarnpkg.com/getting-started/install#vercel)
- [DEPLOYMENT.md](DEPLOYMENT.md) - Backend (Railway)

---

**Última actualización:** 2025-11-03
**Mantenido por:** Equipo Mateatletas
**Estado:** ✅ Production Ready
