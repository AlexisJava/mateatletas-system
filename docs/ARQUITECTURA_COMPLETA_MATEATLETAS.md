# ARQUITECTURA COMPLETA - MATEATLETAS ECOSYSTEM

**Fecha:** 30 de Octubre, 2025
**Propósito:** Análisis exhaustivo de la arquitectura para implementar sistema de notificaciones robusto

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura General](#2-arquitectura-general)
3. [Backend - NestJS](#3-backend---nestjs)
4. [Frontend - Next.js 14](#4-frontend---nextjs-14)
5. [Base de Datos PostgreSQL](#5-base-de-datos-postgresql)
6. [Portales y Rutas](#6-portales-y-rutas)
7. [Estado Global y Data Fetching](#7-estado-global-y-data-fetching)
8. [UI/UX y Componentes](#8-uiux-y-componentes)
9. [Sistema de Eventos y Logs](#9-sistema-de-eventos-y-logs)
10. [Sistema de Autenticación](#10-sistema-de-autenticación)
11. [Recomendaciones para Notificaciones](#11-recomendaciones-para-notificaciones)

---

## 1. RESUMEN EJECUTIVO

### Tecnologías Principales

**Monorepo:**
- **Gestor:** npm workspaces (v10.2.4)
- **Build Tool:** Turbo (v2.0.0)
- **Node:** >= 18.0.0

**Frontend:**
- **Framework:** Next.js 15.5.4 (App Router)
- **React:** 19.1.0
- **Compiler:** Turbopack
- **UI Library:** Custom components + Lucide Icons
- **Styling:** Tailwind CSS 4.0
- **State Management:** Zustand 5.0.8
- **Data Fetching:** Axios 1.12.2 + React Query 5.90.5
- **Animations:** Framer Motion 12.23.24
- **Charts:** Chart.js 4.5.1 + Recharts 3.2.1
- **Validación:** Zod 3.25.76
- **Testing:** Vitest 4.0.3 + Playwright 1.56.0

**Backend:**
- **Framework:** NestJS 11.0.1
- **Node:** TypeScript 5.7.3
- **ORM:** Prisma 6.17.1
- **Database:** PostgreSQL
- **Auth:** JWT + Passport (cookies httpOnly)
- **Cache:** Redis (fallback a memoria)
- **Validation:** class-validator + class-transformer
- **Logging:** Winston 3.18.3 (rotación diaria)
- **Security:** Helmet, CSRF Protection, Rate Limiting (Throttler)
- **Payments:** MercadoPago 2.9.0
- **Testing:** Jest 30.0.0

**Shared:**
- **Package:** @mateatletas/contracts (schemas Zod compartidos)

### Arquitectura

```
mateatletas/
├── apps/
│   ├── web/          # Frontend Next.js 14 (Puerto 3000)
│   └── api/          # Backend NestJS (Puerto 3001)
├── packages/
│   └── contracts/    # Schemas Zod compartidos
├── scripts/          # Scripts de utilidad
└── docs/            # Documentación
```

---

## 2. ARQUITECTURA GENERAL

### Flujo de Autenticación

```
[Usuario]
   ↓ login
[Frontend Next.js:3000]
   ↓ POST /api/auth/login (axios con withCredentials: true)
[Backend NestJS:3001]
   ↓ JwtStrategy valida credenciales
   ↓ Genera JWT token
   ↓ Set-Cookie: auth_token (httpOnly, secure, sameSite)
[Response con user data]
   ↓
[Frontend guarda user en Zustand store]
   ↓
[Todas las requests subsecuentes envían cookie automáticamente]
```

### Flujo de Data Fetching

**Patrón Actual (Migración en progreso):**

1. **Zustand Store (Legacy):** Estado global simple
2. **React Query (Moderno):** Cache, invalidación automática, polling

**Ejemplo Portal Docente (Notificaciones):**
```
[Componente NotificationCenter]
   ↓
[useNotificationCenter hook] (React Query)
   ↓ cada 30s polling
[notificaciones.api.ts]
   ↓ axios.get('/api/notificaciones')
[Backend NotificacionesController]
   ↓
[NotificacionesService]
   ↓
[Prisma Client]
   ↓
[PostgreSQL]
```

---

## 3. BACKEND - NESTJS

### 3.1. Estructura de Directorios

```
apps/api/src/
├── app.module.ts                    # Módulo raíz
├── main.ts                          # Entry point
│
├── auth/                            # Autenticación y autorización
│   ├── guards/                      # JWT, Roles, Token Blacklist
│   ├── strategies/                  # Passport JWT + role handlers
│   ├── decorators/                  # @GetUser, @Roles, @Public
│   └── auth.service.ts
│
├── core/                            # Configuración core
│   ├── config/                      # Variables de entorno
│   └── database/                    # Prisma service
│
├── common/                          # Utilidades compartidas
│   ├── guards/                      # CSRF, Throttler personalizado
│   ├── interceptors/                # Logging interceptor
│   ├── filters/                     # Exception filters
│   ├── logger/                      # Winston logger service
│   ├── cache/                       # Redis cache module
│   ├── circuit-breaker/             # Patrón circuit breaker
│   └── validators/                  # Custom validators
│
├── admin/                           # CRUD admin (usuarios, clases, etc.)
│   └── services/
│       ├── admin.service.ts
│       ├── admin-estudiantes.service.ts
│       └── admin-credenciales.service.ts
│
├── estudiantes/                     # Gestión de estudiantes
├── docentes/                        # Gestión de docentes
├── tutor/                           # Gestión de tutores (padres)
│
├── clases/                          # Sistema de clases
│   └── services/
│       ├── clases-management.service.ts
│       ├── clases-reservas.service.ts
│       └── clases-asistencia.service.ts
│
├── asistencia/                      # Registro de asistencias
├── equipos/                         # Equipos de gamificación
├── catalogo/                        # Catálogo de productos
├── pagos/                           # Sistema de pagos (MercadoPago)
│   ├── application/                 # Use cases
│   ├── domain/                      # Lógica de negocio
│   ├── infrastructure/              # Adapters
│   └── presentation/                # Controllers y DTOs
│
├── gamificacion/                    # Sistema de gamificación
│   ├── controllers/
│   └── services/
│       └── verificador-logros.service.ts
│
├── cursos/                          # Sistema de cursos y lecciones
├── notificaciones/                  # Sistema de notificaciones
│   ├── notificaciones.controller.ts
│   ├── notificaciones.service.ts
│   └── dto/
│
├── eventos/                         # Calendario y eventos (docentes)
│   ├── eventos.controller.ts
│   └── eventos.service.ts
│
├── planificaciones-simples/         # Sistema de planificaciones
├── tienda/                          # Tienda virtual (recursos, items)
└── health/                          # Health checks
```

### 3.2. Módulos Principales

**Módulos Registrados en AppModule:**

1. **ThrottlerModule** - Rate limiting (100 req/min prod, 1000 dev)
2. **AppConfigModule** - Configuración de entorno
3. **DatabaseModule** - Prisma ORM
4. **LoggerModule** - Winston logging estructurado
5. **CacheConfigModule** - Redis cache (fallback memoria)
6. **AuthModule** - Autenticación JWT
7. **EstudiantesModule** - CRUD estudiantes
8. **EquiposModule** - CRUD equipos
9. **DocentesModule** - CRUD docentes
10. **CatalogoModule** - CRUD productos
11. **PagosModule** - Integración MercadoPago
12. **TutorModule** - CRUD tutores
13. **ClasesModule** - Sistema de clases
14. **AsistenciaModule** - Registro de asistencias
15. **AdminModule** - Panel administrativo
16. **GamificacionModule** - Sistema de gamificación
17. **CursosModule** - Cursos y lecciones
18. **NotificacionesModule** - Notificaciones (exportado para uso en otros módulos)
19. **EventosModule** - Calendario de eventos
20. **PlanificacionesSimplesModule** - Planificaciones pedagógicas
21. **TiendaModule** - Tienda virtual
22. **HealthModule** - Monitoreo de salud

### 3.3. Guards Globales

Aplicados en orden:

1. **CsrfProtectionGuard** - Protección CSRF
2. **TokenBlacklistGuard** - Valida tokens no invalidados
3. **UserThrottlerGuard** - Rate limiting por user.id o IP

### 3.4. Interceptors Globales

- **LoggingInterceptor** - Registra todas las requests HTTP con duración

### 3.5. Endpoints Clave (Notificaciones)

**Base:** `/api/notificaciones`

| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| GET | `/` | Docente | Listar notificaciones (query: soloNoLeidas) |
| GET | `/count` | Docente | Contar no leídas |
| PATCH | `/:id/leer` | Docente | Marcar como leída |
| PATCH | `/leer-todas` | Docente | Marcar todas leídas |
| DELETE | `/:id` | Docente | Eliminar notificación |

### 3.6. Sistema de Logging

**Winston Logger:**
- Logs estructurados con contexto
- Rotación diaria de archivos
- Niveles: error, warn, info, http, debug
- Metadata con userId, userRole, operation, etc.

**Uso:**
```typescript
this.logger.log('Operación exitosa', { userId, operation: 'crear_clase' });
this.logger.error('Error en validación', error);
```

---

## 4. FRONTEND - NEXT.JS 14

### 4.1. Estructura de Directorios

```
apps/web/src/
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout
│   ├── (landing)/                   # Landing page (grupo de rutas)
│   ├── login/                       # Página de login
│   ├── register/                    # Página de registro
│   │
│   ├── admin/                       # Portal Admin
│   │   ├── layout.tsx               # Layout con sidebar OS
│   │   ├── dashboard/page.tsx
│   │   ├── usuarios/page.tsx
│   │   ├── credenciales/page.tsx
│   │   ├── clases/page.tsx
│   │   ├── estudiantes/page.tsx
│   │   ├── planificaciones/page.tsx
│   │   ├── pagos/page.tsx
│   │   └── reportes/page.tsx
│   │
│   ├── docente/                     # Portal Docente
│   │   ├── layout.tsx               # Layout glassmorphism
│   │   ├── dashboard/page.tsx
│   │   ├── calendario/page.tsx
│   │   ├── observaciones/page.tsx
│   │   ├── planificaciones/page.tsx
│   │   ├── grupos/[id]/page.tsx
│   │   └── clases/[id]/asistencia/page.tsx
│   │
│   ├── estudiante/                  # Portal Estudiante
│   │   ├── layout.tsx               # Auth guard + avatar check
│   │   ├── crear-avatar/page.tsx    # Ready Player Me
│   │   ├── gimnasio/page.tsx        # Hub principal (Brawl Stars)
│   │   │   ├── components/
│   │   │   ├── views/               # HubView, NotificacionesView, etc.
│   │   │   ├── hooks/
│   │   │   └── contexts/
│   │   └── planificaciones/
│   │       └── [codigo]/page.tsx
│   │
│   └── (protected)/                 # Rutas protegidas legacy
│       ├── dashboard/
│       ├── catalogo/
│       ├── clases/
│       └── membresia/
│
├── components/                      # Componentes compartidos
│   ├── ui/                          # Componentes base
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   └── Toast.tsx
│   │
│   ├── admin/                       # Componentes del portal admin
│   ├── docente/                     # Componentes del portal docente
│   │   └── NotificationCenter.tsx   # Sistema de notificaciones
│   │
│   └── calendario/                  # Componentes de calendario
│
├── features/                        # Features modulares (admin)
│   └── admin/
│       ├── dashboard/
│       │   └── store/dashboard.store.ts
│       ├── stats/
│       ├── users/
│       ├── products/
│       └── classes/
│
├── lib/                             # Utilidades y configuración
│   ├── api/                         # Clientes API (19 archivos)
│   │   ├── auth.api.ts
│   │   ├── admin.api.ts
│   │   ├── estudiantes.api.ts
│   │   ├── docentes.api.ts
│   │   ├── clases.api.ts
│   │   ├── notificaciones.api.ts
│   │   ├── calendario.api.ts
│   │   ├── gamificacion.api.ts
│   │   ├── pagos.api.ts
│   │   └── ...
│   │
│   ├── hooks/                       # Custom hooks
│   │   └── useNotificaciones.ts     # React Query hooks
│   │
│   ├── schemas/                     # Schemas Zod
│   ├── axios.ts                     # Cliente axios configurado
│   └── theme/                       # ThemeContext (dark mode)
│
└── store/                           # Stores Zustand (19 archivos)
    ├── auth.store.ts                # Estado de autenticación
    ├── notificaciones.store.ts      # Notificaciones (deprecado)
    ├── admin.store.ts
    ├── docente.store.ts
    ├── estudiantes.store.ts
    ├── clases.store.ts
    ├── gamificacion.store.ts
    └── ...
```

### 4.2. Configuración de Axios

**Archivo:** `lib/axios.ts`

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true,  // ⚠️ CRÍTICO: Envía cookies httpOnly
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,  // ⚠️ Retorna solo data
  (error) => {
    if (error.response?.status === 401) {
      // Redirige a login si no está en página de auth
      if (!isAuthPage) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Importante:**
- `withCredentials: true` es esencial para cookies httpOnly
- El interceptor retorna `response.data` directamente
- Redirección automática a `/login` en 401

### 4.3. Patrón de API Client

**Ejemplo:** `lib/api/notificaciones.api.ts`

```typescript
export async function getNotificaciones(soloNoLeidas?: boolean) {
  const params = soloNoLeidas ? { soloNoLeidas: 'true' } : {};
  const response = await apiClient.get('/notificaciones', { params });

  // Validar con Zod
  return notificacionesListSchema.parse(response);
}
```

**Características:**
- Todas las funciones son async
- Validación con Zod en todas las responses
- Type-safe con TypeScript
- Error handling centralizado en interceptor

---

## 5. BASE DE DATOS POSTGRESQL

### 5.1. Modelos Principales (Prisma Schema)

#### **Usuarios del Sistema**

| Modelo | Descripción | Roles | Campos Clave |
|--------|-------------|-------|--------------|
| **Tutor** | Padres/Tutores | `["tutor"]` | username, email, password_hash, roles |
| **Estudiante** | Alumnos | `["estudiante"]` | username, email, password_hash, avatar_url, equipo_id |
| **Docente** | Profesores | `["docente"]`, `["docente", "admin"]` | email, password_hash, roles, disponibilidad_horaria |
| **Admin** | Administradores | `["admin"]`, `["admin", "docente"]` | email, password_hash, roles |

**Multi-Rol:**
- Docentes pueden ser admin simultáneamente
- Admins pueden ser docente simultáneamente
- Campo `roles` es JSON array: `["docente", "admin"]`

#### **Sistema de Clases**

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **Clase** | Clase one-time programada | docente, producto?, rutaCurricular?, sector? |
| **ClaseGrupo** | Grupo recurrente (comisión) | grupo, docente, rutaCurricular?, sector |
| **InscripcionClase** | Reserva de estudiante a Clase | estudiante, tutor, clase |
| **InscripcionClaseGrupo** | Inscripción a ClaseGrupo | estudiante, tutor, claseGrupo |
| **Asistencia** | Asistencia a Clase | estudiante, clase |
| **AsistenciaClaseGrupo** | Asistencia a ClaseGrupo en fecha específica | estudiante, claseGrupo, fecha |

#### **Gamificación**

| Modelo | Descripción |
|--------|-------------|
| **Equipo** | Equipos (Fénix, Dragón, Tigre, Águila) |
| **LogroEstudiante** | Logros desbloqueados |
| **RachaEstudiante** | Racha de días consecutivos |
| **PuntosPadre** | Puntos acumulados del padre/tutor |
| **RecursosEstudiante** | XP, monedas, gemas |
| **ItemObtenido** | Items comprados en tienda |

#### **Notificaciones**

```prisma
model Notificacion {
  id         String           @id @default(cuid())
  tipo       TipoNotificacion
  titulo     String
  mensaje    String
  leida      Boolean          @default(false)
  docente_id String
  metadata   Json?
  createdAt  DateTime         @default(now())
  docente    Docente          @relation(fields: [docente_id], references: [id], onDelete: Cascade)

  @@index([docente_id, leida])
  @@index([docente_id, createdAt])
  @@map("notificaciones")
}

enum TipoNotificacion {
  ClaseProxima
  AsistenciaPendiente
  EstudianteAlerta
  ClaseCancelada
  LogroEstudiante
  Recordatorio
  General
}
```

**⚠️ Limitación Actual:**
- Solo tiene `docente_id`, no hay campo genérico `usuario_id`
- No puede notificar a estudiantes, tutores o admins directamente

#### **Eventos (Calendario Docente)**

```prisma
model Evento {
  id             String        @id @default(cuid())
  titulo         String
  descripcion    String?
  tipo           TipoEvento    // CLASE, TAREA, RECORDATORIO, NOTA
  fecha_inicio   DateTime
  fecha_fin      DateTime
  es_todo_el_dia Boolean       @default(false)
  docente_id     String
  clase_id       String?
  docente        Docente       @relation(...)
  clase          Clase?        @relation(...)

  // Relaciones polimórficas 1:1
  tarea          Tarea?
  recordatorio   Recordatorio?
  nota           Nota?
}

model Tarea {
  id                        String         @id @default(cuid())
  evento_id                 String         @unique
  estado                    EstadoTarea
  prioridad                 PrioridadTarea
  porcentaje_completado     Int
  subtareas                 Json           // Array de subtareas
  archivos                  Json           // Array de archivos
  recurrencia               Json?
  recordatorios             Json
}
```

### 5.2. Índices Importantes

**Notificaciones:**
- `[docente_id, leida]` - Para queries "no leídas por docente"
- `[docente_id, createdAt]` - Para ordenar por fecha

**Clases:**
- `[docente_id]` - Clases por docente
- `[fecha_hora_inicio]` - Ordenar por fecha
- `[estado]` - Filtrar por estado

**Estudiantes:**
- `[tutor_id]` - Estudiantes por tutor
- `[equipo_id]` - Estudiantes por equipo

### 5.3. Relaciones Cascade

**OnDelete: Cascade:**
- Tutor → Estudiantes (si borras tutor, se borran sus estudiantes)
- Estudiante → Asistencias, Logros, Puntos, etc.
- Docente → Notificaciones, Eventos
- ClaseGrupo → Inscripciones, Asistencias

---

## 6. PORTALES Y RUTAS

### 6.1. Portal Admin (`/admin`)

**Layout:** Mateatletas OS - Sidebar estilo macOS/Windows 11

**Rutas:**

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/admin/dashboard` | `admin/dashboard/page.tsx` | Dashboard principal |
| `/admin/usuarios` | `admin/usuarios/page.tsx` | Gestión de usuarios (tutores, docentes, admins) |
| `/admin/credenciales` | `admin/credenciales/page.tsx` | Ver/resetear passwords temporales |
| `/admin/clases` | `admin/clases/page.tsx` | Gestión de clases y clubes |
| `/admin/clases/[id]` | `admin/clases/[id]/page.tsx` | Detalle de clase |
| `/admin/estudiantes` | `admin/estudiantes/page.tsx` | Gestión de estudiantes |
| `/admin/planificaciones` | `admin/planificaciones/page.tsx` | Planificaciones pedagógicas |
| `/admin/planificaciones-simples` | `admin/planificaciones-simples/page.tsx` | Planificaciones simplificadas |
| `/admin/planificaciones-simples/[codigo]` | `admin/planificaciones-simples/[codigo]/page.tsx` | Ver planificación |
| `/admin/sectores-rutas` | `admin/sectores-rutas/page.tsx` | Sectores y rutas curriculares |
| `/admin/pagos` | `admin/pagos/page.tsx` | Gestión de pagos |
| `/admin/reportes` | `admin/reportes/page.tsx` | Reportes y estadísticas |

**Características UI:**
- Sidebar colapsable
- Gradientes vibrantes por sección
- Badges de notificaciones
- Notificaciones hardcodeadas (3 items demo)
- Dark mode disabled (tema fixed)

**Auth Guard:**
- Verifica `user.role === 'admin'` o `selectedRole === 'admin'`
- Redirige según rol activo del usuario

### 6.2. Portal Docente (`/docente`)

**Layout:** Glassmorphism elegante + gradientes suaves

**Rutas:**

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/docente/dashboard` | `docente/dashboard/page.tsx` | Dashboard docente |
| `/docente/calendario` | `docente/calendario/page.tsx` | Calendario de eventos |
| `/docente/observaciones` | `docente/observaciones/page.tsx` | Observaciones de estudiantes |
| `/docente/planificaciones` | `docente/planificaciones/page.tsx` | Planificaciones asignadas |
| `/docente/grupos/[id]` | `docente/grupos/[id]/page.tsx` | Detalle de grupo/comisión |
| `/docente/clases/[id]/asistencia` | `docente/clases/[id]/asistencia/page.tsx` | Tomar asistencia |
| `/docente/clase/[id]/sala` | `docente/clase/[id]/sala/page.tsx` | Sala de clase virtual |
| `/docente/perfil` | `docente/perfil/page.tsx` | Perfil del docente |

**Características UI:**
- NotificationCenter con polling (30s)
- Theme toggle (light/dark)
- Sidebar responsive
- Toast notifications (react-hot-toast)

**Sistema de Notificaciones:**
- **Componente:** `components/docente/NotificationCenter.tsx`
- **Hook:** `lib/hooks/useNotificaciones.ts` (React Query)
- **Store (deprecado):** `store/notificaciones.store.ts`
- **Backend:** `/api/notificaciones` (5 endpoints)

**Auth Guard:**
- Verifica `user.role === 'docente'` o `selectedRole === 'docente'`

### 6.3. Portal Estudiante (`/estudiante`)

**Layout:** Minimalista (sin sidebar visible)

**Rutas:**

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/estudiante/crear-avatar` | `estudiante/crear-avatar/page.tsx` | Ready Player Me avatar creator |
| `/estudiante/gimnasio` | `estudiante/gimnasio/page.tsx` | Hub principal (Brawl Stars style) |
| `/estudiante/planificaciones/[codigo]` | `estudiante/planificaciones/[codigo]/page.tsx` | Ver planificación interactiva |

**Hub Views (dentro de `/estudiante/gimnasio`):**

| View | Archivo | Descripción |
|------|---------|-------------|
| **HubView** | `views/HubView.tsx` | Pantalla principal con avatar 3D |
| **NotificacionesView** | `views/NotificacionesView.tsx` | Notificaciones gamificadas |
| **MiGrupoView** | `views/MiGrupoView.tsx` | Compañeros de equipo |
| **MiProgresoView** | `views/MiProgresoView.tsx` | Estadísticas y logros |
| **TiendaView** | `views/TiendaView.tsx` | Comprar items con gemas |
| **PerfilView** | `views/PerfilView.tsx` | Perfil del estudiante |

**Overlays (modales fullscreen):**
- **PlanificacionView** - Ver actividades semanales
- **ClaseSincronicaQuimica** - Clase sincrónica (demo)
- **MisionView** - Misiones diarias/semanales

**Características UI:**
- Estilo Brawl Stars (vibrante, cartoon, gamificado)
- Avatar 3D con AnimatedAvatar3D (Ready Player Me + animations)
- Confetti explosions, sonidos, partículas
- Notificaciones con emojis y colores
- Sin sistema real de notificaciones backend

**Auth Guard:**
- Verifica `user.role === 'estudiante'`
- Verifica que tenga `avatar_url` (si no, redirige a `/crear-avatar`)

### 6.4. Rutas Legacy (`/(protected)`)

**Layout:** Layout antiguo (pre-migración)

Rutas en proceso de migración:
- `/dashboard`
- `/catalogo`
- `/clases`
- `/equipos`
- `/estudiantes/[id]`
- `/membresia/planes`
- `/membresia/confirmacion`
- `/mis-clases`
- `/planificaciones`

**Estado:** En desuso, se migran a portales específicos

### 6.5. Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Login multi-rol |
| `/register` | Registro de tutores |
| `/showcase` | Showcase de componentes |

---

## 7. ESTADO GLOBAL Y DATA FETCHING

### 7.1. Zustand Stores (19 stores)

**Ubicación:** `src/store/*.store.ts`

| Store | Propósito | Estado |
|-------|-----------|--------|
| `auth.store.ts` | Autenticación, user, token | ✅ Activo |
| `admin.store.ts` | Estado del panel admin | ✅ Activo |
| `docente.store.ts` | Estado del portal docente | ✅ Activo |
| `estudiantes.store.ts` | Lista de estudiantes | ✅ Activo |
| `clases.store.ts` | Lista de clases | ✅ Activo |
| `gamificacion.store.ts` | Estado de gamificación | ✅ Activo |
| `notificaciones.store.ts` | Notificaciones docente | ⚠️ Deprecado (migrar a React Query) |
| `calendario.store.ts` | Eventos del calendario | ✅ Activo |
| `pagos.store.ts` | Estado de pagos | ✅ Activo |
| `catalogo.store.ts` | Catálogo de productos | ✅ Activo |
| `equipos.store.ts` | Equipos de gamificación | ✅ Activo |
| `sectores.store.ts` | Sectores (Matemática/Programación) | ✅ Activo |
| `asistencia.store.ts` | Asistencias | ✅ Activo |
| `cursos.store.ts` | Cursos y lecciones | ✅ Activo |

**Características:**
- Persist middleware (localStorage)
- Acciones async
- Type-safe con TypeScript

**Ejemplo (auth.store.ts):**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;  // Para multi-rol

  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setSelectedRole: (role) => void;
}
```

### 7.2. React Query (Migración en progreso)

**Configuración:** `app/layout.tsx`

```tsx
<QueryClientProvider client={queryClient}>
  <ReactQueryDevtools initialIsOpen={false} />
  {children}
</QueryClientProvider>
```

**Hooks Implementados:**

**Portal Docente (Notificaciones):**
- `useNotificaciones()` - Query para listar
- `useNotificacionesCount()` - Query para contador
- `useMarcarNotificacionLeida()` - Mutation
- `useMarcarTodasLeidas()` - Mutation
- `useEliminarNotificacion()` - Mutation
- `useNotificationCenter()` - Hook combinado con polling

**Beneficios vs Zustand:**
- Cache automático
- Invalidación inteligente
- Background refetching (polling)
- Optimistic updates
- Loading/error states automáticos
- DevTools integradas

**Ejemplo:**
```typescript
const { data: notificaciones, isLoading } = useNotificaciones(false);

const marcarLeida = useMarcarNotificacionLeida();
marcarLeida.mutate(notificationId);
```

### 7.3. API Clients (19 archivos)

**Ubicación:** `src/lib/api/*.api.ts`

**Patrón Estándar:**
```typescript
// 1. Importar axios configurado
import apiClient from '../axios';

// 2. Importar schemas Zod
import { responseSchema } from '../schemas/...';

// 3. Definir función async
export async function getNombreRecurso() {
  const response = await apiClient.get('/endpoint');
  return responseSchema.parse(response);  // Validar con Zod
}

// 4. Helpers visuales (opcional)
export function getIconoByTipo(tipo: string): string {
  // ...
}
```

**APIs Disponibles:**
- auth.api.ts
- admin.api.ts
- estudiantes.api.ts
- docentes.api.ts
- tutor.api.ts
- clases.api.ts
- clase-grupos.api.ts
- asistencia.api.ts
- calendario.api.ts
- notificaciones.api.ts
- gamificacion.api.ts
- pagos.api.ts
- catalogo.api.ts
- cursos.api.ts
- equipos.api.ts
- sectores.api.ts
- planificaciones.api.ts
- planificaciones-simples.api.ts
- tienda.api.ts

### 7.4. Shared Contracts (Zod Schemas)

**Package:** `@mateatletas/contracts`

**Ubicación:** `packages/contracts/src/schemas/`

Schemas compartidos entre frontend y backend:
- `notificacion.schema.ts`
- `clase.schema.ts`
- `estudiante.schema.ts`
- `auth.schema.ts`
- etc.

**Beneficios:**
- Type-safety compartida
- Validación consistente
- Single source of truth

---

## 8. UI/UX Y COMPONENTES

### 8.1. Sistema de Diseño

**UI Library:** Custom components (no shadcn/ui, no Material UI)

**Ubicación:** `src/components/ui/`

**Componentes Base:**

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| Button | `Button.tsx` | Botones con variantes (primary, secondary, ghost) |
| Card | `Card.tsx` | Cards con glassmorphism |
| Modal | `Modal.tsx` | Modales con backdrop |
| Input | `Input.tsx` | Inputs con validación |
| Select | `Select.tsx` | Selects customizados |
| Avatar | `Avatar.tsx` | Avatares circulares |
| StudentAvatar | `StudentAvatar.tsx` | Avatar de estudiante con gradiente |
| Badge | `Badge.tsx` | Badges de estado/notificaciones |
| Toast | `Toast.tsx` | Sistema de toasts (react-hot-toast) |
| AnimatedCounter | `AnimatedCounter.tsx` | Contador animado |
| FloatingCard | `FloatingCard.tsx` | Cards flotantes |
| MagneticButton | `MagneticButton.tsx` | Botones con efecto magnético |
| ThemeToggle | `ThemeToggle.tsx` | Toggle light/dark |
| Breadcrumbs | `Breadcrumbs.tsx` | Navegación breadcrumb |
| TypingCode | `TypingCode.tsx` | Animación de código |

**Iconos:** Lucide React (v0.545.0)

### 8.2. Estilos por Portal

**Portal Admin:**
- Fondo: Gradientes dinámicos + blur
- Sidebar: Estilo macOS/Windows 11
- Colores: Vibrantes (violet, blue, emerald, orange, pink)
- Glassmorphism: Sutil
- Animaciones: Suaves (hover states)

**Portal Docente:**
- Fondo: Gradientes suaves (purple → blue)
- Glassmorphism: Elegante
- Sombras: Profundas
- Tipografía: Inter
- Dark mode: Funcional

**Portal Estudiante:**
- Estilo: Brawl Stars (cartoon, vibrante)
- Fondo: Animado con partículas/estrellas
- Colores: Neones, brillantes
- Emojis: Abundantes
- Animaciones: Explosivas (confetti, bounce)

### 8.3. Sistema de Modales/Overlays

**Portal Admin:**
- Modales estándar con backdrop
- Componente: `components/ui/Modal.tsx`

**Portal Docente:**
- Modales glassmorphism
- NotificationCenter: Dropdown con backdrop

**Portal Estudiante:**
- Overlays fullscreen (slide from right)
- Componente: `components/OverlayManager.tsx`
- Ejemplos: PlanificacionView, MisionView

### 8.4. Sistema de Notificaciones UI

**Portal Admin:**
- Panel hardcodeado (3 notificaciones demo)
- Sin integración real
- Ubicación: Topbar derecha

**Portal Docente:**
- **Componente:** `components/docente/NotificationCenter.tsx`
- **Features:**
  - Badge con contador de no leídas
  - Dropdown con lista scrolleable
  - Marcar como leída (individual)
  - Marcar todas como leídas
  - Eliminar notificación
  - Polling cada 30s (React Query)
  - Iconos y colores por tipo
  - Tiempo relativo ("Hace 2 horas")
- **Ubicación:** Topbar derecha

**Portal Estudiante:**
- **View:** `views/NotificacionesView.tsx`
- **Características:**
  - Notificaciones "virtuales" (construidas desde otros endpoints)
  - Tipos: Logros, Clases próximas, Equipo
  - Filtros por tipo
  - UI gamificada con emojis
  - Sin persistencia de estado leído/no leído

### 8.5. Animaciones

**Library:** Framer Motion 12.23.24

**Uso:**
- Transiciones de página
- Hover states
- Modales (fade + scale)
- Listas (stagger children)
- Confetti explosions (canvas-confetti)

**Ejemplo:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

### 8.6. Charts y Visualizaciones

**Libraries:**
- Chart.js 4.5.1
- react-chartjs-2 5.3.0
- Recharts 3.2.1

**Uso:**
- Dashboard admin (gráficos profesionales)
- Dashboard docente (estadísticas)
- Portal estudiante (progreso, XP)

---

## 9. SISTEMA DE EVENTOS Y LOGS

### 9.1. Eventos que Generan Notificaciones (Backend)

**Fuente:** `notificaciones.service.ts`

| Evento | Trigger | Método | Usuario Destino |
|--------|---------|--------|-----------------|
| **Clase Próxima** | 24h antes de clase | `notificarClaseProxima()` | Docente |
| **Asistencia Pendiente** | Post-clase sin asistencia | `notificarAsistenciaPendiente()` | Docente |
| **Estudiante Alerta** | Rendimiento bajo | `notificarEstudianteAlerta()` | Docente |
| **Clase Cancelada** | Admin/Docente cancela | `notificarClaseCancelada()` | Docente |
| **Logro Desbloqueado** | Estudiante logra objetivo | `notificarLogroEstudiante()` | Docente |

**Ejemplo de Integración:**

```typescript
// clases-management.service.ts (línea 187-195)
Promise.allSettled([
  // Operación principal
  this.prisma.clase.update({
    where: { id },
    data: { estado: EstadoClase.Cancelada }
  }),

  // Notificación secundaria
  this.notificacionesService.notificarClaseCancelada(
    clase.docente_id,
    id,
    claseTitulo
  )
])
```

### 9.2. Sistema de Logging (Winston)

**Configuración:** `common/logger/logger.service.ts`

**Características:**
- Logs estructurados con contexto
- Rotación diaria de archivos
- Metadata enriquecida

**Campos de Metadata:**
- `eventType` - Tipo de evento
- `operation` - Operación realizada
- `userId` - ID del usuario
- `userRole` - Rol del usuario
- `method` - Método HTTP
- `url` - URL de la request
- `duration` - Duración en ms
- `ip` - IP del cliente
- `userAgent` - User agent

**Niveles:**
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `http` - Logs de HTTP requests
- `debug` - Debugging detallado

**Ejemplo:**
```typescript
this.logger.log('Clase cancelada', {
  eventType: 'clase_cancelada',
  operation: 'cancelar_clase',
  userId: docente.id,
  userRole: 'docente',
  claseId: clase.id
});
```

### 9.3. Logging Interceptor

**Archivo:** `common/interceptors/logging.interceptor.ts`

**Función:**
- Registra TODAS las requests HTTP
- Calcula duración
- Incluye método, URL, status code, userId

**Output:**
```
[HTTP] GET /api/notificaciones 200 - 45ms - userId: abc123
```

### 9.4. Eventos del Calendario (Portal Docente)

**Modelo:** `Evento` (Prisma)

**Tipos:**
- **CLASE** - Referencias a clases del sistema
- **TAREA** - Tareas pedagógicas con subtareas, archivos, recurrencia
- **RECORDATORIO** - Recordatorios simples
- **NOTA** - Notas de texto largo

**Servicio:** `eventos.service.ts`

**Features:**
- CRUD completo
- Filtrado por fechas, tipo, categoría
- Búsqueda
- Drag & Drop support
- Exportación (JSON, iCal)

### 9.5. Actividad del Usuario (No implementado)

**⚠️ No hay tabla de logs de actividad del usuario**

**Potencial implementación:**
```prisma
model ActividadUsuario {
  id         String   @id @default(cuid())
  usuario_id String
  tipo_usuario String // "docente", "estudiante", "admin"
  accion     String   // "login", "ver_clase", "marcar_asistencia"
  metadata   Json?
  ip         String?
  user_agent String?
  createdAt  DateTime @default(now())

  @@index([usuario_id, createdAt])
  @@index([accion])
}
```

---

## 10. SISTEMA DE AUTENTICACIÓN

### 10.1. Flujo de Autenticación

```
[Cliente]
   ↓ POST /api/auth/login { email, password }
[AuthController]
   ↓ validateUser()
[AuthService]
   ↓ Busca usuario en DB (Tutor, Docente, Admin, Estudiante)
   ↓ Compara password_hash con bcrypt
   ↓ Genera JWT payload { sub: userId, email, role, roles }
[JwtService]
   ↓ Firma JWT con secret
[Response]
   ↓ Set-Cookie: auth_token (httpOnly, secure, sameSite, maxAge: 7 días)
   ↓ Body: { user: {...}, access_token }
[Cliente]
   ↓ Guarda user en Zustand store
   ↓ Todas las requests subsecuentes envían cookie automáticamente
```

### 10.2. Roles del Sistema

| Rol | Tabla | Descripción |
|-----|-------|-------------|
| **tutor** | Tutor | Padres que gestionan estudiantes y pagos |
| **estudiante** | Estudiante | Alumnos que acceden al portal de aprendizaje |
| **docente** | Docente | Profesores que dictan clases |
| **admin** | Admin | Administradores del sistema |

**Multi-Rol:**
- Docentes pueden tener `roles: ["docente", "admin"]`
- Admins pueden tener `roles: ["admin", "docente"]`
- Frontend maneja `selectedRole` para cambiar entre roles

### 10.3. Guards y Estrategias

**JWT Strategy:**
- Extrae token de cookie `auth_token`
- Valida con JwtService
- Adjunta `user` al request

**Guards:**
1. **JwtAuthGuard** - Verifica que el usuario esté autenticado
2. **RolesGuard** - Verifica que el usuario tenga el rol requerido
3. **TokenBlacklistGuard** - Verifica que el token no esté invalidado

**Decorators:**
- `@Public()` - Excluye de autenticación
- `@Roles('admin', 'docente')` - Requiere roles específicos
- `@GetUser()` - Extrae el usuario del request

**Ejemplo:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Docente)
@Get('/mis-clases')
async getMisClases(@GetUser() user) {
  return this.clasesService.findByDocente(user.id);
}
```

### 10.4. Cambio de Contraseña Forzado

**Flujo:**
1. Admin crea usuario con `password_temporal`
2. Usuario ve `debe_cambiar_password: true`
3. Frontend redirige a página de cambio de contraseña
4. Usuario cambia password
5. Backend actualiza `debe_cambiar_password: false`
6. Se borra `password_temporal`

### 10.5. Logout y Token Blacklist

**Flujo:**
1. Usuario hace logout
2. Backend agrega token a blacklist (Redis)
3. Frontend limpia store
4. Cookie se elimina (max-age 0)

**TokenBlacklistGuard:**
- Verifica en cada request que el token no esté en blacklist
- Si está, retorna 401

---

## 11. RECOMENDACIONES PARA NOTIFICACIONES

### 11.1. Problemas Actuales

1. **Solo Docentes:** El modelo `Notificacion` solo tiene `docente_id`
2. **Discrepancia de Tipos:** Enums diferentes entre Prisma y contracts
3. **Portal Admin:** Notificaciones hardcodeadas, sin integración
4. **Portal Estudiante:** Sistema independiente, no usa backend real
5. **Sin Real-Time:** Usa polling (30s), no WebSocket
6. **Sin Preferencias:** No hay sistema de configuración de notificaciones

### 11.2. Propuesta de Arquitectura Unificada

#### **A. Extender Modelo Prisma (Multi-Usuario)**

```prisma
model Notificacion {
  id          String           @id @default(cuid())
  tipo        TipoNotificacion
  titulo      String
  mensaje     String
  leida       Boolean          @default(false)

  // 🆕 Campo genérico para cualquier usuario
  usuario_id  String
  usuario_tipo UsuarioTipo     // "tutor", "estudiante", "docente", "admin"

  // 🆕 Campos opcionales para compatibilidad
  docente_id  String?
  estudiante_id String?
  tutor_id    String?
  admin_id    String?

  metadata    Json?
  createdAt   DateTime         @default(now())

  @@index([usuario_id, leida])
  @@index([usuario_id, createdAt])
  @@index([usuario_tipo, leida])
  @@map("notificaciones")
}

enum UsuarioTipo {
  Tutor
  Estudiante
  Docente
  Admin
}

// 🆕 Enum unificado (alinear con contracts)
enum TipoNotificacion {
  // Clases
  ClaseProgramada
  ClaseCancelada
  ClaseProxima
  AsistenciaPendiente

  // Estudiantes
  EstudianteNuevo
  EstudianteAlerta
  LogroEstudiante

  // Pagos
  PagoRecibido
  PagoRechazado
  MembresiaProximoVencimiento
  MembresiaVencida

  // Reservas
  NuevaReserva
  CancelacionReserva

  // Sistema
  Recordatorio
  General
  Sistema
}
```

#### **B. NotificacionesService Unificado**

```typescript
@Injectable()
export class NotificacionesService {
  // 🆕 Método genérico para crear notificaciones
  async create(data: {
    usuario_id: string;
    usuario_tipo: UsuarioTipo;
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.notificacion.create({ data });
  }

  // 🆕 Método para listar por usuario (cualquier tipo)
  async findByUsuario(
    usuario_id: string,
    usuario_tipo: UsuarioTipo,
    soloNoLeidas?: boolean
  ) {
    return this.prisma.notificacion.findMany({
      where: {
        usuario_id,
        usuario_tipo,
        ...(soloNoLeidas && { leida: false }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Métodos específicos por tipo de notificación
  async notificarLogrosDesbloqueados(
    estudiante_id: string,
    logro: Logro
  ) {
    // Notificar al estudiante
    await this.create({
      usuario_id: estudiante_id,
      usuario_tipo: UsuarioTipo.Estudiante,
      tipo: TipoNotificacion.LogroEstudiante,
      titulo: '¡Nuevo Logro Desbloqueado! 🏆',
      mensaje: `Has desbloqueado: ${logro.nombre}`,
      metadata: { logro_id: logro.id },
    });

    // Notificar al tutor (padre)
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudiante_id },
    });

    await this.create({
      usuario_id: estudiante.tutor_id,
      usuario_tipo: UsuarioTipo.Tutor,
      tipo: TipoNotificacion.LogroEstudiante,
      titulo: `${estudiante.nombre} desbloqueó un logro`,
      mensaje: `Tu hijo/a desbloqueó: ${logro.nombre}`,
      metadata: { estudiante_id, logro_id: logro.id },
    });
  }

  async notificarPagoRecibido(
    tutor_id: string,
    pago: Pago
  ) {
    await this.create({
      usuario_id: tutor_id,
      usuario_tipo: UsuarioTipo.Tutor,
      tipo: TipoNotificacion.PagoRecibido,
      titulo: 'Pago Recibido ✅',
      mensaje: `Se recibió tu pago de $${pago.monto}`,
      metadata: { pago_id: pago.id, monto: pago.monto },
    });
  }

  async notificarAdminEstudianteNuevo(
    admin_id: string,
    estudiante: Estudiante
  ) {
    await this.create({
      usuario_id: admin_id,
      usuario_tipo: UsuarioTipo.Admin,
      tipo: TipoNotificacion.EstudianteNuevo,
      titulo: 'Nuevo Estudiante Registrado',
      mensaje: `${estudiante.nombre} ${estudiante.apellido} se registró`,
      metadata: { estudiante_id: estudiante.id },
    });
  }
}
```

#### **C. NotificacionesController Genérico**

```typescript
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  // 🆕 Endpoint genérico (detecta rol del usuario)
  @Get()
  async findAll(
    @GetUser() user,
    @Query('soloNoLeidas') soloNoLeidas?: string
  ) {
    // Determinar tipo de usuario desde JWT
    const usuario_tipo = this.mapRoleToUsuarioTipo(user.role);

    return this.notificacionesService.findByUsuario(
      user.id,
      usuario_tipo,
      soloNoLeidas === 'true'
    );
  }

  @Get('/count')
  async count(@GetUser() user) {
    const usuario_tipo = this.mapRoleToUsuarioTipo(user.role);
    return this.notificacionesService.countNoLeidas(user.id, usuario_tipo);
  }

  @Patch(':id/leer')
  async marcarLeida(@GetUser() user, @Param('id') id: string) {
    // Verificar ownership antes de actualizar
    return this.notificacionesService.marcarComoLeida(user.id, id);
  }

  @Patch('/leer-todas')
  async marcarTodasLeidas(@GetUser() user) {
    const usuario_tipo = this.mapRoleToUsuarioTipo(user.role);
    return this.notificacionesService.marcarTodasComoLeidas(
      user.id,
      usuario_tipo
    );
  }

  private mapRoleToUsuarioTipo(role: string): UsuarioTipo {
    switch (role) {
      case 'tutor': return UsuarioTipo.Tutor;
      case 'estudiante': return UsuarioTipo.Estudiante;
      case 'docente': return UsuarioTipo.Docente;
      case 'admin': return UsuarioTipo.Admin;
      default: throw new BadRequestException('Rol inválido');
    }
  }
}
```

#### **D. Frontend - API Client Unificado**

```typescript
// lib/api/notificaciones.api.ts

export async function getNotificaciones(soloNoLeidas?: boolean) {
  const params = soloNoLeidas ? { soloNoLeidas: 'true' } : {};
  const response = await apiClient.get('/notificaciones', { params });
  return notificacionesListSchema.parse(response);
}

// El endpoint es el mismo para todos los usuarios
// El backend determina el tipo de usuario desde el JWT
```

#### **E. Frontend - Componente Reutilizable**

```tsx
// components/shared/NotificationCenter.tsx

interface NotificationCenterProps {
  variant: 'admin' | 'docente' | 'estudiante' | 'tutor';
}

export function NotificationCenter({ variant }: NotificationCenterProps) {
  const {
    notificaciones,
    count,
    isLoading,
    marcarLeida,
    marcarTodas,
    eliminar,
  } = useNotificationCenter();

  // Adaptar estilos según variant
  const styles = getStylesByVariant(variant);

  return (
    <div className={styles.container}>
      <button className={styles.bell}>
        <Bell size={20} />
        {count > 0 && <Badge>{count}</Badge>}
      </button>

      {/* Dropdown con notificaciones */}
      <div className={styles.dropdown}>
        {notificaciones.map(n => (
          <NotificationItem
            key={n.id}
            notification={n}
            variant={variant}
            onMarkRead={marcarLeida}
            onDelete={eliminar}
          />
        ))}
      </div>
    </div>
  );
}
```

#### **F. Integración en Todos los Portales**

```tsx
// app/admin/layout.tsx
<NotificationCenter variant="admin" />

// app/docente/layout.tsx
<NotificationCenter variant="docente" />

// app/estudiante/gimnasio/components/TopBar.tsx
<NotificationCenter variant="estudiante" />

// app/(protected)/layout.tsx (tutor)
<NotificationCenter variant="tutor" />
```

### 11.3. Eventos a Notificar por Rol

#### **Admin:**
- Nuevo estudiante registrado
- Nueva reserva de clase
- Cancelación de reserva
- Pago recibido
- Clase sin docente asignado
- Alerta de sistema

#### **Docente:**
- Clase próxima (24h antes)
- Asistencia pendiente
- Estudiante con alerta
- Clase cancelada
- Nuevo estudiante en su grupo
- Logro desbloqueado por estudiante

#### **Estudiante:**
- Logro desbloqueado
- Clase próxima
- Clase cancelada
- Nueva actividad asignada
- Comentario del docente
- Recompensa obtenida

#### **Tutor (Padre):**
- Logro desbloqueado por hijo/a
- Asistencia registrada
- Pago próximo a vencer
- Pago recibido
- Comentario del docente sobre hijo/a
- Alerta de rendimiento

### 11.4. Roadmap de Implementación

**Fase 1: Migración del Modelo (1-2 días)**
- [ ] Crear migración Prisma para extender `Notificacion`
- [ ] Agregar campos `usuario_id`, `usuario_tipo`
- [ ] Alinear enum `TipoNotificacion`
- [ ] Mantener campos legacy (`docente_id`, etc.) para compatibilidad
- [ ] Migrar datos existentes

**Fase 2: Backend Unificado (2-3 días)**
- [ ] Refactorizar `NotificacionesService` con métodos genéricos
- [ ] Actualizar `NotificacionesController` para soportar todos los roles
- [ ] Agregar tests E2E para cada rol
- [ ] Integrar notificaciones en eventos críticos del sistema

**Fase 3: Frontend - Portal Admin (1 día)**
- [ ] Reemplazar panel hardcodeado con `NotificationCenter`
- [ ] Conectar a API real
- [ ] Implementar React Query hooks

**Fase 4: Frontend - Portal Estudiante (1 día)**
- [ ] Migrar `NotificacionesView` a usar API real
- [ ] Mantener UI gamificada
- [ ] Agregar persistencia de estado leído/no leído

**Fase 5: Frontend - Portal Tutor (1 día)**
- [ ] Crear `NotificationCenter` para tutores
- [ ] Integrar en layout del portal protegido

**Fase 6: Real-Time (Opcional, 3-5 días)**
- [ ] Agregar WebSocket gateway (NestJS)
- [ ] Implementar Server-Sent Events (SSE)
- [ ] Migrar de polling a eventos en tiempo real

**Fase 7: Features Avanzados (Opcional, 5-7 días)**
- [ ] Sistema de preferencias de notificaciones
- [ ] Templates de email personalizados
- [ ] CRON jobs para recordatorios
- [ ] Push notifications PWA
- [ ] Desktop notifications API

### 11.5. Consideraciones de Performance

**Backend:**
- Índices en `[usuario_id, leida]` y `[usuario_id, createdAt]`
- Paginación en listados (limit/offset)
- Cache de contador de no leídas (Redis, TTL 30s)

**Frontend:**
- React Query con staleTime: 30s
- Optimistic updates para UX instantáneo
- Virtualización para listas largas (react-window)

**Real-Time:**
- WebSocket solo para usuarios activos
- Fallback a polling si WebSocket falla
- Heartbeat cada 30s para mantener conexión

---

## CONCLUSIÓN

El ecosistema Mateatletas está construido con arquitectura moderna y sólida:

✅ **Fortalezas:**
- Monorepo bien estructurado (Turbo + npm workspaces)
- Backend robusto (NestJS + Prisma + PostgreSQL)
- Frontend moderno (Next.js 14 + React Query + Zustand)
- Sistema de autenticación completo (JWT + multi-rol)
- Logging estructurado (Winston)
- Testing configurado (Jest + Vitest + Playwright)
- Sistema de notificaciones funcional (Portal Docente)

⚠️ **Áreas de Mejora:**
- Extender notificaciones a todos los roles
- Migrar de polling a WebSocket (real-time)
- Completar migración de Zustand a React Query
- Implementar sistema de preferencias
- Agregar tabla de logs de actividad
- Unificar estilos entre portales

**Estado General del Proyecto:** 85% completo, producción-ready para Portal Docente

---

**Documento generado:** 30 de Octubre, 2025
**Última actualización:** 30 de Octubre, 2025
**Versión:** 1.0.0
