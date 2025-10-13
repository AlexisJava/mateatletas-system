# Mateatletas Ecosystem

Monorepo para la plataforma Mateatletas, construido con Turborepo.

## 📋 Estado del Proyecto

**Fase Actual:** 7 Slices Implementados y Testeados
**Estado:** ✅ Producción Ready (Backend API)

### Slices Completados

| # | Slice | Estado | Tests |
|---|-------|--------|-------|
| 1 | Autenticación (JWT) | ✅ | ✅ |
| 2 | Estudiantes (CRUD) | ✅ | ✅ |
| 3 | Equipos (Gamificación) | ✅ | ✅ |
| 4 | Docentes | ✅ | ✅ |
| 5 | Catálogo de Productos | ✅ | ✅ |
| 6 | Pagos (MercadoPago) | ✅ | ✅ |
| 7 | Clases y Reservas | ✅ | ✅ |

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (para PostgreSQL)

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar PostgreSQL
docker start mateatletas-postgres

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env

# 4. Ejecutar migraciones
cd apps/api && npx prisma migrate dev

# 5. Ejecutar seeds
npx prisma db seed
```

### Desarrollo Local

```bash
# Iniciar todas las aplicaciones
npm run dev

# Solo backend
npm run dev:api

# Solo frontend
npm run dev:web
```

### Testing

```bash
# Test de integración completo
./tests/scripts/test-integration-full.sh

# Tests individuales
./tests/scripts/test-docentes.sh
./tests/scripts/test-catalogo.sh
./tests/scripts/test-clases-simple.sh
./tests/scripts/test-pagos-simple.sh
```

Ver documentación completa: [docs/testing/TESTING_SUMMARY.md](docs/testing/TESTING_SUMMARY.md)

## 📁 Estructura del Proyecto

```
mateatletas-ecosystem/
├── apps/
│   ├── api/              # Backend NestJS (Puerto 3001)
│   └── web/              # Frontend Next.js (Puerto 3000)
├── packages/
│   └── shared/           # Tipos compartidos
├── docs/
│   ├── api-specs/        # Especificaciones de endpoints
│   ├── architecture/     # Diagramas y arquitectura
│   ├── development/      # Guías de desarrollo
│   ├── slices/           # Documentación por slice
│   ├── testing/          # Resultados de testing
│   └── archived/         # Documentos históricos
├── tests/
│   └── scripts/          # Scripts de testing bash
└── README.md             # Este archivo
```

## 🏗️ Tecnologías

### Backend
- **Framework**: NestJS 11
- **Base de Datos**: PostgreSQL 16 + Prisma ORM
- **Autenticación**: JWT (Passport)
- **Validación**: class-validator + class-transformer
- **Pagos**: MercadoPago SDK (mock en desarrollo)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Estilado**: Tailwind CSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios

### DevOps
- **Monorepo**: Turborepo
- **Contenedores**: Docker
- **Linting**: ESLint + Prettier
- **TypeScript**: Modo estricto

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar tutor
- `POST /api/auth/login` - Login con email/password
- `GET /api/auth/profile` - Obtener perfil (protegido)

### Estudiantes
- `GET /api/estudiantes` - Listar (con paginación)
- `POST /api/estudiantes` - Crear
- `GET /api/estudiantes/:id` - Obtener por ID
- `PATCH /api/estudiantes/:id` - Actualizar
- `DELETE /api/estudiantes/:id` - Eliminar

### Equipos
- `GET /api/equipos` - Listar todos
- `POST /api/equipos` - Crear equipo
- `PATCH /api/equipos/:id` - Actualizar
- `GET /api/equipos/estadisticas` - Rankings

### Docentes
- `POST /api/docentes-public` - Registro público
- `GET /api/docentes` - Listar todos (público)
- `GET /api/docentes/me` - Perfil propio
- `PATCH /api/docentes/:id` - Actualizar perfil

### Catálogo
- `GET /api/productos` - Listar productos
- `GET /api/productos/suscripciones` - Solo suscripciones
- `GET /api/productos/cursos` - Solo cursos
- `POST /api/productos` - Crear producto (admin)

### Pagos (MercadoPago)
- `POST /api/pagos/suscripcion` - Crear preferencia de suscripción
- `POST /api/pagos/curso` - Comprar curso
- `GET /api/pagos/membresia` - Ver estado de membresía
- `POST /api/pagos/webhook` - Webhook de MercadoPago

### Clases
- `GET /api/clases/metadata/rutas-curriculares` - Listar rutas
- `POST /api/clases` - Programar clase (admin)
- `GET /api/clases` - Listar disponibles (tutor)
- `POST /api/clases/:id/reservar` - Reservar cupo
- `GET /api/clases/docente/mis-clases` - Clases del docente
- `POST /api/clases/:id/asistencia` - Registrar asistencia

Ver especificaciones completas en [docs/api-specs/](docs/api-specs/)

## 📚 Documentación

### Para Desarrolladores
- [Guía de Inicio Rápido](docs/development/QUICK_START.md)
- [Guía de Construcción](docs/development/guia-de-construccion.md)
- [Setup Inicial](docs/development/setup_inicial.md)
- [Contribuir](docs/development/CONTRIBUTING.md)
- [GitHub Setup](docs/development/GITHUB_SETUP.md)

### Arquitectura
- [Arquitectura de Software](docs/architecture/arquitectura-de-software.md)
- [Arquitectura Fase 1](docs/architecture/ARCHITECTURE_FASE_1.md)
- [Frontend Architecture](docs/architecture/frontend-arquitectura.md)
- [Backend Técnico](docs/architecture/documento-tecnico-del-backend.md)
- [Design System](docs/architecture/design-system.md)

### Testing
- [Resumen de Testing](docs/testing/TESTING_SUMMARY.md)
- Scripts en [tests/scripts/](tests/scripts/)

### Slices Implementados
- [Slice #1: Autenticación](docs/slices/slice-1.md)
- [Slice #2: Estudiantes](docs/slices/slice-2.md)
- [Slice #6: Pagos Summary](docs/slices/SLICE_6_PAGOS_SUMMARY.md)

### Especificaciones API
- [Autenticación](docs/api-specs/Autenticacion.md)
- [Tutores](docs/api-specs/tutores.md)
- [Estudiantes](docs/api-specs/estudiantes.md)
- [Docentes](docs/api-specs/docentes.md)
- [Catálogo](docs/api-specs/catalogo.md)
- [Clases](docs/api-specs/clases.md)
- [Pagos](docs/api-specs/pagos.md)
- [Asistencia](docs/api-specs/asistencia.md)
- [Reservas](docs/api-specs/reserva_clase.md)
- [Gamificación](docs/api-specs/gamificacion_puntos_logros.md)
- [Admin Copilot](docs/api-specs/admin_copiloto.md)

## 🧪 Testing

### Ejecutar Tests

```bash
# Test completo end-to-end
cd /home/alexis/Documentos/Mateatletas-Ecosystem
./tests/scripts/test-integration-full.sh

# Tests por módulo
./tests/scripts/test-docentes.sh
./tests/scripts/test-catalogo.sh
./tests/scripts/test-clases-simple.sh
./tests/scripts/test-pagos-simple.sh
./tests/scripts/test-estudiantes.sh
./tests/scripts/test-equipos.sh
```

### Estado de Tests

✅ **7/7 Slices con tests pasando al 100%**

Ver reporte completo: [docs/testing/TESTING_SUMMARY.md](docs/testing/TESTING_SUMMARY.md)

## 🗄️ Base de Datos

### Modelos Implementados

- **User** - Usuario base (Tutor, Docente, Admin)
- **Tutor** - Extensión de User para tutores
- **Estudiante** - Estudiantes vinculados a tutores
- **Equipo** - Equipos con gamificación
- **Docente** - Extensión de User para docentes
- **Producto** - Catálogo (Suscripciones, Cursos, Recursos)
- **Membresia** - Suscripciones activas de tutores
- **InscripcionCurso** - Inscripciones a cursos
- **Pago** - Registro de pagos
- **RutaCurricular** - 6 rutas matemáticas
- **Clase** - Clases programadas
- **InscripcionClase** - Reservas de cupos
- **Asistencia** - Registro de asistencia

### Migraciones

```bash
# Crear migración
cd apps/api
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Resetear DB (desarrollo)
npx prisma migrate reset
```

### Seeds

```bash
# Ejecutar todos los seeds
cd apps/api
npx prisma db seed

# Seeds disponibles:
# - Productos (2 suscripciones, 2 cursos, 1 recurso)
# - Rutas Curriculares (6 rutas matemáticas)
```

## 🌐 Variables de Entorno

Archivo: `apps/api/.env`

```env
# Base de datos
DATABASE_URL="postgresql://mateatletas:mateatletas123@localhost:5433/mateatletas?schema=public"

# JWT
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRATION="7d"

# Puertos
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# MercadoPago (opcional - usa mock si no está configurado)
MERCADOPAGO_ACCESS_TOKEN="TEST-XXXXXXXX"
MERCADOPAGO_PUBLIC_KEY="TEST-XXXXXXXX"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
```

## 🎯 Próximos Pasos

### Slices Pendientes

- [ ] **Slice #8**: Sistema de Asistencia (expandido)
- [ ] **Slice #9**: Reserva de Clase (mejorado con recordatorios)
- [ ] **Slice #10**: Admin Copilot (dashboard administrativo)

### Mejoras Técnicas

- [ ] Remover `@ts-nocheck` de archivos de clases
- [ ] Estandarizar DTOs (camelCase vs snake_case)
- [ ] Implementar webhook real de MercadoPago
- [ ] Agregar tests unitarios Jest
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar Swagger/OpenAPI docs

### Frontend

- [ ] Páginas de login y registro
- [ ] Dashboard de tutor
- [ ] Vista de clases disponibles
- [ ] Gestión de estudiantes
- [ ] Pasarela de pagos integrada

## 🤝 Contribuir

Lee la [Guía de Contribución](docs/development/CONTRIBUTING.md) para conocer el proceso de desarrollo.

## 📝 Licencia

Este proyecto es privado y propiedad de Mateatletas.

---

**Última actualización:** 13 de Octubre, 2025
**Versión:** 1.0.0 (7 Slices completados)
