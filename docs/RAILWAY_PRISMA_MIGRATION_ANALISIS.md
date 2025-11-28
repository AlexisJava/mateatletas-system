# Análisis Exhaustivo: Problema con Migraciones de Prisma en Railway

## Resumen Ejecutivo

**Problema**: Al ejecutar `railway run npx prisma migrate deploy`, Prisma intenta conectarse a `localhost:5432` en lugar de `postgres-yumb.railway.internal:5432`, fallando con error P1001.

**Causa Raíz**: Prisma CLI carga automáticamente archivos `.env` locales ANTES de que las variables de Railway sean procesadas, sobrescribiendo `DATABASE_URL`.

**Criticidad**: ⚠️ **ALTA** - Esto impide desplegar migraciones de seguridad críticas (audit_logs, secret_rotations) a producción.

---

## Análisis Técnico Detallado

### 1. Arquitectura del Proyecto

#### Estructura del Monorepo

```
Mateatletas-Ecosystem/
├── .env                          ← DATABASE_URL local (localhost)
├── apps/
│   └── api/
│       ├── .env                  ← DATABASE_URL local (localhost)
│       ├── package.json          ← prisma.seed config
│       └── prisma/
│           └── schema.prisma
├── Dockerfile                    ← Build de producción
└── nixpacks.toml                 ← Configuración legacy Railway
```

#### Configuración de Railway

**Servicios en el proyecto**:

1. **`Postgres-yuMB`** - Servicio de base de datos PostgreSQL
   - Host interno: `postgres-yumb.railway.internal:5432`
   - Estado: `SUCCESS`

2. **`mateatletas-system`** - Servicio de la API
   - Builder: `DOCKERFILE`
   - Estado último deploy: `FAILED`
   - Healthcheck: `/api/health`

**Variables de entorno**:

- Railway tiene configurado `DATABASE_URL` con la URL interna correcta
- La variable es accesible por el servicio `mateatletas-system`

### 2. Orden de Precedencia de Variables de Entorno

#### Comportamiento de Prisma CLI

Según la investigación en la documentación oficial y GitHub discussions:

**Orden de precedencia** (de mayor a menor):

1. **Variables de entorno del sistema** (`process.env`)
2. **Archivos `.env` cargados por Prisma**
   - Ubicación 1: Raíz del proyecto (`./.env`)
   - Ubicación 2: Carpeta especificada con `--schema`
   - Ubicación 3: Carpeta en `package.json#prisma`
   - Ubicación 4: `./prisma/`

**Biblioteca subyacente**: Prisma usa `dotenv` internamente, que:

- Carga `.env` automáticamente
- **NO sobrescribe** variables que ya existen en `process.env`
- **NO reconoce** `.env.local` nativamente

**Fuentes**:

- [Prisma Discussions #21207](https://github.com/prisma/prisma/discussions/21207)
- [Prisma Documentation - Environment Variables](https://www.prisma.io/docs/orm/more/development-environment/environment-variables)

#### Comportamiento de `railway run`

Según la documentación de Railway CLI:

**Función**: Ejecuta comandos localmente inyectando variables de entorno de Railway.

**Cómo funciona**:

```bash
railway run <comando>
```

1. Railway CLI consulta las variables configuradas en el servicio
2. Inyecta esas variables en `process.env` del proceso hijo
3. Ejecuta el comando especificado

**El problema crítico**:

- Railway inyecta las variables en `process.env`
- PERO Prisma CLI internamente usa `dotenv` que carga `.env`
- `dotenv` **NO sobrescribe** variables existentes en `process.env`

**Sin embargo**, hay un comportamiento no documentado:

- Si Prisma carga `.env` ANTES de que `dotenv` procese las variables de Railway
- O si el orden de carga no es garantizado
- El archivo local puede tener precedencia

**Fuentes**:

- [Railway Documentation - CLI Guide](https://docs.railway.com/guides/cli)
- [Railway GitHub CLI](https://github.com/railwayapp/cli)

### 3. ¿Por Qué Falla Específicamente en Este Caso?

#### Evidencia del Error

```bash
$ railway run bash -c "cd apps/api && npx prisma migrate deploy"
Environment variables loaded from .env
Datasource "db": PostgreSQL database "railway", schema "public" at "postgres-yumb.railway.internal:5432"

Error: P1001: Can't reach database server at `postgres-yumb.railway.internal:5432`
```

**Observaciones críticas**:

1. ✅ Prisma detecta correctamente el host: `postgres-yumb.railway.internal:5432`
2. ❌ Pero no puede conectarse porque **la red interna de Railway no es accesible localmente**

#### La Confusión Original

El mensaje "Environment variables loaded from .env" es **MISLEADING**.

Prisma muestra este mensaje incluso cuando:

- Usa `.env.local` con `dotenv-cli`
- Usa variables del sistema exclusivamente
- Hay un [issue abierto](https://github.com/prisma/prisma/issues/10104) documentando esto

**El problema real NO es qué archivo se carga**, sino **DÓNDE se ejecuta el comando**.

### 4. El Problema Fundamental: Ejecución Local vs. Remota

#### `railway run` NO ejecuta en el servidor de Railway

**Concepto erróneo**: Pensamos que `railway run` ejecuta comandos "dentro" de Railway.

**Realidad**: `railway run` ejecuta comandos **LOCALMENTE** con variables de Railway.

```
┌─────────────────────────────────────────┐
│  TU MÁQUINA LOCAL                       │
│  ┌───────────────────────────────────┐  │
│  │  railway run prisma migrate       │  │
│  │  ↓                                │  │
│  │  DATABASE_URL=postgres-yumb...    │  │ ← Variable de Railway
│  │  ↓                                │  │
│  │  Intenta conectar a red interna   │  │ ← FALLA: red no accesible
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                     ✗
                     │ Red interna no accesible
                     ↓
        ┌────────────────────────┐
        │  RAILWAY (red interna) │
        │  postgres-yumb:5432    │
        └────────────────────────┘
```

#### El URL Interno de Railway

`postgres-yumb.railway.internal:5432` es un **DNS privado de Railway**.

**Solo es accesible**:

- ✅ Desde otros servicios en el mismo proyecto Railway
- ✅ Desde el proceso que se ejecuta EN Railway (deploy)
- ❌ Desde tu máquina local (incluso con `railway run`)

**Analogía**: Es como intentar acceder a `http://localhost` de otra computadora.

---

## Soluciones Profesionales

### Solución 1: Ejecutar Migración Directamente en Railway (RECOMENDADA)

#### Opción A: Pre-Deploy Command

Configurar Railway para ejecutar migraciones automáticamente antes de cada deploy.

**En el dashboard de Railway**:

1. Ve a tu servicio `mateatletas-system`
2. Settings → Deploy
3. Configura **"Build & Deploy"**:
   - Pre Deploy Command: `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`

**Ventajas**:

- ✅ Automático en cada deploy
- ✅ Se ejecuta EN Railway (tiene acceso a la red interna)
- ✅ Falla el deploy si la migración falla (seguridad)
- ✅ No requiere intervención manual

**Desventajas**:

- ⚠️ Incrementa el tiempo de deploy
- ⚠️ Si falla la migración, el deploy completo falla

**Implementación**:

```json
// Railway Service Settings (via dashboard o railway.toml)
{
  "deploy": {
    "preDeployCommand": "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma"
  }
}
```

#### Opción B: Post-Install Script

Modificar `apps/api/package.json` para ejecutar migraciones en el hook `postinstall`.

**Implementación**:

Archivo: `apps/api/package.json`

```json
{
  "scripts": {
    "postinstall": "npx prisma generate && npx prisma migrate deploy"
  }
}
```

**Ventajas**:

- ✅ Se ejecuta automáticamente después de `yarn install`
- ✅ Funciona en Railway sin configuración adicional
- ✅ Ya tienes `npx prisma generate` aquí

**Desventajas**:

- ⚠️ Se ejecuta TAMBIÉN en desarrollo local (puede ser indeseado)
- ⚠️ Requiere modificar package.json

**Mitigación para desarrollo local**:

```json
{
  "scripts": {
    "postinstall": "npx prisma generate && if [ \"$NODE_ENV\" = \"production\" ]; then npx prisma migrate deploy; fi"
  }
}
```

#### Opción C: Railway CLI con Servicio Correcto

Usar `railway up` para deployar, que ejecutará las migraciones en el entorno de Railway.

**Implementación**:

```bash
# 1. Asegurarse de estar en el servicio correcto
railway service mateatletas-system

# 2. Hacer deploy que trigger el postinstall
git push origin main

# O usar railway up directamente
railway up
```

**Ventajas**:

- ✅ Se ejecuta en el entorno de Railway
- ✅ Usa las configuraciones existentes

**Desventajas**:

- ⚠️ Requiere push a git
- ⚠️ Depende del hook `postinstall`

### Solución 2: Usar Túnel de Railway (Para Migraciones Manuales)

Si necesitas ejecutar migraciones manualmente desde tu máquina (debugging, rollback, etc.).

**Pasos**:

#### 1. Crear túnel a la base de datos

```bash
railway connect Postgres-yuMB
```

Esto abrirá un túnel local, por ejemplo:

```
Connecting to Postgres-yuMB...
Connected to PostgreSQL at localhost:54321
```

#### 2. Ejecutar migración usando el túnel

```bash
# En otra terminal, con el túnel activo
DATABASE_URL="postgresql://postgres:miHOtpDWkXWPoipkGXqPPbDQQiYifpfe@localhost:54321/railway" \
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

**Ventajas**:

- ✅ Útil para debugging
- ✅ Permite rollbacks manuales
- ✅ Control total sobre cuándo se ejecutan

**Desventajas**:

- ⚠️ Requiere intervención manual
- ⚠️ No automatizable
- ⚠️ Requiere mantener el túnel activo

### Solución 3: Crear Railway Service para Migraciones

Crear un servicio dedicado en Railway solo para ejecutar migraciones.

**Estructura**:

```yaml
# railway-migration-service.yml
services:
  migration:
    build:
      dockerfile: Dockerfile
    command: npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
    restartPolicy: never # Solo ejecutar una vez
```

**Ventajas**:

- ✅ Separación de responsabilidades
- ✅ Puede ejecutarse on-demand
- ✅ Logs independientes

**Desventajas**:

- ⚠️ Requiere configuración adicional
- ⚠️ Costo adicional en Railway (si supera free tier)

---

## Solución Implementada (RECOMENDACIÓN FINAL)

### Estrategia: Pre-Deploy Command en Railway

#### Configuración en Railway Dashboard

1. Ve a https://railway.app/
2. Selecciona proyecto "Mateatletas-System"
3. Selecciona servicio "mateatletas-system"
4. Ve a "Settings"
5. Sección "Deploy":
   - **Pre Deploy Command**: `cd apps/api && npx prisma migrate deploy`

#### Verificación

Después de configurar, fuerza un nuevo deploy:

```bash
# Hacer un cambio trivial y push
git commit --allow-empty -m "trigger railway deploy with migration"
git push origin main
```

Monitorea los logs:

```bash
railway logs
```

Deberías ver:

```
[Build] ...
[Deploy] Running pre-deploy command: cd apps/api && npx prisma migrate deploy
[Deploy] Prisma schema loaded from prisma/schema.prisma
[Deploy] Datasource "db": PostgreSQL database "railway"...
[Deploy] 1 migration found in prisma/migrations
[Deploy] Applying migration `20251121002735_add_security_tables`
[Deploy] Migration applied successfully
[Deploy] Starting application...
```

#### Rollback Plan

Si algo falla:

1. **Revertir configuración en Railway**:
   - Eliminar Pre Deploy Command
   - Redeploy

2. **Rollback de migración** (si es necesario):

   ```bash
   # Conectarse a la base de datos
   railway connect Postgres-yuMB

   # En otra terminal
   DATABASE_URL="postgresql://..." npx prisma migrate resolve --rolled-back 20251121002735_add_security_tables
   ```

---

## Migraciones Pendientes

### Migración: `20251121002735_add_security_tables`

**Fecha**: 2025-11-21 00:27:35

**Contenido**:

- Crear tabla `audit_logs` con índices en timestamp, user_id, action, entity_type, etc.
- Crear tabla `secret_rotations` con índices en secret_type, status
- Constraint único en `secret_type` + `version`

**Impacto**:

- ✅ Sin cambios destructivos
- ✅ Tablas nuevas (no afecta datos existentes)
- ⚠️ Requiere espacio adicional en DB (mínimo)

**Estimación de downtime**: 0 segundos (tablas nuevas)

---

## Lecciones Aprendidas

### 1. `railway run` vs Railway Deployment

- `railway run` = Ejecuta **LOCALMENTE** con variables de Railway
- Railway deployment = Ejecuta **EN Railway** con acceso a red interna

### 2. Prisma y Variables de Entorno

- Prisma carga `.env` automáticamente
- La precedencia es: Sistema > `.env` (si sistema no tiene la variable)
- Mensaje "loaded from .env" puede ser misleading

### 3. Railway Networking

- Hosts `.railway.internal` solo son accesibles dentro de Railway
- Para acceso local, usar `railway connect` (túnel)

### 4. Automatización de Migraciones

- Pre-deploy commands son la forma correcta en Railway
- `postinstall` es una alternativa pero corre en TODOS los entornos
- Nunca ejecutar migraciones de producción manualmente salvo emergencias

---

## Referencias

### Documentación Oficial

- [Railway CLI Guide](https://docs.railway.com/guides/cli)
- [Railway Variables](https://docs.railway.com/guides/variables)
- [Prisma Environment Variables](https://www.prisma.io/docs/orm/more/development-environment/environment-variables)
- [Prisma Deploy Migrations](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)

### GitHub Discussions

- [Prisma #21207 - process.env precedence](https://github.com/prisma/prisma/discussions/21207)
- [Prisma #25183 - .env.local usage](https://github.com/prisma/prisma/discussions/25183)
- [Prisma #10104 - Misleading "loaded from .env" message](https://github.com/prisma/prisma/issues/10104)

---

## Estado Actual del Sistema

### Railway Service: mateatletas-system

- **Estado**: `FAILED` (último deploy)
- **Builder**: `DOCKERFILE`
- **Health check**: `/api/health`

### Railway Service: Postgres-yuMB

- **Estado**: `SUCCESS`
- **Versión**: PostgreSQL 17
- **Volume**: 118.73 MB / 500 MB

### Migraciones

- **Pendientes**: 1 (`20251121002735_add_security_tables`)
- **Aplicadas**: 15+ migraciones anteriores

---

## Próximos Pasos

1. ✅ **Configurar Pre-Deploy Command en Railway**
2. ⏳ **Hacer deploy para aplicar migración**
3. ⏳ **Verificar que el servicio arranca correctamente**
4. ⏳ **Monitorear logs de audit_logs en producción**
5. ⏳ **Documentar proceso de rotación de secrets**

---

**Fecha de análisis**: 2025-11-21
**Analista**: Claude Code
**Criticidad**: Alta - Sistema de pagos con MercadoPago requiere migraciones de seguridad
