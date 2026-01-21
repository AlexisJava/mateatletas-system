# AUDITORÍA EXHAUSTIVA: Portal del Estudiante

**Fecha:** 2026-01-20
**Versión:** 1.0
**Auditor:** Claude Opus 4.5

---

## RESUMEN EJECUTIVO

El portal del estudiante tiene una arquitectura más limpia que el portal docente. **USA CORRECTAMENTE la vista `inscripcionUnificada`** para la mayoría de queries relacionadas con inscripciones a ClaseGrupo.

### Hallazgos Clave

| Aspecto                          | Estado          | Observación                                    |
| -------------------------------- | --------------- | ---------------------------------------------- |
| Uso de inscripcionUnificada      | ✅ CORRECTO     | La mayoría de queries usan la vista            |
| Uso de inscripcionesComision     | ✅ CORRECTO     | Para comisiones usa la tabla directa           |
| Acceso a clases (LiveKit)        | ✅ CORRECTO     | Usa inscripcionUnificada para ClaseGrupo       |
| Fallback ClaseGrupo → Comision   | ✅ IMPLEMENTADO | Busca primero en ClaseGrupo, luego en Comision |
| Problema con obtenerProximaClase | ⚠️ PARCIAL      | Usa `inscripciones` directo en lugar de vista  |
| getDetalleCompleto               | ⚠️ PARCIAL      | Usa `inscripciones_clase` (tabla legacy)       |

---

## ARQUITECTURA DEL MÓDULO

```
apps/api/src/estudiantes/
├── estudiantes.controller.ts          # Controller principal (778 líneas)
├── estudiante-notificaciones.controller.ts  # Notificaciones del estudiante
├── estudiantes-facade.service.ts      # Facade que orquesta servicios
└── services/
    ├── estudiante-query.service.ts    # Queries CQRS
    ├── estudiante-command.service.ts  # Commands CQRS
    ├── estudiante-aula.service.ts     # Aula virtual
    ├── estudiante-stats.service.ts    # Estadísticas
    ├── acceso-estudiante.service.ts   # Verificación de acceso (LiveKit)
    ├── activity-feed.service.ts       # Feed de actividades
    ├── mi-progreso.service.ts         # Progreso consolidado
    └── estudiante-copy.service.ts     # Copiar estudiante a sector
```

---

## ENDPOINTS Y SUS QUERIES PRISMA

### 1. Verificación de Acceso a Plataforma

#### `GET /estudiantes/verificar-acceso`

**Service:** `AccesoEstudianteService.verificarAccesoEstudiante()`
**Propósito:** Determina si el estudiante puede acceder a la plataforma

```typescript
// Query Prisma EXACTA (línea 160-185)
const estudiante = await this.prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    plan: true, // TABLA: plan_suscripcion
    tutor: {
      include: {
        suscripciones: {
          // TABLA: suscripciones
          where: {
            estado: { in: ['ACTIVA', 'EN_GRACIA'] },
          },
          include: { plan: true },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    },
    inscripcionesComision: {
      // TABLA: inscripciones_comision
      where: { estado: { in: ['Confirmada', 'Pendiente'] } },
      include: { comision: true },
    },
  },
});
```

**Tablas consultadas:**

- `estudiantes` (base)
- `plan_suscripcion` (via plan)
- `tutores` (via tutor)
- `suscripciones` (via tutor.suscripciones)
- `inscripciones_comision` (DIRECTA, no usa vista)
- `comisiones` (via inscripcionesComision.comision)

**Lógica de acceso (prioridad):**

1. Si `estado_acceso = SUSPENDIDO` → SIN_ACCESO
2. Si `acceso_override` activo → OVERRIDE (acceso completo)
3. Si tiene `plan` directo vigente → PLAN_DIRECTO
4. Si tutor tiene suscripción activa → SUSCRIPCION_TUTOR
5. Si tiene inscripción a comisión activa → COMISION_ACTIVA
6. Sin acceso

---

### 2. Acceso a Clase Específica (LiveKit)

#### `GET /estudiantes/puede-entrar-clase?claseGrupoId=X` o `?comisionId=Y`

**Service:** `AccesoEstudianteService.puedeEntrarAClase()`
**Propósito:** Determina si puede entrar a clase en vivo (WebSocket/LiveKit)

##### Caso A: Acceso por claseGrupoId (línea 541-626)

```typescript
// Query 1: Verificar inscripción usando VISTA UNIFICADA ✅
const inscripcion = await this.prisma.inscripcionUnificada.findFirst({
  where: {
    estudiante_id: estudianteId,
    clase_grupo_id: claseGrupoId,
    estado: 'ACTIVA',
  },
});

// Query 2: Verificar plan STEAM_SINCRONICO
const estudiante = await this.prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    plan: true,
    tutor: {
      include: {
        suscripciones: {
          where: { estado: { in: ['ACTIVA', 'EN_GRACIA'] } },
          include: { plan: true },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    },
  },
});
```

**Resultado:**

- Requiere inscripción ACTIVA en vista unificada
- ADEMÁS requiere plan `STEAM_SINCRONICO` (directo o del tutor)

##### Caso B: Acceso por comisionId (línea 490-539)

```typescript
// Query 1: Obtener comisión
const comision = await this.prisma.comision.findUnique({
  where: { id: comisionId },
});

// Query 2: Verificar inscripción DIRECTA en tabla
const inscripcion = await this.prisma.inscripcionComision.findFirst({
  where: {
    estudiante_id: estudianteId,
    comision_id: comisionId,
    estado: 'Confirmada',
  },
});
```

**Resultado:**

- Solo requiere inscripción confirmada en `inscripciones_comision`
- NO requiere plan específico (comisiones son autónomas)

---

### 3. Mis Clases (Lista de clases del estudiante)

#### `GET /estudiantes/mis-clases`

**Service:** `EstudianteQueryService.obtenerMisClases()`
**Propósito:** Lista todas las clases donde está inscrito

```typescript
// Query paralela para ClaseGrupo Y Comisiones (línea 585-659)
const [inscripcionesClaseGrupo, inscripcionesComision] = await Promise.all([
  // ClaseGrupo: USA VISTA UNIFICADA ✅
  this.prisma.inscripcionUnificada.findMany({
    where: {
      estudiante_id: estudianteId,
      estado: 'ACTIVA',
    },
    include: {
      claseGrupo: {
        include: {
          docente: { select: { id, nombre, apellido, titulo, bio, especialidades, experiencia_anos } },
          grupo: { select: { id, codigo, nombre, link_meet } },
          sector: { select: { id, nombre, color, icono } },
        },
      },
    },
  }),

  // Comisiones: USA TABLA DIRECTA (correcto, comisiones no están en vista)
  this.prisma.inscripcionComision.findMany({
    where: {
      estudiante_id: estudianteId,
      estado: { in: ['Confirmada', 'Pendiente'] },
    },
    include: {
      comision: {
        select: {
          id, nombre, descripcion, horario, fecha_inicio, fecha_fin, activo,
          estado_clase, iniciada_en,  // Campos LiveKit
          docente: { select: { ... } },
          producto: { select: { id, nombre, descripcion } },
        },
      },
    },
  }),
]);
```

**Tablas consultadas:**

- `inscripciones_unificadas` (VISTA) ✅
- `clase_grupo`
- `docentes`
- `grupos`
- `sectores`
- `inscripciones_comision` (TABLA directa)
- `comisiones`
- `productos`

---

### 4. Próxima Clase

#### `GET /estudiantes/mi-proxima-clase`

**Service:** `EstudianteQueryService.obtenerProximaClase()`
**Propósito:** Obtiene la próxima clase programada

```typescript
// ⚠️ USA RELACIÓN DIRECTA, NO VISTA UNIFICADA
const proximaClaseGrupo = await this.prisma.claseGrupo.findFirst({
  where: {
    inscripciones: {           // ❌ Relación directa a inscripciones_clase_grupo
      some: {
        estudiante_id: estudianteId,
      },
    },
    activo: true,
  },
  include: {
    docente: { ... },
    grupo: { ... },
  },
  orderBy: { createdAt: 'asc' },
});
```

**PROBLEMA DETECTADO:**

- Usa relación `inscripciones` que apunta a `inscripciones_clase_grupo`
- NO usa vista unificada
- Si el estudiante tiene inscripción via suscripción (tabla `inscripciones_actividad`), NO la encontrará

---

### 5. Compañeros de Clase

#### `GET /estudiantes/mis-companeros`

**Service:** `EstudianteQueryService.obtenerCompanerosDeClase()`
**Propósito:** Lista compañeros del mismo grupo

```typescript
// 1. Buscar inscripción del estudiante (USA VISTA ✅)
const inscripcionClaseGrupo = await this.prisma.inscripcionUnificada.findFirst({
  where: {
    estudiante_id: estudianteId,
    estado: 'ACTIVA',
  },
});

// 2. Si tiene ClaseGrupo, buscar compañeros (USA VISTA ✅)
if (inscripcionClaseGrupo) {
  const companeros = await this.prisma.estudiante.findMany({
    where: {
      id: { not: estudianteId },
      inscripcionesUnificadas: {        // ✅ Usa relación a vista
        some: {
          clase_grupo_id: inscripcionClaseGrupo.clase_grupo_id,
          estado: 'ACTIVA',
        },
      },
    },
    select: { id, nombre, apellido, recursos: { select: { xp_total } } },
  });
  return companeros.map(...).sort(...);
}

// 3. Fallback a Comisión si no tiene ClaseGrupo
const inscripcionComision = await this.prisma.inscripcionComision.findFirst({
  where: {
    estudiante_id: estudianteId,
    estado: 'Confirmada',
  },
});

if (inscripcionComision) {
  const companeros = await this.prisma.estudiante.findMany({
    where: {
      id: { not: estudianteId },
      inscripcionesComision: {
        some: {
          comision_id: inscripcionComision.comision_id,
          estado: 'Confirmada',
        },
      },
    },
    ...
  });
}
```

**Lógica de fallback:** ClaseGrupo (vista) → Comision (tabla directa)

---

### 6. Mi Plan de Suscripción

#### `GET /estudiantes/mi-plan`

**Service:** `EstudianteQueryService.obtenerMiPlan()`
**Propósito:** Determina el plan y permisos del estudiante

```typescript
// 1. Obtener estudiante con plan directo
const estudiante = await this.prisma.estudiante.findUnique({
  where: { id: estudianteId },
  select: {
    tutor_id: true,
    plan_id: true,
    estado_acceso: true,
    fecha_vencimiento_plan: true,
    notas_plan: true,
    plan: true,        // Relación directa con plan_suscripcion
  },
});

// 2. Si tiene plan directo, retornarlo
if (estudiante.plan_id && estudiante.plan) {
  return { tiene_plan: true, plan: estudiante.plan, es_plan_directo: true, ... };
}

// 3. Fallback: buscar suscripción del tutor
const suscripcion = await this.prisma.suscripcion.findFirst({
  where: {
    tutor_id: estudiante.tutor_id,
    estado: { in: ['ACTIVA', 'EN_GRACIA'] },
  },
  include: { plan: true },
  orderBy: { created_at: 'desc' },
});
```

**Tablas consultadas:**

- `estudiantes`
- `plan_suscripcion` (via plan o suscripcion.plan)
- `suscripciones`
- `tutores` (implícito via tutor_id)

---

### 7. Mis Sectores

#### `GET /estudiantes/mis-sectores`

**Service:** `EstudianteQueryService.obtenerMisSectores()`
**Propósito:** Lista sectores donde está inscrito

```typescript
// USA VISTA UNIFICADA ✅
const inscripciones = await this.prisma.inscripcionUnificada.findMany({
  where: {
    estudiante_id: estudianteId,
    estado: 'ACTIVA',
  },
  include: {
    claseGrupo: {
      include: {
        grupo: {
          include: { sector: true },
        },
      },
    },
  },
});
```

---

### 8. Mi Aula Virtual

#### `GET /estudiantes/mi-aula`

**Service:** `EstudianteAulaService.getMiAula()`
**Propósito:** Resumen del aula con planificaciones activas

```typescript
// 1. Obtener grupos del estudiante (USA VISTA ✅)
const inscripciones = await this.prisma.inscripcionUnificada.findMany({
  where: {
    estudiante_id: estudianteId,
    estado: 'ACTIVA',
  },
  select: {
    clase_grupo_id: true,
    claseGrupo: {
      select: {
        id, nombre, codigo,
        grupo: {
          select: {
            id, nombre,
            sector: { select: { id, nombre, color, icono } },
          },
        },
      },
    },
  },
});

// 2. Obtener asignaciones de planificación para esos grupos
const asignaciones = await this.prisma.asignacionPlanificacion.findMany({
  where: {
    clase_grupo_id: { in: claseGrupoIds },
    activa: true,
  },
  include: {
    planificacion: { ... },
    claseGrupo: { include: { docente: { ... } } },
    docente: { ... },
    estadosClases: { ... },
    tareasAsignadas: { ... },
  },
});

// 3. Progreso del estudiante
const progresosClases = await this.prisma.progresoClaseEstudiante.findMany({...});
const progresosTareas = await this.prisma.progresoTareaEstudiante.findMany({...});
```

**Tablas consultadas:**

- `inscripciones_unificadas` (VISTA) ✅
- `clase_grupo`
- `grupos`
- `sectores`
- `asignaciones_planificacion`
- `planificaciones`
- `docentes`
- `estados_clase_asignacion`
- `tareas_asignadas`
- `progresos_clase_estudiante`
- `progresos_tarea_estudiante`

---

### 9. Tareas del Estudiante

#### `GET /estudiantes/mis-tareas`

**Service:** `EstudianteAulaService.getMisTareas()`
**Propósito:** Lista tareas asignadas con progreso

```typescript
// 1. Obtener grupos del estudiante (USA VISTA ✅)
const inscripciones = await this.prisma.inscripcionUnificada.findMany({
  where: {
    estudiante_id: estudianteId,
    estado: 'ACTIVA',
  },
  select: { clase_grupo_id: true },
});

// 2. Obtener tareas asignadas para esos grupos
const tareasAsignadas = await this.prisma.tareaAsignada.findMany({
  where: {
    activa: true,
    asignacion: {
      activa: true,
      clase_grupo_id: { in: claseGrupoIds },
    },
  },
  include: {
    tareaClase: { include: { contenido: {...}, clase: {...} } },
    asignacion: { select: { ... } },
    progresos: { where: { estudiante_id: estudianteId } },
  },
  orderBy: [{ fecha_limite: 'asc' }, { fecha_asignacion: 'desc' }],
});
```

---

### 10. Mi Progreso (Endpoint Consolidado)

#### `GET /estudiantes/mi-progreso`

**Service:** `MiProgresoService.getMiProgreso()`
**Propósito:** Datos consolidados de gamificación

```typescript
// Ejecuta 5 queries en paralelo
const [estudiante, recursos, racha, logrosData, actividadesData] = await Promise.all([
  // Query 1: Datos básicos
  this.prisma.estudiante.findUniqueOrThrow({
    where: { id: estudianteId },
    select: { id, nombre, apellido, avatarUrl, casa: { select: { tipo } } },
  }),

  // Query 2: Recursos (XP)
  this.prisma.recursosEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  }),

  // Query 3: Racha
  this.prisma.rachaEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  }),

  // Query 4: Logros (3 queries paralelas internas)
  [
    this.prisma.logroEstudiante.count({...}),
    this.prisma.logro.count({...}),
    this.prisma.logroEstudiante.findMany({...take: 5}),
  ],

  // Query 5: Actividades recientes
  this.prisma.actividadFeed.findMany({
    where: { estudiante_id: estudianteId },
    take: 10,
    orderBy: { creado_en: 'desc' },
  }),
]);
```

**Tablas consultadas:**

- `estudiantes`
- `casas`
- `recursos_estudiante`
- `rachas_estudiante`
- `logros_estudiante`
- `logros`
- `actividad_feed`

---

### 11. Activity Feed

#### `GET /estudiantes/feed`

**Service:** `ActivityFeedService.getFeed()`

```typescript
const [items, total] = await Promise.all([
  this.prisma.actividadFeed.findMany({
    where,
    include: {
      estudiante: { select: { id, nombre, apellido, avatarUrl } },
      reacciones: { select: { emoji, estudiante_id } },
      _count: { select: { reacciones: true } },
    },
    orderBy: { creado_en: 'desc' },
    skip,
    take: limit,
  }),
  this.prisma.actividadFeed.count({ where }),
]);
```

---

### 12. Detalle Completo del Estudiante

#### `GET /estudiantes/:id/detalle` (usado por tutores)

**Service:** `EstudianteQueryService.getDetalleCompleto()`

```typescript
// ⚠️ USA RELACIÓN DIRECTA inscripciones_clase, NO vista unificada
const estudiante = await this.prisma.estudiante.findFirst({
  where: { id: estudianteId, tutor_id: tutorId },
  include: {
    casa: true,
    recursos: { select: { xp_total } },
    logros_desbloqueados: { include: { logro } },
    inscripciones_clase: {        // ❌ Tabla legacy, no vista
      include: {
        clase: { include: { docente: {...} } },
      },
      take: 10,
    },
    asistencias: { include: { clase } },
  },
});
```

**PROBLEMA:** Usa `inscripciones_clase` (tabla legacy para clases individuales) que es diferente a `inscripciones_clase_grupo` o la vista.

---

## COMPARACIÓN: ClaseGrupo vs Comision

### Modelo de Datos del Estudiante

```
                    ESTUDIANTE
                         │
          ┌──────────────┴──────────────┐
          │                             │
    CLASEGRUPO                     COMISION
          │                             │
    ┌─────┴─────┐                       │
    │           │                       │
inscripcion  inscripcion         inscripcion
_clase_grupo _actividad          _comision
(manual)     (suscripción)       (única tabla)
    │           │                       │
    └─────┬─────┘                       │
          │                             │
    VISTA UNIFICADA            inscripciones_comision
```

### Uso por Endpoint

| Endpoint                         | ClaseGrupo  | Comision     | Usa Vista        |
| -------------------------------- | ----------- | ------------ | ---------------- |
| verificarAccesoEstudiante        | No          | Sí (directo) | No               |
| puedeEntrarAClase (claseGrupoId) | Sí          | No           | ✅ Sí            |
| puedeEntrarAClase (comisionId)   | No          | Sí (directo) | N/A              |
| obtenerMisClases                 | Sí          | Sí           | ✅ Sí            |
| obtenerProximaClase              | Sí          | Sí           | ❌ NO (problema) |
| obtenerCompanerosDeClase         | Sí          | Sí           | ✅ Sí (fallback) |
| obtenerMiPlan                    | No          | No           | N/A              |
| obtenerMisSectores               | Sí          | No           | ✅ Sí            |
| getMiAula                        | Sí          | No           | ✅ Sí            |
| getMisTareas                     | Sí          | No           | ✅ Sí            |
| getMiProgreso                    | No          | No           | N/A              |
| getDetalleCompleto               | Sí (legacy) | No           | ❌ NO (problema) |

---

## PROBLEMAS IDENTIFICADOS

### 1. `obtenerProximaClase` no usa vista unificada

**Ubicación:** `estudiante-query.service.ts:326-355`

```typescript
// ACTUAL (problemático)
const proximaClaseGrupo = await this.prisma.claseGrupo.findFirst({
  where: {
    inscripciones: {  // ❌ Apunta a inscripciones_clase_grupo directamente
      some: { estudiante_id: estudianteId },
    },
    ...
  },
});
```

**Impacto:**

- Estudiantes inscritos via suscripción (inscripciones_actividad) NO verán su próxima clase

**Solución propuesta:**

```typescript
// Buscar primero la inscripción activa del estudiante
const inscripcion = await this.prisma.inscripcionUnificada.findFirst({
  where: { estudiante_id: estudianteId, estado: 'ACTIVA' },
  include: { claseGrupo: { include: { docente, grupo } } },
});
// Luego usar los datos de la inscripción
```

### 2. `getDetalleCompleto` usa tabla legacy

**Ubicación:** `estudiante-query.service.ts:198-279`

El método usa `inscripciones_clase` que es una tabla legacy para clases individuales (no grupales). Esto es un problema de nomenclatura y puede causar confusión.

### 3. Algunos métodos del EstudianteAulaService usan relación directa

**Ubicación:** `estudiante-aula.service.ts` líneas 259-268, 419-431, etc.

```typescript
// En getPlanificacionDetalle
claseGrupo: {
  inscripciones: {          // ❌ Debería usar vista
    some: {
      estudiante_id: estudianteId,
      fecha_baja: null,
    },
  },
},
```

**Impacto:** Misma situación - estudiantes con inscripción via suscripción no tendrán acceso.

---

## TABLAS REQUERIDAS PARA QUE FUNCIONE EL PORTAL

### Tablas Críticas (deben tener datos)

| Tabla                 | Propósito                          | Seed requerido     |
| --------------------- | ---------------------------------- | ------------------ |
| `estudiantes`         | Base del portal                    | ✅ Sí              |
| `tutores`             | Padre/tutor del estudiante         | ✅ Sí              |
| `casas`               | Gamificación (casa del estudiante) | ✅ Sí              |
| `plan_suscripcion`    | Planes disponibles                 | ✅ Sí              |
| `recursos_estudiante` | XP y puntos                        | Se crea automático |
| `rachas_estudiante`   | Rachas de actividad                | Se crea automático |

### Tablas de Inscripción (al menos una debe tener datos)

| Tabla                       | Cuándo usar                              | Quién la llena          |
| --------------------------- | ---------------------------------------- | ----------------------- |
| `inscripciones_clase_grupo` | Admin/becas crean inscripción manual     | Admin                   |
| `inscripciones_actividad`   | Tutor compra suscripción y elige horario | Sistema via suscripción |
| `inscripciones_comision`    | Inscripción a talleres/colonias          | Admin o sistema         |

### Tablas de Clases (para funcionalidades de aula)

| Tabla         | Propósito                      |
| ------------- | ------------------------------ |
| `clase_grupo` | Clases semanales regulares     |
| `grupos`      | Agrupación de ClaseGrupo       |
| `sectores`    | Matemática, Programación, etc. |
| `comisiones`  | Talleres, colonias, eventos    |
| `docentes`    | Profesores                     |

### Tablas de Contenido (para aula virtual)

| Tabla                        | Propósito                      |
| ---------------------------- | ------------------------------ |
| `planificaciones`            | Plan de clases                 |
| `clases_planificacion`       | Clases dentro de planificación |
| `contenidos`                 | Teoría/práctica                |
| `nodos_contenido`            | Slides de contenido            |
| `asignaciones_planificacion` | Planificación → ClaseGrupo     |
| `estados_clase_asignacion`   | Qué está activado              |
| `tareas_clase`               | Tareas de cada clase           |
| `tareas_asignadas`           | Tareas asignadas a grupos      |
| `progresos_clase_estudiante` | Progreso del estudiante        |
| `progresos_tarea_estudiante` | Progreso en tareas             |

### Tablas de Gamificación

| Tabla               | Propósito            |
| ------------------- | -------------------- |
| `logros`            | Definición de logros |
| `logros_estudiante` | Logros desbloqueados |
| `actividad_feed`    | Feed de actividades  |
| `reacciones_feed`   | Reacciones al feed   |

---

## FLUJO DE ACCESO A CLASE EN VIVO (LiveKit)

```
Usuario hace click en "Entrar a Clase"
          │
          ▼
Frontend llama GET /estudiantes/puede-entrar-clase?claseGrupoId=X
          │
          ▼
AccesoEstudianteService.puedeEntrarAClase()
          │
          ├── ¿Es comisionId? ──────────────────────────────────────┐
          │                                                          │
          ▼                                                          ▼
verificarAccesoClaseGrupo()                          verificarAccesoClaseComision()
          │                                                          │
          ▼                                                          ▼
1. Buscar inscripcion en                             1. Buscar comision
   inscripcionUnificada ✅                           2. Verificar que no venció
   (estado: ACTIVA)                                  3. Buscar inscripcion en
          │                                              inscripcionComision
          ▼                                              (estado: Confirmada)
2. ¿Tiene inscripción?                                        │
   ├── NO → SIN_INSCRIPCION                                   ▼
   └── SÍ → Continuar                                ¿Tiene inscripción?
          │                                          ├── NO → SIN_INSCRIPCION
          ▼                                          └── SÍ → PUEDE ENTRAR ✅
3. Verificar plan estudiante
   (plan directo o suscripcion tutor)
          │
          ▼
4. ¿Plan = STEAM_SINCRONICO?
   ├── NO → SIN_PERMISO
   └── SÍ → PUEDE ENTRAR ✅
```

---

## RECOMENDACIONES

### Prioridad Alta

1. **Corregir `obtenerProximaClase`**
   - Cambiar para usar `inscripcionUnificada` en lugar de relación directa
   - Impacta: estudiantes con suscripción no ven su próxima clase

2. **Corregir `getPlanificacionDetalle` y similares en EstudianteAulaService**
   - Cambiar validación de acceso para usar vista unificada
   - Impacta: acceso a contenido del aula virtual

### Prioridad Media

3. **Revisar `getDetalleCompleto`**
   - Clarificar qué tabla de inscripciones debe usar
   - `inscripciones_clase` parece ser legacy para clases individuales

### Prioridad Baja

4. **Documentar modelo dual ClaseGrupo/Comision**
   - Crear documentación clara de cuándo usar cada uno
   - El código tiene buen fallback, pero falta documentación

---

## CONCLUSIÓN

El portal del estudiante está **mejor implementado** que el portal docente en cuanto al uso de la vista unificada. La mayoría de endpoints críticos (mis-clases, mis-companeros, mi-aula, mis-tareas) usan correctamente `inscripcionUnificada`.

Sin embargo, hay algunos métodos que aún usan relaciones directas a `inscripciones_clase_grupo`, lo que causa inconsistencias cuando los estudiantes están inscritos via suscripción familiar (`inscripciones_actividad`).

### Resumen de Estado

| Componente                     | Estado                    |
| ------------------------------ | ------------------------- |
| Acceso a clases vivo (LiveKit) | ✅ Funciona correctamente |
| Listar mis clases              | ✅ Funciona correctamente |
| Compañeros de clase            | ✅ Funciona correctamente |
| Mi aula virtual                | ✅ Funciona correctamente |
| Próxima clase                  | ⚠️ Requiere corrección    |
| Planificación detalle          | ⚠️ Requiere corrección    |
| Gamificación                   | ✅ Funciona correctamente |
