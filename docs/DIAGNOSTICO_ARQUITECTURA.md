# DIAGNÓSTICO DE ARQUITECTURA - PANELES MATEATLETAS

> **Fecha:** 2025-11-29
> **Versión:** 1.0
> **Stack:** Next.js 15.5.4 + React 19.1.0 + Tailwind CSS 4 + TypeScript

---

## RESUMEN EJECUTIVO

| Métrica              | Valor   |
| -------------------- | ------- |
| Componentes TSX/TS   | 127     |
| Líneas de código     | ~64,791 |
| Páginas funcionales  | 31      |
| Layouts principales  | 6       |
| Stores Zustand       | 14      |
| Hooks personalizados | 18      |
| Archivos API         | 11      |

**Estado General:** 🟡 BUENO - Funcional al 90% con deuda técnica notable

---

## PANELES IDENTIFICADOS

| Panel                     | Ruta             | Estado (1-10) | Responsive        | Notas                                       |
| ------------------------- | ---------------- | ------------- | ----------------- | ------------------------------------------- |
| **Admin Portal**          | `/admin/*`       | 7/10          | ✅ Parcial        | Layout de 614 líneas, 5 endpoints faltantes |
| **Portal Docente**        | `/docente/*`     | 8/10          | ✅ Sí             | Mejor estructurado, theme toggle funcional  |
| **Plataforma Estudiante** | `/estudiante/*`  | 9/10          | ⚠️ Landscape-only | Gamificación completa, avatar 3D            |
| **Portal Tutor**          | `/(protected)/*` | 7/10          | ✅ Sí             | Minimalista, funcional pero básico          |

---

## DETALLE POR PANEL

### 1. ADMIN PORTAL (`/admin`)

**Diseño:** Glassmorphism oscuro con gradientes vibrantes (violet, blue, emerald, orange)

#### Páginas Implementadas

| Página          | Ruta                     | Estado      | Funcionalidades                        |
| --------------- | ------------------------ | ----------- | -------------------------------------- |
| Dashboard       | `/admin`                 | ⚠️ Parcial  | Stats generales, pero faltan 5 widgets |
| Usuarios        | `/admin/usuarios`        | ✅ Completo | CRUD, multi-rol, exportar              |
| Clubes          | `/admin/clubes`          | ✅ Completo | CRUD completo                          |
| Cursos          | `/admin/cursos`          | ✅ Completo | CRUD completo                          |
| Estudiantes     | `/admin/estudiantes`     | ✅ Completo | Listado, filtros, asignación           |
| Planificaciones | `/admin/planificaciones` | ✅ Completo | Simple y avanzada                      |
| Pagos           | `/admin/pagos`           | ✅ Completo | Transacciones, reportes                |
| Reportes        | `/admin/reportes`        | ✅ Completo | Exportación                            |
| Sectores        | `/admin/sectores`        | ✅ Completo | Geolocalización                        |
| Rutas           | `/admin/rutas`           | ✅ Completo | Gestión de rutas                       |
| Credenciales    | `/admin/credenciales`    | 🔴 STUB     | Solo estructura                        |

#### Problemas Específicos

```
🔴 CRÍTICO: Layout de 614 líneas (debería ser ~150-200)
🔴 Dashboard incompleto - TODOs pendientes:
   - GET /admin/stats/top-courses
   - GET /admin/stats/geographic-distribution
   - GET /admin/stats/upcoming-courses
   - GET /admin/stats/teacher-updates
   - GET /admin/stats/trends
🟠 Código duplicado con otros layouts (sidebar, topbar)
```

---

### 2. PORTAL DOCENTE (`/docente`)

**Diseño:** Elegante con tema light/dark, gradientes suaves (indigo, purple, pink)

#### Páginas Implementadas

| Página          | Ruta                       | Estado      | Funcionalidades                                |
| --------------- | -------------------------- | ----------- | ---------------------------------------------- |
| Dashboard       | `/docente`                 | ✅ Completo | Saludo dinámico, clase de hoy, 7 grupos, stats |
| Calendario      | `/docente/calendario`      | ✅ Completo | Vista mensual                                  |
| Observaciones   | `/docente/observaciones`   | ✅ Completo | CRUD                                           |
| Perfil          | `/docente/perfil`          | ✅ Completo | Editar info, cambiar contraseña                |
| Planificaciones | `/docente/planificaciones` | ✅ Completo | Acceso a recursos                              |

#### Fortalezas

```
✅ ThemeToggle bien implementado
✅ Blobs animados para ambiance
✅ Sidebar collapsible
✅ Layout más limpio (382 líneas)
```

---

### 3. PLATAFORMA ESTUDIANTE (`/estudiante`)

**Diseño:** Futurista espacial (cyan, blue, purple - estrellas, nebulosas)

#### Páginas Implementadas

| Página          | Ruta                       | Estado      | Funcionalidades               |
| --------------- | -------------------------- | ----------- | ----------------------------- |
| Crear Avatar    | `/estudiante/crear-avatar` | ✅ Completo | Ready Player Me integrado     |
| Gimnasio (Hub)  | `/estudiante/gimnasio`     | ✅ Completo | Centro principal              |
| Gamificación    | `/estudiante/gamificacion` | ✅ Completo | Puntos, misiones, leaderboard |
| Logros          | `/estudiante/logros`       | ✅ Completo | Galería de badges             |
| Tienda          | `/estudiante/tienda`       | ✅ Completo | Items y skins                 |
| Planificaciones | `/estudiante/[codigo]`     | ✅ Completo | Por nivel, dinámico           |
| Perfil          | `/estudiante/perfil`       | ✅ Completo | Avatar 3D interactivo         |

#### Características Especiales

```
✅ Avatar 3D con Ready Player Me
✅ Sistema de racha automática
✅ Modal de bienvenida diaria
✅ LandscapeOnlyGuard para móviles
✅ Loading screen épico (agujero negro + estrellas)
⚠️ Solo landscape en mobile (limitación intencional)
```

---

### 4. PORTAL TUTOR (`/(protected)`)

**Diseño:** Minimalista (gris, azul)

#### Páginas Implementadas

| Página             | Ruta                              | Estado      | Funcionalidades                                      |
| ------------------ | --------------------------------- | ----------- | ---------------------------------------------------- |
| Dashboard          | `/(protected)/dashboard`          | ✅ Completo | 5 tabs: resumen, mis hijos, calendario, pagos, ayuda |
| Catálogo           | `/(protected)/catalogo`           | ✅ Completo | Cursos disponibles                                   |
| Mis Clases         | `/(protected)/mis-clases`         | ✅ Completo | Clases activas de hijos                              |
| Clases Disponibles | `/(protected)/clases-disponibles` | ✅ Completo | Búsqueda avanzada                                    |
| Estudiantes        | `/(protected)/estudiantes`        | ✅ Completo | Listado de hijos                                     |
| Detalle Estudiante | `/(protected)/estudiantes/[id]`   | ✅ Completo | Perfil completo                                      |
| Equipos            | `/(protected)/equipos`            | ✅ Completo | Grupos de hijos                                      |
| Planificaciones    | `/(protected)/planificaciones`    | ✅ Completo | Vista de contenido                                   |

---

## PROBLEMAS CRÍTICOS

### 1. 🔴 Token JWT en localStorage (SEGURIDAD)

```typescript
// Actual - INSEGURO
localStorage.setItem('token', response.token);

// Recomendado
// HTTP-only cookies manejadas por el backend
```

**Impacto:** Vulnerable a XSS attacks
**Solución:** Migrar a HTTP-only cookies

---

### 2. 🔴 Validación de Auth Duplicada (4x)

```typescript
// Se repite en CADA layout:
useEffect(() => {
  const checkAuth = async () => {
    // ... misma lógica 4 veces
  };
  checkAuth();
}, []);
```

**Impacto:** Código duplicado, mantenimiento difícil, requests innecesarios
**Solución:** Crear `ProtectedLayout` wrapper único

---

### 3. 🔴 Layouts Idénticos con 600+ Líneas Duplicadas

| Layout     | Líneas | Duplicación                 |
| ---------- | ------ | --------------------------- |
| Admin      | 614    | Sidebar, Topbar, Auth check |
| Docente    | 382    | Sidebar, Topbar, Auth check |
| Estudiante | 350    | Sidebar, Topbar, Auth check |
| Tutor      | 96     | Auth check, container       |

**Impacto:** Mantenimiento imposible a escala
**Solución:** Extraer `AppShell` componente reutilizable

---

### 4. 🔴 Admin Dashboard Incompleto

```typescript
// TODOs encontrados en el código:
// TODO: Implementar cuando backend tenga endpoint
// - topCourses
// - geographicDistribution
// - upcomingCourses
// - teacherUpdates
// - trends
```

**Impacto:** Dashboard admin muestra datos incompletos
**Solución:** Implementar 5 endpoints en backend

---

### 5. 🔴 LoadingScreen Duplicado 4 Veces

```
apps/web/app/admin/layout.tsx       → LoadingScreen custom
apps/web/app/docente/layout.tsx     → LoadingScreen custom
apps/web/app/estudiante/layout.tsx  → LoadingScreen épico
apps/web/app/(protected)/layout.tsx → LoadingScreen básico
```

**Impacto:** Inconsistencia visual, código repetido
**Solución:** Un `LoadingScreen` parametrizable

---

## PROBLEMAS MENORES

### 1. 🟠 14 Stores Zustand Sin Consolidación

```
auth, admin, estudiantes, docente, gamificacion,
notificaciones, cursos, clases, equipos, catalogo,
pagos, asistencia, calendario, sectores
```

**Recomendación:** Consolidar a 5-6 stores por dominio

---

### 2. 🟠 25+ Carpetas en /components/

```
/components/
├── admin/
├── auth/
├── avatar/
├── calendario/
├── clases/
├── clubes/
├── credenciales/
├── cursos/
├── dashboard/
├── equipos/
├── estudiantes/
├── gamificacion/
├── logros/
├── misiones/
├── notificaciones/
├── observaciones/
├── pagos/
├── planificaciones/
├── profile/
├── quiz/
├── reportes/
├── rutas/
├── sectores/
├── tienda/
└── ui/
```

**Recomendación:** Agrupar en `/admin/`, `/student/`, `/shared/`

---

### 3. 🟠 Animaciones Pesadas en Mobile

```typescript
// estudiante/layout.tsx
<div className="stars" /> // 200+ elementos
<div className="nebula" /> // Filtros blur
```

**Recomendación:** CSS animations + `prefers-reduced-motion`

---

### 4. 🟠 3 Backgrounds Diferentes

```
CosmosBackground.tsx
CosmosBackgroundGlobal.tsx
GradientBg.tsx
```

**Recomendación:** Un `AnimatedBackground` con variantes

---

### 5. 🟡 4 Fuentes Tipográficas

```css
/* Posiblemente excesivo */
font-family: Nunito        /* Oficial */
font-family: Lilita One    /* Dashboard Brawl Stars */
font-family: Orbitron      /* Futurista */
font-family: Rajdhani      /* Premium */
```

**Recomendación:** Reducir a 2 fuentes máximo

---

### 6. 🟡 No Hay Tokens de Diseño Centralizados

```typescript
// Actual - hardcoded en cada archivo
className = 'text-violet-500 bg-slate-900/50';

// Recomendado - tokens.ts
import { colors, spacing } from '@/lib/tokens';
```

---

### 7. 🟡 Login Inconsistente

```typescript
// Dos métodos diferentes
authStore.login(credentials); // Normal
authStore.loginEstudiante(codigo); // Estudiantes
```

**Recomendación:** Un `login()` único con discriminador

---

## DEPENDENCIAS ENTRE PANELES

```
┌─────────────────────────────────────────────────────────────┐
│                        AUTH STORE                           │
│  (user, token, selectedRole, isAuthenticated)               │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
    ▼             ▼             ▼             ▼
┌───────┐   ┌─────────┐   ┌──────────┐   ┌───────┐
│ ADMIN │   │ DOCENTE │   │ESTUDIANTE│   │ TUTOR │
└───┬───┘   └────┬────┘   └────┬─────┘   └───┬───┘
    │            │             │             │
    │   ┌────────┴─────────────┴─────────────┘
    │   │
    ▼   ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORES COMPARTIDOS                        │
├─────────────────────────────────────────────────────────────┤
│ estudiantes-store  │ Tutor ↔ Admin ↔ Docente                │
│ cursos-store       │ Admin ↔ Tutor                          │
│ clases-store       │ Docente ↔ Tutor ↔ Admin                │
│ pagos-store        │ Tutor ↔ Admin                          │
│ gamificacion-store │ Estudiante (exclusivo)                 │
│ calendario-store   │ Docente ↔ Tutor                        │
└─────────────────────────────────────────────────────────────┘

COMPONENTES COMPARTIDOS:
┌─────────────────────────────────────────────────────────────┐
│ /components/ui/      → Button, Card, Input, Modal, Badge    │
│ /components/auth/    → LoginForm, RegisterForm              │
│ /hooks/              → useAuth, useFetch, useDebounce       │
│ /lib/api/            → Axios clients, Zod schemas           │
└─────────────────────────────────────────────────────────────┘
```

---

## RECOMENDACIÓN: QUÉ ORDENAR ANTES DE CONSTRUIR STUDIO

### FASE 1: Fundamentos (CRÍTICO - Hacer Primero)

| Prioridad | Tarea                                    | Esfuerzo | Impacto                               |
| --------- | ---------------------------------------- | -------- | ------------------------------------- |
| P0        | Crear `AppShell` componente reutilizable | 2-3 días | Elimina 600+ líneas duplicadas        |
| P0        | Crear `ProtectedLayout` wrapper          | 1 día    | Centraliza auth, elimina 4x checkAuth |
| P0        | Unificar `LoadingScreen` parametrizable  | 0.5 días | Consistencia visual                   |

### FASE 2: Completar Backend (ALTA)

| Prioridad | Tarea                                           | Esfuerzo | Impacto                  |
| --------- | ----------------------------------------------- | -------- | ------------------------ |
| P1        | Endpoint `/admin/stats/top-courses`             | 0.5 días | Dashboard admin completo |
| P1        | Endpoint `/admin/stats/geographic-distribution` | 0.5 días | Dashboard admin completo |
| P1        | Endpoint `/admin/stats/upcoming-courses`        | 0.5 días | Dashboard admin completo |
| P1        | Endpoint `/admin/stats/teacher-updates`         | 0.5 días | Dashboard admin completo |
| P1        | Endpoint `/admin/stats/trends`                  | 1 día    | Dashboard admin completo |

### FASE 3: Design System (MEDIA)

| Prioridad | Tarea                                              | Esfuerzo | Impacto                          |
| --------- | -------------------------------------------------- | -------- | -------------------------------- |
| P2        | Crear `tokens.ts` con colores, spacing, tipografía | 1 día    | Consistencia en todo el proyecto |
| P2        | Unificar backgrounds en `AnimatedBackground`       | 0.5 días | Elimina 3 componentes duplicados |
| P2        | Reducir fuentes de 4 a 2                           | 0.5 días | Performance, consistencia        |

### FASE 4: Seguridad (MEDIA-ALTA)

| Prioridad | Tarea                                    | Esfuerzo | Impacto           |
| --------- | ---------------------------------------- | -------- | ----------------- |
| P2        | Migrar token a HTTP-only cookies         | 2 días   | Seguridad crítica |
| P2        | Unificar `login()` / `loginEstudiante()` | 0.5 días | Código más limpio |

### FASE 5: Optimización (BAJA)

| Prioridad | Tarea                                  | Esfuerzo | Impacto                |
| --------- | -------------------------------------- | -------- | ---------------------- |
| P3        | Consolidar 14 stores a 5-6             | 2 días   | Performance, debugging |
| P3        | Reorganizar `/components/` en 3 grupos | 1 día    | DX mejorada            |
| P3        | Optimizar animaciones mobile           | 1 día    | Performance móvil      |

---

## ORDEN SUGERIDO PARA STUDIO

```
1. AppShell + ProtectedLayout (ANTES de cualquier página nueva)
2. tokens.ts (ANTES de crear componentes Studio)
3. Endpoints admin faltantes (SI Studio usa analytics)
4. Migrar auth a cookies (ANTES de producción)
5. Consolidar stores (CUANDO Studio agregue más estado)
```

---

## MÉTRICAS DE ÉXITO POST-REFACTOR

| Métrica              | Actual | Objetivo |
| -------------------- | ------ | -------- |
| Líneas en layouts    | 1,442  | < 400    |
| Llamadas checkAuth() | 4      | 1        |
| LoadingScreens       | 4      | 1        |
| Backgrounds          | 3      | 1        |
| Stores               | 14     | 6        |
| Fuentes              | 4      | 2        |

---

## CONCLUSIÓN

El frontend de Mateatletas está **funcionalmente completo al 90%** con una arquitectura visual distintiva por rol. Sin embargo, tiene **deuda técnica significativa** en:

1. **Duplicación de código** (layouts, loading screens, backgrounds)
2. **Seguridad** (token en localStorage)
3. **Endpoints faltantes** (5 en admin dashboard)

**Recomendación final:** Invertir 1-2 sprints en refactorización de fundamentos (AppShell, ProtectedLayout, tokens) ANTES de construir Studio. Esto evitará propagar la deuda técnica existente al nuevo módulo.

---

_Generado automáticamente - Mateatletas Architecture Diagnostic v1.0_
