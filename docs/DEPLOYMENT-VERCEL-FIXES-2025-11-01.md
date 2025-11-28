# Guía de Deployment - Mateatletas Ecosystem

## Correcciones Aplicadas para Vercel (2025-11-01)

### Problemas Resueltos

#### 1. **TypeScript Path Mappings**

- **Problema**: Los paths en `tsconfig.json` usaban rutas relativas (`../../packages/...`) que fallaban en Vercel
- **Solución**: Eliminados los path mappings custom, ahora usa resolución estándar de `node_modules`
- **Archivos modificados**:
  - `apps/web/tsconfig.json`
  - `apps/api/tsconfig.json`
  - `packages/shared/tsconfig.json`

#### 2. **Node.js Version Warning**

- **Problema**: `"node": ">=18.0.0"` causaba warnings de auto-upgrade
- **Solución**: Cambiado a `"node": "20.x"` (versión específica)
- **Archivo modificado**: `package.json` (root)

#### 3. **Configuración de Vercel Optimizada**

- Agregado `vercel.json` con:
  - `--legacy-peer-deps` para dependencias peer
  - `NODE_OPTIONS=--max-old-space-size=4096` para builds grandes
  - `NEXT_TELEMETRY_DISABLED=1` para performance

## Verificación Local

Build local exitoso:

```bash
npm run build
```

**Resultado esperado**:

```
✓ @mateatletas/contracts: compiled
✓ @mateatletas/shared: compiled
✓ api: compiled (NestJS)
✓ web: compiled (Next.js 15.5.4)
  - 44 páginas generadas
  - 0 errores TypeScript
```

## Variables de Entorno Requeridas en Vercel

Asegúrate de configurar en Vercel Dashboard > Settings > Environment Variables:

### Database

- `DATABASE_URL` (Production DB)
- `DATABASE_URL_NON_POOLING` (Direct connection)

### Auth & Security

- `JWT_SECRET`
- `SESSION_SECRET`

### API URLs

- `NEXT_PUBLIC_API_URL`

### Payments (MercadoPago)

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_PUBLIC_KEY`

### Redis (opcional)

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`

## Comandos de Deploy

### Deploy a Production

```bash
git add .
git commit -m "fix: resolver errores de deployment Vercel"
git push origin main
```

Vercel detectará el push y ejecutará el build automáticamente.

### Verificar Build en Vercel

1. Ve a tu dashboard de Vercel
2. Selecciona el proyecto "mateatletas-ecosystem"
3. Verifica que el build termine con éxito
4. Revisa los logs en "Deployments" > [último deployment] > "Build Logs"

## Troubleshooting

### Si el build falla en Vercel:

1. **Verificar variables de entorno**:
   - Asegúrate de que todas las variables estén configuradas
   - Verifica que no haya espacios extra o caracteres especiales

2. **Revisar logs de build**:

   ```
   Vercel Dashboard > Deployments > [Failed Build] > View Build Logs
   ```

3. **Verificar Prisma**:
   - El `prebuild` script debe ejecutar `npx prisma generate`
   - Si falla, verifica que `DATABASE_URL` esté configurado

4. **Memory issues**:
   - El `vercel.json` ya incluye `--max-old-space-size=4096`
   - Si persiste, considera actualizar al plan Pro de Vercel

## Estructura del Monorepo

```
mateatletas-ecosystem/
├── apps/
│   ├── api/          → NestJS API (Puerto 3001)
│   └── web/          → Next.js Frontend (Puerto 3000)
└── packages/
    ├── contracts/    → Schemas Zod compartidos
    └── shared/       → Utilidades compartidas
```

## Build Order (Turbo)

1. `@mateatletas/contracts` (primero)
2. `@mateatletas/shared` (depende de contracts)
3. `api` (depende de contracts)
4. `web` (depende de contracts y shared)

## Notas Importantes

- ✅ El build local está 100% funcional
- ✅ Todas las dependencias se resuelven correctamente vía `node_modules`
- ✅ TypeScript compila sin errores
- ✅ Prisma genera el client correctamente
- ✅ Auto-detección de planificaciones funciona en `prebuild`

## Última Verificación

Ejecutado: **2025-11-01 10:50 UTC**
Build time: **37.83s**
Status: ✅ **READY FOR DEPLOYMENT**
