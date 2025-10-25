# 🎯 PLAN DE ACCIÓN - VERTICAL SLICES

**Fecha de creación:** 2025-10-24
**Branch inicial:** `feature/portal-tutor`
**Objetivo:** Completar MVP v1 con implementación incremental y deployable

---

## 📋 METODOLOGÍA DE TRABAJO

### **Principios obligatorios en CADA slice:**

1. ✅ **TDD (Test-Driven Development)**
   - Tests ANTES de implementación
   - Red → Green → Refactor
   - Coverage mínimo: 80%

2. ✅ **TypeScript estricto**
   - ❌ PROHIBIDO: `any`, `unknown`
   - ✅ REQUERIDO: Tipos explícitos y interfaces
   - ✅ Validación con class-validator

3. ✅ **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

4. ✅ **Clean Architecture**
   - Entities (domain)
   - Use Cases (application)
   - Controllers/Gateways (infrastructure)
   - DTOs separados (input/output)
   - Repository Pattern

5. ✅ **Estructura por slice:**
   ```
   📁 apps/api/src/planificaciones/
   ├── 📁 domain/
   │   ├── planificacion.entity.ts
   │   └── planificacion.repository.interface.ts
   ├── 📁 application/
   │   ├── dto/
   │   │   ├── create-planificacion.dto.ts
   │   │   └── planificacion-response.dto.ts
   │   └── use-cases/
   │       ├── create-planificacion.use-case.ts
   │       └── get-planificaciones.use-case.ts
   ├── 📁 infrastructure/
   │   ├── prisma-planificacion.repository.ts
   │   └── planificaciones.controller.ts
   └── 📁 __tests__/
       ├── unit/
       ├── integration/
       └── e2e/
   ```

---

## **FASE 1: PLANIFICACIONES (Fundación crítica)**

### **SLICE 1: Ver Planificaciones Mensuales (Admin)** ⬜
**Valor:** Admin puede ver todas las planificaciones del sistema
**Tiempo estimado:** 15h
**Branch:** `slice/01-planificaciones-list`

**Stack completo:**
- **Backend:**
  - Repository: `IPlanificacionRepository` interface + Prisma implementation
  - Use Case: `GetPlanificacionesUseCase`
  - Controller: `GET /api/planificaciones` (filtros: mes, año, codigo_grupo, estado)
  - DTOs: `GetPlanificacionesQueryDto`, `PlanificacionListResponseDto`
  - Guards: `AdminGuard`

- **Frontend:**
  - Page: `apps/web/src/app/(admin)/planificaciones/page.tsx`
  - Components: `PlanificacionesTable`, `PlanificacionFilters`
  - API Client: `planificaciones.api.ts`
  - Types: `PlanificacionListItem`

- **Tests:**
  - Unit: Use case con mocks
  - Integration: Repository con test DB
  - E2E: Flujo completo con Supertest

**Criterios de aceptación:**
- [ ] Admin ve lista de planificaciones
- [ ] Puede filtrar por mes, año, grupo
- [ ] Ve estado (borrador/publicada/archivada)
- [ ] Paginación funcional
- [ ] Tests passing 100%

---

### **SLICE 2: Crear Planificación Mensual (Admin)** ⬜
**Valor:** Admin puede crear planificación para un grupo/mes
**Tiempo estimado:** 20h
**Branch:** `slice/02-planificaciones-create`

**Stack completo:**
- **Backend:**
  - Use Case: `CreatePlanificacionUseCase`
  - Controller: `POST /api/planificaciones`
  - DTOs: `CreatePlanificacionDto`, `PlanificacionResponseDto`
  - Validaciones:
    - Unique constraint (codigo_grupo + mes + año)
    - Mes válido (1-12)
    - Código grupo válido (B1, B2, B3)
  - Guards: `AdminGuard`

- **Frontend:**
  - Modal: `CreatePlanificacionModal`
  - Form: React Hook Form + Zod validation
  - API Client: `createPlanificacion()`
  - Toast notifications

- **Tests:**
  - Unit: Validaciones + lógica negocio
  - Integration: DB constraints
  - E2E: Creación exitosa + errores

**Criterios de aceptación:**
- [ ] Admin crea planificación con datos válidos
- [ ] Validación unique (grupo + mes + año)
- [ ] Estado inicial: "borrador"
- [ ] Título auto-generado o manual
- [ ] Error handling completo
- [ ] Tests passing 100%

---

### **SLICE 3: Agregar Actividades a Planificación (Admin)** ⬜
**Valor:** Admin llena la planificación con actividades semanales
**Tiempo estimado:** 25h
**Branch:** `slice/03-planificaciones-actividades`

**Stack completo:**
- **Backend:**
  - Use Case: `AddActividadToPlanificacionUseCase`
  - Controller: `POST /api/planificaciones/:id/actividades`
  - DTOs: `CreateActividadDto`, `ActividadResponseDto`
  - Validaciones:
    - Planificación existe
    - Semana válida (1-4)
    - Componente válido (enum)
  - Guards: `AdminGuard` + `PlanificacionOwnershipGuard`

- **Frontend:**
  - Page: `apps/web/src/app/(admin)/planificaciones/[id]/page.tsx`
  - Components:
    - `ActividadEditor` (4 semanas en tabs)
    - `ComponentePicker` (juegos/videos/ejercicios)
    - `ActividadPreview`
  - API Client: `addActividad()`, `updateActividad()`, `deleteActividad()`

- **Tests:**
  - Unit: Lógica editor + validaciones
  - Integration: CRUD actividades
  - E2E: Flujo completo agregar/editar/eliminar

**Criterios de aceptación:**
- [ ] Admin agrega actividades por semana (1-4)
- [ ] Selecciona componente (juego/video/pdf)
- [ ] Define descripción y props del componente
- [ ] Puede editar/eliminar actividades
- [ ] Preview en tiempo real
- [ ] Tests passing 100%

**Resultado FASE 1:**
- ✅ CRUD completo Planificaciones
- ✅ Base sólida para asignaciones (Fase 3)
- ✅ 60h de trabajo vertical

---

## **FASE 2: PORTAL TUTOR (Gap crítico #1)**

### **SLICE 4: Login + Dashboard Tutor** ⬜
**Valor:** Tutor puede entrar y ver su home
**Tiempo estimado:** 12h
**Branch:** `slice/04-portal-tutor-dashboard`

**Stack completo:**
- **Backend:**
  - ✅ Ya existe: `POST /api/auth/login`, `GET /api/tutores/me`
  - Verificar: TutorGuard funcional

- **Frontend:**
  - Layout: `apps/web/src/app/(tutor)/layout.tsx`
  - Page: `apps/web/src/app/(tutor)/dashboard/page.tsx`
  - Components:
    - `TutorSidebar` (navegación)
    - `TutorDashboardStats` (widgets vacíos)
  - Auth: Redirect logic por rol
  - API Client: `auth.api.ts` update

- **Tests:**
  - E2E: Login flow tutor → redirect dashboard
  - Unit: Role-based navigation

**Criterios de aceptación:**
- [ ] Tutor hace login
- [ ] Redirect a `/tutor/dashboard`
- [ ] Ve layout con sidebar
- [ ] Dashboard vacío con mensaje bienvenida
- [ ] Tests passing 100%

---

### **SLICE 5: Ver Estudiantes Asignados (Tutor)** ⬜
**Valor:** Tutor ve lista de sus estudiantes
**Tiempo estimado:** 18h
**Branch:** `slice/05-tutor-estudiantes-list`

**Stack completo:**
- **Backend:**
  - Repository: `ITutorRepository.getEstudiantes(tutorId)`
  - Use Case: `GetTutorEstudiantesUseCase`
  - Controller: `GET /api/tutores/me/estudiantes`
  - DTOs: `EstudianteListItemDto`
  - Guards: `TutorGuard` + ownership automático (req.user)

- **Frontend:**
  - Page: `apps/web/src/app/(tutor)/estudiantes/page.tsx`
  - Components:
    - `EstudiantesTable`
    - `EstudianteFilters` (grupo, estado)
    - `EstudianteCard` (vista mobile)
  - API Client: `getTutorEstudiantes()`

- **Tests:**
  - Unit: Use case + filtros
  - Integration: Query con joins (estudiantes + inscripciones)
  - E2E: Tutor solo ve SUS estudiantes

**Criterios de aceptación:**
- [ ] Tutor ve lista de estudiantes asignados
- [ ] Muestra: nombre, grupo, estado inscripción
- [ ] Filtros por grupo y estado
- [ ] Búsqueda por nombre
- [ ] NO puede ver estudiantes de otros tutores
- [ ] Tests passing 100%

---

### **SLICE 6: Ver Progreso de Estudiante (Tutor)** ⬜
**Valor:** Tutor hace click en estudiante y ve su progreso completo
**Tiempo estimado:** 25h
**Branch:** `slice/06-tutor-estudiante-progreso`

**Stack completo:**
- **Backend:**
  - Use Case: `GetEstudianteProgresoUseCase`
  - Controller: `GET /api/tutores/estudiantes/:id/progreso`
  - DTOs: `EstudianteProgresoDto` (asistencias, puntos, logros, pagos)
  - Aggregations:
    - Total asistencias por mes
    - Puntos acumulados
    - Logros desbloqueados
    - Estado pagos (al día / deuda)
  - Guards: `TutorGuard` + `EstudianteOwnershipGuard` (verificar es su estudiante)

- **Frontend:**
  - Page: `apps/web/src/app/(tutor)/estudiantes/[id]/page.tsx`
  - Components:
    - `EstudianteHeader` (foto, nombre, grupo)
    - `ProgresoTabs` (asistencias / gamificación / pagos)
    - `AsistenciasChart` (Chart.js - por mes)
    - `GamificacionCard` (puntos, nivel, logros)
    - `PagosTimeline` (historial)
  - API Client: `getEstudianteProgreso(id)`

- **Tests:**
  - Unit: Cálculos aggregations
  - Integration: Queries complejas
  - E2E: Tutor NO puede ver progreso de estudiante ajeno

**Criterios de aceptación:**
- [ ] Tutor ve perfil completo estudiante
- [ ] Tab Asistencias: gráfico mensual + tabla
- [ ] Tab Gamificación: puntos, nivel, logros
- [ ] Tab Pagos: timeline + estado actual
- [ ] Ownership validado (403 si no es su estudiante)
- [ ] Tests passing 100%

---

### **SLICE 7: Ver Planificación Asignada (Tutor)** ⬜
**Valor:** Tutor ve la planificación del grupo de su estudiante
**Tiempo estimado:** 15h
**Branch:** `slice/07-tutor-planificacion-view`

**Stack completo:**
- **Backend:**
  - Use Case: `GetPlanificacionForTutorUseCase`
  - Controller: `GET /api/planificaciones/:id` (con permisos tutor)
  - Guard: `PlanificacionAccessGuard` (admin O tutor con estudiante en ese grupo)
  - DTO: `PlanificacionDetailDto` (readonly)

- **Frontend:**
  - Page: `apps/web/src/app/(tutor)/planificaciones/[id]/page.tsx`
  - Components:
    - `PlanificacionHeader` (grupo, mes, año)
    - `ActividadesCalendar` (vista semanal readonly)
    - `ActividadDetailModal` (descripción, componente)
  - API Client: `getPlanificacion(id)`

- **Tests:**
  - Unit: Lógica permisos
  - Integration: Access guard
  - E2E: Tutor ve planificación de grupo con sus estudiantes, NO de otros grupos

**Criterios de aceptación:**
- [ ] Tutor ve planificación del grupo de su estudiante
- [ ] Vista readonly (no puede editar)
- [ ] Ve todas las actividades por semana
- [ ] Puede ver detalle de cada actividad
- [ ] NO puede ver planificaciones de grupos sin sus estudiantes
- [ ] Tests passing 100%

**Resultado FASE 2:**
- ✅ Portal Tutor 100% funcional
- ✅ Gap crítico #1 resuelto
- ✅ 70h de trabajo vertical

---

## **FASE 3: ASIGNACIONES Y FLUJOS**

### **SLICE 8: Asignar Docente a Planificación (Admin)** ⬜
**Valor:** Admin conecta docente con planificación
**Tiempo estimado:** 18h
**Branch:** `slice/08-asignar-docente-planificacion`

**Stack completo:**
- **Backend:**
  - Use Case: `AsignarDocentePlanificacionUseCase`
  - Controller: `POST /api/planificaciones/:id/asignar-docente`
  - DTOs: `AsignarDocenteDto`, `AsignacionResponseDto`
  - Side Effects:
    - Crear registro `AsignacionDocente`
    - Enviar email notificación docente
    - Crear notificación in-app
  - Guards: `AdminGuard`

- **Frontend:**
  - Component: `AsignarDocenteModal`
  - Select: Lista docentes disponibles
  - Confirmation: Preview asignación
  - Toast: Success/error feedback
  - API Client: `asignarDocente()`

- **Tests:**
  - Unit: Lógica asignación + notificación
  - Integration: Cascadas DB
  - E2E: Flujo completo + email sent

**Criterios de aceptación:**
- [ ] Admin selecciona docente para planificación
- [ ] Se crea AsignacionDocente
- [ ] Docente recibe email notificación
- [ ] Docente recibe notificación in-app
- [ ] Validación: docente no duplicado en misma planificación
- [ ] Tests passing 100%

---

### **SLICE 9: Ver Planificación Asignada (Docente)** ⬜
**Valor:** Docente ve su planificación en portal
**Tiempo estimado:** 15h
**Branch:** `slice/09-docente-planificaciones`

**Stack completo:**
- **Backend:**
  - Use Case: `GetDocentePlanificacionesUseCase`
  - Controller: `GET /api/docentes/me/planificaciones`
  - DTOs: `DocentePlanificacionDto`
  - Filtros: mes, año, estado
  - Guards: `DocenteGuard`

- **Frontend:**
  - Page: `apps/web/src/app/(docente)/planificaciones/page.tsx`
  - Components:
    - `PlanificacionesDocenteList`
    - `PlanificacionCard` (grupo, periodo, actividades count)
  - API Client: `getDocentePlanificaciones()`

- **Tests:**
  - Unit: Filtros + ordenamiento
  - Integration: Query asignaciones
  - E2E: Docente solo ve sus asignaciones

**Criterios de aceptación:**
- [ ] Docente ve lista de planificaciones asignadas
- [ ] Filtra por mes/año/estado
- [ ] Click en planificación → detalle
- [ ] NO ve planificaciones de otros docentes
- [ ] Tests passing 100%

---

### **SLICE 10: Marcar Actividad Completada (Docente)** ⬜
**Valor:** Docente checkea actividades cumplidas
**Tiempo estimado:** 20h
**Branch:** `slice/10-completar-actividad`

**Stack completo:**
- **Backend:**
  - Use Case: `CompletarActividadUseCase`
  - Controller: `PATCH /api/planificaciones/actividades/:id/completar`
  - DTOs: `CompletarActividadDto`, `ActividadCompletadaResponseDto`
  - Cascada:
    - Update `ActividadSemanal.completada = true`
    - Create `ProgresoEstudianteActividad` (todos los estudiantes del grupo)
  - Guards: `DocenteGuard` + ownership (asignado a esa planificación)

- **Frontend:**
  - Component: `ActividadCheckbox`
  - Modal: `CompletarActividadModal` (observaciones opcionales)
  - Feedback: Optimistic UI update
  - API Client: `completarActividad()`

- **Tests:**
  - Unit: Lógica cascada
  - Integration: Updates múltiples
  - E2E: Marcar completada → progreso estudiantes actualizado

**Criterios de aceptación:**
- [ ] Docente marca actividad como completada
- [ ] Puede agregar observaciones
- [ ] Se actualiza progreso de todos los estudiantes del grupo
- [ ] Solo puede completar actividades de SUS planificaciones
- [ ] Tests passing 100%

**Resultado FASE 3:**
- ✅ Flujo Planificaciones → Docente completo
- ✅ Cascadas funcionando
- ✅ 53h de trabajo vertical

---

## **FASE 4: GAMIFICACIÓN UI**

### **SLICE 11: Ver Puntos y Nivel (Estudiante)** ⬜
**Valor:** Estudiante ve su gamificación en portal
**Tiempo estimado:** 15h
**Branch:** `slice/11-estudiante-gamificacion`

**Stack completo:**
- **Backend:**
  - ✅ Ya existe: `GET /api/estudiantes/me/gamificacion`
  - Verificar: Response structure correcta

- **Frontend:**
  - Page: `apps/web/src/app/(estudiante)/gamificacion/page.tsx`
  - Components:
    - `PuntosWidget` (puntos actuales + barra progreso nivel)
    - `NivelCard` (nivel actual + próximo nivel)
    - `RankingMiniTable` (top 5 + posición del estudiante)
  - API Client: `getMyGamificacion()`

- **Tests:**
  - Unit: Cálculo barra progreso
  - Integration: Query puntos + nivel
  - E2E: Estudiante ve sus datos

**Criterios de aceptación:**
- [ ] Estudiante ve puntos totales
- [ ] Ve nivel actual + progreso al siguiente
- [ ] Ve su posición en ranking
- [ ] Animación en cambio de nivel
- [ ] Tests passing 100%

---

### **SLICE 12: Ver Logros Desbloqueados (Estudiante)** ⬜
**Valor:** Estudiante ve sus badges y logros
**Tiempo estimado:** 18h
**Branch:** `slice/12-estudiante-logros`

**Stack completo:**
- **Backend:**
  - Use Case: `GetEstudianteLogrosUseCase`
  - Controller: `GET /api/logros/me`
  - DTOs: `LogroDto` (incluye estado: bloqueado/desbloqueado)
  - Response: Todos los logros con flag `desbloqueado` + `fecha_desbloqueo`
  - Guards: `EstudianteGuard`

- **Frontend:**
  - Page: `apps/web/src/app/(estudiante)/logros/page.tsx`
  - Components:
    - `LogrosGallery` (grid de badges)
    - `LogroCard` (bloqueado: grayscale, desbloqueado: color)
    - `LogroDetailModal` (descripción, condición, fecha desbloqueo)
  - API Client: `getMyLogros()`

- **Tests:**
  - Unit: Filtros estado
  - Integration: Query logros + user_logros
  - E2E: Estudiante ve logros correctos

**Criterios de aceptación:**
- [ ] Estudiante ve todos los logros (bloqueados + desbloqueados)
- [ ] Logros bloqueados en grayscale con tooltip "¿Cómo desbloquear?"
- [ ] Logros desbloqueados con fecha
- [ ] Click en logro → modal detalle
- [ ] Tests passing 100%

**Resultado FASE 4:**
- ✅ Gamificación UI completa
- ✅ Experiencia estudiante mejorada
- ✅ 33h de trabajo vertical

---

## **FASE 5: OWNERSHIP & SEGURIDAD**

### **SLICE 13: Ownership Guards - Estudiantes** ⬜
**Valor:** Seguridad - usuarios solo ven sus datos
**Tiempo estimado:** 10h
**Branch:** `slice/13-ownership-estudiantes`

**Stack completo:**
- **Backend (refactor):**
  - Guard: `EstudianteOwnershipGuard`
  - Aplicar en endpoints:
    - `GET /api/estudiantes/:id`
    - `GET /api/estudiantes/:id/asistencias`
    - `GET /api/estudiantes/:id/inscripciones`
    - `GET /api/estudiantes/:id/pagos`
    - `GET /api/estudiantes/:id/equipos`
    - `PATCH /api/estudiantes/:id`
  - Lógica: `req.user.sub === params.id` O `req.user.role === 'admin'`

- **Tests:**
  - Unit: Guard logic
  - E2E:
    - Estudiante A intenta ver datos de Estudiante B → 403
    - Admin puede ver cualquier estudiante → 200

**Criterios de aceptación:**
- [ ] EstudianteOwnershipGuard implementado
- [ ] Aplicado en 6+ endpoints críticos
- [ ] Tests de seguridad passing
- [ ] Admin bypass funcional
- [ ] Tests passing 100%

---

### **SLICE 14: Ownership Guards - Tutores** ⬜
**Valor:** Seguridad - tutores solo ven sus estudiantes
**Tiempo estimado:** 10h
**Branch:** `slice/14-ownership-tutores`

**Stack completo:**
- **Backend (refactor):**
  - Guard: `TutorEstudianteOwnershipGuard`
  - Aplicar en endpoints:
    - `GET /api/tutores/estudiantes/:id/progreso`
    - `GET /api/tutores/estudiantes/:id/asistencias`
    - `GET /api/tutores/estudiantes/:id/pagos`
  - Lógica: Verificar `estudiante.tutor_id === req.user.sub`

- **Tests:**
  - Unit: Guard logic + DB query
  - E2E:
    - Tutor A intenta ver estudiante de Tutor B → 403
    - Tutor ve su propio estudiante → 200

**Criterios de aceptación:**
- [ ] TutorEstudianteOwnershipGuard implementado
- [ ] Verificación contra DB (estudiante.tutor_id)
- [ ] Aplicado en 3+ endpoints
- [ ] Tests de permisos cruzados
- [ ] Tests passing 100%

**Resultado FASE 5:**
- ✅ Seguridad ownership robusta
- ✅ Guards reusables
- ✅ 20h de trabajo vertical

---

## **FASE 6: NOTIFICACIONES (OPCIONAL MVP)**

### **SLICE 15: Notificaciones en Dashboard (Todas las roles)** ⬜
**Valor:** Usuarios ven notificaciones en UI
**Tiempo estimado:** 20h
**Branch:** `slice/15-notificaciones-ui`

**Stack completo:**
- **Backend:**
  - Use Cases:
    - `GetMyNotificacionesUseCase`
    - `MarkNotificacionAsReadUseCase`
  - Controllers:
    - `GET /api/notificaciones/me`
    - `PATCH /api/notificaciones/:id/mark-read`
    - `PATCH /api/notificaciones/mark-all-read`
  - DTOs: `NotificacionDto`
  - Guards: Por rol (Admin/Docente/Tutor/Estudiante)

- **Frontend:**
  - Component: `NotificacionesDropdown` (en navbar)
  - Badge: Contador de no leídas
  - List: Últimas 10 notificaciones
  - Actions: Mark as read, mark all as read
  - API Client: `getMyNotificaciones()`, `markAsRead()`

- **Tests:**
  - Unit: Filtros leídas/no leídas
  - Integration: Mark as read updates
  - E2E: Usuario ve solo SUS notificaciones

**Criterios de aceptación:**
- [ ] Dropdown notificaciones en navbar
- [ ] Badge con contador no leídas
- [ ] Lista últimas 10 notificaciones
- [ ] Click en notificación → marca como leída + redirect
- [ ] "Marcar todas como leídas" funcional
- [ ] Tests passing 100%

---

### **SLICE 16: WebSocket - Notificaciones Real-time** ⬜
**Valor:** Notificaciones instantáneas sin refresh
**Tiempo estimado:** 30h
**Branch:** `slice/16-websocket-notifications`

**Stack completo:**
- **Backend:**
  - Gateway: `NotificacionesGateway` (WebSocket)
  - Rooms: Por usuario (`user:${userId}`)
  - Events:
    - `notification:new` (server → client)
    - `notification:read` (client → server)
  - Auth: JWT en handshake
  - Integration: Emitir en use cases (cuando se crea notificación)

- **Frontend:**
  - Hook: `useNotificationsSocket()`
  - Client: Socket.io-client
  - Auto-connect on login
  - Auto-disconnect on logout
  - Listeners:
    - `notification:new` → update state + show toast
    - `notification:read` → update badge count

- **Tests:**
  - Unit: Gateway events
  - Integration: Room join/leave
  - E2E: Crear notificación → cliente recibe en tiempo real

**Criterios de aceptación:**
- [ ] WebSocket conecta al login
- [ ] Usuario recibe notificaciones instantáneas
- [ ] Toast aparece automáticamente
- [ ] Badge actualiza sin refresh
- [ ] Manejo de reconexión
- [ ] Tests passing 100%

**Resultado FASE 6:**
- ✅ Sistema notificaciones completo
- ✅ Real-time opcional pero funcional
- ✅ 50h de trabajo vertical

---

## 📊 RESUMEN EJECUTIVO

### **Tiempos estimados por fase:**

| Fase | Slices | Tiempo | Prioridad | Estado |
|------|--------|--------|-----------|--------|
| **FASE 1: Planificaciones** | 3 | 60h | 🔴 CRÍTICO | ⬜ Pendiente |
| **FASE 2: Portal Tutor** | 4 | 70h | 🔴 CRÍTICO | ⬜ Pendiente |
| **FASE 3: Asignaciones** | 3 | 53h | 🟡 ALTO | ⬜ Pendiente |
| **FASE 4: Gamificación UI** | 2 | 33h | 🟡 ALTO | ⬜ Pendiente |
| **FASE 5: Ownership** | 2 | 20h | 🟢 MEDIO | ⬜ Pendiente |
| **FASE 6: Notificaciones** | 2 | 50h | 🟢 BAJO | ⬜ Pendiente |
| **TOTAL MVP MÍNIMO** | **Fases 1-2** | **130h** | | |
| **TOTAL MVP COMPLETO** | **Fases 1-5** | **236h** | | |
| **TOTAL CON REAL-TIME** | **Fases 1-6** | **286h** | | |

---

### **Roadmap sugerido:**

**Semana 1-2 (130h):**
- ✅ FASE 1: Planificaciones (60h)
- ✅ FASE 2: Portal Tutor (70h)
- 🎯 **RESULTADO:** MVP mínimo funcional deployable

**Semana 3 (106h):**
- ✅ FASE 3: Asignaciones (53h)
- ✅ FASE 4: Gamificación UI (33h)
- ✅ FASE 5: Ownership (20h)
- 🎯 **RESULTADO:** MVP completo con seguridad robusta

**Semana 4 (50h) - OPCIONAL:**
- ✅ FASE 6: Notificaciones real-time
- 🎯 **RESULTADO:** Sistema completo v1.0

---

## 🎯 PRÓXIMOS PASOS

### **Iniciar FASE 1 - SLICE 1:**

1. **Crear branch:**
   ```bash
   git checkout -b slice/01-planificaciones-list
   ```

2. **Orden de implementación (TDD):**
   - [ ] Tests unitarios (Use Case)
   - [ ] Domain entities + interfaces
   - [ ] Use Case implementation
   - [ ] Tests integración (Repository)
   - [ ] Infrastructure (Controller + Prisma Repository)
   - [ ] DTOs + Validaciones
   - [ ] Tests E2E
   - [ ] Frontend components
   - [ ] Frontend page
   - [ ] Tests E2E frontend

3. **Checklist antes de merge:**
   - [ ] Tests passing 100%
   - [ ] No `any` ni `unknown`
   - [ ] SOLID principles aplicados
   - [ ] Clean Architecture respetada
   - [ ] Coverage ≥ 80%
   - [ ] Build success
   - [ ] Linter passing

4. **Merge a main:**
   ```bash
   git checkout main
   git merge slice/01-planificaciones-list
   git push origin main
   ```

---

## 📝 NOTAS FINALES

- Cada slice es **independiente y deployable**
- Nunca avanzar al siguiente slice sin completar el actual
- **TDD es obligatorio** - tests antes de código
- **TypeScript estricto** - no shortcuts
- **Clean Architecture** - separación clara de capas
- **SOLID** - código mantenible y extensible

**Commit message format:**
```
feat(slice-XX): descripción corta

- Detalle cambio 1
- Detalle cambio 2

Tests: [unit/integration/e2e]
Coverage: XX%

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**¿Listo para comenzar con SLICE 1?** 🚀
