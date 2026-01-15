# Pre-Production Testing Checklist

Análisis de cobertura de tests de integración para lanzamiento a producción.

**Fecha de análisis:** 2026-01-15
**Metodología:** Black Box Testing (tests como jueces, no cómplices)

---

## Resumen Ejecutivo

| Categoría                       | Tests | Estado                      |
| ------------------------------- | ----- | --------------------------- |
| `/integration/flows/`           | 6     | FUNCIONAN                   |
| `/integration/pagos/`           | 7     | FUNCIONAN                   |
| `/integration/portal-specific/` | 53    | FUNCIONAN                   |
| `/integration/services/`        | 7     | REPARADOS (commit 8b17f366) |

**Total:** ~170 tests de integración operativos (morosidad 26, suscripciones 28, estados 18, descuentos 22, multiples-hijos 15, concurrencia 15 + existentes).

---

## Cobertura Actual por Área

### Autenticación

| Test                                 | Cobertura                                                  |
| ------------------------------------ | ---------------------------------------------------------- |
| `auth-flow.integration.spec.ts`      | Login tutor/estudiante/docente, refresh, logout, blacklist |
| `auth.integration.spec.ts`           | Register, login, JWT cookies                               |
| `throttle-login.integration.spec.ts` | Rate limiting 5 req/min                                    |

### Estudiantes (Portal)

| Test                                    | Cobertura                                     |
| --------------------------------------- | --------------------------------------------- |
| `mi-aula.integration.spec.ts`           | Vista aula, planificaciones, progreso         |
| `completar-leccion.integration.spec.ts` | Completar lecciones, XP                       |
| `verificar-acceso.integration.spec.ts`  | Acceso por plan/suscripción/comisión/override |
| `mi-progreso.integration.spec.ts`       | Progreso y estadísticas                       |
| `activity-feed.integration.spec.ts`     | Feed de actividad                             |
| `reacciones.integration.spec.ts`        | Sistema de reacciones                         |
| `livekit-token.integration.spec.ts`     | Tokens LiveKit                                |
| `race-conditions.integration.spec.ts`   | Concurrencia                                  |
| `auth-estudiante.integration.spec.ts`   | Auth específico estudiante                    |

### Docentes (Portal)

| Test                                   | Cobertura                 |
| -------------------------------------- | ------------------------- |
| `mis-asignaciones.integration.spec.ts` | Lista de asignaciones     |
| `activar-clase.integration.spec.ts`    | Activación de clases      |
| `desactivar-clase.integration.spec.ts` | Desactivación             |
| `progreso.integration.spec.ts`         | Progreso de estudiantes   |
| `tareas.integration.spec.ts`           | Gestión de tareas         |
| `teoria-practica.integration.spec.ts`  | Contenido teoría/práctica |
| `docentes.integration.spec.ts`         | Próxima clase, comisiones |

### Tutores (Portal)

| Test                               | Cobertura                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| `tutor-portal.integration.spec.ts` | Inscripciones, dashboard, próximas clases, alertas (24 tests) |

### Admin (Portal)

| Test                                          | Cobertura                 |
| --------------------------------------------- | ------------------------- |
| `grupos-pedagogicos.integration.spec.ts`      | CRUD grupos pedagógicos   |
| `casa-mundo-asignaciones.integration.spec.ts` | Sistema Casa/Mundo 2026   |
| `pago-manual.integration.spec.ts`             | Registrar pagos manuales  |
| `stats-endpoints.integration.spec.ts`         | Endpoints de estadísticas |

### Pagos

| Test                                        | Cobertura                                               |
| ------------------------------------------- | ------------------------------------------------------- |
| `webhook-async-flow.integration.spec.ts`    | Webhooks MercadoPago, async, idempotencia               |
| `dlq-reprocesamiento.integration.spec.ts`   | Dead Letter Queue                                       |
| `flujo-pago-acceso.integration.spec.ts`     | Pago → Acceso estudiante                                |
| `vencimiento-pagos.integration.spec.ts`     | Vencimientos, recargos 15%, anulación día 12            |
| `morosidad.integration.spec.ts`             | Morosidad tutor/estudiante, lista morosos (26 tests)    |
| `suscripciones.integration.spec.ts`         | Planes, mis-suscripciones, cancelar, admin (28 tests)   |
| `suscripciones-estados.integration.spec.ts` | Transiciones de estado, grace period, acceso (18 tests) |

### Gamificación

| Test                                   | Cobertura               |
| -------------------------------------- | ----------------------- |
| `asignar-insignia.integration.spec.ts` | Asignación de insignias |
| `logros.service.integration.spec.ts`   | Desbloqueo, XP, eventos |
| `racha.service.integration.spec.ts`    | Streak system           |
| `recursos.service.integration.spec.ts` | XP, niveles             |
| `progreso.service.integration.spec.ts` | Progreso en contenidos  |

### LiveKit

| Test                               | Cobertura                 |
| ---------------------------------- | ------------------------- |
| `livekit-flow.integration.spec.ts` | Tokens, permisos, estados |

### Sandbox/Contenidos

| Test    | Cobertura                                                      |
| ------- | -------------------------------------------------------------- |
| 8 tests | CRUD contenidos, nodos, planificaciones, seguridad, edge cases |

---

## GAPS CRÍTICOS PARA PRODUCCIÓN

### ~~1. Portal Tutor~~ ✅ COMPLETADO

**Archivo:** `portal-specific/tutor/tutor-portal.integration.spec.ts`
**Tests:** 24
**Estado:** APROBADO (BBT como juez - sin bugs encontrados)

**Cobertura:**

- GET /tutor/mis-inscripciones (auth, filtros, paginación, aislamiento datos)
- GET /tutor/dashboard-resumen (auth, métricas, tutor sin hijos)
- GET /tutor/proximas-clases (auth, estructura respuesta)
- GET /tutor/alertas (auth, estructura respuesta)

---

### ~~1. Morosidad y Bloqueo de Acceso~~ ✅ COMPLETADO

**Archivo:** `pagos/morosidad.integration.spec.ts`
**Tests:** 24 (pendiente ejecución para confirmar)
**Estado:** CREADO - BBT

**Cobertura:**

- GET /pagos/morosidad/tutor/:tutorId (auth, CE1-CE5)
- GET /pagos/morosidad/estudiante/:estudianteId (auth, CE6-CE9)
- GET /pagos/morosidad/estudiantes (admin only, CE10-CE12)

**Clases de equivalencia cubiertas:**

- Tutor SIN deuda, CON deuda vencida, CON deuda no vencida
- Estudiante al día, moroso, mes actual
- Lista global de morosos para admin

---

### ~~2. Suscripciones MercadoPago~~ ✅ COMPLETADO

**Archivo:** `pagos/suscripciones.integration.spec.ts`
**Tests:** ~30 (pendiente ejecución para confirmar)
**Estado:** CREADO - BBT

**Cobertura:**

- GET /suscripciones/planes (público, CE1-CE2)
- GET /suscripciones/mis-suscripciones (tutor, CE8-CE10)
- POST /suscripciones/:id/cancelar (tutor, CE13-CE16)
- GET /suscripciones/admin (admin, CE17-CE19)
- GET /suscripciones/admin/morosas (admin, CE20)
- GET /suscripciones/admin/metricas (admin)
- POST /suscripciones (validaciones CE4-CE6)

---

## Plan de Implementación

### ~~Fase 1: Flujo de Dinero Básico~~ ✅ COMPLETADA

1. ✅ `tutor-portal.integration.spec.ts` (24 tests - PASÓ)
2. ✅ `morosidad.integration.spec.ts` (~24 tests - CREADO)

### ~~Fase 2: Suscripciones~~ ✅ COMPLETADA

3. ✅ `suscripciones.integration.spec.ts` (~30 tests - CREADO)

### ~~Fase 3: Edge Cases (Prioridad MEDIA)~~ ✅ PARCIALMENTE COMPLETADA

4. ✅ `suscripciones-estados.integration.spec.ts` (18 tests - CREADO)
   - Transiciones de estado
   - Grace period 3 días
   - Bloqueo por MOROSA
   - Acceso por estado (ACTIVA, EN_GRACIA, MOROSA, CANCELADA)

**Pendientes (Prioridad BAJA):**

5. Descuentos familiares
6. Múltiples hijos con diferentes estados
7. Concurrencia en pagos

---

## Metodología BBT Aplicada

Todos los tests nuevos DEBEN seguir la metodología de TESTING.md:

1. **No mirar implementación** - Solo requisitos de negocio
2. **Documentar clases de equivalencia** en header del archivo
3. **Documentar boundaries** relevantes
4. **Documentar transiciones de estado** si aplica
5. **El test es el juez** - Si falla, es bug o requisito mal definido

---

## Archivos de Referencia

- Metodología: `apps/api/test/TESTING.md`
- Factories: `apps/api/test/fixtures/factories/`
- Helpers: `apps/api/test/helpers/`
- Tests de ejemplo: `apps/api/test/integration/flows/auth-flow.integration.spec.ts`
