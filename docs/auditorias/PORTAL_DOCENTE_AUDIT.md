# Auditoría Exhaustiva del Portal Docente

## Resumen Ejecutivo

**Fecha:** 2026-01-20
**Estado:** 🔴 PROBLEMA CRÍTICO IDENTIFICADO

### Diagnóstico Principal

El docente no ve sus estudiantes porque el seed crea:

- `ClaseGrupo` con `inscripcionesClaseGrupo` (tabla: `inscripciones_clase_grupo`)
- `Comision` SIN inscripciones en `InscripcionComision` (tabla: `inscripciones_comision`)

Pero los endpoints del portal docente consultan **AMBAS** estructuras por separado y hay inconsistencia.

---

## Arquitectura del Módulo Docentes

```
DocentesController
    └── DocentesService (Facade)
            ├── DocentesFacade
            │       ├── DocenteQueryService      → CRUD docentes
            │       ├── DocenteCommandService    → create/update/delete
            │       ├── DocenteStatsService      → Dashboard, métricas, calendarios
            │       └── DocenteComisionQueriesService → Estudiantes de comisiones
            └── DocentePlanificacionesService    → Planificaciones y asignaciones
```

---

## Mapa Completo de Endpoints

### 1. ENDPOINTS ADMIN (Solo para administradores)

#### `POST /docentes`

- **Controller:** [docentes.controller.ts:43-47](apps/api/src/docentes/docentes.controller.ts#L43-L47)
- **Service:** `DocenteCommandService.create()`
- **Tablas:** `docentes`
- **Seed requerido:** N/A (crea nuevos docentes)

#### `GET /docentes`

- **Controller:** [docentes.controller.ts:53-57](apps/api/src/docentes/docentes.controller.ts#L53-L57)
- **Service:** `DocenteQueryService.findAll()`
- **Tablas:** `docentes`
- **Seed requerido:** `docentes` con registros

#### `GET /docentes/clases-count-batch`

- **Controller:** [docentes.controller.ts:525-529](apps/api/src/docentes/docentes.controller.ts#L525-L529)
- **Service:** `DocenteQueryService.getClasesCountBatch()`
- **Tablas consultadas:**

  ```sql
  -- Query 1: ClaseGrupos activos por docente
  SELECT docente_id, COUNT(*) FROM clase_grupos WHERE activo = true GROUP BY docente_id

  -- Query 2: Comisiones activas por docente
  SELECT docente_id, COUNT(*) FROM comisiones WHERE activo = true GROUP BY docente_id
  ```

- **Seed requerido:** `clase_grupos` y/o `comisiones` con `docente_id` y `activo = true`

#### `GET /docentes/:id/clases-count`

- **Controller:** [docentes.controller.ts:536-539](apps/api/src/docentes/docentes.controller.ts#L536-L539)
- **Service:** `DocenteQueryService.getClasesCount(id)`
- **Tablas:** `clase_grupos`, `comisiones`
- **Filtros:**
  ```typescript
  claseGrupo.count({ where: { docente_id: id, activo: true } });
  comision.count({ where: { docente_id: id, activo: true } });
  ```

#### `GET /docentes/:id`

- **Controller:** [docentes.controller.ts:547-550](apps/api/src/docentes/docentes.controller.ts#L547-L550)
- **Service:** `DocenteQueryService.findById(id)`
- **Tablas:** `docentes`, `docentes_rutas` → `sectores`

#### `PATCH /docentes/:id`

- **Controller:** [docentes.controller.ts:559-566](apps/api/src/docentes/docentes.controller.ts#L559-L566)
- **Service:** `DocenteCommandService.update()`

#### `POST /docentes/:id/reasignar-clases`

- **Controller:** [docentes.controller.ts:574-581](apps/api/src/docentes/docentes.controller.ts#L574-L581)
- **Service:** `DocenteCommandService.reasignarClases()`
- **Tablas:** `clases` (actualiza `docente_id`)

#### `DELETE /docentes/:id`

- **Controller:** [docentes.controller.ts:589-592](apps/api/src/docentes/docentes.controller.ts#L589-L592)
- **Service:** `DocenteCommandService.remove()`

---

### 2. ENDPOINTS DOCENTE - PERFIL

#### `GET /docentes/me`

- **Controller:** [docentes.controller.ts:109-113](apps/api/src/docentes/docentes.controller.ts#L109-L113)
- **Service:** `DocenteQueryService.findById(user.id)`
- **Tablas:** `docentes`, `docentes_rutas` → `sectores`
- **Seed requerido:** Docente en `docentes`

#### `PATCH /docentes/me`

- **Controller:** [docentes.controller.ts:121-128](apps/api/src/docentes/docentes.controller.ts#L121-L128)
- **Service:** `DocenteCommandService.update()`

---

### 3. ENDPOINTS DOCENTE - DASHBOARD (⚠️ CRÍTICOS)

#### `GET /docentes/me/dashboard`

- **Controller:** [docentes.controller.ts:65-69](apps/api/src/docentes/docentes.controller.ts#L65-L69)
- **Service:** `DocenteStatsService.getDashboard()`
- **Tablas consultadas y relaciones:**

| Tabla                     | Relaciones                                                 | Filtros                                       |
| ------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `clase_grupos`            | `inscripciones_unificadas` → `estudiantes`                 | `docente_id`, `activo=true`, `dia_semana=hoy` |
| `comisiones`              | `inscripciones`, `inscripciones_actividad` → `estudiantes` | `docente_id`, `activo=true`                   |
| `asistencias_clase_grupo` | -                                                          | `docente_id` via `clase_grupos`               |
| `puntos_obtenidos`        | -                                                          | `docente_id`                                  |

**Queries principales:**

```typescript
// 1. Clase inminente (hoy)
prisma.claseGrupo.findMany({
  where: {
    docente_id: docenteId,
    activo: true,
    dia_semana: diaActual, // LUNES, MARTES, etc.
  },
  select: {
    _count: {
      select: {
        inscripcionesUnificadas: { where: { estado: 'ACTIVA' } }
      }
    }
  }
})

// 2. Clases del día (con estudiantes)
prisma.claseGrupo.findMany({
  where: { docente_id, activo: true, dia_semana: diaActual },
  include: {
    inscripcionesUnificadas: {
      where: { estado: 'ACTIVA' },
      select: { estudiante: { ... } }
    }
  }
})

// 3. Mis grupos
prisma.claseGrupo.findMany({
  where: { docente_id, activo: true },
  select: { _count: { inscripcionesUnificadas: { where: { estado: 'ACTIVA' } } } }
})

// 4. Mis comisiones (⚠️ DOBLE FUENTE)
prisma.comision.findMany({
  where: { docente_id, activo: true },
  include: {
    inscripciones: { where: { estado: { in: ['Pendiente', 'Confirmada'] } } },
    inscripcionesActividad: { where: { estado: 'ACTIVA' } }
  }
})

// 5. Estudiantes con faltas (via inscripciones_unificadas)
await prisma.$queryRaw`
  SELECT DISTINCT e.id, e.nombre, ...
  FROM estudiantes e
  INNER JOIN inscripciones_unificadas iu ON e.id = iu.estudiante_id
  INNER JOIN clase_grupos cg ON iu.clase_grupo_id = cg.id
  WHERE cg.docente_id = ${docenteId} AND iu.estado = 'ACTIVA'
`

// 6. Stats resumen
prisma.inscripcionUnificada.groupBy({
  by: ['estudiante_id'],
  where: {
    claseGrupo: { docente_id, activo: true },
    estado: 'ACTIVA'
  }
})
```

**Seed requerido para dashboard funcional:**

1. ✅ `docentes` - el docente existe
2. ✅ `clase_grupos` con `docente_id` y `activo = true`
3. ⚠️ `inscripciones_unificadas` (VISTA que combina):
   - `inscripciones_clase_grupo` (fuente manual)
   - `inscripciones_actividad` (fuente suscripción)
4. ⚠️ `comisiones` con `docente_id` y `activo = true`
5. ⚠️ `inscripciones_comision` O `inscripciones_actividad` con `comision_id`

---

#### `GET /docentes/me/estadisticas-completas`

- **Controller:** [docentes.controller.ts:78-82](apps/api/src/docentes/docentes.controller.ts#L78-L82)
- **Service:** `DocenteStatsService.getEstadisticasCompletas()`
- **Tablas:**

```typescript
// 1. Estudiantes del docente (via inscripciones_unificadas)
prisma.inscripcionUnificada.findMany({
  where: {
    claseGrupo: { docente_id, activo: true },
    estado: 'ACTIVA',
  },
  select: { estudiante_id: true, clase_grupo_id: true },
});

// 2. Datos de estudiantes
prisma.estudiante.findMany({ where: { id: { in: estudiantesIds } } });

// 3. Puntos obtenidos
prisma.puntoObtenido.findMany({ where: { estudiante_id: { in: ids } } });

// 4. Asistencias agregadas por estudiante
prisma.asistenciaClaseGrupo.groupBy({
  by: ['estudiante_id', 'estado'],
  where: { estudiante_id: { in: ids }, clase_grupo_id: { in: grupoIds } },
});
```

---

#### `GET /docentes/me/clases-del-mes`

- **Controller:** [docentes.controller.ts:91-102](apps/api/src/docentes/docentes.controller.ts#L91-L102)
- **Service:** `DocenteStatsService.getClasesDelMes()`
- **Tablas:**

```typescript
prisma.claseGrupo.findMany({
  where: { docente_id, activo: true },
  select: {
    inscripciones: {  // ⚠️ USA inscripciones directas, no unificadas
      select: { estudiante: { ... } }
    }
  }
})
```

**⚠️ INCONSISTENCIA:** Este endpoint usa `inscripciones` (relación directa), no `inscripcionesUnificadas`

---

#### `GET /docentes/me/proxima-clase`

- **Controller:** [docentes.controller.ts:135-139](apps/api/src/docentes/docentes.controller.ts#L135-L139)
- **Service:** `DocenteStatsService.getProximaClase()`
- **Tablas:**

```typescript
prisma.comision.findMany({
  where: {
    docente_id,
    activo: true,
    OR: [{ fecha_fin: null }, { fecha_fin: { gte: now } }],
  },
  select: { id, nombre, horario, fecha_fin },
});
```

**Nota:** Este endpoint calcula la próxima clase parseando el string `horario` de las comisiones.

---

#### `GET /docentes/me/carga-horaria-semanal`

- **Controller:** [docentes.controller.ts:146-150](apps/api/src/docentes/docentes.controller.ts#L146-L150)
- **Service:** `DocenteStatsService.getCargaHorariaSemanal()`
- **Tablas:**

```typescript
prisma.comision.findMany({
  where: { docente_id, activo: true },
  select: { horario: true },
});
```

---

#### `GET /docentes/me/tendencia-asistencia`

- **Controller:** [docentes.controller.ts:157-161](apps/api/src/docentes/docentes.controller.ts#L157-L161)
- **Service:** `DocenteStatsService.getTendenciaAsistencia()`
- **Tablas:**

```typescript
// 1. Comisiones del docente
prisma.comision.findMany({ where: { docente_id }, select: { id } });

// 2. Asistencias por semana
prisma.asistenciaComision.groupBy({
  by: ['estado'],
  where: {
    comision_id: { in: comisionIds },
    fecha: { gte: inicioSemana, lte: finSemana },
  },
});
```

**Nota:** Usa `asistenciaComision`, no `asistenciaClaseGrupo`

---

#### `GET /docentes/me/distribucion-estudiantes`

- **Controller:** [docentes.controller.ts:168-172](apps/api/src/docentes/docentes.controller.ts#L168-L172)
- **Service:** `DocenteStatsService.getDistribucionEstudiantes()`
- **Tablas:**

```typescript
prisma.comision.findMany({
  where: { docente_id, activo: true },
  select: {
    nombre: true,
    inscripciones: {
      // ⚠️ SOLO FUENTE 1 (inscripciones manuales)
      where: { estado: { in: ['Pendiente', 'Confirmada'] } },
    },
  },
});
```

**⚠️ BUG:** Este endpoint SOLO cuenta `inscripciones` (manuales), NO incluye `inscripcionesActividad` (suscripción)

---

### 4. ENDPOINTS DOCENTE - COMISIONES (⚠️ CRÍTICOS)

#### `GET /docentes/me/comisiones`

- **Controller:** [docentes.controller.ts:183-187](apps/api/src/docentes/docentes.controller.ts#L183-L187)
- **Service:** `DocenteStatsService.getMisComisiones()`
- **Tablas:**

```typescript
prisma.comision.findMany({
  where: {
    docente_id,
    OR: [{ fecha_fin: null }, { fecha_fin: { gte: now } }],
  },
  select: {
    inscripciones: { where: { estado: { in: ['Pendiente', 'Confirmada'] } } },
    inscripcionesActividad: { where: { estado: 'ACTIVA' } },
  },
});
```

**✅ CORRECTO:** Este endpoint combina ambas fuentes de inscripciones.

---

#### `GET /docentes/me/comisiones/:id`

- **Controller:** [docentes.controller.ts:195-202](apps/api/src/docentes/docentes.controller.ts#L195-L202)
- **Service:** `DocenteStatsService.getComisionDetalle()`
- **Tablas:**

```typescript
prisma.comision.findFirst({
  where: { id: comisionId, docente_id },
  include: {
    inscripciones: { include: { estudiante: { ... } } },
    inscripcionesActividad: { include: { estudiante: { ... } } }
  }
})
```

**✅ CORRECTO:** Combina ambas fuentes.

---

#### `GET /docentes/me/comisiones/:id/estudiantes`

- **Controller:** [docentes.controller.ts:210-217](apps/api/src/docentes/docentes.controller.ts#L210-L217)
- **Service:** `DocenteComisionQueriesService.getEstudiantesComision()`
- **Tablas:**

```typescript
// FUENTE 1: Inscripciones manuales
prisma.inscripcionComision.findMany({
  where: { comision_id, estado: { not: 'Cancelada' } },
  include: { estudiante: { include: { tutor, casa, recursos, racha } } }
})

// FUENTE 2: Inscripciones suscripción
prisma.inscripcionActividad.findMany({
  where: { comision_id, estado: 'ACTIVA' },
  include: { estudiante: { ... }, suscripcion_familiar: { select: { tutor } } }
})
```

**✅ CORRECTO:** Combina ambas fuentes y evita duplicados.

---

#### `GET /docentes/me/comisiones/:id/metricas`

- **Controller:** [docentes.controller.ts:225-232](apps/api/src/docentes/docentes.controller.ts#L225-L232)
- **Service:** `DocenteComisionQueriesService.getMetricasComision()`
- **Tablas:**

```typescript
// Total estudiantes (ambas fuentes)
inscripcionComision.count({ where: { comision_id, estado: { not: 'Cancelada' } } });
inscripcionActividad.count({ where: { comision_id, estado: 'ACTIVA' } });

// Total clases (fechas únicas de asistencia)
asistenciaComision.groupBy({ by: ['fecha'], where: { comision_id } });

// Asistencia promedio
asistenciaComision.count({ where: { comision_id } });
asistenciaComision.count({ where: { comision_id, estado: 'Presente' } });

// XP total (de ambas fuentes)
inscripcionComision.findMany({ select: { estudiante: { recursos: { xp_total } } } });
inscripcionActividad.findMany({ select: { estudiante: { recursos: { xp_total } } } });
```

**✅ CORRECTO:** Combina ambas fuentes.

---

#### `GET /docentes/me/comisiones/:id/progreso`

- **Controller:** [docentes.controller.ts:240-247](apps/api/src/docentes/docentes.controller.ts#L240-L247)
- **Service:** `DocenteStatsService.getProgresoComision()`
- **Tablas:**

```typescript
prisma.comision.findFirst({ where: { id, docente_id } });
prisma.asistenciaComision.groupBy({ by: ['fecha'], where: { comision_id } });
```

---

#### `GET /docentes/me/comisiones/:id/historial-asistencia`

- **Controller:** [docentes.controller.ts:257-273](apps/api/src/docentes/docentes.controller.ts#L257-L273)
- **Service:** `DocenteComisionQueriesService.getHistorialAsistencia()`
- **Tablas:**

```typescript
prisma.asistenciaComision.findMany({
  where: { comision_id, fecha: { gte, lte } },
  include: { estudiante: { ... } }
})
```

---

#### `GET /docentes/me/comisiones/:id/historial-puntos`

- **Controller:** [docentes.controller.ts:283-299](apps/api/src/docentes/docentes.controller.ts#L283-L299)
- **Service:** `DocenteComisionQueriesService.getHistorialPuntosComision()`
- **Tablas:**

```typescript
// Estudiantes de la comisión (ambas fuentes)
inscripcionComision.findMany({ where: { comision_id }, select: { estudiante_id } })
inscripcionActividad.findMany({ where: { comision_id }, select: { estudiante_id } })

// Puntos
puntoObtenido.findMany({
  where: { estudiante_id: { in: ids } },
  include: { estudiante: { ... } }
})
```

---

### 5. ENDPOINTS DOCENTE - PLANIFICACIONES

#### `GET /docentes/me/asignaciones`

- **Controller:** [docentes.controller.ts:310-314](apps/api/src/docentes/docentes.controller.ts#L310-L314)
- **Service:** `DocentePlanificacionesService.getMisAsignaciones()`
- **Tablas:**

```typescript
prisma.asignacionPlanificacion.findMany({
  where: { docente_id },
  include: {
    planificacion: { include: { clases: { ... } } },
    claseGrupo: { ... },
    estadosClases: { include: { clase: { ... } } }
  }
})
```

**Seed requerido:**

- `asignaciones_planificacion` con `docente_id`
- `planificaciones` con `clases_planificacion`
- `estado_clase_grupos`

---

#### `POST /docentes/asignaciones/:id/clases/:claseId/activar`

- **Controller:** [docentes.controller.ts:322-331](apps/api/src/docentes/docentes.controller.ts#L322-L331)
- **Service:** `DocentePlanificacionesService.activarClase()`

#### `POST /docentes/asignaciones/:id/clases/:claseId/desactivar`

- **Controller:** [docentes.controller.ts:339-348](apps/api/src/docentes/docentes.controller.ts#L339-L348)

#### `POST /docentes/asignaciones/:id/clases/:claseId/teoria/activar`

- **Controller:** [docentes.controller.ts:356-365](apps/api/src/docentes/docentes.controller.ts#L356-L365)

#### `POST /docentes/asignaciones/:id/clases/:claseId/teoria/desactivar`

- **Controller:** [docentes.controller.ts:373-382](apps/api/src/docentes/docentes.controller.ts#L373-L382)

#### `POST /docentes/asignaciones/:id/clases/:claseId/practica/activar`

- **Controller:** [docentes.controller.ts:390-399](apps/api/src/docentes/docentes.controller.ts#L390-L399)

#### `POST /docentes/asignaciones/:id/clases/:claseId/practica/desactivar`

- **Controller:** [docentes.controller.ts:407-416](apps/api/src/docentes/docentes.controller.ts#L407-L416)

#### `GET /docentes/asignaciones/:id/progreso`

- **Controller:** [docentes.controller.ts:424-431](apps/api/src/docentes/docentes.controller.ts#L424-L431)
- **Service:** `DocentePlanificacionesService.getProgresoEstudiantes()`
- **Tablas:**

```typescript
prisma.asignacionPlanificacion.findUnique({
  include: {
    claseGrupo: {
      include: {
        inscripciones: {  // ⚠️ USA inscripciones directas
          where: { fecha_baja: null },
          include: { estudiante: { ... } }
        }
      }
    }
  }
})

prisma.progresoClaseEstudiante.findMany({ ... })
```

**⚠️ INCONSISTENCIA:** Usa `inscripciones` directas, no `inscripcionesUnificadas`

---

#### `GET /docentes/asignaciones/:id/clases/:claseId/tareas`

- **Controller:** [docentes.controller.ts:444-452](apps/api/src/docentes/docentes.controller.ts#L444-L452)
- **Service:** `DocentePlanificacionesService.getTareasClase()`

#### `POST /docentes/asignaciones/:id/tareas/:tareaClaseId/asignar`

- **Controller:** [docentes.controller.ts:461-478](apps/api/src/docentes/docentes.controller.ts#L461-L478)

#### `POST /docentes/asignaciones/:id/tareas/:tareaClaseId/desasignar`

- **Controller:** [docentes.controller.ts:486-498](apps/api/src/docentes/docentes.controller.ts#L486-L498)

#### `GET /docentes/asignaciones/:id/tareas/progreso`

- **Controller:** [docentes.controller.ts:506-513](apps/api/src/docentes/docentes.controller.ts#L506-L513)
- **Service:** `DocentePlanificacionesService.getProgresoTareas()`

---

## 🔴 PROBLEMAS IDENTIFICADOS

### Problema 1: Desconexión ClaseGrupo vs Comision

El sistema tiene **DOS modelos paralelos** para representar grupos de estudiantes:

| Modelo     | Tabla principal | Tabla inscripciones                                  | Dónde se usa                        |
| ---------- | --------------- | ---------------------------------------------------- | ----------------------------------- |
| ClaseGrupo | `clase_grupos`  | `inscripciones_clase_grupo`                          | Dashboard, estadísticas, calendario |
| Comision   | `comisiones`    | `inscripciones_comision` + `inscripciones_actividad` | Listado de comisiones, métricas     |

**El seed actual:**

- ✅ Crea `ClaseGrupo` con inscripciones en `inscripciones_clase_grupo`
- ❌ Crea `Comision` PERO no crea inscripciones en `inscripciones_comision`

**Resultado:** El docente ve:

- ❌ Dashboard vacío (debería mostrar estudiantes via `inscripcionesUnificadas`)
- ❌ Comisiones sin estudiantes (no hay `inscripciones_comision`)

---

### Problema 2: Vista `inscripciones_unificadas`

La vista `inscripciones_unificadas` existe y combina:

```sql
-- Fuente 1: inscripciones manuales a ClaseGrupo
SELECT ... FROM inscripciones_clase_grupo

UNION ALL

-- Fuente 2: inscripciones via suscripción 2026
SELECT ... FROM inscripciones_actividad WHERE clase_grupo_id IS NOT NULL
```

**El seed crea:**

- ✅ `inscripciones_clase_grupo` - los endpoints que usan `inscripcionesUnificadas` DEBERÍAN funcionar

**PERO:** El seed crea inscripciones SIN `suscripcion_familiar_id` correcto, lo que puede causar que la vista no las incluya correctamente.

---

### Problema 3: Inconsistencias en endpoints

| Endpoint                        | Fuente de estudiantes         | ¿Correcto?       |
| ------------------------------- | ----------------------------- | ---------------- |
| `me/dashboard`                  | `inscripcionesUnificadas`     | ✅               |
| `me/estadisticas-completas`     | `inscripcionesUnificadas`     | ✅               |
| `me/clases-del-mes`             | `inscripciones` (directa)     | ⚠️ Inconsistente |
| `me/distribucion-estudiantes`   | `inscripciones` (solo manual) | ❌ BUG           |
| `me/comisiones/:id/estudiantes` | Ambas fuentes                 | ✅               |
| `asignaciones/:id/progreso`     | `inscripciones` (directa)     | ⚠️ Inconsistente |

---

## 📋 TABLAS REQUERIDAS PARA EL PORTAL DOCENTE

### Nivel 1: Obligatorias

| Tabla                       | Descripción                 | Campos clave                                        |
| --------------------------- | --------------------------- | --------------------------------------------------- |
| `docentes`                  | El docente autenticado      | `id`, `email`, `password_hash`                      |
| `clase_grupos`              | Grupos de clase del docente | `docente_id`, `activo`, `dia_semana`, `hora_inicio` |
| `inscripciones_clase_grupo` | Inscripciones a grupos      | `clase_grupo_id`, `estudiante_id`, `tipo_acceso`    |
| `estudiantes`               | Estudiantes inscritos       | `id`, `nombre`, `apellido`, `tutor_id`, `casaId`    |

### Nivel 2: Para comisiones

| Tabla                     | Descripción               | Campos clave                                               |
| ------------------------- | ------------------------- | ---------------------------------------------------------- |
| `comisiones`              | Comisiones/cursos         | `docente_id`, `activo`, `producto_id`, `casa_id`           |
| `inscripciones_comision`  | Inscripciones manuales    | `comision_id`, `estudiante_id`, `estado`                   |
| `inscripciones_actividad` | Inscripciones suscripción | `comision_id`, `estudiante_id`, `estado`, `clase_grupo_id` |

### Nivel 3: Para estadísticas

| Tabla                     | Descripción              | Campos clave                                         |
| ------------------------- | ------------------------ | ---------------------------------------------------- |
| `asistencias_clase_grupo` | Asistencias a grupos     | `clase_grupo_id`, `estudiante_id`, `estado`, `fecha` |
| `asistencias_comision`    | Asistencias a comisiones | `comision_id`, `estudiante_id`, `estado`, `fecha`    |
| `puntos_obtenidos`        | Puntos gamificación      | `estudiante_id`, `docente_id`, `puntos`              |
| `recursos_estudiante`     | XP de estudiantes        | `estudiante_id`, `xp_total`                          |
| `rachas_estudiantes`      | Rachas                   | `estudiante_id`, `racha_actual`                      |

### Nivel 4: Para planificaciones

| Tabla                        | Descripción             | Campos clave                                       |
| ---------------------------- | ----------------------- | -------------------------------------------------- |
| `planificaciones`            | Planificaciones         | `id`, `titulo`                                     |
| `clases_planificacion`       | Clases de planificación | `planificacion_id`, `numero`, `titulo`             |
| `asignaciones_planificacion` | Asignación a grupo      | `docente_id`, `planificacion_id`, `clase_grupo_id` |
| `estado_clase_grupos`        | Estado activo/inactivo  | `asignacion_id`, `clase_id`                        |

### Nivel 5: Auxiliares

| Tabla                      | Descripción                        |
| -------------------------- | ---------------------------------- |
| `casas`                    | Casas (Quantum, Vertex, Pulsar)    |
| `productos`                | Productos/cursos                   |
| `tutores`                  | Tutores de estudiantes             |
| `suscripciones_familiares` | Para inscripciones via suscripción |

---

## 🔧 SOLUCIÓN PROPUESTA

### Opción A: Modificar el seed para crear inscripciones a Comisiones

Agregar al seed:

```typescript
// Para cada comisión creada, crear InscripcionComision
await prisma.inscripcionComision.create({
  data: {
    comision_id: comisionQuantum.id,
    estudiante_id: estudianteLuna.id,
    estado: 'Confirmada',
    tipo_inscripcion: 'BECADO',
    fecha_inscripcion: new Date(),
  },
});
```

### Opción B: Sincronizar ClaseGrupo ↔ Comision

Asegurar que cada `ClaseGrupo` tenga una `Comision` asociada y que las inscripciones se dupliquen en ambas.

### Opción C: Unificar modelo (recomendado a largo plazo)

Elegir UN modelo (probablemente `ClaseGrupo` + `inscripciones_unificadas`) y migrar todos los endpoints a usarlo.

---

## Conclusión

El docente no ve estudiantes porque:

1. El seed crea `ClaseGrupo` con inscripciones correctas
2. El seed crea `Comision` SIN inscripciones
3. Los endpoints de comisiones buscan en `inscripciones_comision` que está vacía
4. Algunos endpoints usan `inscripcionesUnificadas` (funciona), otros usan relaciones directas (no funciona)

**Acción inmediata:** Agregar inscripciones a `inscripciones_comision` en el seed para que el portal de comisiones funcione.
