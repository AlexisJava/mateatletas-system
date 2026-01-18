# Plan de Implementación: Vista Unificada de Inscripciones

## Problema

Existen **dos fuentes de inscripción** a ClaseGrupos que no están conectadas:

| Tabla                       | Fuente                                           | Uso                                        |
| --------------------------- | ------------------------------------------------ | ------------------------------------------ |
| `inscripciones_clase_grupo` | Admin crea manualmente (becas, casos especiales) | Docentes, estudiantes, asistencia, LiveKit |
| `inscripciones_actividad`   | Tutor crea via suscripción familiar 2026         | Solo módulo suscripciones                  |

**Resultado:** El docente NO ve estudiantes inscritos via suscripción familiar.

## Solución: Database View con UNION

Crear una vista PostgreSQL `inscripciones_unificadas` que combina ambas fuentes.

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│ inscripciones_clase_grupo   │     │ inscripciones_actividad     │
│ (admin/manual/becas)        │     │ (tutor/suscripción 2026)    │
└──────────────┬──────────────┘     └──────────────┬──────────────┘
               │                                    │
               └────────────┬───────────────────────┘
                            │
                            ▼
               ┌─────────────────────────────┐
               │   VIEW inscripciones_       │
               │        unificadas           │
               │   (Single Source of Truth)  │
               └─────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Docentes │      │Estudiantes│     │ LiveKit  │
    └──────────┘      └──────────┘      └──────────┘
```

---

## FASE 1: Crear la Vista (Migración SQL)

### 1.1 Migración SQL

**Archivo:** `apps/api/prisma/migrations/XXXXXX_create_inscripciones_unificadas_view/migration.sql`

```sql
-- Vista unificada de inscripciones a ClaseGrupos
-- Combina inscripciones manuales (admin) con inscripciones via suscripción (tutor)

CREATE OR REPLACE VIEW inscripciones_unificadas AS

-- Fuente 1: Inscripciones manuales (admin/becas)
SELECT
  icg.id,
  icg.estudiante_id,
  icg.clase_grupo_id,
  icg.tutor_id,
  icg.fecha_inscripcion,
  icg.fecha_baja,
  icg.tipo_acceso::text AS tipo_acceso,
  icg.observaciones,
  icg."createdAt" AS created_at,
  icg."updatedAt" AS updated_at,
  'MANUAL'::text AS fuente,
  NULL::text AS suscripcion_familiar_id,
  NULL::text AS producto_id,
  NULL::text AS tier,
  CASE
    WHEN icg.fecha_baja IS NULL THEN 'ACTIVA'
    ELSE 'CANCELADA'
  END::text AS estado
FROM inscripciones_clase_grupo icg

UNION ALL

-- Fuente 2: Inscripciones via suscripción familiar 2026
SELECT
  ia.id,
  ia.estudiante_id,
  ia.clase_grupo_id,
  sf.tutor_id,
  ia.fecha_inicio AS fecha_inscripcion,
  ia.fecha_fin AS fecha_baja,
  CASE
    WHEN ia.tier = 'STEAM_SINCRONICO' THEN 'SINCRONICO'
    ELSE 'ASINCRONICO'
  END::text AS tipo_acceso,
  NULL::text AS observaciones,
  ia.created_at,
  ia.updated_at,
  'SUSCRIPCION_2026'::text AS fuente,
  ia.suscripcion_familiar_id,
  ia.producto_id,
  ia.tier::text AS tier,
  ia.estado::text AS estado
FROM inscripciones_actividad ia
INNER JOIN suscripciones_familiares sf ON ia.suscripcion_familiar_id = sf.id
WHERE ia.clase_grupo_id IS NOT NULL;  -- Solo inscripciones a ClaseGrupos, no Comisiones

-- Índices para optimizar consultas frecuentes
-- (Las vistas no pueden tener índices, pero las tablas base ya los tienen)

COMMENT ON VIEW inscripciones_unificadas IS
'Vista unificada que combina inscripciones manuales (admin/becas) con inscripciones via suscripción familiar 2026.
Usar esta vista en lugar de consultar inscripciones_clase_grupo directamente.';
```

### 1.2 Agregar al Schema de Prisma

**Archivo:** `apps/api/prisma/schema.prisma`

```prisma
/// Vista unificada de inscripciones a ClaseGrupos
/// Combina inscripciones manuales (admin) con suscripciones familiares (tutor)
/// USAR ESTA VISTA en lugar de InscripcionClaseGrupo para consultas de lectura
view InscripcionUnificada {
  id                      String   @id
  estudiante_id           String
  clase_grupo_id          String
  tutor_id                String
  fecha_inscripcion       DateTime
  fecha_baja              DateTime?
  tipo_acceso             String   // 'SINCRONICO' | 'ASINCRONICO'
  observaciones           String?
  created_at              DateTime
  updated_at              DateTime
  fuente                  String   // 'MANUAL' | 'SUSCRIPCION_2026'
  suscripcion_familiar_id String?  // Solo para fuente SUSCRIPCION_2026
  producto_id             String?  // Solo para fuente SUSCRIPCION_2026
  tier                    String?  // Solo para fuente SUSCRIPCION_2026
  estado                  String   // 'ACTIVA' | 'CANCELADA' | 'PAUSADA'

  // Relaciones (read-only)
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id])
  claseGrupo ClaseGrupo @relation(fields: [clase_grupo_id], references: [id])
  tutor      Tutor      @relation(fields: [tutor_id], references: [id])

  @@map("inscripciones_unificadas")
}
```

### 1.3 Crear archivo de vista para Prisma

**Archivo:** `apps/api/prisma/views/inscripciones_unificadas.sql`

(Mismo contenido que la migración, Prisma lo usa para introspección)

---

## FASE 2: Migrar Módulos Consumidores

### 2.1 Orden de Migración (menor a mayor riesgo)

| #   | Módulo            | Archivo                        | Impacto                     | Prioridad |
| --- | ----------------- | ------------------------------ | --------------------------- | --------- |
| 1   | Admin Stats       | `admin-stats.service.ts`       | Bajo - solo count()         | P1        |
| 2   | Docentes          | `docente-stats.service.ts`     | **CRÍTICO** - Gap principal | P0        |
| 3   | Asistencia        | `asistencia.service.ts`        | Medio                       | P1        |
| 4   | LiveKit           | `livekit-token.service.ts`     | Medio                       | P1        |
| 5   | Estudiantes Aula  | `estudiante-aula.service.ts`   | Alto                        | P1        |
| 6   | Estudiantes Query | `estudiante-query.service.ts`  | Alto                        | P1        |
| 7   | Acceso Estudiante | `acceso-estudiante.service.ts` | **CRÍTICO**                 | P0        |

### 2.2 Patrón de Migración por Archivo

Para cada archivo:

```typescript
// ANTES
const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
  where: { clase_grupo_id: grupoId, fecha_baja: null },
});

// DESPUÉS
const inscripciones = await this.prisma.inscripcionUnificada.findMany({
  where: { clase_grupo_id: grupoId, estado: 'ACTIVA' },
});
```

### 2.3 Archivos que NO se migran (escritura)

El módulo **Admin** sigue escribiendo en `InscripcionClaseGrupo`:

- `clase-grupos.service.ts` - create(), delete()

El módulo **Suscripciones** sigue escribiendo en `InscripcionActividad`:

- `suscripcion-familiar-command.service.ts` - create(), update()

**La vista es SOLO LECTURA.**

---

## FASE 3: Tests de Integración Cross-Portal

### 3.1 Nuevo archivo de test

**Archivo:** `apps/api/test/integration/flows/inscripcion-cross-portal.integration.spec.ts`

```typescript
/**
 * Tests de integración cross-portal para vista unificada
 *
 * CASOS CRÍTICOS:
 * 1. Admin inscribe estudiante → Docente lo ve en su comisión
 * 2. Tutor crea suscripción → Docente ve al estudiante
 * 3. Admin da baja → Docente ya no ve al estudiante
 * 4. Tutor cancela suscripción → Docente ya no ve al estudiante
 * 5. Estudiante inscrito por ambas vías → No se duplica en vista
 */
```

### 3.2 Casos de test

| #   | Caso                                   | Fuente                    | Esperado                                                   |
| --- | -------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| 1   | Admin inscribe manualmente             | MANUAL                    | Docente ve 1 estudiante                                    |
| 2   | Tutor crea suscripción con ClaseGrupo  | SUSCRIPCION_2026          | Docente ve 1 estudiante                                    |
| 3   | Ambas fuentes mismo estudiante         | MANUAL + SUSCRIPCION_2026 | Docente ve 2 registros (válido - diferentes inscripciones) |
| 4   | Admin da baja (fecha_baja)             | MANUAL                    | Docente NO ve estudiante                                   |
| 5   | Tutor cancela (estado=CANCELADA)       | SUSCRIPCION_2026          | Docente NO ve estudiante                                   |
| 6   | Inscripción a Comisión (no ClaseGrupo) | SUSCRIPCION_2026          | NO aparece en vista                                        |

---

## FASE 4: Documentación y Cleanup

### 4.1 Actualizar CLAUDE.md

Agregar sección sobre las dos fuentes de inscripción y cuándo usar cada una.

### 4.2 Deprecar uso directo de InscripcionClaseGrupo

Agregar comentarios en el schema:

```prisma
/// @deprecated Para lectura, usar InscripcionUnificada
/// Solo usar para ESCRITURA de inscripciones manuales (admin/becas)
model InscripcionClaseGrupo {
  // ...
}
```

### 4.3 Linter rule (opcional)

Agregar regla de ESLint que advierta sobre uso de `inscripcionClaseGrupo.find*` fuera de admin.

---

## Checklist de Implementación

### Pre-requisitos

- [ ] Backup de base de datos de desarrollo
- [ ] Verificar que docker-compose.test.yml está corriendo

### Fase 1: Vista

- [ ] Crear migración SQL con la vista
- [ ] Agregar `view` al schema.prisma
- [ ] Crear archivo en `prisma/views/`
- [ ] Ejecutar `npx prisma migrate deploy`
- [ ] Ejecutar `npx prisma generate`
- [ ] Verificar vista en Prisma Studio

### Fase 2: Migración de Módulos

- [ ] 2.1 `admin-stats.service.ts` - cambiar count()
- [ ] 2.2 `docente-stats.service.ts` - cambiar findMany() **CRÍTICO**
- [ ] 2.3 `asistencia.service.ts` - cambiar findMany()
- [ ] 2.4 `livekit-token.service.ts` - cambiar findFirst()
- [ ] 2.5 `estudiante-aula.service.ts` - cambiar findMany()
- [ ] 2.6 `estudiante-query.service.ts` - cambiar findFirst/findMany()
- [ ] 2.7 `acceso-estudiante.service.ts` - cambiar findFirst() **CRÍTICO**

### Fase 3: Tests

- [ ] Crear `inscripcion-cross-portal.integration.spec.ts`
- [ ] Test: Admin inscribe → Docente ve
- [ ] Test: Tutor suscribe → Docente ve
- [ ] Test: Baja manual → Docente no ve
- [ ] Test: Cancelación suscripción → Docente no ve
- [ ] Ejecutar todos los tests existentes (regresión)

### Fase 4: Documentación

- [ ] Actualizar CLAUDE.md
- [ ] Agregar @deprecated a InscripcionClaseGrupo
- [ ] Actualizar PRE_PRODUCTION_CHECKLIST.md

### Verificación Final

- [ ] `yarn build` sin errores
- [ ] `yarn lint` sin warnings
- [ ] `yarn typecheck` sin errores
- [ ] Tests de integración pasan
- [ ] Prueba manual: crear suscripción → docente ve estudiante

---

## Rollback Plan

Si algo falla:

```sql
-- Eliminar la vista
DROP VIEW IF EXISTS inscripciones_unificadas;
```

Y revertir los cambios en los servicios (git checkout).

---

## Métricas de Éxito

1. **Funcionalidad:** Docente ve estudiantes de ambas fuentes
2. **Performance:** Query de docente no aumenta más de 50ms
3. **Tests:** 100% de tests existentes pasan + nuevos tests cross-portal
4. **Zero downtime:** La migración no requiere downtime

---

## Timeline Estimado

| Fase      | Tareas               | Esfuerzo  |
| --------- | -------------------- | --------- |
| 1         | Crear vista + schema | 1-2h      |
| 2         | Migrar 7 archivos    | 3-4h      |
| 3         | Tests cross-portal   | 2-3h      |
| 4         | Documentación        | 1h        |
| **Total** |                      | **7-10h** |

---

## Notas Técnicas

### Performance de la Vista

- PostgreSQL optimiza `UNION ALL` mejor que `UNION` (no elimina duplicados)
- Los índices de las tablas base se usan automáticamente
- Para queries frecuentes, considerar `MATERIALIZED VIEW` en el futuro

### Prisma Views

- Las vistas en Prisma son read-only por diseño
- No se pueden hacer `create()`, `update()`, `delete()` en una vista
- Las relaciones funcionan normalmente para lecturas

### Handling de Duplicados

Si un estudiante está inscrito por AMBAS vías al mismo grupo:

- La vista mostrará 2 registros (correcto - son inscripciones diferentes)
- Si se necesita deduplicar, usar `DISTINCT ON (estudiante_id, clase_grupo_id)` en la consulta
