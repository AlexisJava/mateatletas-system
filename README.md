# Mateatletas Ecosystem

Plataforma educativa de matemáticas con gamificación, clases en vivo, y múltiples portales.

**Monorepo: Turborepo + NestJS + Next.js + PostgreSQL**

---

## Estado del Proyecto

**Versión:** 2.0.0 (Enero 2026)
**Estado:** PRODUCTION READY

| Componente        | Estado | Detalles                                      |
| ----------------- | ------ | --------------------------------------------- |
| Backend API       | 95%    | 41 módulos, 32 controllers, 69 modelos Prisma |
| Frontend Web      | 90%    | 4 portales funcionales                        |
| Base de Datos     | 100%   | 5 migraciones aplicadas, schema sincronizado  |
| Tests Integración | 95+    | 17 suites de tests                            |
| Gamificación      | 100%   | XP, rachas, logros, feed de actividad         |
| Aula Virtual      | 100%   | LiveKit, planificaciones, progreso            |

---

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo>
cd Mateatletas-Ecosystem
yarn install

# 2. Configurar base de datos
cd apps/api
cp .env.example .env
# Editar DATABASE_URL en .env

# 3. Aplicar migraciones
npx prisma migrate deploy
npx prisma generate

# 4. Iniciar desarrollo
yarn dev
```

**URLs de desarrollo:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs

---

## Arquitectura

```
Mateatletas-Ecosystem/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── admin/       # Panel administrativo
│   │   │   ├── auth/        # Autenticación JWT (4 roles)
│   │   │   ├── estudiantes/ # Portal estudiante + Aula Virtual
│   │   │   ├── docentes/    # Portal docente
│   │   │   ├── livekit/     # Videollamadas en vivo
│   │   │   ├── gamificacion/# XP, logros, rachas
│   │   │   └── ...          # 35+ módulos más
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 69 modelos, 3210 líneas
│   │   │   └── migrations/      # 5 migraciones
│   │   └── test/
│   │       ├── integration/     # 17 suites
│   │       └── utils/           # Helpers y factories
│   └── web/                 # Frontend Next.js 15
│       └── src/
│           ├── app/         # App Router
│           └── components/  # UI Components
├── packages/
│   └── contracts/           # DTOs compartidos
└── docs/                    # Documentación técnica
```

---

## Stack Tecnológico

### Backend

- **Framework:** NestJS 10 + TypeScript
- **ORM:** Prisma 6
- **Database:** PostgreSQL 15
- **Cache:** Redis (Keyv) con fallback a memoria
- **Queues:** BullMQ
- **Auth:** JWT con cookies HttpOnly
- **Video:** LiveKit
- **Docs:** Swagger/OpenAPI

### Frontend

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **State:** React Query + Zustand
- **Animations:** Framer Motion
- **3D:** Ready Player Me avatars

### Testing

- **Unit:** Jest
- **Integration:** Supertest + PostgreSQL real
- **E2E:** Base de datos de test aislada

---

## Módulos Principales

### Portal Estudiante

Sistema completo de aula virtual con gamificación.

| Feature           | Estado | Descripción                          |
| ----------------- | ------ | ------------------------------------ |
| Aula Virtual      | 100%   | Clases, lecciones, teoría + práctica |
| Gamificación      | 100%   | XP, niveles, rachas, logros          |
| Feed de Actividad | 100%   | Ver compañeros, reacciones           |
| Avatar 3D         | 100%   | Ready Player Me integration          |
| LiveKit           | 100%   | Clases en vivo con video             |

### Portal Admin

Gestión completa de la plataforma.

| Feature    | Estado | Descripción                         |
| ---------- | ------ | ----------------------------------- |
| Dashboard  | 100%   | Stats, actividad reciente           |
| Usuarios   | 100%   | CRUD estudiantes, docentes, tutores |
| Productos  | 100%   | Catálogo, precios                   |
| Finanzas   | 90%    | Inscripciones, pagos                |
| Contenidos | 100%   | Libros, bloques, niveles            |

### Portal Docente

Herramientas para profesores.

| Feature         | Estado | Descripción                |
| --------------- | ------ | -------------------------- |
| Clases          | 100%   | Ver programación, alumnos  |
| Asistencia      | 100%   | Registro con observaciones |
| Planificaciones | 100%   | Asignar contenido a clases |

### Portal Tutor

Para padres y responsables.

| Feature       | Estado | Descripción           |
| ------------- | ------ | --------------------- |
| Estudiantes   | 100%   | Ver progreso de hijos |
| Inscripciones | 100%   | Gestionar membresías  |
| Pagos         | 100%   | MercadoPago integrado |

---

## Base de Datos

### Modelos Principales (69 total)

**Usuarios:**

- Estudiante, Tutor, Docente, Admin

**Educación:**

- Libro, Bloque, Nivel, Contenido
- ClaseGrupo, Planificacion, ClasePlanificacion

**Gamificación:**

- RecursosEstudiante (XP, monedas, rachas)
- LogroGamificacion, LogrosEstudiantesGamificacion
- ActividadFeed, ReaccionFeed

**Comercio:**

- Producto, Suscripcion, Pago
- InscripcionClaseGrupo, InscripcionMensual

### Migraciones Aplicadas

| Migración                | Descripción                    |
| ------------------------ | ------------------------------ |
| 0_init                   | Schema inicial completo        |
| 20260106_add_livekit     | LiveKit para comisiones        |
| 20260107_planificaciones | Sistema de planificaciones     |
| 20260108_actividad_feed  | Feed de actividad + reacciones |
| 20260109_fix_contenido   | Nullable creador_id            |

---

## Testing

### Ejecutar Tests

```bash
# Levantar DB de test
docker-compose -f docker-compose.test.yml up -d

# Aplicar migraciones a DB test
DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" \
npx prisma migrate deploy

# Correr tests de integración
yarn workspace api test:e2e --runInBand

# Correr suite específica
yarn workspace api test --testPathPattern="activity-feed.integration" --runInBand
```

### Suites de Integración

| Suite         | Tests | Descripción                   |
| ------------- | ----- | ----------------------------- |
| auth/         | 20+   | Login, tokens, roles          |
| estudiantes/  | 50+   | Aula virtual, feed, lecciones |
| admin/        | 30+   | CRUD usuarios, productos      |
| gamificacion/ | 15+   | XP, logros, rankings          |

---

## Desarrollo

### Comandos Principales

```bash
# Desarrollo
yarn dev                    # Backend + Frontend
yarn workspace api dev      # Solo backend
yarn workspace web dev      # Solo frontend

# Build
yarn build                  # Todo
yarn workspace api build    # Solo backend

# Lint y Types
yarn lint                   # ESLint
yarn typecheck              # TypeScript

# Tests
yarn test                   # Unit tests
yarn test:e2e               # Integration tests
```

### Migraciones de Base de Datos

**IMPORTANTE:** Siempre hacer backup antes de migrar.

```bash
# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes (SEGURO)
npx prisma migrate deploy

# Crear nueva migración (CUIDADO - puede resetear DB)
# Hacer backup primero:
pg_dump -U postgres mateatletas_dev > backup.sql
npx prisma migrate dev --name descripcion
```

---

## Configuración de Entorno

### Variables Requeridas (Backend)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mateatletas_dev"

# Auth
JWT_SECRET="secret-seguro-de-produccion"
JWT_EXPIRATION="7d"

# Frontend
FRONTEND_URL="http://localhost:3000"

# LiveKit (opcional para desarrollo)
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."
LIVEKIT_URL="wss://..."

# MercadoPago (opcional para desarrollo)
MERCADOPAGO_ACCESS_TOKEN="..."
```

---

## Deploy

### Backend (Railway)

```bash
# El Dockerfile está listo
git push origin main
# Railway auto-deploys desde main
```

### Frontend (Vercel)

```bash
vercel --prod
# Configurar NEXT_PUBLIC_API_URL en Vercel
```

---

## Contribución

### Git Flow

- `main` - Producción
- `dev` - Desarrollo
- `feature/*` - Features nuevas
- `fix/*` - Bug fixes

### Commit Convention

```
tipo(scope): descripción

Ejemplos:
feat(estudiantes): agregar feed de actividad
fix(auth): corregir refresh token
test(integration): agregar tests de aula virtual
```

### Checklist PR

- [ ] Tests pasan (`yarn test:e2e --runInBand`)
- [ ] Build compila (`yarn build`)
- [ ] Lint sin errores (`yarn lint`)
- [ ] Migraciones incluidas si hay cambios de schema

---

## Contacto

**Desarrollo:** Claude Code + Alexis
**Última actualización:** 9 de Enero de 2026
**Versión:** 2.0.0

---

**Made with NestJS, Next.js, and Claude Code**
