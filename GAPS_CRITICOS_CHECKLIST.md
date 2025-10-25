# GAPS CRÍTICOS - CHECKLIST DE REFACTORIZACIONES

## PRIORIDAD 1: CRÍTICA (Antes del 26 Octubre MVP)

### GAP #1: Portal Tutor Completamente Faltante
- **Ubicación:** `apps/web/src/app/tutor/`
- **Estado:** ❌ NO EXISTE
- **Criticidad:** 🔴 CRÍTICA
- **Impacto:** 50%+ usuarios sin acceso
- **Esfuerzo:** 50 horas
- **Tareas:**
  - [ ] Crear estructura de carpetas base
  - [ ] Crear layout.tsx y pages
  - [ ] Crear dashboard con resumen hijos
  - [ ] Crear pages: hijos, reservas, pagos, calendario
  - [ ] Integrar con APIs existentes
  - [ ] Testing completo

### GAP #2: API planificaciones.api.ts Faltante
- **Ubicación:** `apps/web/src/lib/api/planificaciones.api.ts`
- **Estado:** ❌ NO EXISTE
- **Criticidad:** 🔴 CRÍTICA
- **Impacto:** P5 sin acceso desde frontend
- **Esfuerzo:** 15 horas
- **Tareas:**
  - [ ] Crear archivo con función wrapper de axios
  - [ ] Implementar 8 funciones principales
  - [ ] Tipos TypeScript completos
  - [ ] Manejo de errores
  - [ ] Testing unitario

### GAP #3: Ownership Guards Incompletos
- **Ubicación:** Backend endpoints (planificaciones, notificaciones)
- **Estado:** ⚠️ PARCIAL
- **Criticidad:** 🔴 CRÍTICA (Seguridad)
- **Impacto:** Vulnerabilidades de acceso
- **Esfuerzo:** 10 horas
- **Tareas:**
  - [ ] Auditar todos endpoints POST/PUT/DELETE
  - [ ] Aplicar EstudianteOwnershipGuard donde corresponda
  - [ ] Validar DTOs en todos endpoints
  - [ ] Testing de seguridad

### GAP #4: DTOs sin Validación
- **Ubicación:** Backend DTOs (varios módulos)
- **Estado:** ⚠️ INCOMPLETO
- **Criticidad:** 🔴 ALTA (Seguridad)
- **Impacto:** Datos inválidos en BD
- **Esfuerzo:** 8 horas
- **Tareas:**
  - [ ] Crear/actualizar DTOs faltantes
  - [ ] Agregar decoradores class-validator
  - [ ] Validar en controllers
  - [ ] Testing de validación

---

## PRIORIDAD 2: ALTA (Antes del 31 Octubre Lanzamiento)

### GAP #5: UI Planificaciones Admin
- **Ubicación:** `apps/web/src/app/admin/planificaciones/`
- **Estado:** ❌ NO EXISTE
- **Criticidad:** 🔴 CRÍTICA
- **Impacto:** Admin no puede crear planificaciones
- **Esfuerzo:** 40 horas
- **Tareas:**
  - [ ] Crear página: crear-planificacion
  - [ ] Crear página: editar-planificacion
  - [ ] Crear página: gestionar-actividades
  - [ ] Formularios completos
  - [ ] Validación con Zod schema
  - [ ] Integración API completa
  - [ ] Testing E2E

### GAP #6: UI Planificaciones Docente
- **Ubicación:** `apps/web/src/app/docente/planificaciones/`
- **Estado:** ❌ NO EXISTE
- **Criticidad:** 🔴 CRÍTICA
- **Impacto:** Docente no puede asignar planificaciones
- **Esfuerzo:** 20 horas
- **Tareas:**
  - [ ] Crear página: asignar-planificacion
  - [ ] Crear página: ver-progreso
  - [ ] Componentes de asignación
  - [ ] Integración API
  - [ ] Testing completo

### GAP #7: UI Planificaciones Estudiante
- **Ubicación:** `apps/web/src/app/estudiante/actividades/`
- **Estado:** ❌ NO EXISTE
- **Criticidad:** 🔴 CRÍTICA
- **Impacto:** Estudiante no puede completar actividades
- **Esfuerzo:** 20 horas
- **Tareas:**
  - [ ] Crear página: listado-actividades
  - [ ] Crear página: resolver-actividad
  - [ ] Componentes de resolución
  - [ ] Integración con juegos interactivos
  - [ ] Testing completo

### GAP #8: Gamificación UI Estudiante
- **Ubicación:** `apps/web/src/app/estudiante/gamificacion/`
- **Estado:** ⚠️ PARCIAL (50%)
- **Criticidad:** 🔴 ALTA
- **Impacto:** UI gamificación incompleta
- **Esfuerzo:** 20 horas
- **Tareas:**
  - [ ] Crear leaderboards (personal, grupo)
  - [ ] Crear vista de logros desbloqueados
  - [ ] Animaciones de nivel up
  - [ ] Perfil con estadísticas
  - [ ] Integración API
  - [ ] Testing visual

### GAP #9: Sistema Notificaciones Real-Time
- **Ubicación:** Backend + Frontend
- **Estado:** ⚠️ PARCIAL (75% backend, 50% frontend)
- **Criticidad:** 🟡 ALTA
- **Impacto:** Notificaciones no instantáneas
- **Esfuerzo:** 50 horas (post-MVP)
- **Tareas:**
  - [ ] Crear WebSocket gateway (NestJS)
  - [ ] Integrar con módulos (clases, gamificacion, pagos, planificaciones)
  - [ ] Crear frontend WebSocket client
  - [ ] Hooks useNotificaciones()
  - [ ] Componentes toast notifications
  - [ ] Testing E2E

---

## PRIORIDAD 3: MEDIA (Post-lanzamiento)

### GAP #10: Clean Architecture Backend
- **Ubicación:** `apps/api/src/[modulos]/`
- **Estado:** ⚠️ PARCIAL (100% en pagos/, 0% en otros)
- **Criticidad:** 🟡 MEDIA (Deuda técnica)
- **Impacto:** Dificultad mantenimiento
- **Esfuerzo:** 40 horas
- **Tareas:**
  - [ ] Refactorizar planificaciones/
  - [ ] Refactorizar notificaciones/
  - [ ] Refactorizar gamificacion/
  - [ ] Crear /application/, /domain/, /infrastructure/, /presentation/
  - [ ] Testing después refactoring

### GAP #11: Repository Pattern
- **Ubicación:** `apps/api/src/`
- **Estado:** ❌ NO IMPLEMENTADO
- **Criticidad:** 🟡 BAJA (Deuda técnica)
- **Impacto:** Acoplamiento a Prisma
- **Esfuerzo:** 35 horas (opcional)
- **Tareas:**
  - [ ] Crear repository interfaces
  - [ ] Implementar Prisma repositories
  - [ ] Actualizar servicios
  - [ ] Testing

### GAP #12: DTOs de Respuesta Seguros
- **Ubicación:** `apps/api/src/*/dto/`
- **Estado:** ⚠️ INCOMPLETO
- **Criticidad:** 🟡 MEDIA (Seguridad)
- **Impacto:** Exposición de datos sensibles
- **Esfuerzo:** 25 horas
- **Tareas:**
  - [ ] Crear Response DTOs para Estudiante
  - [ ] Crear Response DTOs para Docente
  - [ ] Crear Response DTOs para Tutor
  - [ ] Actualizar controllers
  - [ ] Testing

---

## RESUMEN POR FASE

### FASE 1: CRÍTICAS MVP (Antes 26 Oct)
```
GAP #1: Portal Tutor              50h  ████████████████████
GAP #2: API planificaciones       15h  ██████
GAP #3: Ownership Guards          10h  ████
GAP #4: DTOs Validación            8h  ███
─────────────────────────────────────────
SUBTOTAL:                          83h
```

### FASE 2: LANZAMIENTO (Antes 31 Oct)
```
GAP #5: UI Planificaciones Admin  40h  ████████████████████
GAP #6: UI Planificaciones Doc    20h  ██████████
GAP #7: UI Planificaciones Est    20h  ██████████
GAP #8: Gamificación UI           20h  ██████████
─────────────────────────────────────────
SUBTOTAL:                         100h
```

### FASE 3: MEJORAS (Post-lanzamiento)
```
GAP #9: Notificaciones Real-Time  50h  ██████████████████████████
GAP #10: Clean Architecture       40h  ████████████████████
GAP #11: Repository Pattern       35h  ██████████████████
GAP #12: Response DTOs            25h  ████████████
─────────────────────────────────────────
SUBTOTAL:                         150h
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Semana 1 (24-27 Octubre)
- [ ] Crear Portal Tutor (estructura)
- [ ] Crear API planificaciones.api.ts
- [ ] Auditar y arreglar ownership guards
- [ ] Crear DTOs faltantes

### Semana 1-2 (27-31 Octubre)
- [ ] UI Planificaciones Admin (40h)
- [ ] UI Planificaciones Docente (20h)
- [ ] UI Planificaciones Estudiante (20h)
- [ ] Mejorar Gamificación UI (20h)

### Semana 2+ (Noviembre)
- [ ] WebSocket real-time (50h)
- [ ] Clean Architecture refactoring (40h)
- [ ] Repository Pattern (35h)
- [ ] Response DTOs seguros (25h)

---

## TRACKING DE PROGRESO

### GAP #1: Portal Tutor
- [ ] Estructura de carpetas
- [ ] Layouts y páginas base
- [ ] Componentes principales
- [ ] API integrada
- [ ] Testing

### GAP #2: API Planificaciones
- [ ] Archivo creado
- [ ] Funciones implementadas
- [ ] Tipos definidos
- [ ] Testing unitario
- [ ] Documentación

### GAP #3: Ownership Guards
- [ ] Audit completado
- [ ] Guards aplicados
- [ ] DTOs validados
- [ ] Testing de seguridad
- [ ] Code review

### GAP #4: DTOs Validación
- [ ] DTOs creados
- [ ] Decoradores agregados
- [ ] Controllers actualizados
- [ ] Testing de validación
- [ ] Code review

---

## REFERENCIAS RÁPIDAS

**Portal Tutor Estructura Esperada:**
```
tutor/
├── layout.tsx
├── dashboard/
├── hijos/
├── reservas/
├── calendario/
├── pagos/
├── notificaciones/
└── perfil/
```

**API Planificaciones Funciones:**
```typescript
crearPlanificacion()
obtenerPlanificaciones()
crearActividad()
asignarPlanificacionGrupo()
asignarActividadEstudiante()
obtenerActividadesAsignadas()
actualizarProgresoActividad()
obtenerProgresoActividad()
```

**Archivos Clave a Crear:**
- `apps/web/src/app/tutor/` (DIRECTORIO)
- `apps/web/src/lib/api/planificaciones.api.ts`
- `apps/web/src/lib/schemas/planificacion.schema.ts`
- `apps/api/src/notificaciones/websocket.gateway.ts`
- `apps/web/src/lib/ws-client.ts`

---

**Estado:** LISTO PARA IMPLEMENTACIÓN  
**Última actualización:** 24 Octubre 2025  
**Próxima revisión:** 27 Octubre 2025
