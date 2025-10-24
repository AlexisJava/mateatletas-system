# SLICE 1: Ver Planificaciones Mensuales (Admin)

**Branch**: `slice/01-planificaciones-list`
**Tiempo estimado**: 15h
**Valor**: Admin puede ver todas las planificaciones del sistema

---

## 📋 Checklist de Implementación

### Backend ✅ (COMPLETADO)

#### Repository Layer
- [x] `IPlanificacionRepository` interface
- [x] `PrismaPlanificacionRepository` implementation
- [x] Tests de integración (15 tests passing)

#### Application Layer
- [x] `GetPlanificacionesUseCase`
- [x] `GetPlanificacionesQueryDto` (filtros: mes, año, codigo_grupo, estado)
- [x] `PlanificacionListResponseDto`
- [x] `PlanificacionListItemDto`
- [x] Tests unitarios (7 tests passing)

#### Infrastructure Layer
- [x] `PlanificacionesControllerV2`
- [x] Endpoint: `GET /api/planificaciones`
- [x] Guards: `JwtAuthGuard`, `RolesGuard`
- [x] Roles: `Admin`, `Tutor`, `Docente`
- [x] Swagger documentation
- [x] Tests E2E (10 tests passing)

#### Module Integration
- [ ] Verificar integración en `AppModule`
- [ ] Verificar que compile sin errores
- [ ] Verificar que todos los tests pasen (32/32)

---

### Frontend ⬜ (PENDIENTE)

#### API Client
- [ ] Crear `apps/web/src/lib/api/planificaciones.api.ts`
- [ ] Función: `getPlanificaciones(filters, pagination)`
- [ ] TypeScript types: `PlanificacionListItem`, `PlanificacionFilters`
- [ ] Error handling con try/catch

#### Components
- [ ] `PlanificacionesTable` component
  - [ ] Mostrar lista de planificaciones
  - [ ] Columnas: Grupo, Mes/Año, Estado, Actividades, Acciones
  - [ ] Paginación
  - [ ] Loading state
  - [ ] Empty state

- [ ] `PlanificacionFilters` component
  - [ ] Filtro por mes (select 1-12)
  - [ ] Filtro por año (input number)
  - [ ] Filtro por grupo (select B1, B2, B3)
  - [ ] Filtro por estado (select borrador/publicada/archivada)
  - [ ] Botón "Limpiar filtros"
  - [ ] Botón "Aplicar filtros"

#### Pages
- [ ] Crear `apps/web/src/app/(admin)/planificaciones/page.tsx`
- [ ] Layout con título "Planificaciones Mensuales"
- [ ] Botón "Nueva Planificación" (disabled con tooltip)
- [ ] Integrar `PlanificacionFilters`
- [ ] Integrar `PlanificacionesTable`
- [ ] Manejo de errores con toast

#### Routing
- [ ] Verificar que ruta `/admin/planificaciones` esté protegida
- [ ] Agregar link en sidebar de admin

---

### Tests Frontend ⬜ (PENDIENTE)

#### Component Tests
- [ ] `PlanificacionesTable.test.tsx`
  - [ ] Renderiza lista correctamente
  - [ ] Muestra loading state
  - [ ] Muestra empty state
  - [ ] Paginación funciona

- [ ] `PlanificacionFilters.test.tsx`
  - [ ] Renderiza todos los filtros
  - [ ] Aplica filtros correctamente
  - [ ] Limpia filtros

#### Integration Tests
- [ ] Flujo completo: filtrar y paginar
- [ ] Manejo de errores de API

---

## 🎯 Criterios de Aceptación

### Funcionales
- [ ] Admin puede ver lista de planificaciones
- [ ] Admin puede filtrar por mes, año, grupo, estado
- [ ] Admin ve información: grupo, mes/año, estado, cantidad de actividades
- [ ] Paginación funcional (10 items por página)
- [ ] Loading states durante carga de datos
- [ ] Empty state cuando no hay planificaciones
- [ ] Error handling con mensajes claros

### Técnicos
- [ ] Backend: 32/32 tests passing (unit + integration + E2E)
- [ ] Frontend: Tests de componentes passing
- [ ] TypeScript estricto (no `any`, no `unknown`)
- [ ] Código sigue principios SOLID
- [ ] Clean Architecture (domain → application → infrastructure)
- [ ] DTOs separados (input/output)
- [ ] Repository Pattern implementado

### No Funcionales
- [ ] Performance: Lista carga en < 1s
- [ ] Responsive: Funciona en mobile/tablet/desktop
- [ ] Accesibilidad: Navegable con teclado
- [ ] UX: Feedback visual en todas las acciones

---

## 📊 Estado Actual

### Backend: ✅ 100% COMPLETADO

```
✅ Repository: PrismaPlanificacionRepository (15 tests)
✅ Use Case: GetPlanificacionesUseCase (7 tests)
✅ Controller: PlanificacionesControllerV2 (10 tests E2E)
✅ DTOs: GetPlanificacionesQueryDto, PlanificacionListResponseDto
✅ Guards: AdminGuard via RolesGuard
✅ Total: 32/32 tests passing
```

### Frontend: ⬜ 0% COMPLETADO

```
⬜ API Client: planificaciones.api.ts
⬜ Components: PlanificacionesTable, PlanificacionFilters
⬜ Page: (admin)/planificaciones/page.tsx
⬜ Tests: Component tests
⬜ Total: 0 componentes creados
```

---

## 🚀 Próximos Pasos

1. **Verificar backend integrado**
   - Commitear módulo planificaciones
   - Verificar que compile
   - Verificar tests pasan

2. **Crear rama slice/01-planificaciones-list**
   - Branch desde feature/portal-tutor

3. **Implementar frontend**
   - API Client
   - Components
   - Page
   - Tests

4. **Testing E2E manual**
   - Levantar backend + frontend
   - Probar flujo completo
   - Verificar filtros y paginación

5. **PR y Code Review**
   - Crear PR a feature/portal-tutor
   - Review de código
   - Merge cuando esté aprobado

---

## 🎨 Diseño UI (Wireframe)

```
┌────────────────────────────────────────────────────────┐
│ Planificaciones Mensuales                [+ Nueva]     │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Filtros:                                                │
│ [Grupo: Todos ▼] [Mes: Todos ▼] [Año: 2025] [Estado ▼]│
│ [Limpiar] [Aplicar]                                     │
│                                                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Grupo │ Mes/Año │ Estado    │ Actividades │ ... │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ B1    │ 01/2025 │ Publicada │ 12         │ ⋮   │  │
│ │ B2    │ 01/2025 │ Borrador  │ 5          │ ⋮   │  │
│ │ B3    │ 12/2024 │ Archivada │ 16         │ ⋮   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ◄ Anterior  [1] 2 3 4 5  Siguiente ►                  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

**Última actualización**: 2025-10-24
**Estado**: Backend completo, Frontend pendiente
