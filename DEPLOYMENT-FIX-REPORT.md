# Reporte de Corrección de Deployment

## Fecha: 2025-11-03

## Resumen Ejecutivo

Se identificaron y corrigieron problemas críticos en la configuración de deployment que impedían el correcto funcionamiento de la aplicación en producción:
- **Vercel (Frontend)**: Configuración incorrecta de outputDirectory para Next.js standalone
- **Railway (Backend)**: Cookies/JWT no se transmitían correctamente en requests cross-domain

## Cambios Realizados

### 1. Vercel Configuration

#### Archivo: `/vercel.json`

**Cambios aplicados:**
- ✅ `outputDirectory` actualizado de `apps/web/.next` → `apps/web/.next/standalone`
- ✅ `buildCommand` simplificado de `cd apps/web && npm run build` → `npm run build:web`

**Razón:** Next.js en modo standalone genera los archivos de producción en `.next/standalone`, no en `.next`. Esta corrección permite que Vercel encuentre correctamente los archivos para deployment.

#### Archivo: `/package.json` (root)

**Cambios aplicados:**
- ✅ Script `build:web` actualizado para usar `cd apps/web && npm run build` (consistente con arquitectura de monorepo)

**Razón:** Vercel ahora invoca este script centralizado que gestiona correctamente el build dentro del workspace.

---

### 2. Backend CORS/Auth Configuration

#### Archivo: `/apps/api/src/main.ts`

**Cambios aplicados:**
- ✅ Agregado `'X-Requested-With'` a `allowedHeaders` (línea 102)
- ✅ Agregado `'set-cookie'` a `exposedHeaders` (línea 103)

**Antes:**
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
exposedHeaders: ['Content-Disposition'],
```

**Después:**
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
exposedHeaders: ['Content-Disposition', 'set-cookie'],
```

**Razón:** El header `set-cookie` debe estar expuesto para que las cookies sean accesibles en requests cross-domain con `credentials: true`.

---

#### Archivo: `/apps/api/src/auth/auth.controller.ts`

**Cambios aplicados:**
- ✅ Actualizada configuración de cookies en método `login()` (líneas 141-148)
- ✅ Actualizada configuración de cookies en método `loginEstudiante()` (líneas 196-203)
- ✅ Actualizada configuración de cookies en método `logout()` (líneas 299-305)

**Antes:**
```typescript
res.cookie('auth-token', result.access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
```

**Después:**
```typescript
res.cookie('auth-token', result.access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  domain: process.env.NODE_ENV === 'production' ? '.mateatletasclub.com.ar' : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
```

**Razón:**
- `sameSite: 'strict'` bloquea cookies en requests cross-domain. Cambiar a `'none'` permite cross-domain cookies cuando se usa HTTPS (`secure: true`)
- `domain: '.mateatletasclub.com.ar'` permite que la cookie sea compartida entre subdominios (api.mateatletasclub.com.ar y www.mateatletasclub.com.ar)

---

### 3. Variables de Entorno

**Estado en Railway:** ✅ Todas las variables críticas están correctamente configuradas

```
FRONTEND_URL=https://www.mateatletasclub.com.ar,https://mateatletas-fybnyracj-alexis-figueroas-projects-d4fb75f1.vercel.app
NODE_ENV=production
JWT_SECRET=[kHIL4UmYmRJO5TF+ffxWBJ4M+fx3TTmO4ukBrniSTfQ=]
```

**Estado en Vercel:** ✅ Variables verificadas con `vercel env pull` (paso previo)

---

## Resumen de Archivos Modificados

| Archivo | Cambios | Motivo |
|---------|---------|--------|
| `/vercel.json` | outputDirectory, buildCommand | Corregir path de output para Next.js standalone |
| `/package.json` | Script `build:web` | Consistencia con arquitectura de monorepo |
| `/apps/api/src/main.ts` | CORS headers | Exponer `set-cookie` y permitir `X-Requested-With` |
| `/apps/api/src/auth/auth.controller.ts` | Cookie configuration | sameSite='none' y domain compartido para cross-domain |

---

## Próximos Pasos

### 1. Commit y Push de Cambios
```bash
git add .
git commit -m "fix(deploy): resolver errores de Vercel y cookies cross-domain

- Corregir outputDirectory en vercel.json para Next.js standalone
- Actualizar buildCommand para usar script centralizado
- Agregar set-cookie a exposedHeaders en CORS
- Cambiar sameSite de 'strict' a 'none' en producción para cross-domain cookies
- Agregar domain compartido (.mateatletasclub.com.ar) a cookies

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 2. Verificar Deployments

**Vercel (automático):**
- Vercel detectará los cambios en `main` automáticamente
- Nuevo deployment comenzará en ~30 segundos
- Verificar en: https://vercel.com/alexis-figueroas-projects-d4fb75f1/mateatletas

**Railway (automático):**
- Railway detectará cambios en `apps/api/src/` automáticamente
- Rebuild y redeploy comenzará en ~1 minuto
- Verificar en: https://railway.app

### 3. Verificar Funcionamiento

```bash
# Verificar que Vercel esté deployado
vercel ls

# Verificar que Railway esté corriendo
railway status

# Ver logs de Railway
railway logs

# Probar endpoint de health
curl https://mateatletas-system.railway.app/api/health

# Probar login desde el frontend
# Abrir https://www.mateatletasclub.com.ar y hacer login
```

### 4. Validación Post-Deployment

- [ ] Frontend carga correctamente en https://www.mateatletasclub.com.ar
- [ ] Backend responde en https://mateatletas-system.railway.app/api/health
- [ ] Login funciona correctamente (se reciben y envían cookies)
- [ ] Requests autenticados retornan 200 OK (no 401 Unauthorized)
- [ ] No hay errores CORS en la consola del navegador

---

## Diagnóstico de Problemas Potenciales

### Si Vercel sigue fallando:
```bash
# Verificar logs de build en Vercel
vercel logs <deployment-url>

# Verificar que el outputDirectory exista después del build local
npm run build:web
ls -la apps/web/.next/standalone
```

### Si Railway sigue retornando 401:
```bash
# Verificar que FRONTEND_URL esté correctamente configurado
railway variables | grep FRONTEND_URL

# Ver logs en tiempo real
railway logs --tail

# Verificar que las cookies se estén enviando
# En DevTools > Network > Request Headers > Cookie: auth-token=...
```

### Si hay problemas de CORS:
```bash
# Verificar que el origin del frontend esté en FRONTEND_URL
railway variables | grep FRONTEND_URL

# Agregar URL faltante si es necesario
railway variables set FRONTEND_URL="https://www.mateatletasclub.com.ar,https://otra-url.vercel.app"
```

---

## Comandos de Referencia

```bash
# Verificar Vercel
vercel --version
vercel whoami
vercel ls
vercel env pull

# Verificar Railway
railway --version
railway whoami
railway status
railway variables
railway logs

# Build local para verificar
npm run build:web
npm run build --workspace=apps/api

# Pruebas locales
npm run dev
```

---

## Notas Técnicas

### Por qué `sameSite: 'none'` es necesario

Cuando el frontend (Vercel) y backend (Railway) están en dominios diferentes:
- Frontend: `https://www.mateatletasclub.com.ar`
- Backend: `https://mateatletas-system.railway.app`

Esto se considera **cross-site**, no solo **cross-origin**. Para que las cookies funcionen en este escenario:
1. `sameSite: 'none'` - permite cookies cross-site
2. `secure: true` - obligatorio cuando se usa `sameSite: 'none'`
3. `credentials: true` en CORS - permite envío de cookies
4. `domain: '.mateatletasclub.com.ar'` - opcional, solo si backend también está en subdominio de mateatletasclub.com.ar

### Next.js Standalone Output

Next.js genera tres directorios en `.next/`:
- `.next/standalone` - Servidor Node.js minificado (usado en producción)
- `.next/static` - Assets estáticos
- `.next/cache` - Cache de build

Vercel necesita apuntar a `.next/standalone` para servir la aplicación correctamente.

---

**Fin del reporte**
