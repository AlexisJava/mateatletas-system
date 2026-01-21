# Verificación del Sistema Legacy: Clase + InscripcionClase

**Fecha**: 2026-01-20
**Objetivo**: Identificar TODOS los usos del sistema legacy para evaluar si puede eliminarse.

---

## Resumen Ejecutivo

| Métrica                            | Valor                          |
| ---------------------------------- | ------------------------------ |
| Archivos usando `prisma.clase.`    | **14 archivos**                |
| Archivos usando `InscripcionClase` | **12 archivos**                |
| Operaciones de ESCRITURA           | **Sí, activas**                |
| Operaciones de LECTURA             | **Sí, extensas**               |
| ¿Usado en seed?                    | **No** (seed usa sistema 2026) |
| **¿Se puede eliminar?**            | **NO todavía**                 |

---

## 1. Modelo `Clase` - Usos Encontrados

### 1.1 Operaciones de ESCRITURA (CRÍTICAS)

| Archivo                                              | Línea    | Operación                 | Descripción                        |
| ---------------------------------------------------- | -------- | ------------------------- | ---------------------------------- |
| `clases/services/clase-command.service.ts`           | 48       | `prisma.clase.create`     | **Admin crea clases individuales** |
| `clases/services/clase-command.service.ts`           | 106      | `prisma.clase.update`     | Cancelar clase (estado)            |
| `clases/services/clase-command.service.ts`           | 175      | `prisma.clase.delete`     | Eliminar clase permanentemente     |
| `clases/services/clase-command.service.ts`           | 252      | `prisma.clase.update`     | Actualizar cupos ocupados          |
| `clases/services/clases-reservas.service.ts`         | 107      | `tx.clase.update`         | Incrementar cupos al reservar      |
| `clases/services/clases-reservas.service.ts`         | 199      | `tx.clase.update`         | Decrementar cupos al cancelar      |
| `estudiantes/services/estudiante-command.service.ts` | 500, 595 | `tx.clase.update`         | Actualizar cupos al asignar clases |
| `docentes/services/docente-command.service.ts`       | 173      | `prisma.clase.updateMany` | Docente actualiza sus clases       |

### 1.2 Operaciones de LECTURA

| Archivo                                                   | Líneas                          | Descripción                       |
| --------------------------------------------------------- | ------------------------------- | --------------------------------- |
| `clases/services/clase-query.service.ts`                  | 62, 91, 133, 204, 274, 293, 342 | Listar y consultar clases         |
| `clases/services/clase-stats.service.ts`                  | 43, 127, 190                    | Estadísticas de clases            |
| `clases/services/clases-asistencia.service.ts`            | 36                              | Verificar clase para asistencia   |
| `estudiantes/services/estudiante-query.service.ts`        | 297, 415                        | Próximas clases del estudiante    |
| `tutor/services/tutor-query.service.ts`                   | 199                             | Historial de clases antiguas      |
| `tutor/services/tutor-stats.service.ts`                   | 322                             | Clases de hoy para stats          |
| `admin/services/admin-stats.service.ts`                   | 59, 104, 105                    | Conteo de clases para dashboard   |
| `gamificacion/gamificacion.service.ts`                    | 105                             | Próximas clases para progreso     |
| `gamificacion/puntos.service.ts`                          | 132                             | Validar clase para otorgar puntos |
| `asistencia/asistencia.service.ts`                        | 29, 124                         | Verificar clase para asistencia   |
| `asistencia/asistencia-reportes.service.ts`               | 19, 186                         | Reportes de asistencia por clase  |
| `estudiantes/validators/estudiante-business.validator.ts` | 108                             | Validar clase existe              |

---

## 2. Modelo `InscripcionClase` - Usos Encontrados

### 2.1 Operaciones de ESCRITURA (CRÍTICAS)

| Archivo                                              | Línea | Operación                        | Descripción                     |
| ---------------------------------------------------- | ----- | -------------------------------- | ------------------------------- |
| `clases/services/clases-reservas.service.ts`         | 93    | `tx.inscripcionClase.create`     | **Tutor reserva cupo en clase** |
| `clases/services/clases-reservas.service.ts`         | 195   | `tx.inscripcionClase.delete`     | Tutor cancela reserva           |
| `clases/services/clase-command.service.ts`           | 231   | `prisma.inscripcionClase.create` | Admin asigna estudiantes        |
| `estudiantes/services/estudiante-command.service.ts` | 491   | `tx.inscripcionClase.create`     | Asignar clase a estudiante      |
| `estudiantes/services/estudiante-command.service.ts` | 586   | `tx.inscripcionClase.create`     | Asignar múltiples clases        |

### 2.2 Operaciones de LECTURA

| Archivo                                              | Líneas       | Descripción                            |
| ---------------------------------------------------- | ------------ | -------------------------------------- |
| `clases/services/clases-reservas.service.ts`         | 77, 126, 167 | Verificar inscripción, listar reservas |
| `asistencia/asistencia.service.ts`                   | 45, 141      | Verificar inscripción para asistencia  |
| `asistencia/asistencia-reportes.service.ts`          | 29, 90, 108  | Reportes de inscripciones              |
| `tutor/services/tutor-stats.service.ts`              | 164          | Contar clases del mes                  |
| `estudiantes/services/estudiante-command.service.ts` | 477, 572     | Verificar inscripción existente        |

### 2.3 Lecturas via Relación (include)

```typescript
// Ejemplos de includes que traen inscripciones_clase
inscripciones_clase: {
  include: {
    clase: true;
  }
}
```

| Archivo                                               | Descripción                        |
| ----------------------------------------------------- | ---------------------------------- |
| `admin/services/admin-estudiantes.service.ts`         | Listar inscripciones de estudiante |
| `estudiantes/services/estudiante-query.service.ts`    | Perfil con clases inscritas        |
| `auth/strategies/role-handlers/estudiante.handler.ts` | Datos de sesión                    |
| `gamificacion/gamificacion.service.ts`                | Calcular progreso por clases       |

---

## 3. Diferencia con Sistema 2026

### Sistema Legacy (Clase + InscripcionClase)

```
Clase (individual, fecha específica)
  ├── docente_id
  ├── fecha_hora_inicio
  ├── cupos_maximo / cupos_ocupados
  └── InscripcionClase[]
        ├── estudiante_id
        ├── tutor_id
        └── clase_id
```

**Uso**: Clases individuales programadas (ej: "Clase de Matemáticas - 20 Enero 15:00")

### Sistema 2026 (ClaseGrupo + inscripciones_unificadas)

```
ClaseGrupo (grupo recurrente semanal)
  ├── docente_id
  ├── horario (Lunes 16:00)
  ├── cupo_maximo
  └── inscripciones_unificadas (VISTA)
        ├── Fuente 1: inscripciones_clase_grupo (manual/becas)
        └── Fuente 2: inscripciones_actividad (suscripción 2026)
```

**Uso**: Grupos semanales recurrentes (ej: "Grupo Quantum - Lunes 16:00")

---

## 4. Análisis por Módulo

### 4.1 Módulo `clases/` - USO INTENSIVO

| Servicio                       | Sistema Usado | Propósito                            |
| ------------------------------ | ------------- | ------------------------------------ |
| `clase-command.service.ts`     | LEGACY        | Programar, cancelar, eliminar clases |
| `clase-query.service.ts`       | LEGACY        | Listar, buscar clases                |
| `clases-reservas.service.ts`   | LEGACY        | Reservar/cancelar cupos              |
| `clase-stats.service.ts`       | LEGACY        | Estadísticas de clases               |
| `clases-asistencia.service.ts` | LEGACY        | Asistencia a clases individuales     |

**Veredicto**: Este módulo completo usa sistema LEGACY.

### 4.2 Módulo `estudiantes/` - MIXTO

| Servicio                        | Sistema Usado | Propósito                   |
| ------------------------------- | ------------- | --------------------------- |
| `estudiante-command.service.ts` | LEGACY        | Asignar clases a estudiante |
| `estudiante-query.service.ts`   | LEGACY        | Próximas clases, perfil     |

**Veredicto**: Usa LEGACY para clases individuales.

### 4.3 Módulo `asistencia/` - MIXTO

| Servicio                         | Sistema Usado | Propósito                               |
| -------------------------------- | ------------- | --------------------------------------- |
| `asistencia.service.ts`          | LEGACY + 2026 | Marcar asistencia (Clase vs ClaseGrupo) |
| `asistencia-reportes.service.ts` | LEGACY        | Reportes de asistencia                  |

**Veredicto**: Soporta ambos sistemas.

### 4.4 Módulo `tutor/` - LEGACY

| Servicio                 | Sistema Usado | Propósito           |
| ------------------------ | ------------- | ------------------- |
| `tutor-query.service.ts` | LEGACY        | Historial de clases |
| `tutor-stats.service.ts` | LEGACY        | Clases del mes      |

**Veredicto**: Usa LEGACY para stats.

### 4.5 Módulo `admin/` - MIXTO

| Servicio                       | Sistema Usado    | Propósito                    |
| ------------------------------ | ---------------- | ---------------------------- |
| `admin-stats.service.ts`       | LEGACY           | Conteo de clases             |
| `admin-estudiantes.service.ts` | LEGACY (include) | Inscripciones del estudiante |
| `clase-grupos.service.ts`      | 2026             | CRUD de ClaseGrupos          |

**Veredicto**: Admin stats usa LEGACY, ClaseGrupos usa 2026.

### 4.6 Módulo `gamificacion/` - LEGACY

| Servicio                  | Sistema Usado | Propósito                 |
| ------------------------- | ------------- | ------------------------- |
| `gamificacion.service.ts` | LEGACY        | Próximas clases, progreso |
| `puntos.service.ts`       | LEGACY        | Validar clase para puntos |

**Veredicto**: Usa LEGACY para calcular XP/progreso.

---

## 5. ¿El Seed Usa Sistema Legacy?

**NO**. El seed actual (`clean-seed.ts`) usa el sistema 2026:

```typescript
// clean-seed.ts:715
await prisma.inscripcionClaseGrupo.upsert({
  // Inscripción al sistema 2026
});
```

El seed NO crea datos en las tablas legacy (`Clase`, `InscripcionClase`).

---

## 6. Conclusión: ¿Se Pueden Eliminar los Modelos Legacy?

### ❌ NO SE PUEDEN ELIMINAR TODAVÍA

**Razones:**

1. **Funcionalidad activa**: El módulo `clases/` completo depende de Clase + InscripcionClase
2. **Tutores usan reservas**: `clases-reservas.service.ts` permite a tutores reservar clases
3. **Asistencia individual**: El sistema de asistencia a clases individuales está activo
4. **Stats/Dashboard**: Múltiples stats usan conteos de Clase

### Diferencia Conceptual IMPORTANTE

| Modelo         | Propósito                       | Estado                      |
| -------------- | ------------------------------- | --------------------------- |
| **Clase**      | Clases individuales programadas | ACTIVO - tutores reservan   |
| **ClaseGrupo** | Grupos semanales recurrentes    | ACTIVO - suscripciones 2026 |

**Son modelos DIFERENTES con propósitos DIFERENTES**.

- `Clase` = Evento puntual (ej: taller especial, clase de reposición)
- `ClaseGrupo` = Grupo recurrente (ej: Matemáticas Lunes 16:00)

### Recomendación

**Opción A**: Mantener ambos sistemas (son complementarios)

- Clase para eventos puntuales
- ClaseGrupo para grupos recurrentes

**Opción B**: Migrar todo a ClaseGrupo + eventos

- Crear modelo `Evento` para clases puntuales
- Migrar reservas de Clase a ClaseGrupo

**Para eliminar el modelo `Clase`:**

1. Migrar toda funcionalidad de reservas a nuevo sistema
2. Migrar stats y reportes
3. Actualizar módulos de asistencia
4. Deprecar endpoints de `/clases`

---

## 7. Listado Completo de Archivos a Modificar

Si se decide migrar, estos son TODOS los archivos afectados:

### Escrituras (11 ubicaciones)

```
apps/api/src/clases/services/clase-command.service.ts (4 lugares)
apps/api/src/clases/services/clases-reservas.service.ts (4 lugares)
apps/api/src/estudiantes/services/estudiante-command.service.ts (5 lugares)
apps/api/src/docentes/services/docente-command.service.ts (1 lugar)
```

### Lecturas (25+ ubicaciones)

```
apps/api/src/clases/services/clase-query.service.ts (7 lugares)
apps/api/src/clases/services/clase-stats.service.ts (3 lugares)
apps/api/src/asistencia/asistencia.service.ts (3 lugares)
apps/api/src/asistencia/asistencia-reportes.service.ts (4 lugares)
apps/api/src/estudiantes/services/estudiante-query.service.ts (2 lugares)
apps/api/src/tutor/services/tutor-query.service.ts (1 lugar)
apps/api/src/tutor/services/tutor-stats.service.ts (2 lugares)
apps/api/src/admin/services/admin-stats.service.ts (3 lugares)
apps/api/src/gamificacion/gamificacion.service.ts (2 lugares)
apps/api/src/gamificacion/puntos.service.ts (1 lugar)
apps/api/src/estudiantes/validators/estudiante-business.validator.ts (1 lugar)
```

### Tests Afectados

```
apps/api/src/clases/__tests__/clases-race-condition.spec.ts
apps/api/src/clases/__tests__/asistencia-batch-upsert.spec.ts
apps/api/src/clases/__tests__/clases-cancelar-security.spec.ts
apps/api/src/estudiantes/__tests__/asignar-clases-a-estudiante.spec.ts
apps/api/src/gamificacion/__tests__/gamificacion.service.spec.ts
apps/api/src/gamificacion/__tests__/puntos-transaction-security.spec.ts
```

---

## 8. Próximos Pasos Sugeridos

1. **Decisión arquitectónica**: ¿Mantener o migrar?
2. Si migrar:
   - Crear RFC de migración
   - Diseñar sistema de eventos/clases puntuales en 2026
   - Plan de migración gradual
   - Migrar datos existentes
3. Si mantener:
   - Documentar claramente la diferencia
   - Considerar renombrar a `ClaseIndividual` para claridad
