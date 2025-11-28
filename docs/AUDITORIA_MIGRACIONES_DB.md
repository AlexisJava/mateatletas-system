# Auditoría Completa: Base de Datos vs Migraciones

**Fecha**: 2025-11-21 01:50 UTC
**Base de Datos**: Railway Postgres (postgresql://...@maglev.proxy.rlwy.net:16579/railway)
**Prisma Version**: 6.18.0

---

## 📊 Estado Actual de la Base de Datos

### Tablas Existentes (68 tablas)

```
✅ _prisma_migrations
✅ acciones_puntuables
✅ actividades_semanales
✅ admins
✅ alertas
✅ asignaciones_actividad_estudiante
✅ asignaciones_docente
✅ asignaciones_planificacion
✅ asistencias
✅ asistencias_clase_grupo
✅ becas
✅ canjes_padres
✅ categorias_item
✅ clase_grupos
✅ clases
✅ colonia_estudiante_cursos
✅ colonia_estudiantes
✅ colonia_inscripciones
✅ colonia_pagos
✅ compras_item
✅ configuracion_precios
✅ cursos_catalogo
✅ cursos_estudiantes
✅ docentes
✅ docentes_rutas
✅ equipos
✅ estudiante_sectores
✅ estudiantes
✅ eventos
✅ grupos
✅ historial_cambio_precios
✅ inscripciones_clase
✅ inscripciones_clase_grupo
✅ inscripciones_curso
✅ inscripciones_mensuales
✅ items_obtenidos
✅ items_tienda
✅ lecciones
✅ logros_cursos
✅ logros_desbloqueados
✅ logros_estudiantes_gamificacion
✅ logros_gamificacion
✅ membresias
✅ modulos
✅ niveles_config
✅ notas
✅ notificaciones
✅ planificaciones_mensuales
✅ planificaciones_simples
✅ premios_padres
✅ productos
✅ progreso_estudiante_actividad
✅ progreso_estudiante_planificacion
✅ progreso_lecciones
✅ puntos_obtenidos
✅ puntos_padres
✅ rachas_estudiantes
✅ recordatorios
✅ recursos_estudiante
✅ rutas_curriculares
✅ rutas_especialidad
✅ sectores
✅ semanas_activas
✅ solicitudes_canje
✅ tareas
✅ transacciones_puntos_padres
✅ transacciones_recurso
✅ tutores
```

### ❌ Tablas Faltantes Según Schema

Basado en el schema.prisma actual, estas tablas **deberían** existir pero **NO existen**:

1. ❌ `audit_logs` - **CRÍTICA** (sistema de seguridad)
2. ❌ `secret_rotations` - **CRÍTICA** (sistema de seguridad)
3. ❌ `pagos_inscripciones_2026` - Referenciada en migración 20251118132555

---

## 📁 Estado de Migraciones en Filesystem

### Migraciones en `apps/api/prisma/migrations/` (17 directorios)

```
1.  20250110_add_colonia_verano_2026
2.  20251012132133_init
3.  20251012134731_create_tutor_model
4.  20251012173206_create_estudiante_equipo
5.  20251012231854_add_docente_model
6.  20251012233723_create_productos
7.  20251012234351_create_membresias_inscripciones
8.  20251013002021_create_clases_inscripciones_asistencia
9.  20251013121713_add_alertas_model
10. 20251013122322_add_admin_model
11. 20251013215600_add_gamification_tables
12. 20251104151500_add_pagos_inscripciones_configuracion
13. 20251108000000_add_username_to_tutor
14. 20251112172254_remove_test_model
15. 20251118132555_add_processed_at_to_pagos
16. 20251121000000_add_security_tables
17. 20251121002735_add_security_tables
```

---

## 🔍 Estado de Migraciones en `_prisma_migrations` (17 registros)

| #   | Migration Name                                          | Finished At         | Applied Steps | Estado                               |
| --- | ------------------------------------------------------- | ------------------- | ------------- | ------------------------------------ |
| 1   | `20251012132133_init`                                   | 2025-11-02 21:48:02 | 1             | ✅ OK                                |
| 2   | `20251012134731_create_tutor_model`                     | 2025-11-02 21:48:02 | 1             | ✅ OK                                |
| 3   | `20251012173206_create_estudiante_equipo`               | 2025-11-02 21:48:03 | 1             | ✅ OK                                |
| 4   | `20251012231854_add_docente_model`                      | 2025-11-02 21:48:03 | 1             | ✅ OK                                |
| 5   | `20251012233723_create_productos`                       | 2025-11-02 21:48:04 | 1             | ✅ OK                                |
| 6   | `20251012234351_create_membresias_inscripciones`        | 2025-11-02 21:48:04 | 1             | ✅ OK                                |
| 7   | `20251013002021_create_clases_inscripciones_asistencia` | 2025-11-02 21:48:05 | 1             | ✅ OK                                |
| 8   | `20251013121713_add_alertas_model`                      | 2025-11-02 21:48:05 | 1             | ✅ OK                                |
| 9   | `20251013122322_add_admin_model`                        | 2025-11-02 21:48:05 | 1             | ✅ OK                                |
| 10  | `20251013215600_add_gamification_tables`                | 2025-11-02 21:48:06 | 1             | ✅ OK                                |
| 11  | `20250110_add_colonia_verano_2026`                      | 2025-11-21 04:35:56 | 1             | ✅ OK                                |
| 12  | `20251104151500_add_pagos_inscripciones_configuracion`  | 2025-11-21 04:42:53 | **0**         | ⚠️ MARCADA COMO APLICADA MANUALMENTE |
| 13  | `20251108000000_add_username_to_tutor`                  | 2025-11-21 04:44:09 | **0**         | ⚠️ MARCADA COMO APLICADA MANUALMENTE |
| 14  | `20251112172254_remove_test_model`                      | 2025-11-21 04:45:12 | 1             | ✅ OK                                |
| 15  | `20251118132555_add_processed_at_to_pagos`              | **NULL**            | **0**         | ❌ PENDIENTE / FALLIDA               |
| 16  | `20251108000000_add_username_to_tutor`                  | **NULL**            | **0**         | ❌ DUPLICADO                         |
| 17  | `20251104151500_add_pagos_inscripciones_configuracion`  | **NULL**            | **0**         | ❌ DUPLICADO                         |

---

## 🚨 Problemas Críticos Identificados

### 1. **Migraciones Duplicadas en `_prisma_migrations`**

```
❌ 20251108000000_add_username_to_tutor (aparece 2 veces)
   - Primera: finished_at = 2025-11-21 04:44:09, applied_steps = 0
   - Segunda: finished_at = NULL, applied_steps = 0

❌ 20251104151500_add_pagos_inscripciones_configuracion (aparece 2 veces)
   - Primera: finished_at = 2025-11-21 04:42:53, applied_steps = 0
   - Segunda: finished_at = NULL, applied_steps = 0
```

**Causa**: Múltiples intentos de `prisma migrate resolve --applied` crearon registros duplicados.

**Impacto**: Prisma puede confundirse al intentar aplicar nuevas migraciones.

### 2. **Migraciones Pendientes con Errores**

```
❌ 20251118132555_add_processed_at_to_pagos
   - Estado: finished_at = NULL
   - Error: Intenta modificar tabla `pagos_inscripciones_2026` que no existe
   - Ya modificada para solo afectar a `colonia_pagos`
```

### 3. **Migraciones Duplicadas en Filesystem**

```
❌ 20251121000000_add_security_tables
❌ 20251121002735_add_security_tables
```

**Contenido**: Ambas crean las tablas `audit_logs` y `secret_rotations`.

**Causa**: Múltiples intentos de `prisma migrate dev` sin resolver conflictos.

**Impacto**: Si se aplican ambas, fallará por tablas duplicadas.

### 4. **Migraciones Corruptas (Sin `migration.sql`)**

```
❌ 20251121002705_add_security_tables (ELIMINADO)
❌ 20251110153254_add_colonia_verano_2026 (ELIMINADO)
```

**Estado**: Ya eliminados del filesystem.

### 5. **Tablas Faltantes Críticas**

```
❌ audit_logs
❌ secret_rotations
❌ pagos_inscripciones_2026 (referenciada pero no existe)
```

**Causa**: Las migraciones de seguridad (`20251121*`) nunca se aplicaron exitosamente.

---

## 📋 Plan de Sincronización

### Fase 1: Limpieza de Registros Duplicados en `_prisma_migrations`

```sql
-- Eliminar registros duplicados que NO tienen finished_at
DELETE FROM _prisma_migrations
WHERE migration_name = '20251108000000_add_username_to_tutor'
  AND finished_at IS NULL;

DELETE FROM _prisma_migrations
WHERE migration_name = '20251104151500_add_pagos_inscripciones_configuracion'
  AND finished_at IS NULL;
```

### Fase 2: Marcar Migración Fallida como Aplicada

La migración `20251118132555_add_processed_at_to_pagos` fue modificada para solo afectar `colonia_pagos`.

**Opción A - Aplicar la migración modificada**:

```bash
DATABASE_URL="<url>" prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

**Opción B - Si falla, marcar como aplicada**:

```bash
DATABASE_URL="<url>" prisma migrate resolve --applied 20251118132555_add_processed_at_to_pagos --schema apps/api/prisma/schema.prisma
```

Luego aplicar manualmente:

```sql
ALTER TABLE "colonia_pagos" ADD COLUMN "processed_at" TIMESTAMP(3);
CREATE INDEX "colonia_pagos_processed_at_idx" ON "colonia_pagos"("processed_at");
```

### Fase 3: Limpiar Migraciones Duplicadas en Filesystem

```bash
# Eliminar una de las migraciones de seguridad duplicadas
rm -rf apps/api/prisma/migrations/20251121000000_add_security_tables

# Mantener: 20251121002735_add_security_tables
```

### Fase 4: Aplicar Migraciones Pendientes

```bash
DATABASE_URL="<url>" prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Esto aplicará:

- `20251121002735_add_security_tables` (crea `audit_logs` y `secret_rotations`)

### Fase 5: Verificación Final

```bash
# Verificar estado
DATABASE_URL="<url>" prisma migrate status --schema apps/api/prisma/schema.prisma

# Verificar tablas
psql "<url>" -c "\dt audit_logs"
psql "<url>" -c "\dt secret_rotations"
psql "<url>" -c "\dt colonia_pagos" | grep processed_at
```

---

## ✅ Checklist de Sincronización

- [ ] Backup de la base de datos
- [ ] Eliminar duplicados en `_prisma_migrations`
- [ ] Resolver/aplicar migración `20251118132555`
- [ ] Eliminar migración duplicada del filesystem
- [ ] Aplicar migraciones pendientes
- [ ] Verificar tablas críticas creadas
- [ ] Commit y push de cambios al filesystem
- [ ] Deploy a Railway
- [ ] Verificar servicio arranca correctamente

---

## 🔐 Tablas de Seguridad Pendientes

### `audit_logs`

**Propósito**: Registro de auditoría para cumplimiento y seguridad.

**Campos clave**:

- `timestamp`, `user_id`, `action`, `entity_type`, `entity_id`
- `changes` (JSONB) - Cambios realizados
- `metadata` (JSONB) - Información adicional
- `severity`, `category`

**Índices**:

- timestamp, user_id, action, entity_type, entity_id, category, severity

### `secret_rotations`

**Propósito**: Rotación de secretos (API keys, tokens) para seguridad.

**Campos clave**:

- `secret_type`, `version`, `secret_hash`
- `status` (active/rotated/revoked)
- `created_at`, `expires_at`, `rotated_at`

**Índices**:

- secret_type, status
- Unique constraint en (secret_type, version)

---

## 📊 Estadísticas

- **Tablas en DB**: 68
- **Migraciones aplicadas correctamente**: 11
- **Migraciones marcadas manualmente**: 2
- **Migraciones fallidas**: 1
- **Migraciones duplicadas**: 2
- **Migraciones pendientes**: 1 (seguridad)
- **Tablas faltantes críticas**: 2 (audit_logs, secret_rotations)

---

## 🎯 Prioridad de Ejecución

1. **URGENTE**: Eliminar duplicados en `_prisma_migrations` (causa inestabilidad)
2. **ALTA**: Aplicar migración de seguridad (audit_logs, secret_rotations)
3. **MEDIA**: Resolver migración `processed_at`
4. **BAJA**: Limpiar filesystem (estético)

---

**Tiempo estimado de sincronización**: 15-20 minutos
**Riesgo**: Bajo (operaciones son idempotentes y reversibles)
