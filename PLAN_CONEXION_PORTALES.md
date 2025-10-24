# 🔗 PLAN DE CONEXIÓN TOTAL DE PORTALES - Mateatletas MVP v1

**Fecha:** 24 Octubre 2025
**Objetivo:** Conectar completamente los 4 portales (Admin, Docente, Tutor, Estudiante) con el backend
**Estado Actual:** 65-70% conectado
**Meta:** 95-100% conectado para MVP

---

## 📊 DIAGNÓSTICO ACTUAL

### Estado de Conectividad por Portal

| Portal | Conectividad | Backend Listo | Frontend Listo | Gap Principal |
|--------|-------------|---------------|----------------|---------------|
| **Admin** | 60% | ✅ 100% | ⚠️ 60% | CRUD Cursos, Sectores, Reportes |
| **Docente** | 55% | ✅ 95% | ⚠️ 55% | Planificador completo, Reportes |
| **Tutor** | 15% | ✅ 100% | ❌ 15% | **Portal completo inexistente** |
| **Estudiante** | 70% | ✅ 90% | ⚠️ 70% | Cursos completos, Evaluaciones |

### Estadísticas Globales

```
✅ APIs Backend Implementadas:    16/16 (100%)
⚠️ APIs en Uso por Frontend:      11/16 (69%)
📡 Endpoints Totales:              125+
🔌 Endpoints Conectados:           72 (58%)
🏠 Portales Funcionales:           2.5/4 (62%)
📈 Cobertura Total Sistema:        65-70%
```

---

## 🎯 PLAN DE ACCIÓN - 4 FASES

### **FASE 1: CRÍTICO - MVP BLOCKER** ⚠️
**Duración:** 5-7 días
**Objetivo:** Resolver elementos que bloquean el lanzamiento MVP

#### 1.1 Portal Tutor - CREAR DESDE CERO 🚨
**Prioridad:** MÁXIMA | **Tiempo:** 3 días | **Complejidad:** Alta

**Situación:** El backend está 100% listo pero NO existe frontend

**Tareas:**
- [ ] Crear estructura base portal tutor (`apps/web/src/tutor/`)
- [ ] Implementar Dashboard con métricas:
  - Estudiantes activos/total
  - Ingresos mensuales (suscripciones)
  - Clases grupales activas
  - Tasa de retención
- [ ] Página de Estudiantes con:
  - Lista de estudiantes del tutor
  - Filtros y búsqueda
  - Detalle de estudiante (perfil, progreso, pagos)
- [ ] Página de Clases Grupales:
  - Lista de ClaseGrupos
  - Crear/editar/eliminar ClaseGrupo
  - Gestionar inscripciones
  - Calendario de clases
- [ ] Página de Ingresos:
  - Resumen de suscripciones activas
  - Historial de pagos
  - Gráficos de ingresos
- [ ] Página de Planificaciones:
  - Lista de planificaciones asignadas
  - Ver detalles de planificación
  - Reportes de progreso por estudiante

**Backend ya disponible:**
- ✅ `/tutores` - CRUD completo
- ✅ `/tutores/:id/estudiantes` - Lista estudiantes
- ✅ `/tutores/:id/ingresos` - Métricas financieras
- ✅ `/tutores/:id/clases-grupales` - ClaseGrupos
- ✅ `/clase-grupos` - CRUD completo

**Archivos a crear:**
```
apps/web/src/tutor/
├── dashboard/
│   └── page.tsx (Dashboard principal)
├── estudiantes/
│   ├── page.tsx (Lista)
│   └── [id]/page.tsx (Detalle)
├── clases-grupales/
│   ├── page.tsx (Lista)
│   ├── crear/page.tsx
│   └── [id]/editar/page.tsx
├── ingresos/
│   └── page.tsx
└── planificaciones/
    ├── page.tsx
    └── [id]/page.tsx
```

**Servicio API a crear:**
```typescript
// apps/web/src/lib/api/tutores.api.ts
- getTutorDashboard()
- getTutorEstudiantes()
- getTutorIngresos()
- getTutorClasesGrupales()
- createClaseGrupo()
- updateClaseGrupo()
- deleteClaseGrupo()
```

---

#### 1.2 CRUD de Cursos en Admin 📚
**Prioridad:** ALTA | **Tiempo:** 2 días | **Complejidad:** Media

**Situación:** Backend 100% listo, NO existe UI en admin

**Tareas:**
- [ ] Crear página lista de cursos (`apps/web/src/admin/cursos/page.tsx`)
- [ ] Crear página crear curso (`apps/web/src/admin/cursos/crear/page.tsx`)
- [ ] Crear página editar curso (`apps/web/src/admin/cursos/[id]/editar/page.tsx`)
- [ ] Implementar formulario con campos:
  - Nombre, descripción, código
  - Precio (individual/grupal)
  - Duración, modalidad
  - Sector asignado
  - Estado (activo/inactivo)
- [ ] Tabla con acciones (ver, editar, eliminar)
- [ ] Filtros por sector, modalidad, estado

**Backend ya disponible:**
- ✅ `GET /cursos` - Lista paginada
- ✅ `POST /cursos` - Crear
- ✅ `PUT /cursos/:id` - Actualizar
- ✅ `DELETE /cursos/:id` - Eliminar
- ✅ `GET /cursos/:id/estudiantes` - Estudiantes inscritos

**Servicio API a crear:**
```typescript
// apps/web/src/lib/api/cursos.api.ts (ya existe parcialmente)
- getAllCursos() ✅
- createCurso() ❌ FALTA
- updateCurso() ❌ FALTA
- deleteCurso() ❌ FALTA
- getCursoEstudiantes() ❌ FALTA
```

---

#### 1.3 Sistema de Notificaciones 🔔
**Prioridad:** ALTA | **Tiempo:** 2 días | **Complejidad:** Media

**Situación:** Backend completo, frontend NO consume las notificaciones

**Tareas:**
- [ ] Crear hook `useNotificaciones()` para polling o WebSocket
- [ ] Componente `NotificationBell` en navbar (badge con contador)
- [ ] Dropdown de notificaciones con:
  - Lista de últimas 10 notificaciones
  - Marcar como leída
  - Ver todas
- [ ] Página de notificaciones completa (`/notificaciones`)
- [ ] Filtros por tipo y estado (leída/no leída)
- [ ] Integrar en los 4 portales

**Backend ya disponible:**
- ✅ `GET /notificaciones` - Lista paginada
- ✅ `GET /notificaciones/no-leidas` - Contador
- ✅ `PUT /notificaciones/:id/leer` - Marcar leída
- ✅ `PUT /notificaciones/leer-todas` - Marcar todas
- ✅ Creación automática de notificaciones en eventos

**Componentes a crear:**
```typescript
// apps/web/src/components/notifications/
├── NotificationBell.tsx
├── NotificationDropdown.tsx
├── NotificationList.tsx
└── NotificationItem.tsx

// apps/web/src/lib/api/notificaciones.api.ts
- getNotificaciones()
- getNoLeidas()
- marcarLeida()
- marcarTodasLeidas()
```

---

### **FASE 2: ALTA PRIORIDAD - FUNCIONALIDADES CORE** 📈
**Duración:** 2 semanas
**Objetivo:** Completar funcionalidades principales de cada portal

#### 2.1 Completar Portal Docente
**Tiempo:** 5 días | **Complejidad:** Alta

##### 2.1.1 Planificador Completo
**Situación:** Existe estructura básica pero falta integración completa

**Tareas:**
- [ ] Conectar creación de planificaciones con backend
- [ ] Implementar asignación de actividades a planificación
- [ ] Sistema de drag-and-drop para organizar actividades
- [ ] Gestión de progreso de planificación
- [ ] Vista de estudiante con planificación asignada
- [ ] Reportes de cumplimiento

**Backend disponible:**
- ✅ `POST /planificaciones` - Crear
- ✅ `PUT /planificaciones/:id` - Actualizar
- ✅ `GET /planificaciones/:id/actividades` - Actividades
- ✅ `POST /planificaciones/:id/actividades` - Asignar actividad
- ⚠️ Módulo completo implementado pero sin usar

**Archivos a completar:**
```
apps/web/src/planificaciones/ (ya existe)
├── components/
│   ├── PlanificacionForm.tsx (mejorar)
│   ├── ActividadSelector.tsx (crear)
│   ├── ActividadDragDrop.tsx (crear)
│   └── ProgresoChart.tsx (crear)
└── [id]/
    ├── editar/page.tsx (completar)
    └── asignar-estudiantes/page.tsx (crear)
```

##### 2.1.2 Reportes de Docente
**Tareas:**
- [ ] Reporte de asistencia por clase
- [ ] Reporte de progreso de estudiantes
- [ ] Reporte de actividades completadas
- [ ] Exportar reportes a PDF/Excel

**Backend:**
- ⚠️ Endpoints parciales, necesita expansión

---

#### 2.2 Completar Portal Admin
**Tiempo:** 4 días | **Complejidad:** Media

##### 2.2.1 CRUD de Sectores
**Tareas:**
- [ ] Página lista de sectores
- [ ] Crear/editar sector
- [ ] Asignar rutas a sector
- [ ] Ver docentes por sector
- [ ] Ver cursos por sector

**Backend disponible:**
- ✅ `GET /sectores`
- ✅ `POST /sectores`
- ✅ `PUT /sectores/:id`
- ✅ `DELETE /sectores/:id`
- ✅ `GET /sectores/:id/rutas`

##### 2.2.2 Gestión de Rutas
**Tareas:**
- [ ] Página lista de rutas
- [ ] Crear/editar ruta
- [ ] Asignar provincias a ruta
- [ ] Ver estudiantes por ruta

**Backend disponible:**
- ✅ CRUD completo en `/sectores`

##### 2.2.3 Reportes Administrativos
**Tareas:**
- [ ] Dashboard con métricas globales
- [ ] Reporte de ingresos consolidado
- [ ] Reporte de crecimiento (nuevos usuarios)
- [ ] Reporte de retención
- [ ] Métricas de uso del sistema

---

#### 2.3 Completar Portal Estudiante
**Tiempo:** 3 días | **Complejidad:** Media

##### 2.3.1 Página de Cursos Completa
**Situación:** Lista básica existe, falta detalle y inscripción

**Tareas:**
- [ ] Vista detallada de curso
- [ ] Proceso de inscripción a curso
- [ ] Ver docente asignado
- [ ] Ver calendario de clases
- [ ] Progreso en el curso
- [ ] Materiales del curso

##### 2.3.2 Evaluaciones
**Tareas:**
- [ ] Lista de evaluaciones disponibles
- [ ] Realizar evaluación
- [ ] Ver resultados de evaluaciones
- [ ] Historial de evaluaciones

**Backend:**
- ⚠️ No implementado, necesita crearse

---

### **FASE 3: MEDIA PRIORIDAD - FEATURES ADICIONALES** 🔧
**Duración:** 2 semanas
**Objetivo:** Agregar funcionalidades complementarias

#### 3.1 Sistema de Eventos
**Tiempo:** 2 días

**Backend disponible:**
- ✅ CRUD completo de eventos
- ✅ Log de eventos del sistema

**Tareas:**
- [ ] Página de eventos en admin
- [ ] Log de actividad del sistema
- [ ] Auditoría de cambios

#### 3.2 Gestión de Equipos
**Tiempo:** 3 días

**Tareas:**
- [ ] CRUD completo de equipos
- [ ] Asignar miembros a equipo
- [ ] Actividades grupales de equipo

#### 3.3 Calendario Global
**Tiempo:** 2 días

**Tareas:**
- [ ] Vista de calendario integrada
- [ ] Mostrar clases, eventos, actividades
- [ ] Sincronización entre portales

---

### **FASE 4: BAJA PRIORIDAD - MEJORAS POST-MVP** ✨
**Duración:** Según roadmap post-lanzamiento

#### 4.1 Features Avanzadas
- [ ] Videollamadas integradas
- [ ] Chat en tiempo real
- [ ] Notificaciones push (móvil)
- [ ] App móvil nativa
- [ ] Integración con plataformas externas

#### 4.2 Optimizaciones
- [ ] Cache avanzado
- [ ] Optimización de queries
- [ ] CDN para assets
- [ ] Monitoreo y analytics

---

## 📋 RESUMEN DE GAPS IDENTIFICADOS

### Por Categoría

#### 🚨 CRÍTICOS (Bloquean MVP)
1. ❌ **Portal Tutor completo** - 3 días
2. ❌ **CRUD Cursos en Admin** - 2 días
3. ❌ **Sistema de Notificaciones** - 2 días

#### ⚠️ ALTOS (Importantes para MVP)
4. ⚠️ **Planificador Docente completo** - 3 días
5. ⚠️ **CRUD Sectores/Rutas** - 2 días
6. ⚠️ **Cursos completos en Estudiante** - 2 días

#### 📌 MEDIOS (Deseables para MVP)
7. ⚠️ **Reportes Admin/Docente** - 3 días
8. ⚠️ **Evaluaciones Estudiante** - 2 días
9. ⚠️ **Eventos y Log** - 2 días

#### 🔧 BAJOS (Post-MVP)
10. Equipos completos
11. Calendario global
12. Features avanzadas

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Sprint 1 (Semana 1) - CRÍTICOS
**Objetivo:** MVP funcional para los 4 roles

```
Día 1-3: Portal Tutor (Alexis + Claude)
  ├─ Día 1: Estructura + Dashboard + API service
  ├─ Día 2: Estudiantes + Clases Grupales
  └─ Día 3: Ingresos + Planificaciones

Día 4-5: CRUD Cursos Admin
  ├─ Día 4: Lista + Crear + API service
  └─ Día 5: Editar + Eliminar + Filtros

Día 6-7: Notificaciones
  ├─ Día 6: Hook + Bell + Dropdown
  └─ Día 7: Página completa + Integración
```

**Resultado:** Sistema 85-90% conectado

---

### Sprint 2 (Semana 2) - ALTOS
**Objetivo:** Completar funcionalidades principales

```
Día 1-3: Planificador Docente
  ├─ Día 1: Asignación de actividades
  ├─ Día 2: Drag-and-drop + UI
  └─ Día 3: Reportes de progreso

Día 4-5: CRUD Sectores/Rutas
  ├─ Día 4: Sectores completo
  └─ Día 5: Rutas + Asignaciones

Día 6-7: Cursos Estudiante
  ├─ Día 6: Vista detallada + Inscripción
  └─ Día 7: Progreso + Materiales
```

**Resultado:** Sistema 95% conectado - **LISTO PARA SOFT LAUNCH**

---

### Sprint 3 (Semana 3) - MEDIOS
**Objetivo:** Features adicionales y pulido

```
Día 1-3: Reportes
  ├─ Dashboard Admin mejorado
  ├─ Reportes Docente
  └─ Exportación PDF/Excel

Día 4-5: Evaluaciones
  ├─ Backend de evaluaciones
  └─ Frontend Estudiante

Día 6-7: QA + Bug fixing
```

**Resultado:** Sistema 98% conectado - **LISTO PARA GO-LIVE**

---

## 📊 MATRIZ DE DEPENDENCIAS

```
Portal Tutor ───┐
                ├──→ Notificaciones ──→ Testing QA
CRUD Cursos ────┤
                └──→ Planificador ────→ Reportes

Sectores/Rutas ─────→ CRUD Cursos
Evaluaciones ───────→ Cursos Estudiante
```

---

## ⏱️ ESTIMACIÓN TOTAL

| Fase | Duración | Esfuerzo (hrs) | Prioridad |
|------|----------|----------------|-----------|
| **Fase 1** | 5-7 días | 56 hrs | 🚨 CRÍTICA |
| **Fase 2** | 10 días | 96 hrs | ⚠️ ALTA |
| **Fase 3** | 10 días | 80 hrs | 📌 MEDIA |
| **Fase 4** | Post-MVP | TBD | 🔧 BAJA |
| **TOTAL MVP** | **3-4 semanas** | **~230 hrs** | |

---

## 🎯 CRITERIOS DE ÉXITO

### Para considerar un portal "100% conectado":

#### ✅ Portal Admin
- [ ] Dashboard con métricas reales
- [ ] CRUD Docentes ✅
- [ ] CRUD Cursos ❌
- [ ] CRUD Sectores/Rutas ❌
- [ ] Gestión de estudiantes ✅
- [ ] Reportes financieros ⚠️
- [ ] Notificaciones ❌

#### ✅ Portal Docente
- [ ] Dashboard con clases ✅
- [ ] Planificador completo ⚠️
- [ ] Gestión de asistencia ✅
- [ ] Observaciones ✅
- [ ] Reportes de progreso ❌
- [ ] Notificaciones ❌

#### ✅ Portal Tutor
- [ ] Dashboard con métricas ❌
- [ ] Gestión de estudiantes ❌
- [ ] Clases grupales ❌
- [ ] Ingresos y pagos ❌
- [ ] Planificaciones ❌
- [ ] Notificaciones ❌

#### ✅ Portal Estudiante
- [ ] Dashboard gamificación ✅
- [ ] Cursos inscritos ⚠️
- [ ] Calendario de clases ⚠️
- [ ] Actividades y progreso ⚠️
- [ ] Evaluaciones ❌
- [ ] Notificaciones ❌

---

## 🚀 RECOMENDACIÓN FINAL

### Plan de 3 Semanas para MVP 100% Conectado

**Semana 1 (Críticos):** Portal Tutor + Cursos + Notificaciones
**Semana 2 (Altos):** Planificador + Sectores + Cursos Estudiante
**Semana 3 (Pulido):** Reportes + QA + Bug fixing

**Go-Live:** Semana 4 (Soft launch con monitoreo)

### Métricas de Éxito
- ✅ 4 portales 100% funcionales
- ✅ 95%+ endpoints en uso
- ✅ 0 features críticas faltantes
- ✅ Notificaciones en tiempo real
- ✅ Reportes básicos implementados

### Equipo Recomendado
- **1 Developer Full-time** (Alexis)
- **1 AI Assistant** (Claude - yo)
- **1 QA part-time** (para testing en Semana 2-3)

### Riesgos
1. **Portal Tutor:** Más complejo de lo estimado (+1-2 días)
2. **Planificador:** Lógica de negocio compleja (+1 día)
3. **Testing:** Bugs no anticipados (+2-3 días)

**Contingencia:** Buffer de 3-5 días

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

### Hoy (Día 1)
1. ✅ Aprobar este plan
2. 🔧 Comenzar Portal Tutor:
   - Crear estructura de carpetas
   - Implementar servicio API tutores
   - Dashboard básico

### Mañana (Día 2)
3. Continuar Portal Tutor:
   - Página de estudiantes
   - Página de clases grupales

### Resto de la semana
4. Completar Portal Tutor
5. Iniciar CRUD Cursos
6. Iniciar Notificaciones

---

**¿Estás listo para comenzar? ¿Quieres que empiece por el Portal Tutor o prefieres otra prioridad?**
