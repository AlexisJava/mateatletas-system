# Auditoría Portal Docentes - Funcionalidades Pendientes

> **Fecha:** 2026-01-03
> **Autor:** Claude Code - Auditoría Exhaustiva
> **Objetivo:** Identificar funcionalidades sin backend, handlers vacíos y datos mock

---

## 📊 Resumen Ejecutivo

| Métrica                              | Valor |
| ------------------------------------ | ----- |
| **Componentes Auditados**            | 25    |
| **Páginas Auditadas**                | 10    |
| **Funcionalidades con Backend**      | 8     |
| **Funcionalidades Mock/Placeholder** | 34    |
| **Botones sin Handler Real**         | 18    |
| **Componentes 100% Mock**            | 8     |

---

## 🔴 Crítico - Funcionalidades SIN Backend

### 1. LiveClassPage.tsx (44KB) - 100% MOCK

**Archivo:** `apps/web/src/components/docente/LiveClassPage.tsx`

| Funcionalidad              | Línea   | Estado                                   |
| -------------------------- | ------- | ---------------------------------------- |
| `handleLaunchQuiz`         | 252-261 | Solo actualiza estado local, no persiste |
| `handleStudentResponse`    | 264-279 | Estado local, no envía al backend        |
| `handlePingStudent`        | 281-284 | `alert()` - **NO FUNCIONAL**             |
| `handleSendMessage`        | 286-298 | Estado local, no WebSocket/API           |
| `setClassStarted`          | 639     | Estado local, no crea sesión en backend  |
| Botón "Finalizar"          | 429-432 | Sin handler (`className` solo)           |
| Botón "Compartir Pantalla" | 407-409 | Sin handler (`className` solo)           |
| Botón "Levantar Mano"      | 413-415 | Sin handler (`className` solo)           |
| "Seleccionar Actividad"    | 828-829 | Sin handler                              |
| "Quitar Puntos"            | 791-793 | Sin handler                              |

**Datos Mock:**

- `slides` (línea 79-99): 2 slides hardcodeados
- `initialStudents` (línea 101-160): 8 estudiantes hardcodeados
- `initialChatMessages` (línea 162-179): 2 mensajes hardcodeados

**Estado:** 🔴 **100% MOCK** - Clase en vivo no funcional

---

### 2. StudentList.tsx - 90% MOCK

**Archivo:** `apps/web/src/components/docente/StudentList.tsx`

| Funcionalidad                                         | Línea   | Estado                        |
| ----------------------------------------------------- | ------- | ----------------------------- |
| `handleAddPoints`                                     | 175-179 | Estado local, **NO persiste** |
| `saveObservation`                                     | 187-198 | Estado local, **NO persiste** |
| "INICIAR CLASE"                                       | 237-239 | Sin handler                   |
| Botón "Contactar (WhatsApp)"                          | 333-336 | Sin handler                   |
| Tabs: Asistencia/Observaciones/Planificación/Métricas | 351-358 | `"Contenido en desarrollo"`   |

**Datos Mock:**

- `getCommissionData()` (línea 20-147): 3 comisiones con estudiantes hardcodeados
- No usa `docentesApi.getEstudiantesComision()` que SÍ existe en backend

**Estado:** 🔴 **Ignora endpoints existentes del backend**

---

### 3. CalendarPage.tsx - 100% MOCK

**Archivo:** `apps/web/src/components/docente/CalendarPage.tsx`

| Funcionalidad          | Línea   | Estado                          |
| ---------------------- | ------- | ------------------------------- |
| `handleAddEvent`       | 138-154 | Estado local, **NO persiste**   |
| Eventos del calendario | 28-92   | Hardcodeados en `initialEvents` |

**Backend disponible pero NO usado:**

- `docentesApi.getClasesDelMes(mes, anio)` - Endpoint existe

**Estado:** 🔴 **Backend existe pero NO integrado**

---

### 4. PlanificacionesPage.tsx - PARCIAL

**Archivo:** `apps/web/src/components/docente/PlanificacionesPage.tsx`

| Funcionalidad              | Línea   | Estado                        |
| -------------------------- | ------- | ----------------------------- |
| `toggleWeekLock`           | 96-108  | Estado local, **NO persiste** |
| Botón "Previsualizar"      | 252-255 | Sin handler                   |
| Botón "Presentar en Clase" | 256-259 | Sin handler                   |

**Datos Mock:**

- `mockPlannings` (línea 36-88): 3 planificaciones hardcodeadas

**Backend disponible pero NO usado:**

- `planificacionesApi.getMisAsignaciones()` - Endpoint existe
- `planificacionesApi.activarSemana()` - Endpoint existe
- `planificacionesApi.desactivarSemana()` - Endpoint existe

**Estado:** 🟡 **Backend existe, falta integración**

---

### 5. AlertsPage.tsx - 80% MOCK

**Archivo:** `apps/web/src/components/docente/AlertsPage.tsx`

| Funcionalidad           | Línea   | Estado                        |
| ----------------------- | ------- | ----------------------------- |
| `handleSaveObservation` | 73-78   | **Vacío** - solo cierra modal |
| "Enviar Email"          | 189-193 | Sin handler                   |
| "WhatsApp"              | 194-199 | Sin handler                   |
| "Marcar Resuelto"       | 213-218 | Sin handler                   |

**Datos Mock:**

- `detailedAlerts` (línea 19-60): 4 alertas hardcodeadas

**Estado:** 🔴 **Backend para alertas NO existe**

---

### 6. ResourcesPage.tsx - 100% MOCK

**Archivo:** `apps/web/src/components/docente/ResourcesPage.tsx`

| Funcionalidad         | Línea   | Estado                     |
| --------------------- | ------- | -------------------------- |
| "Subir Recurso"       | 169-172 | Sin handler                |
| "Descargar" / "Abrir" | 253-254 | Sin handler                |
| Búsqueda              | 163-167 | UI solo, sin funcionalidad |

**Datos Mock:**

- `mockResources` (línea 27-107): 8 recursos hardcodeados

**Estado:** 🔴 **Sin endpoints de backend**

---

### 7. DashboardModals.tsx - 100% MOCK

**Archivo:** `apps/web/src/components/docente/DashboardModals.tsx`

| Datos                      | Estado                      |
| -------------------------- | --------------------------- |
| `weeklyClassesData`        | Hardcodeado (línea 27-33)   |
| `attendanceTrendData`      | Hardcodeado (línea 35-41)   |
| `studentsDistributionData` | Hardcodeado (línea 43-48)   |
| `topStudentsData`          | Hardcodeado (línea 52-57)   |
| "Ver Ranking Completo"     | Sin handler (línea 266-268) |

**Backend disponible pero NO usado:**

- `docentesApi.getEstadisticasCompletas()` - Retorna datos reales

**Estado:** 🟡 **Backend existe, falta integración**

---

### 8. CourseList.tsx - 100% MOCK

**Archivo:** `apps/web/src/components/docente/CourseList.tsx`

| Datos          | Estado                             |
| -------------- | ---------------------------------- |
| `courses`      | 4 cursos hardcodeados (línea 5-46) |
| "Ver Todo"     | Sin handler (línea 56-58)          |
| Click en curso | Sin navegación real                |

**Estado:** 🔴 **Componente obsoleto** - Reemplazado por ComisionesGrid

---

### 9. StatsGrid.tsx - 100% MOCK

**Archivo:** `apps/web/src/components/docente/StatsGrid.tsx`

| Datos   | Estado                   |
| ------- | ------------------------ |
| `stats` | Hardcodeado (línea 5-32) |

**Estado:** 🔴 **Componente obsoleto** - Reemplazado por StatsDocente

---

## 🟡 Funcionalidades con Backend PARCIAL

### 10. ProximaClaseCard.tsx

**Archivo:** `apps/web/src/components/docente/ProximaClaseCard.tsx`

| Funcionalidad             | Línea   | Estado                                      |
| ------------------------- | ------- | ------------------------------------------- |
| Botón "INICIAR CLASE"     | 241-262 | `console.log('Iniciar Clase', comision.id)` |
| "Ver Calendario Completo" | 102-104 | Sin handler                                 |

**Datos Reales:** ✅ Usa datos de `comision` prop
**Datos Mock:**

- Sesión #12 de 24 (línea 204-206) - Hardcodeado
- Asistencia 94% (línea 212-214) - Hardcodeado
- Thumbnail usa picsum.photos (línea 118)

**Backend faltante:**

- Endpoint para iniciar clase (crear sesión LiveKit?)
- Endpoint para obtener sesión actual de la comisión
- Progreso real de la comisión (sesión X de Y)

**Estado:** 🟡 **Datos parciales, acciones pendientes**

---

### 11. Dashboard page.tsx (Principal)

**Archivo:** `apps/web/src/app/docente/dashboard/page.tsx`

| Lo que SÍ funciona                      | Endpoint                        |
| --------------------------------------- | ------------------------------- |
| Comisiones del docente                  | `docentesApi.getDashboard()` ✅ |
| Stats (clases, estudiantes, asistencia) | `docentesApi.getDashboard()` ✅ |
| Alertas de estudiantes con faltas       | `docentesApi.getDashboard()` ✅ |
| Logout                                  | `useAuthStore.logout()` ✅      |

| Lo que NO funciona         | Estado                      |
| -------------------------- | --------------------------- |
| `puntosOtorgados` en stats | Hardcodeado a 0 (línea 127) |
| Navegación a Live Class    | Usa mock `LiveClassPage`    |
| Navegación a Alertas       | Usa mock `AlertsPage`       |
| Detalle de comisión        | Usa mock `StudentList`      |

**Estado:** 🟢 **Dashboard funcional, vistas secundarias mock**

---

## 🟢 Funcionalidades Completas (End-to-End)

| Componente     | Funcionalidad     | Endpoint Backend                |
| -------------- | ----------------- | ------------------------------- |
| Header.tsx     | Logout            | `auth/logout` ✅                |
| Header.tsx     | Ver perfil        | Navega a `/docente/perfil` ✅   |
| Dashboard      | Stats generales   | `GET /docentes/me/dashboard` ✅ |
| Dashboard      | Mis comisiones    | `GET /docentes/me/dashboard` ✅ |
| Dashboard      | Alertas de faltas | `GET /docentes/me/dashboard` ✅ |
| ComisionCard   | Mostrar datos     | Usa props de API ✅             |
| ComisionesGrid | Listar comisiones | Usa props de API ✅             |
| StatsDocente   | Mostrar métricas  | Usa props de API ✅             |

---

## 📋 Endpoints Backend Existentes pero NO Usados

| Endpoint                                                  | Descripción               | Componente que debería usarlo    |
| --------------------------------------------------------- | ------------------------- | -------------------------------- |
| `GET /docentes/me/clases-del-mes`                         | Clases del calendario     | CalendarPage.tsx                 |
| `GET /docentes/me/comisiones/:id/estudiantes`             | Estudiantes de comisión   | StudentList.tsx                  |
| `GET /docentes/me/comisiones/:id/metricas`                | Métricas de comisión      | StudentList.tsx (tab Métricas)   |
| `GET /docentes/me/comisiones/:id/historial-asistencia`    | Historial de asistencia   | StudentList.tsx (tab Asistencia) |
| `GET /docentes/me/estadisticas-completas`                 | Stats para observaciones  | DashboardModals.tsx              |
| `GET /docentes/me/asignaciones`                           | Planificaciones asignadas | PlanificacionesPage.tsx          |
| `POST /docentes/asignaciones/:id/semanas/:num/activar`    | Activar semana            | PlanificacionesPage.tsx          |
| `POST /docentes/asignaciones/:id/semanas/:num/desactivar` | Desactivar semana         | PlanificacionesPage.tsx          |
| `GET /docentes/asignaciones/:id/progreso`                 | Progreso de estudiantes   | PlanificacionesPage.tsx          |
| `GET /docentes/me/proxima-clase`                          | Próxima clase del docente | ProximaClaseCard.tsx             |

---

## 📋 Endpoints Backend que FALTAN

| Funcionalidad           | Endpoint Sugerido                     | Prioridad |
| ----------------------- | ------------------------------------- | --------- |
| Iniciar clase en vivo   | `POST /clases/:id/sesion/iniciar`     | 🔴 Alta   |
| Finalizar clase en vivo | `POST /clases/:id/sesion/finalizar`   | 🔴 Alta   |
| Chat de clase           | WebSocket `/clases/:id/chat`          | 🟡 Media  |
| Lanzar Quiz             | `POST /clases/:id/quiz`               | 🟡 Media  |
| Responder Quiz          | `POST /quiz/:id/responder`            | 🟡 Media  |
| Ping a estudiante       | `POST /clases/:id/ping/:estudianteId` | 🟡 Media  |
| Gestionar puntos        | `PATCH /estudiantes/:id/puntos`       | 🟡 Media  |
| Agregar observación     | `POST /estudiantes/:id/observaciones` | 🟡 Media  |
| Marcar alerta resuelta  | `PATCH /alertas/:id/resolver`         | 🟡 Media  |
| Recursos/archivos       | `GET/POST /docentes/me/recursos`      | 🟢 Baja   |
| Enviar email            | `POST /notificaciones/email`          | 🟢 Baja   |
| Enviar WhatsApp         | `POST /notificaciones/whatsapp`       | 🟢 Baja   |

---

## 🛠️ Plan de Acción Recomendado

### Fase 1: Integrar Backend Existente (Quick Wins)

1. **CalendarPage** - Usar `docentesApi.getClasesDelMes()`
2. **StudentList** - Usar `docentesApi.getEstudiantesComision()`
3. **PlanificacionesPage** - Usar `planificacionesApi.getMisAsignaciones()`
4. **DashboardModals** - Usar `docentesApi.getEstadisticasCompletas()`
5. **ProximaClaseCard** - Usar `docentesApi.getProximaClase()`

### Fase 2: Crear Endpoints Faltantes

1. Gestión de puntos para estudiantes
2. Sistema de observaciones
3. Sistema de alertas con resolución
4. Historial de asistencia en tabs

### Fase 3: Clase en Vivo (Complejo)

1. Integración con LiveKit (ya existe directorio `apps/api/src/livekit/`)
2. Sistema de chat en tiempo real
3. Sistema de quiz interactivo
4. Tracking de atención de estudiantes

### Fase 4: Recursos y Notificaciones

1. Upload/gestión de recursos
2. Sistema de notificaciones por email
3. Integración WhatsApp (opcional)

---

## 📂 Archivos a Priorizar

```
PRIORIDAD ALTA (Backend existe, solo integrar):
├── apps/web/src/components/docente/CalendarPage.tsx
├── apps/web/src/components/docente/StudentList.tsx
├── apps/web/src/components/docente/PlanificacionesPage.tsx
├── apps/web/src/components/docente/DashboardModals.tsx
└── apps/web/src/components/docente/ProximaClaseCard.tsx

PRIORIDAD MEDIA (Requiere backend nuevo):
├── apps/web/src/components/docente/AlertsPage.tsx
├── apps/web/src/components/docente/ResourcesPage.tsx
└── apps/web/src/components/docente/LiveClassPage.tsx

ELIMINAR/DEPRECAR (Componentes obsoletos):
├── apps/web/src/components/docente/CourseList.tsx
└── apps/web/src/components/docente/StatsGrid.tsx
```

---

## 📝 Notas Adicionales

1. **LiveKit**: Ya existe directorio `apps/api/src/livekit/` - revisar estado de implementación
2. **WebSockets**: No hay implementación actual para chat en tiempo real
3. **Thumbnails**: Todos usan `picsum.photos` - necesita sistema de uploads
4. **Puntos**: Sistema de gamificación parcialmente implementado pero no conectado al portal docente
