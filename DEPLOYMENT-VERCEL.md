# 🚀 Guía de Deployment en Vercel - SOLUCIÓN FINAL

## ❌ Problema Identificado

```
Error: No Output Directory named "public" found after the Build completed.
```

**Causa**: Vercel está buscando el output en el directorio raíz, pero el proyecto es un **monorepo** donde Next.js está en `apps/web/`.

## ✅ SOLUCIÓN - Configuración en Vercel Dashboard

### Paso 1: Configurar Root Directory

Ve a tu proyecto en Vercel:
```
https://vercel.com/[tu-team]/mateatletas-ecosystem/settings
```

**Settings > General > Root Directory**:
- ✅ **Override**: Activar el toggle
- ✅ **Root Directory**: `apps/web`
- ✅ **Save**

### Paso 2: Verificar Framework Preset

**Settings > General > Framework Preset**:
- ✅ Debe estar en: `Next.js`

### Paso 3: Build & Development Settings

**Settings > General > Build & Development Settings**:
- **Build Command**: (dejar en blanco, usa `vercel.json`)
- **Output Directory**: (dejar en blanco, usa default `.next`)
- **Install Command**: (dejar en blanco, usa `vercel.json`)

### Paso 4: Variables de Entorno (OPCIONAL)

**Settings > Environment Variables**:

Para que `detect-planificaciones` funcione durante build (opcional):
```
DATABASE_URL=postgresql://...
```

⚠️ **NOTA**: Si no configuras `DATABASE_URL`, verás warnings durante el build pero **NO afecta el deployment**. Las planificaciones se pueden cargar después vía API.

## 📋 Verificación

Después de configurar el Root Directory:

1. **Redeploy** desde Vercel Dashboard
2. El build debería completarse exitosamente
3. Vercel encontrará `.next` en `apps/web/.next`

## 🎯 Configuración Actual del Proyecto

### Archivos Corregidos:
- ✅ `vercel.json` - Configuración optimizada
- ✅ `package.json` - Node version `20.x`
- ✅ `apps/web/tsconfig.json` - Paths corregidos
- ✅ `apps/api/tsconfig.json` - Paths corregidos
- ✅ `packages/shared/tsconfig.json` - Paths corregidos

### Build Verificado:
```
✅ @mateatletas/contracts: compiled
✅ @mateatletas/shared: compiled
✅ api: compiled
✅ web: compiled (44 páginas)
```

## 🐛 Troubleshooting

### Si el error persiste después de configurar Root Directory:

1. **Verificar que Root Directory esté guardado**:
   - Debe mostrar: `apps/web` en la configuración

2. **Hacer un Redeploy**:
   - Vercel > Deployments > [...] > Redeploy

3. **Verificar logs del build**:
   - Debe mostrar: `Building in /vercel/path0/apps/web`

### Warnings Esperados (NO son errores):

```
⚠️ DATABASE_URL not found
⚠️ BLOB_READ_WRITE_TOKEN missing from turbo.json
```

Estos son warnings que **NO bloquean el deployment**.

## 📝 Resumen de Cambios

### Commit 1: `fix(deploy): resolver errores de deployment en Vercel`
- Eliminados path mappings relativos en tsconfig
- Node.js version específica `20.x`
- Agregado `vercel.json` optimizado

### Commit 2: `fix(tsconfig): cambiar lib 'esnext' a 'ES2020'`
- Corregido error de validación TypeScript

### Commit 3 (pendiente): `fix(vercel): simplificar configuración para monorepo`
- Removido `outputDirectory` y `buildCommand` custom
- Delega configuración a Vercel Dashboard

## 🎯 Estado Final

```
Build Status: ✅ EXITOSO
- Turbo: 4/4 tasks successful
- Time: ~1m 16s
- Output: apps/web/.next (listo)
```

**El build funciona perfectamente. Solo falta configurar Root Directory en Vercel Dashboard.**

---

## 🚀 Deploy Ahora

1. **Configurar Root Directory en Vercel**: `apps/web`
2. **Push a GitHub**: `git push origin main`
3. **Vercel hará auto-deploy**
4. ✅ **DONE**
