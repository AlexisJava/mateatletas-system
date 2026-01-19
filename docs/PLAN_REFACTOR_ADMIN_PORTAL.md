# Plan de Refactor - Admin Portal 2026

> **Estado**: EN PROGRESO
> **Branch**: `refactor/admin-portal`
> **Última actualización**: 2026-01-18

---

## 1. Resumen Ejecutivo

### Problema Actual

El menú de navegación del Admin tiene **9 items** que generan confusión:

- "Asignaciones" → Solo asigna Casa/Mundo a docentes
- "Grupos" → Solo muestra grupos pedagógicos (ClaseGrupo)
- "Contenidos" → Gestiona contenido educativo pero está "suelto"

### Solución Propuesta

Reorganizar a **8 items** claros con agrupación lógica:

1. ✅ Dashboard (ya existe)
2. ✅ Finanzas (ya existe)
3. ✅ Analytics (ya existe)
4. ✅ Personas (ya existe)
5. ✅ Productos (ya existe) - **MEJORAR**: integrar horarios/ClaseGrupos
6. 🆕 **Suscripciones** (nueva vista)
7. ✅ Contenidos (ya existe)
8. ✅ Sandbox (ya existe)

**Se eliminan**: Asignaciones, Grupos → se integran en Personas y Productos respectivamente.

---

## 2. Auditoría del Estado Actual

### 2.1 Navegación Actual (ADMIN_NAV_ITEMS)

| #   | Item         | Ruta                  | Vista                   | Estado                  |
| --- | ------------ | --------------------- | ----------------------- | ----------------------- |
| 1   | Dashboard    | `/admin/dashboard`    | DashboardView           | ✅ Completo             |
| 2   | Finanzas     | `/admin/finanzas`     | FinanceView             | ✅ Completo             |
| 3   | Analytics    | `/admin/analytics`    | AnalyticsView           | ✅ Completo             |
| 4   | Personas     | `/admin/personas`     | PersonasView            | ✅ Completo             |
| 5   | Asignaciones | `/admin/asignaciones` | DocenteAsignacionesView | ⚠️ Mover a Personas     |
| 6   | Grupos       | `/admin/grupos`       | GruposPedagogicosView   | ⚠️ Mover a Productos    |
| 7   | Productos    | `/admin/productos`    | ProductosView           | ✅ Necesita sub-páginas |
| 8   | Contenidos   | `/admin/contenidos`   | ContenidosView          | ✅ Completo             |
| 9   | Sandbox      | `/admin/sandbox`      | SandboxView             | ✅ Completo             |

### 2.2 Endpoints Backend Disponibles (NO usados en Frontend)

| Endpoint                                               | Descripción                        | Vista sugerida          |
| ------------------------------------------------------ | ---------------------------------- | ----------------------- |
| `GET /suscripciones/familiar`                          | Todas las suscripciones familiares | 🆕 SuscripcionesView    |
| `GET /suscripciones/familiar/:id`                      | Detalle de suscripción             | 🆕 SuscripcionesView    |
| `PATCH /suscripciones/familiar/inscripciones/:id/tier` | Cambiar tier inscripción           | 🆕 SuscripcionesView    |
| `GET /admin/clase-grupos`                              | Todos los ClaseGrupos              | Productos/[id]/horarios |
| `POST /admin/clase-grupos`                             | Crear ClaseGrupo                   | Productos/[id]/horarios |
| `GET /admin/alertas`                                   | Alertas del sistema                | Dashboard               |

### 2.3 Estructura de Archivos Frontend Admin

```
apps/web/src/
├── app/admin/
│   ├── dashboard/page.tsx      ✅
│   ├── finanzas/page.tsx       ✅
│   ├── analytics/page.tsx      ✅
│   ├── personas/page.tsx       ✅
│   ├── asignaciones/page.tsx   ⚠️ ELIMINAR
│   ├── grupos/page.tsx         ⚠️ ELIMINAR
│   ├── productos/
│   │   ├── page.tsx            ✅
│   │   └── [id]/page.tsx       ✅ (tiene ComisionesSection)
│   ├── contenidos/page.tsx     ✅
│   └── sandbox/page.tsx        ✅
│
├── components/admin/views/
│   ├── dashboard/              ✅
│   ├── finanzas/               ✅
│   ├── analytics/              ✅
│   ├── personas/               ✅
│   ├── docentes-asignaciones/  ⚠️ Mover a personas/
│   ├── grupos-pedagogicos/     ⚠️ Mover a productos/
│   ├── productos/              ✅
│   ├── sandbox/                ✅
│   └── [FALTA suscripciones/]  🆕
│
└── lib/api/
    ├── admin.api.ts            ✅ (2000+ líneas, muy completo)
    └── suscripcion-familiar.api.ts  ✅ (para portal tutor, adaptar para admin)
```

---

## 3. Plan de Implementación por Fases

### FASE 1: Crear Vista de Suscripciones (ALTA PRIORIDAD)

> **Objetivo**: Dar visibilidad admin a todas las suscripciones familiares

**Archivos a crear:**

```
apps/web/src/
├── app/admin/suscripciones/
│   └── page.tsx
└── components/admin/views/suscripciones/
    ├── index.ts
    ├── SuscripcionesView.tsx
    ├── hooks/
    │   └── useSuscripciones.ts
    └── components/
        ├── SuscripcionesStatsGrid.tsx
        ├── SuscripcionesFilters.tsx
        ├── SuscripcionesTable.tsx
        └── SuscripcionDetailModal.tsx
```

**Funcionalidad:**

- [ ] Listar todas las suscripciones familiares (paginado)
- [ ] Filtrar por estado (AUTHORIZED, PAUSED, CANCELLED)
- [ ] Filtrar por tier
- [ ] Ver detalle de inscripciones por suscripción
- [ ] **Cambiar tier de inscripción individual** (MODELO 2026)
- [ ] Ver historial de cambios de tier
- [ ] Exportar a CSV

**Endpoints a usar:**

```typescript
// Necesita endpoint ADMIN (no existe aún)
GET /admin/suscripciones               // Listar todas
GET /admin/suscripciones/:id           // Detalle
PATCH /admin/suscripciones/:id/tier    // Cambiar tier (admin)
```

**Backend requerido (si no existe):**

```typescript
// apps/api/src/admin/admin.controller.ts
@Get('suscripciones')
@Roles('admin')
async listarSuscripciones(@Query() query: PaginationDto)

@Get('suscripciones/:id')
@Roles('admin')
async obtenerSuscripcion(@Param('id') id: string)
```

---

### FASE 2: Integrar Asignaciones Casa/Mundo en Personas

**Objetivo**: La pestaña "Asignaciones" desaparece, su funcionalidad se integra en PersonasView

**Cambios:**

1. Agregar pestaña/tab "Docentes" en PersonasView
2. Al ver un docente, mostrar sus asignaciones Casa/Mundo
3. Modal para editar asignaciones desde PersonDetailModal

**Archivos a modificar:**

```
apps/web/src/components/admin/views/personas/
├── PersonasView.tsx           # Agregar tabs
├── components/
│   ├── PersonasTable.tsx      # Columna "Asignaciones" para docentes
│   └── PersonDetailModal.tsx  # Sección Casa/Mundo
```

**Archivos a reusar (mover):**

```
docentes-asignaciones/hooks/useDocenteAsignaciones.ts → personas/hooks/
docentes-asignaciones/components/DocenteDetailModal.tsx → personas/components/
```

**Archivos a ELIMINAR después:**

```
apps/web/src/app/admin/asignaciones/page.tsx
apps/web/src/components/admin/views/docentes-asignaciones/ (toda la carpeta)
```

---

### FASE 3: Integrar ClaseGrupos (Horarios) en Productos

**Objetivo**: Eliminar "Grupos" como item separado. Los ClaseGrupos se gestionan dentro de cada Producto tipo Club.

**Cambio conceptual:**

- Producto tipo "Club" → tiene ClaseGrupos (horarios semanales recurrentes)
- Producto tipo "Curso" → tiene Comisiones (ya implementado)
- Producto tipo "Evento" → tiene Comisiones (ya implementado)

**Archivos a crear:**

```
apps/web/src/components/admin/views/productos/components/
├── ClaseGruposSection.tsx    # Similar a ComisionesSection
├── ClaseGrupoCard.tsx
├── ClaseGrupoFormModal.tsx
└── ClaseGrupoDetailModal.tsx
```

**Modificar:**

```
apps/web/src/app/admin/productos/[id]/page.tsx
// Agregar: if (producto.tipo === 'Club') → mostrar ClaseGruposSection
```

**Archivos a ELIMINAR después:**

```
apps/web/src/app/admin/grupos/page.tsx
apps/web/src/components/admin/views/grupos-pedagogicos/ (toda la carpeta)
```

---

### FASE 4: Actualizar Navegación

**Archivo a modificar:**

```
apps/web/src/types/admin-dashboard.types.ts
```

**Nueva configuración:**

```typescript
export enum AdminView {
  DASHBOARD = 'dashboard',
  FINANZAS = 'finanzas',
  ANALYTICS = 'analytics',
  PERSONAS = 'personas',
  SUSCRIPCIONES = 'suscripciones', // 🆕
  PRODUCTOS = 'productos',
  CONTENIDOS = 'contenidos',
  SANDBOX = 'sandbox',
  // ELIMINADOS: ASIGNACIONES, GRUPOS
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    view: AdminView.DASHBOARD,
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
  },
  { view: AdminView.FINANZAS, label: 'Finanzas', href: '/admin/finanzas', icon: 'CreditCard' },
  { view: AdminView.ANALYTICS, label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { view: AdminView.PERSONAS, label: 'Personas', href: '/admin/personas', icon: 'Users' },
  {
    view: AdminView.SUSCRIPCIONES,
    label: 'Suscripciones',
    href: '/admin/suscripciones',
    icon: 'Repeat',
  }, // 🆕
  { view: AdminView.PRODUCTOS, label: 'Productos', href: '/admin/productos', icon: 'Package' },
  { view: AdminView.CONTENIDOS, label: 'Contenidos', href: '/admin/contenidos', icon: 'BookOpen' },
  { view: AdminView.SANDBOX, label: 'Sandbox', href: '/admin/sandbox', icon: 'Code2' },
];
```

---

### FASE 5: Cleanup Final

**Eliminar archivos obsoletos:**

```bash
# Páginas
rm apps/web/src/app/admin/asignaciones/page.tsx
rm apps/web/src/app/admin/grupos/page.tsx

# Componentes
rm -rf apps/web/src/components/admin/views/docentes-asignaciones/
rm -rf apps/web/src/components/admin/views/grupos-pedagogicos/
```

**Verificaciones:**

- [ ] `yarn build` pasa
- [ ] `yarn lint` pasa
- [ ] Todas las rutas redirigen correctamente
- [ ] Tests actualizados

---

## 4. Diagrama de Navegación Propuesto

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN SIDEBAR                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Dashboard        ──► Métricas, alertas, overview        │
│                                                             │
│  💰 Finanzas         ──► Ingresos, pagos, configuración     │
│                                                             │
│  📈 Analytics        ──► Retención, tendencias, reportes    │
│                                                             │
│  👥 Personas         ──► Estudiantes, Docentes, Tutores     │
│       │                                                     │
│       └─► [Docente] ──► Ver/Editar asignaciones Casa/Mundo  │
│                                                             │
│  🔄 Suscripciones   ──► Suscripciones familiares 2026      │ 🆕
│       │                                                     │
│       └─► [Suscripción] ──► Inscripciones, cambiar tier     │
│                                                             │
│  📦 Productos        ──► Clubs, Cursos, Eventos, Recursos   │
│       │                                                     │
│       ├─► [Producto:Club] ──► ClaseGrupos (horarios)        │
│       └─► [Producto:Curso] ──► Comisiones                   │
│                                                             │
│  📚 Contenidos       ──► Microlecciones, evaluaciones       │
│                                                             │
│  🧪 Sandbox          ──► Testing, demos                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Dependencias y Riesgos

### Dependencias

| Fase   | Depende de                                  |
| ------ | ------------------------------------------- |
| FASE 1 | Backend: endpoints admin para suscripciones |
| FASE 2 | FASE 1 completa (para no romper nav)        |
| FASE 3 | FASE 2 completa                             |
| FASE 4 | FASES 1-3 completas                         |
| FASE 5 | FASE 4 completa                             |

### Riesgos

1. **Backend incompleto**: Si faltan endpoints admin para suscripciones, FASE 1 se bloquea
   - _Mitigación_: Crear endpoints en paralelo o usar endpoints existentes del tutor adaptados

2. **Breaking changes**: Eliminar páginas puede romper links guardados
   - _Mitigación_: Agregar redirects temporales en next.config.js

3. **Tests**: Algunos tests pueden fallar si referencian rutas eliminadas
   - _Mitigación_: Actualizar tests en cada fase

---

## 6. Checklist de Progreso

### FASE 0: Cleanup (✅ COMPLETADO)

- [x] Eliminar código muerto del dashboard
- [x] Centralizar utilidades de formato
- [x] Eliminar barrel exports innecesarios
- [x] Verificar build limpio

### FASE 1: Vista Suscripciones (✅ COMPLETADO)

- [x] Crear estructura de carpetas
- [x] Implementar SuscripcionesView
- [x] Implementar hooks (useSuscripciones)
- [x] Implementar componentes (StatsGrid, Filters, Table, DetailModal)
- [x] Agregar al nav
- [x] Responsive design (cards mobile, table desktop)
- [x] Seed data con 6 familias edge cases
- [x] Fix axios interceptor para paginación

### FASE 2: Integrar Asignaciones en Personas

- [ ] Agregar tabs a PersonasView
- [ ] Mover lógica de asignaciones
- [ ] Actualizar PersonDetailModal
- [ ] Eliminar páginas antiguas

### FASE 3: Integrar ClaseGrupos en Productos

- [ ] Crear ClaseGruposSection
- [ ] Integrar en ProductoDetailPage
- [ ] Eliminar páginas antiguas

### FASE 4: Actualizar Navegación

- [ ] Modificar ADMIN_NAV_ITEMS
- [ ] Verificar sidebar
- [ ] Agregar redirects

### FASE 5: Cleanup Final

- [ ] Eliminar archivos obsoletos
- [ ] Verificar build
- [ ] Actualizar documentación
- [ ] Commit final

---

## 7. Notas Técnicas

### API Admin existente (admin.api.ts)

El archivo tiene **2000+ líneas** con endpoints para:

- Dashboard stats
- Estudiantes CRUD
- Docentes CRUD + asignaciones Casa/Mundo
- Productos CRUD
- Comisiones CRUD
- Grupos pedagógicos
- Pagos y finanzas
- Tareas administrativas
- Exportación CSV/PDF

### Suscripciones API (suscripcion-familiar.api.ts)

Diseñado para el **portal tutor**, pero los tipos son reutilizables:

- `TierNombre`: STEAM_LIBROS | STEAM_ASINCRONICO | STEAM_SINCRONICO
- `EstadoSuscripcionFamiliar`: PENDING | AUTHORIZED | PAUSED | CANCELLED
- `InscripcionActividadDetalle`: Incluye tier individual (MODELO 2026)

### Design System Admin

Variables CSS definidas en `globals.css`:

```css
--admin-surface-0: oklch(0.12 0.02 160);
--admin-surface-1: oklch(0.15 0.02 160);
--admin-surface-2: oklch(0.18 0.02 160);
--admin-border: oklch(0.25 0.02 160);
--admin-text: oklch(0.95 0 0);
--admin-text-muted: oklch(0.65 0 0);
--admin-accent: oklch(0.75 0.18 160); /* Emerald */
```

---

## 8. Historial de Cambios

| Fecha      | Cambio                                       | Autor  |
| ---------- | -------------------------------------------- | ------ |
| 2026-01-18 | Creación inicial del documento               | Claude |
| 2026-01-18 | Completada FASE 0 (cleanup)                  | Claude |
| 2026-01-18 | Completada FASE 1 (SuscripcionesView + seed) | Claude |
