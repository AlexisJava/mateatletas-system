# Auditoría de Tests - 2026-01-15

## Resumen Ejecutivo

| Métrica                   | Valor |
| ------------------------- | ----- |
| Total archivos de test    | 182   |
| Unit tests (src/)         | 140   |
| Integration tests (test/) | 42    |
| **Suites pasando**        | 119   |
| **Suites fallando**       | 12    |
| **Suites skipped**        | 4     |
| Tests pasando             | 2107  |
| Tests fallando            | 64    |
| Tests skipped             | 87    |

---

## Acciones Realizadas

### Tests Eliminados (Obsoletos)

| Archivo                                                                      | Razón                                                                        |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/pagos/application/use-cases/crear-inscripcion-mensual.use-case.spec.ts` | 15 referencias a campos obsoletos (precioClubMatematicas, tieneAACREA, etc.) |
| `src/pagos/services/__tests__/payment-query.service.spec.ts`                 | Imports de repositorios inexistentes                                         |
| `src/colonia/__tests__/` (5 archivos)                                        | Módulo Colonia deprecado completamente                                       |

### Tests Habilitados (Removido describe.skip)

| Archivo                                               | Estado                                               |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `src/casas/__tests__/casas.service.spec.ts`           | ⚠️ Habilitado pero falla 1 test (mock incompleto)    |
| `src/mundos/__tests__/mundos.service.spec.ts`         | ✅ Funciona                                          |
| `src/clases/services/clases-reservas.service.spec.ts` | ✅ Funciona (removido import obsoleto LogrosService) |

### Tests que Permanecen Skipped (Requieren Reescritura)

| Archivo                                                      | Razón                                                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `src/gamificacion/__tests__/gamificacion.service.spec.ts`    | Métodos `getNivelInfo`, `getAccionesPuntuables` ya no existen. `nivelConfig` removido de Prisma |
| `src/security/__tests__/fraud-detection.service.spec.ts`     | Usa `pagoInscripcion2026` e `inscripcion2026` (modelos eliminados)                              |
| `src/security/__tests__/security-monitoring.service.spec.ts` | Usa `pagoInscripcion2026` (modelo eliminado)                                                    |

---

## Los 12 Test Suites que Fallan

### 1. `src/estudiantes/services/__tests__/estudiante-command.service.spec.ts`

**Problema:** Dependencias faltantes en el módulo de test
**Tests fallando:** 5

- debe crear un estudiante con credenciales y emitir evento
- debe validar equipo si se proporciona
- debe generar username único si ya existe
- debe crear estudiantes con tutor existente
- debe crear tutor nuevo si no existe

### 2. `src/estudiantes/__tests__/crear-estudiante-con-tutor.spec.ts`

**Problema:** Dependencias faltantes
**Tests fallando:** 5

- debería crear un estudiante, su tutor y usuarios con credenciales automáticas
- debería crear varios estudiantes asociados al mismo tutor
- debería usar un tutor existente si el email ya está registrado
- debería generar username único basado en nombre.apellido
- debería generar contraseña temporal de 8 caracteres alfanuméricos

### 3. `src/admin/services/__tests__/admin-estudiantes.service.spec.ts`

**Problema:** Dependencias faltantes
**Tests fallando:** 5

- debería crear estudiante con tutor EXISTENTE
- debería crear estudiante con tutor NUEVO
- debería crear estudiante SIN equipoId
- debería usar valores por defecto para puntosIniciales y nivelInicial
- debería hashear el PIN del estudiante

### 4. `src/livekit/__tests__/livekit-token.service.spec.ts`

**Problema:** Mocks incompletos para ClaseGrupo y Comision
**Tests fallando:** 4

- should_generate_token_with_canPublish_true_when_docente_owns_ClaseGrupo
- should_generate_token_with_canPublish_true_when_docente_owns_Comision
- should_generate_token_with_canPublish_false_when_estudiante_belongs_to_ClaseGrupo
- should_generate_token_with_canPublish_false_when_estudiante_has_active_InscripcionComision

### 5. `src/estudiantes/__tests__/estudiantes-acceso.controller.spec.ts`

**Problema:** Dependencias faltantes (AccesoEstudianteService, etc.)
**Tests fallando:** 12

- Múltiples tests de verificar-acceso y puede-entrar-clase

### 6. `src/estudiantes/__tests__/estudiantes-avatar-security.spec.ts`

**Problema:** Falta mock de `AccesoEstudianteService` en index [1]
**Tests fallando:** 7

- Tests de seguridad de avatar ownership

### 7. `src/casas/__tests__/casas.service.spec.ts`

**Problema:** Mock de `findOne` no incluye array `estudiantes`
**Tests fallando:** 1

- should_return_casa_by_id

**Fix requerido:**

```typescript
// El mock necesita incluir estudiantes[]
const casaConEstudiantes = {
  ...mockCasa,
  estudiantes: [
    {
      id: 'est-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      recursos: { xp_total: 100, nivel: 2 },
    },
  ],
};
```

### 8. `src/estudiantes/services/__tests__/activity-feed.service.spec.ts`

**Problema:** Mocks incompletos para reacciones
**Tests fallando:** 3

- should_add_reaction_with_valid_emoji
- should*accept_valid_emoji*👏
- should*accept_valid_emoji*🔥

### 9-12. Otros (no detallados en output)

Probablemente relacionados con las mismas dependencias faltantes.

---

## Problema Común: Dependencias No Mockeadas

La mayoría de fallos se deben a servicios agregados recientemente que no están mockeados:

```
AccesoEstudianteService    → Agregado a EstudiantesController
ActivityFeedService        → Nuevo servicio de feed
MiProgresoService          → Nuevo servicio de progreso
EstudianteAulaService      → Dependencias actualizadas
```

**Error típico:**

```
Nest can't resolve dependencies of the EstudiantesController
(EstudiantesFacadeService, ?, EstudianteAulaService, ActivityFeedService, MiProgresoService).
Please make sure that the argument AccesoEstudianteService at index [1] is available...
```

---

## Tests Skipped Justificados (87 tests en 4 suites)

### 1. `src/gamificacion/__tests__/gamificacion.service.spec.ts`

- **Razón:** API del servicio cambió completamente
- **Esfuerzo estimado:** Reescritura completa
- **Métodos obsoletos:** `getNivelInfo()`, `getAccionesPuntuables()`
- **Schema removido:** `nivelConfig` ya no existe en Prisma

### 2. `src/security/__tests__/fraud-detection.service.spec.ts`

- **Razón:** Usa modelo `Inscripcion2026` eliminado
- **Esfuerzo estimado:** Reescritura para nuevo modelo de pagos

### 3. `src/security/__tests__/security-monitoring.service.spec.ts`

- **Razón:** Usa modelo `pagoInscripcion2026` eliminado
- **Esfuerzo estimado:** Reescritura para nuevo modelo de pagos

### 4. Otros skips menores

- `railway-readiness.spec.ts` - Skip condicional por REDIS_URL
- Varios `it.skip` individuales con razones documentadas

---

## Script de Auditoría

Se creó `scripts/audit-tests.ts` que detecta:

1. `describe.skip` / `it.skip` (tests saltados)
2. Campos obsoletos (precioClubMatematicas, CLUB_MATEMATICAS, etc.)
3. Imports potencialmente muertos

**Ejecutar:**

```bash
cd apps/api && npx ts-node scripts/audit-tests.ts
```

**Resultado actual:**

- 0 issues de alta severidad
- 12 issues de media severidad (skips justificados)

---

## Plan de Acción Recomendado

### Prioridad Alta (Bloquean CI)

1. **Arreglar tests de estudiantes** - Agregar mocks de `AccesoEstudianteService`
2. **Arreglar test de casas** - Agregar `estudiantes[]` al mock de findOne

### Prioridad Media

3. **Arreglar tests de livekit** - Completar mocks de ClaseGrupo/Comision
4. **Arreglar tests de activity-feed** - Completar mocks de reacciones

### Prioridad Baja (Pueden permanecer skipped)

5. **Reescribir gamificacion.service.spec.ts** - Cuando se estabilice el servicio
6. **Reescribir fraud-detection/security-monitoring** - Cuando se defina nuevo modelo de fraude

---

## Estructura de Tests

```
apps/api/
├── src/                           # 140 unit tests
│   ├── admin/services/            # 6 tests
│   ├── auth/                      # 22 tests
│   ├── estudiantes/               # 14 tests
│   ├── pagos/                     # 19 tests
│   ├── suscripciones/             # 12 tests
│   ├── docentes/                  # 10 tests
│   ├── clases/                    # 8 tests
│   ├── gamificacion/              # 6 tests
│   └── ...                        # Otros módulos
│
└── test/integration/              # 42 integration tests
    ├── flows/                     # 3 flujos completos
    ├── pagos/                     # 2 tests de webhooks
    ├── services/                  # 7 tests de servicios
    └── portal-specific/           # 30 tests por portal
        ├── admin/                 # 4 tests
        ├── docentes/              # 6 tests
        ├── estudiantes/           # 9 tests
        ├── sandbox/               # 9 tests
        └── gamificacion/          # 1 test
```

---

## Fecha de Auditoría

- **Fecha:** 2026-01-15
- **Branch:** `refactor/test-architecture-20260115`
- **Autor:** Claude (asistido)
