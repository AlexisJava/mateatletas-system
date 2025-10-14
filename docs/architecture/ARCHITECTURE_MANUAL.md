# 🏗️ Manual de Arquitectura - Mateatletas Ecosystem

**Versión:** 1.0.0
**Fecha:** 14 de Octubre de 2025
**Autor:** Equipo Técnico Mateatletas
**Estado:** Production-Ready

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura de Alto Nivel](#2-arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Monorepo](#4-estructura-del-monorepo)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Database Design](#7-database-design)
8. [API Design](#8-api-design)
9. [Security Architecture](#9-security-architecture)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. Visión General

### 1.1 Propósito del Sistema

**Mateatletas** es una plataforma SaaS EdTech B2C para enseñanza de matemáticas K-12 con gamificación profunda, diseñada para el mercado latinoamericano.

### 1.2 Características Principales

- **Multi-tenant B2C** - Familias como clientes primarios
- **4 Roles de Usuario** - Tutor, Estudiante, Docente, Admin
- **Dual-mode Learning** - Sincrónico (clases en vivo) + Asincrónico (cursos)
- **Gamificación Profunda** - Equipos, logros, puntos, rankings
- **Monetización Integrada** - Suscripciones + compras one-time

### 1.3 Principios Arquitectónicos

1. **Separation of Concerns** - Módulos independientes por dominio
2. **Type Safety** - TypeScript en frontend y backend
3. **API-First Design** - Backend RESTful, frontend consume
4. **Scalability** - Diseñado para 10,000+ usuarios concurrentes
5. **Security by Design** - JWT, RBAC, validación en cada capa
6. **Developer Experience** - Monorepo, hot-reload, testing automatizado

---

## 2. Arquitectura de Alto Nivel

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (Browsers)                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Portal  │  │  Portal  │  │  Portal  │  │  Portal  │       │
│  │  Tutor   │  │Estudiante│  │ Docente  │  │  Admin   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  React Server Components + Client Components                   │
│  Zustand State Management | TailwindCSS | Framer Motion        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/REST (Port 3001)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API (NestJS)                        │
│  ┌────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐   │
│  │  Auth  │ │ Tutores │ │Estudian│ │ Docentes│ │Productos │   │
│  │ Module │ │ Module  │ │  tes   │ │ Module  │ │ Module   │   │
│  └────────┘ └─────────┘ └────────┘ └─────────┘ └──────────┘   │
│  ┌────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐   │
│  │ Clases │ │Asisten  │ │ Pagos  │ │ Cursos  │ │Gamifica  │   │
│  │ Module │ │  cia    │ │ Module │ │ Module  │ │  ción    │   │
│  └────────┘ └─────────┘ └────────┘ └─────────┘ └──────────┘   │
│                                                                 │
│  Controllers → Services → Repositories (Prisma)                │
│  Guards (JWT, RBAC) | DTOs | Pipes | Filters                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Prisma ORM
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 15)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │ Academic │  │ Commerce │  │   Game   │       │
│  │  Tables  │  │  Tables  │  │  Tables  │  │  Tables  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  21 Tables | 45+ Foreign Keys | ACID Transactions              │
└─────────────────────────────────────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  MercadoPago │  │  Email (TBD) │  │ Analytics    │         │
│  │    Payments  │  │   Resend     │  │  (TBD)       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Patrones Arquitectónicos Aplicados

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| **Monorepo** | Raíz | Gestión unificada de apps/packages |
| **MVC** | Backend | Controllers → Services → Models |
| **Repository** | Backend | Abstracción de acceso a datos (Prisma) |
| **Facade** | Backend | AdminService → Servicios especializados |
| **Server Components** | Frontend | SSR optimizado con Next.js 15 |
| **Module Federation** | Frontend | Portales independientes |
| **DTO Pattern** | Backend | Validación y serialización |
| **Guard Pattern** | Backend | Autenticación y autorización |

---

## 3. Stack Tecnológico

### 3.1 Backend Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18.x | Runtime de JavaScript |
| **NestJS** | 10.x | Framework enterprise |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.x | ORM y migrations |
| **PostgreSQL** | 15.x | Base de datos relacional |
| **JWT** | 9.x | Tokens de autenticación |
| **bcrypt** | 5.x | Hash de contraseñas |
| **class-validator** | 0.14.x | Validación de DTOs |
| **MercadoPago SDK** | Latest | Procesamiento de pagos |

### 3.2 Frontend Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15.x | Framework React con SSR |
| **React** | 19.x | UI components |
| **TypeScript** | 5.x | Type safety |
| **Zustand** | 4.x | State management |
| **TailwindCSS** | 3.x | Utility-first CSS |
| **Framer Motion** | 11.x | Animaciones |
| **Recharts** | 2.x | Gráficos y visualizaciones |
| **React Hook Form** | 7.x | Form management |

### 3.3 DevOps & Tools

| Tecnología | Propósito |
|------------|-----------|
| **Turborepo** | Monorepo build system |
| **ESLint** | Linting |
| **Prettier** | Code formatting |
| **GitHub Actions** | CI/CD |
| **Docker** | Containerización (ready) |
| **Vercel** | Frontend deployment (ready) |
| **Railway** | Backend deployment (ready) |

---

## 4. Estructura del Monorepo

### 4.1 Organización de Directorios

```
Mateatletas-Ecosystem/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── admin/         # Módulo Admin
│   │   │   ├── asistencia/    # Módulo Asistencia
│   │   │   ├── auth/          # Módulo Autenticación
│   │   │   ├── catalogo/      # Módulo Catálogo
│   │   │   ├── clases/        # Módulo Clases
│   │   │   ├── common/        # Utilidades compartidas
│   │   │   ├── core/          # Core (Database, Config)
│   │   │   ├── cursos/        # Módulo Cursos E-Learning
│   │   │   ├── docentes/      # Módulo Docentes
│   │   │   ├── equipos/       # Módulo Equipos
│   │   │   ├── estudiantes/   # Módulo Estudiantes
│   │   │   ├── gamificacion/  # Módulo Gamificación
│   │   │   ├── pagos/         # Módulo Pagos
│   │   │   └── main.ts        # Entry point
│   │   ├── prisma/
│   │   │   ├── migrations/    # Migraciones SQL versionadas
│   │   │   ├── schema.prisma  # Schema de base de datos
│   │   │   └── seed.ts        # Datos iniciales
│   │   ├── test/              # Tests E2E
│   │   └── package.json
│   │
│   └── web/                   # Frontend Next.js
│       ├── src/
│       │   ├── app/           # App Router (Next.js 15)
│       │   │   ├── (auth)/    # Rutas de autenticación
│       │   │   ├── (protected)/
│       │   │   │   ├── admin/      # Portal Admin
│       │   │   │   ├── dashboard/  # Portal Tutor
│       │   │   │   ├── docente/    # Portal Docente
│       │   │   │   └── estudiante/ # Portal Estudiante
│       │   │   └── layout.tsx
│       │   ├── components/    # Componentes reutilizables
│       │   │   ├── ui/        # Componentes base
│       │   │   ├── charts/    # Gráficos
│       │   │   └── effects/   # Animaciones
│       │   ├── hooks/         # Custom React hooks
│       │   ├── store/         # Zustand stores
│       │   └── lib/           # Utilidades
│       └── package.json
│
├── docs/                      # Documentación completa
│   ├── architecture/          # Arquitectura técnica
│   ├── api-specs/            # Especificaciones de API
│   ├── database/             # Diseño de base de datos
│   ├── development/          # Guías de desarrollo
│   ├── slices/               # Documentación de slices
│   └── testing/              # Estrategias de testing
│
├── tests/                     # Scripts de testing E2E
│   ├── scripts/              # Tests backend
│   └── frontend/             # Tests frontend
│
├── turbo.json                 # Configuración Turborepo
├── package.json               # Root package.json
└── .env.example              # Template de variables
```

### 4.2 Convenciones de Naming

**Backend (NestJS):**
```
- Módulos:       nombre.module.ts
- Controllers:   nombre.controller.ts
- Services:      nombre.service.ts
- DTOs:          nombre.dto.ts
- Guards:        nombre.guard.ts
- Decorators:    nombre.decorator.ts
```

**Frontend (Next.js):**
```
- Pages:         page.tsx (App Router)
- Layouts:       layout.tsx
- Components:    PascalCase.tsx
- Stores:        nombre.store.ts
- Hooks:         useNombre.ts
```

---

## 5. Backend Architecture

### 5.1 Módulos Implementados

| Módulo | Responsabilidad | Líneas | Estado |
|--------|----------------|--------|--------|
| **auth** | Autenticación JWT, roles | ~400 | ✅ |
| **tutores** | Gestión de padres/apoderados | ~300 | ✅ |
| **estudiantes** | Gestión de estudiantes | ~450 | ✅ |
| **docentes** | Gestión de profesores | ~350 | ✅ |
| **admin** | Panel administrativo | ~600 | ✅ Refactorizado |
| **catalogo** | Productos (cursos, suscripciones) | ~400 | ✅ |
| **pagos** | MercadoPago integration | ~560 | ✅ |
| **clases** | Reserva y gestión de clases | ~570 | ✅ |
| **asistencia** | Registro de asistencia | ~650 | ✅ |
| **cursos** | E-learning asincrónico | ~620 | ✅ |
| **gamificacion** | Puntos, logros, rankings | ~560 | ✅ |
| **equipos** | Equipos gamificados | ~250 | ✅ |
| **core** | Database, Config, Common | ~500 | ✅ |

**Total Backend:** ~6,210 líneas de código

### 5.2 Arquitectura de Capas (NestJS)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Controllers│  │   Guards   │  │    DTOs    │           │
│  │  (Routes)  │  │  (Auth &   │  │ (Validation│           │
│  │            │  │   RBAC)    │  │  & Types)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Services  │  │  Facades   │  │   Domain   │           │
│  │  (Business │  │ (Orchestr  │  │   Logic    │           │
│  │   Logic)   │  │  ation)    │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Prisma   │  │  Entities  │  │  Queries   │           │
│  │  Service   │  │  (Models)  │  │ (Optimized)│           │
│  │            │  │            │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
                 PostgreSQL
```

### 5.3 Flujo de una Request

```
1. Client HTTP Request
   ↓
2. NestJS Middleware (CORS, Body Parser)
   ↓
3. Guards (JWT Auth, Roles)
   ↓
4. Controller (Route Handler)
   ↓
5. Validation Pipe (DTO validation)
   ↓
6. Service (Business Logic)
   ↓
7. Prisma Client (Database Query)
   ↓
8. PostgreSQL (Data Retrieval)
   ↓
9. Transform Response
   ↓
10. Exception Filter (Error Handling)
   ↓
11. HTTP Response to Client
```

### 5.4 Dependency Injection

Todos los módulos utilizan el sistema de DI de NestJS:

```typescript
@Module({
  imports: [DatabaseModule],        // Módulos compartidos
  controllers: [PagosController],    // HTTP endpoints
  providers: [
    PagosService,                    // Business logic
    ProductosService,                // Dependencias
  ],
  exports: [PagosService],           // Exportar para otros módulos
})
export class PagosModule {}
```

---

## 6. Frontend Architecture

### 6.1 App Router Structure (Next.js 15)

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
│
├── (auth)/                    # Auth group (sin layout protegido)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
└── (protected)/               # Protected group (con auth)
    ├── layout.tsx             # Protected layout (auth required)
    │
    ├── dashboard/             # Portal Tutor
    │   ├── page.tsx           # Dashboard principal
    │   ├── estudiantes/
    │   ├── pagos/
    │   └── reservas/
    │
    ├── estudiante/            # Portal Estudiante
    │   ├── page.tsx           # Dashboard gamificado
    │   ├── logros/
    │   ├── ranking/
    │   └── cursos/
    │
    ├── docente/               # Portal Docente
    │   ├── page.tsx
    │   ├── clases/
    │   └── asistencia/
    │
    └── admin/                 # Portal Admin
        ├── page.tsx
        ├── usuarios/
        ├── productos/
        └── estadisticas/
```

### 6.2 Component Architecture

```
components/
├── ui/                        # Componentes base reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Modal.tsx
│
├── charts/                    # Visualizaciones de datos
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   └── PieChart.tsx
│
├── effects/                   # Efectos visuales
│   ├── FloatingParticles.tsx
│   ├── Confetti.tsx
│   └── GlowingBadge.tsx
│
└── layout/                    # Componentes de layout
    ├── Navbar.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

### 6.3 State Management (Zustand)

```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    const response = await fetch('/api/auth/login', ...);
    set({ user: response.user, token: response.token });
  },
  logout: () => set({ user: null, token: null }),
}));
```

**Stores implementados:**
- `auth.store.ts` - Autenticación
- `catalogo.store.ts` - Productos
- `estudiantes.store.ts` - Estudiantes del tutor
- `cursos.store.ts` - Cursos y progreso
- `gamificacion.store.ts` - Puntos y logros
- `clases.store.ts` - Reservas de clases
- `admin.store.ts` - Panel admin

### 6.4 Data Fetching Pattern

```typescript
// Server Component (fetch en servidor)
async function DashboardPage() {
  const stats = await fetch('http://localhost:3001/api/admin/stats', {
    cache: 'no-store' // Datos frescos
  });

  return <StatsDisplay data={stats} />;
}

// Client Component (fetch en cliente con Zustand)
'use client';
function StudentLogros() {
  const { logros, fetchLogros } = useGamificacionStore();

  useEffect(() => {
    fetchLogros();
  }, []);

  return <LogrosList logros={logros} />;
}
```

---

## 7. Database Design

### 7.1 Schema Overview (21 Modelos)

```prisma
// USUARIOS (4 modelos)
model Tutor { ... }
model Estudiante { ... }
model Docente { ... }
model Admin { ... }

// ACADÉMICO (4 modelos)
model RutaCurricular { ... }
model Clase { ... }
model InscripcionClase { ... }
model Asistencia { ... }

// E-LEARNING (3 modelos)
model Modulo { ... }
model Leccion { ... }
model ProgresoLeccion { ... }

// COMERCIAL (3 modelos)
model Producto { ... }
model Membresia { ... }
model InscripcionCurso { ... }

// GAMIFICACIÓN (6 modelos)
model Equipo { ... }
model AccionPuntuable { ... }
model PuntoObtenido { ... }
model Logro { ... }
model LogroDesbloqueado { ... }
model Alerta { ... }

// TEST (1 modelo)
model TestModel { ... }
```

### 7.2 Relaciones Clave

```
Tutor (1) ──────> (N) Estudiante
Estudiante (N) ──> (1) Equipo
Estudiante (N) ──> (N) Clase (via InscripcionClase)
Estudiante (1) ──> (N) Asistencia
Estudiante (1) ──> (N) ProgresoLeccion
Estudiante (1) ──> (N) LogroDesbloqueado

Docente (1) ────> (N) Clase
Clase (N) ──────> (1) RutaCurricular

Producto (1) ───> (N) Membresia
Producto (1) ───> (N) InscripcionCurso
Producto (1) ───> (N) Modulo
Modulo (1) ─────> (N) Leccion
```

### 7.3 Índices y Performance

```prisma
model Estudiante {
  id String @id @default(cuid())
  email String? @unique              // ← Índice único
  tutor_id String
  equipo_id String

  @@index([tutor_id])                // ← Índice compuesto
  @@index([equipo_id])
  @@map("estudiantes")
}

model ProgresoLeccion {
  estudiante_id String
  leccion_id String

  @@id([estudiante_id, leccion_id]) // ← Primary key compuesta
  @@unique([estudiante_id, leccion_id])
}
```

### 7.4 Migraciones (Versionadas)

```
prisma/migrations/
├── 20251012132133_init/
├── 20251012134731_create_tutor_model/
├── 20251012173206_create_estudiante_equipo/
├── 20251012231854_add_docente_model/
├── 20251012233723_create_productos/
├── 20251012234351_create_membresias_inscripciones/
├── 20251013002021_create_clases_inscripciones_asistencia/
├── 20251013121713_add_alertas_model/
├── 20251013122322_add_admin_model/
└── 20251013215600_add_gamification_tables/

Total: 10 migraciones versionadas en Git
```

---

## 8. API Design

### 8.1 Convenciones RESTful

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/resource` | Listar todos |
| GET | `/api/resource/:id` | Obtener uno |
| POST | `/api/resource` | Crear nuevo |
| PATCH | `/api/resource/:id` | Actualizar parcial |
| PUT | `/api/resource/:id` | Actualizar completo |
| DELETE | `/api/resource/:id` | Eliminar |

### 8.2 Endpoints por Módulo

**Auth Module (7 endpoints):**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/estudiante/login
POST   /api/auth/docente/register
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
```

**Pagos Module (6 endpoints):**
```
POST   /api/pagos/suscripcion
POST   /api/pagos/curso
POST   /api/pagos/webhook
GET    /api/pagos/membresia
GET    /api/pagos/membresia/:id/estado
GET    /api/pagos/inscripciones
```

**Clases Module (15 endpoints):**
```
GET    /api/clases
GET    /api/clases/:id
POST   /api/clases
PATCH  /api/clases/:id
DELETE /api/clases/:id
POST   /api/clases/:id/reservar
DELETE /api/clases/:id/cancelar-reserva
GET    /api/clases/tutor/:tutorId/reservas
GET    /api/clases/estudiante/:estudianteId
GET    /api/clases/docente/mis-clases
POST   /api/clases/:id/cancelar
GET    /api/clases/rutas
GET    /api/clases/rutas/:id
GET    /api/clases/rutas/:id/progreso/:estudianteId
GET    /api/clases/disponibles
```

**Total:** ~120+ endpoints

### 8.3 Response Format

**Success (200):**
```json
{
  "id": "cuid...",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "createdAt": "2025-10-14T10:00:00.000Z"
}
```

**Error (4xx/5xx):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "email must be an email",
    "password must be longer than 8 characters"
  ]
}
```

### 8.4 Authentication Flow

```
1. Client: POST /api/auth/login
   Body: { email, password }

2. Server: Validate credentials
   - Hash password with bcrypt
   - Compare with DB

3. Server: Generate JWT
   Payload: { sub: userId, email, role }
   Secret: JWT_SECRET (env)
   Expiry: 7 days (configurable)

4. Server: Response
   {
     "access_token": "eyJhbGc...",
     "user": { id, email, nombre, role }
   }

5. Client: Store token in Zustand
   - Use in Authorization header
   - Bearer token for all protected requests

6. Server: Validate JWT (JwtAuthGuard)
   - Verify signature
   - Check expiry
   - Extract user payload
   - Attach to request.user
```

---

## 9. Security Architecture

### 9.1 Authentication & Authorization

**JWT Strategy:**
```typescript
// apps/api/src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
```

**RBAC (Role-Based Access Control):**
```typescript
// Roles disponibles
export enum Role {
  Tutor = 'tutor',
  Estudiante = 'estudiante',
  Docente = 'docente',
  Admin = 'admin',
}

// Uso en controllers
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/usuarios')
async listarUsuarios() { ... }
```

### 9.2 Input Validation

**DTOs con class-validator:**
```typescript
export class CrearAlertaDto {
  @IsUUID('4')
  @IsNotEmpty()
  estudianteId!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  descripcion!: string;
}
```

**Global Validation Pipe:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Remover props no declaradas
  forbidNonWhitelisted: true, // Error si props extra
  transform: true,           // Auto-transformar tipos
}));
```

### 9.3 Password Security

```typescript
// Hash en registro
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Validación en login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 9.4 Webhook Security (MercadoPago)

```typescript
// Validación HMAC
const manifest = `id:${dataId};request-id:${requestId};`;
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(manifest)
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

### 9.5 SQL Injection Prevention

**Prisma ORM** previene SQL injection automáticamente:
```typescript
// ✅ SEGURO (Prisma escapa automáticamente)
await prisma.estudiante.findMany({
  where: { email: userInput }
});

// ❌ INSEGURO (Raw SQL sin Prisma)
await prisma.$queryRaw`SELECT * FROM estudiantes WHERE email = ${userInput}`;
```

### 9.6 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
```

---

## 10. Deployment Architecture

### 10.1 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Application
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://mateatletas.com"
BACKEND_URL="https://api.mateatletas.com"

# Auth
JWT_SECRET="secure-random-string-32-chars"
JWT_EXPIRES_IN="7d"

# Payments
MERCADOPAGO_ACCESS_TOKEN="APP-XXXXX"
MERCADOPAGO_WEBHOOK_SECRET="base64-secret"
```

### 10.2 Deployment Strategy

**Frontend (Vercel):**
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.mateatletas.com"
  }
}
```

**Backend (Railway/Render):**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

**Database (Supabase/Railway):**
- PostgreSQL 15 managed
- Backups automáticos diarios
- SSL enabled
- Connection pooling

### 10.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres: ...
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies
      - Run Prisma migrations
      - Run unit tests
      - Generate coverage

  build:
    needs: test
    steps:
      - Build apps/api
      - Build apps/web
```

### 10.4 Scalability Considerations

**Horizontal Scaling:**
- Backend stateless (multiple instances)
- Load balancer (NGINX/Cloudflare)
- Sticky sessions NO requeridas (JWT)

**Database Optimization:**
- Connection pooling (Prisma)
- Read replicas (futuro)
- Caching layer (Redis - futuro)

**CDN:**
- Assets estáticos en Vercel Edge
- Images optimizadas con Next.js Image

---

## 📚 Referencias Adicionales

- [API Specifications](../api-specs/) - Especificaciones detalladas de cada módulo
- [Database Design](../database/) - Schema y migraciones
- [Development Guide](../development/) - Guía de desarrollo
- [Testing Strategy](../testing/) - Estrategia de testing

---

**Fin del Manual de Arquitectura**

**Versión:** 1.0.0
**Última actualización:** 14 de Octubre de 2025
**Mantenido por:** Equipo Técnico Mateatletas
