# Guía de Deploy en Railway - Mateatletas API

Esta guía detalla cómo configurar y deployar el backend de Mateatletas en Railway.

## 🏗️ Arquitectura del Proyecto

Este es un **monorepo** que contiene:
- `apps/api` - Backend NestJS (se deploya en Railway)
- `apps/web` - Frontend Next.js (se deploya en Vercel)
- `packages/contracts` - Schemas compartidos (Zod) - paquete local

**Importante**: Railway usa [nixpacks.toml](../../nixpacks.toml) para construir el proyecto correctamente, manejando las dependencias locales del monorepo.

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app/)
2. CLI de Railway instalado (opcional): `npm i -g @railway/cli`
3. Repositorio conectado a Railway

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio `Mateatletas-Ecosystem`
5. **Importante**: Railway detectará `nixpacks.toml` y `railway.json` automáticamente

### 2. Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway automáticamente creará la base de datos y configurará `DATABASE_URL`

### 3. Configurar Variables de Entorno

En el dashboard de Railway, ve a tu servicio del backend y configura las siguientes variables:

#### Variables Obligatorias

```bash
# Entorno
NODE_ENV=production

# Base de Datos (automáticamente configurada por Railway)
DATABASE_URL=${{ PostgreSQL.DATABASE_URL }}

# JWT Secret (CRÍTICO: generar uno aleatorio y seguro)
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu-secreto-super-seguro-de-128-caracteres-minimo

# Expiración de JWT
JWT_EXPIRATION=1h

# Puerto (Railway lo configura automáticamente)
PORT=3001
```

#### Variables de Integración

```bash
# MercadoPago (Producción - Credenciales REALES)
MERCADOPAGO_ACCESS_TOKEN=APP-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MERCADOPAGO_PUBLIC_KEY=APP-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# URLs
FRONTEND_URL=https://tu-dominio-frontend.vercel.app
BACKEND_URL=https://tu-app.railway.app
NEXT_PUBLIC_API_URL=https://tu-app.railway.app/api
```

#### Variables Opcionales

```bash
# Rate Limiting (ajustar según necesidad)
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
```

### 4. Configuración del Servicio

Railway usa dos archivos de configuración:

#### [nixpacks.toml](../../nixpacks.toml) - Configuración de Build
```toml
# Maneja el monorepo y dependencias locales
- Instala dependencias desde la raíz (npm workspaces)
- Construye packages/contracts (dependencia local)
- Genera cliente de Prisma
- Construye apps/api
- Ejecuta migraciones en el start
```

#### [railway.json](../../railway.json) - Configuración de Deploy
```json
- Builder: Nixpacks
- Watch Patterns: apps/api/**, packages/contracts/**
- Health Check: /api/health
- Restart Policy: ON_FAILURE (max 10 retries)
```

## 🔧 Comandos Útiles

### Desde Railway CLI

```bash
# Iniciar sesión
railway login

# Enlazar proyecto local con Railway
railway link

# Ver logs en tiempo real
railway logs

# Ejecutar comando en Railway
railway run <comando>

# Abrir dashboard del proyecto
railway open
```

### Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente durante el deploy mediante:
```bash
npx prisma migrate deploy
```

Para ejecutar manualmente:
```bash
railway run npx prisma migrate deploy
```

### Seed de Base de Datos

El seed se ejecuta automáticamente en el primer deploy si la base de datos está vacía.

Para ejecutar manualmente:
```bash
railway run npm run db:seed:prod
```

## 📊 Monitoreo y Salud

### Health Check

La aplicación expone un endpoint de health check en:
```
GET /api/health
```

Railway lo usa automáticamente para verificar que el servicio esté funcionando.

### Logs

Ver logs en tiempo real:
```bash
railway logs
```

O desde el dashboard de Railway en la sección "Deployments".

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] `JWT_SECRET` generado aleatoriamente (mínimo 128 caracteres)
- [ ] `NODE_ENV=production` configurado
- [ ] Credenciales de MercadoPago son de PRODUCCIÓN (no TEST)
- [ ] `FRONTEND_URL` apunta al dominio correcto (importante para CORS)
- [ ] `BACKEND_URL` apunta a la URL de Railway
- [ ] Rate limiting configurado apropiadamente
- [ ] Variables de entorno no están en el código fuente
- [ ] Base de datos PostgreSQL usa conexión SSL

### Variables Sensibles

**NUNCA** commitear:
- `.env`
- `.env.production`
- Archivos con credenciales reales

Usar solo:
- `.env.example`
- `.env.production.template`

## 🚨 Troubleshooting

### Error: "Cannot find module"

**Solución**: Verificar que el build command incluya `npm install --legacy-peer-deps`

### Error: Migraciones fallan

**Causa**: `DATABASE_URL` no configurada o incorrecta

**Solución**: Verificar que la variable esté configurada correctamente en Railway

### Error: Health check falla

**Causa**: El servidor no está respondiendo en `/api/health`

**Solución**:
1. Verificar logs: `railway logs`
2. Verificar que el puerto sea el correcto
3. Verificar que todas las variables de entorno estén configuradas

### Error: CORS

**Causa**: `FRONTEND_URL` no configurada correctamente

**Solución**: Configurar `FRONTEND_URL` con el dominio exacto del frontend (sin trailing slash)

### Base de datos se resetea

**Causa**: Railway puede recrear la base de datos si el servicio se elimina

**Solución**:
- Hacer backups regulares
- Usar el servicio de PostgreSQL de Railway (no SQLite)
- Nunca eliminar el servicio de base de datos

## 📈 Escalabilidad

### Horizontal Scaling

Railway soporta múltiples instancias:
1. Ve a "Settings" en tu servicio
2. Ajusta "Replicas" según necesidad

### Vertical Scaling

Railway ajusta recursos automáticamente, pero puedes configurar límites en:
1. "Settings" → "Resources"
2. Configurar RAM y CPU según necesidad

## 🔄 CI/CD

Railway se integra automáticamente con GitHub:

1. **Push a main**: Deploy automático a producción
2. **Pull Request**: Deploy de preview (opcional)
3. **Rollback**: Desde el dashboard, click en deploy anterior

### Configurar Deploys Automáticos

1. En Railway dashboard, ve a "Settings"
2. "Deployment" → "Triggers"
3. Configurar branch para auto-deploy (ej: `main`)

## 📝 Notas Importantes

1. **Primera vez**: El primer deploy puede tardar 5-10 minutos
2. **Migraciones**: Se ejecutan automáticamente en cada deploy
3. **Seed**: Solo se ejecuta si la base de datos está vacía
4. **Logs**: Mantener para debugging, accesibles por 7 días
5. **Costos**: Railway tiene plan gratuito con $5 de crédito mensual

## 🔗 Enlaces Útiles

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs](https://docs.railway.app/)
- [Nixpacks Docs](https://nixpacks.com/)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs: `railway logs`
2. Verificar variables de entorno
3. Consultar esta documentación
4. Contactar soporte de Railway: [help.railway.app](https://help.railway.app)
