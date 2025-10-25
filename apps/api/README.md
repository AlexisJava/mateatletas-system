# Mateatletas API

Backend API de Mateatletas construida con NestJS.

## Tecnologías

- **Framework**: NestJS 11
- **Lenguaje**: TypeScript (modo estricto)
- **Validación**: class-validator + class-transformer
- **Configuración**: @nestjs/config

## Estructura

```
src/
├── core/
│   └── config/
│       └── config.module.ts    # Módulo de configuración global
├── app.controller.ts           # Controlador principal
├── app.module.ts              # Módulo raíz
├── app.service.ts             # Servicio principal
└── main.ts                    # Punto de entrada
```

## Scripts

```bash
# Desarrollo
npm run start:dev

# Build de producción
npm run build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Lint
npm run lint
```

## Flujos cubiertos por las pruebas E2E

Las pruebas end-to-end (`apps/api/test/**/*.e2e-spec.ts`) ejercitan los flujos críticos de la API con datos seedados. Los módulos cubiertos actualmente son:

- **Planificaciones** (`test/planificaciones-flujo-completo.e2e-spec.ts`)
  - Login de admin, docente y estudiante utilizando cookies JWT emitidas por `/auth/login` y `/auth/estudiante/login`.
  - Auto-detección y detalle de planificaciones (`GET /planificaciones` y `/planificaciones/:codigo/detalle`).
  - Asignación a grupos pedagógicos y gestión del calendario semanal.
  - Registro de progreso del estudiante y monitoreo docente.
- **Clases** (`test/clases-flujo.e2e-spec.ts`)
  - Programación y cancelación de clases (`POST /clases`, `PATCH /clases/:id/cancelar`).
  - Listados administrativos, agenda docente y calendario de tutores.
- **Pagos** (`test/pagos-endpoints.e2e-spec.ts`)
  - Lectura de configuración e historial de precios (`GET /pagos/configuracion`, `/pagos/historial-cambios`).
  - Métricas financieras, inscripciones pendientes y descuentos activos.
  - Cálculo de precios por tutor y actualización auditada de tarifas.

> ⚠️ **Requisitos**: las pruebas e2e esperan una base de datos PostgreSQL en ejecución con los seeds de `apps/api/prisma/seeds/` y variables de entorno mínimas (`JWT_SECRET`, `FRONTEND_URL`). El archivo `test/test-env.ts` define valores seguros por defecto para ejecutar la suite en entornos locales.

## Configuración

La API usa variables de entorno definidas en el archivo `.env` en la raíz del monorepo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas?schema=public"
JWT_SECRET="tu-secreto-super-seguro"
PORT=3001
```

## Endpoints

### Health Check

```bash
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "timestamp": "2025-10-12T13:14:19.365Z",
  "service": "Mateatletas API"
}
```

### Base

```bash
GET /api
```

Respuesta:

```
Hello World!
```

## Características

- **Global Prefix**: Todas las rutas tienen el prefijo `/api`
- **CORS**: Habilitado para desarrollo
- **Validation Pipe**: Validación automática de DTOs
- **TypeScript Strict**: Modo estricto activado
- **Config Module**: Configuración global de variables de entorno

## Configuración TypeScript

TypeScript está configurado en modo **estricto** con las siguientes opciones:

- `strict`: true
- `strictNullChecks`: true
- `noImplicitAny`: true
- `strictBindCallApply`: true
- `forceConsistentCasingInFileNames`: true
- `noFallthroughCasesInSwitch`: true

## Puerto

La API corre por defecto en http://localhost:3001

## Base de Datos

### Prisma ORM

La API usa **Prisma** como ORM para PostgreSQL:

- **Base de datos**: PostgreSQL 16 (Docker)
- **Puerto**: 5433
- **Credenciales**: Ver `.env`

### Comandos Prisma

```bash
# Crear migración
npx prisma migrate dev --name nombre

# Generar cliente
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

### Endpoints de DB

```bash
GET /api/db-test
# Response: {"status":"Database connected","test_models_count":0}
```

Ver [PRISMA_SETUP.md](./PRISMA_SETUP.md) para documentación completa.

## Próximos Pasos

1. ✅ Configurar base de datos (Prisma + PostgreSQL)
2. Definir modelos de entidades (User, Athlete, Coach)
3. Implementar módulos de autenticación
4. Crear módulos de usuarios, atletas, entrenadores
5. Implementar autorización con Guards
6. Agregar logging y monitoring
