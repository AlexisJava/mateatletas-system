# AUDITORÍA EXHAUSTIVA: Portal del Tutor

**Fecha:** 2026-01-20
**Versión:** 1.0
**Auditor:** Claude Opus 4.5

---

## RESUMEN EJECUTIVO

El portal del tutor tiene DOS áreas funcionales principales:

1. **Dashboard del tutor** (`/tutor/*`) - Ver información de sus hijos, clases, pagos, alertas
2. **Gestión de estudiantes** (`/estudiantes/*` con rol TUTOR) - CRUD de hijos, ver inscripciones

Además existe el módulo de **Suscripción Familiar** que es CRÍTICO para entender cómo los tutores inscriben hijos a clases.

### Hallazgos Clave

| Aspecto                     | Estado           | Observación                                                           |
| --------------------------- | ---------------- | --------------------------------------------------------------------- |
| Uso de inscripcionUnificada | ❌ NO USA        | El módulo tutor usa tablas legacy directas                            |
| Modelo de Inscripción       | ⚠️ MIXTO         | Usa sistema antiguo (Clase) + nuevo (ClaseGrupo/InscripcionActividad) |
| Suscripción Familiar 2026   | ✅ BIEN DISEÑADO | Escribe a `inscripcion_actividad` que alimenta la vista               |
| Dashboard del tutor         | ⚠️ PARCIAL       | Usa sistema antiguo (Clase + InscripcionClase)                        |
| Clases de hoy/próximas      | ⚠️ DUAL          | Combina sistema antiguo y nuevo en paralelo                           |

---

## ARQUITECTURA DEL MÓDULO

### Módulo Tutor Principal

```
apps/api/src/tutor/
├── tutor.controller.ts              # Endpoints de dashboard
├── tutor-notificaciones.controller.ts  # Notificaciones del tutor
├── tutor.service.ts                 # Facade principal
├── tutor.module.ts                  # Module definition
├── services/
│   ├── tutor-facade.service.ts      # Orquestador
│   ├── tutor-query.service.ts       # Queries CQRS
│   └── tutor-stats.service.ts       # Estadísticas y cálculos
├── validators/
│   └── tutor-business.validator.ts  # Validaciones de negocio
├── dto/                             # DTOs
└── types/
    └── tutor-dashboard.types.ts     # Tipos de dashboard
```

### Módulo Suscripción Familiar

```
apps/api/src/suscripciones/
├── presentation/
│   ├── suscripcion-familiar.controller.ts  # Endpoints suscripción
│   └── suscripciones.controller.ts         # Otros endpoints
├── services/
│   ├── suscripcion-familiar-command.service.ts  # Comandos CQRS
│   ├── suscripcion-familiar-query.service.ts    # Queries CQRS
│   └── mercadopago-preapproval-client.service.ts # MercadoPago
└── types/                           # Tipos de suscripción
```

---

## ENDPOINTS DEL PORTAL TUTOR

### 1. Dashboard Resumen

#### `GET /tutor/dashboard-resumen`

**Service:** `TutorQueryService.getDashboardResumen()`
**Propósito:** Datos consolidados del dashboard del tutor

```typescript
// Ejecuta 4 queries en paralelo (línea 92-97)
const [metricas, hijos, pagosPendientes, clasesHoy] = await Promise.all([
  this.statsService.calcularMetricasDashboard(tutorId),
  this.statsService.obtenerHijos(tutorId),
  this.statsService.obtenerPagosPendientes(tutorId),
  this.statsService.obtenerClasesHoy(tutorId),
]);
```

**Tablas consultadas:**

- `estudiantes` (hijos del tutor)
- `tutores`
- `casas`
- `recursos_estudiante` (XP)
- `inscripciones_clase` (sistema antiguo)
- `clases` (sistema antiguo)
- `inscripciones_mensuales` (pagos)
- `asistencias`

---

### 2. Métricas del Dashboard

**Service:** `TutorStatsService.calcularMetricasDashboard()`

```typescript
// Query 1: Total de hijos (línea 152)
const totalHijos = await this.prisma.estudiante.count({
  where: { tutor_id: tutorId },
});

// Query 2: IDs de estudiantes (línea 157-160)
const estudiantesIds = await this.prisma.estudiante.findMany({
  where: { tutor_id: tutorId },
  select: { id: true },
});

// Query 3: Clases del mes - ❌ USA SISTEMA ANTIGUO (línea 164-175)
const clasesDelMes = await this.prisma.inscripcionClase.count({
  where: {
    estudiante_id: { in: estudiantesIdsArray },
    clase: {
      fecha_hora_inicio: { gte: inicioMes, lte: finMes },
      estado: 'Programada',
    },
  },
});

// Query 4: Total pagado año (línea 178-189)
const inscripcionesPagadas = await this.prisma.inscripcionMensual.aggregate({
  where: {
    tutor_id: tutorId,
    estado_pago: 'Pagado',
    createdAt: { gte: inicioAnio },
  },
  _sum: { precio_final: true },
});

// Query 5: Asistencia promedio (línea 196-204)
const asistencias = await this.prisma.asistencia.groupBy({
  by: ['estado'],
  where: { estudiante_id: { in: estudiantesIdsArray } },
  _count: { estado: true },
});
```

**PROBLEMA:** Usa `inscripcionClase` + `clase` (sistema antiguo), NO usa ClaseGrupo ni inscripcionActividad.

---

### 3. Obtener Hijos del Tutor

**Service:** `TutorStatsService.obtenerHijos()`

```typescript
// Query: Lista de hijos con recursos (línea 603-614)
const estudiantes = await this.prisma.estudiante.findMany({
  where: { tutor_id: tutorId },
  include: {
    casa: { select: { nombre: true } },
    recursos: { select: { xp_total: true } },
  },
  orderBy: { nombre: 'asc' },
});
```

**Tablas consultadas:**

- `estudiantes`
- `casas`
- `recursos_estudiante`
- `asistencias` (para calcular % asistencia por hijo)

---

### 4. Clases de Hoy

**Service:** `TutorStatsService.obtenerClasesHoy()`

```typescript
// ❌ USA SISTEMA ANTIGUO (Clase + InscripcionClase)
const clasesHoy = await this.prisma.clase.findMany({
  where: {
    fecha_hora_inicio: { gte: hoy, lt: manana },
    estado: 'Programada',
    inscripciones: {
      some: { estudiante_id: { in: estudiantesIdsArray } },
    },
  },
  include: {
    docente: { select: { nombre, apellido } },
    inscripciones: {
      where: { estudiante_id: { in: estudiantesIdsArray } },
      include: {
        estudiante: { select: { id, nombre, apellido } },
      },
    },
  },
  orderBy: { fecha_hora_inicio: 'asc' },
});
```

**PROBLEMA CRÍTICO:**

- Este endpoint **NO VE** las clases del sistema 2026 (ClaseGrupo + InscripcionActividad)
- Los hijos inscritos via suscripción familiar NO aparecerán en "clases de hoy"

---

### 5. Próximas Clases

#### `GET /tutor/proximas-clases`

**Service:** `TutorQueryService.getProximasClases()`
**Propósito:** Próximas clases de todos los hijos

```typescript
// SISTEMA DUAL: Combina antiguo y nuevo

// === SISTEMA ANTIGUO: Clase + InscripcionClase (línea 199-236) ===
const clasesAntiguas = await this.prisma.clase.findMany({
  where: {
    fecha_hora_inicio: { gte: ahora },
    estado: 'Programada',
    inscripciones: {
      some: { estudiante_id: { in: estudiantesIdsArray } },
    },
  },
  include: {
    docente: { select: { id, nombre, apellido } },
    inscripciones: {
      where: { estudiante_id: { in: estudiantesIdsArray } },
      include: {
        estudiante: { select: { id, nombre, apellido } },
      },
    },
  },
  orderBy: { fecha_hora_inicio: 'asc' },
  take: limit,
});

// === SISTEMA 2026: ClaseGrupo + InscripcionActividad (línea 241-287) ===
const inscripcionesActividad = await this.prisma.inscripcionActividad.findMany({
  where: {
    estudiante_id: { in: estudiantesIdsArray },
    estado: 'ACTIVA',
    clase_grupo_id: { not: null },
    suscripcion_familiar: {
      estado: 'AUTHORIZED', // Solo suscripciones activas
    },
  },
  select: {
    id: true,
    estado: true,
    estudiante: { select: { id, nombre, apellido } },
    clase_grupo: {
      select: {
        id,
        nombre,
        dia_semana,
        hora_inicio,
        hora_fin,
        fecha_inicio,
        fecha_fin,
        activo,
        estado_clase,
        docente: { select: { id, nombre, apellido } },
        producto: { select: { nombre } },
      },
    },
  },
});
```

**Observaciones:**

- ✅ Este endpoint SÍ consulta ambos sistemas
- ✅ Para ClaseGrupo, usa `inscripcionActividad` directamente (correcto)
- ❌ NO usa la vista `inscripcionUnificada`
- ❌ No incluye inscripciones manuales (solo las de suscripción)

---

### 6. Mis Inscripciones Mensuales

#### `GET /tutor/mis-inscripciones`

**Service:** `TutorQueryService.getMisInscripciones()` via `InscripcionMensualRepository`

```typescript
// Usa repositorio especializado
const inscripciones = await this.inscripcionRepo.obtenerPorTutor(tutorId, periodo, estadoPago);
```

**Tablas consultadas:**

- `inscripciones_mensuales` (pagos mensuales)
- `productos`
- `estudiantes`

---

### 7. Alertas del Tutor

#### `GET /tutor/alertas`

**Service:** `TutorStatsService.construirAlertas()`

Genera alertas basadas en:

1. **Pagos vencidos** (prioridad alta)
2. **Pagos por vencer** (prioridad alta/media)
3. **Clases hoy** (prioridad media)
4. **Asistencia baja <70%** (prioridad alta/media)

**Tablas consultadas:**

- `inscripciones_mensuales`
- `estudiantes`
- `clases` (sistema antiguo)
- `asistencias`

---

### 8. Notificaciones del Tutor

#### `GET /tutor/notificaciones`

**Service:** `NotificacionesService.findAllTutor()`

```typescript
// Usa tabla de notificaciones genérica
const notificaciones = await this.prisma.notificacion.findMany({
  where: {
    destinatario_tipo: 'tutor',
    destinatario_id: tutorId,
    ...filtros,
  },
  ...
});
```

---

## FLUJO DE SUSCRIPCIÓN FAMILIAR (2026)

### Creación de Suscripción

#### `POST /suscripciones/familiar`

**Service:** `SuscripcionFamiliarCommandService.crear()`

```typescript
// 1. Validar tutor y estudiantes
const tutor = await this.prisma.tutor.findUnique({
  where: { id: tutorId },
  include: {
    suscripcionFamiliar: true,
    estudiantes: { select: { id: true } },
  },
});

// 2. Crear suscripción
const suscripcion = await tx.suscripcionFamiliar.create({
  data: {
    tutor_id: tutorId,
    tier,
    estado: EstadoSuscripcionFamiliar.AUTHORIZED,
    monto_mensual: montoMensual,
  },
});

// 3. Crear inscripciones - ✅ ESCRIBE A inscripcion_actividad (línea 220-234)
if (inscripciones && inscripciones.length > 0) {
  const inscripcionesData = inscripciones.map((insc) => ({
    suscripcion_familiar_id: suscripcion.id,
    estudiante_id: insc.estudianteId,
    producto_id: insc.productoId,
    clase_grupo_id: insc.claseGrupoId ?? null, // ✅ Enlace a ClaseGrupo
    comision_id: insc.comisionId ?? null,
    estado: EstadoInscripcionActividad.ACTIVA,
    tier: insc.tier ?? tier,
  }));

  await tx.inscripcionActividad.createMany({
    data: inscripcionesData,
  });
}

// 4. Crear PreApproval en MercadoPago
```

**IMPORTANTE:**

- La suscripción familiar ESCRIBE a `inscripcion_actividad`
- Esta tabla es una de las fuentes de la vista `inscripciones_unificadas`
- Por lo tanto, los portales que usan la vista VERÁN estas inscripciones

---

### Agregar Inscripciones

#### `POST /suscripciones/familiar/inscripciones`

**Service:** `SuscripcionFamiliarCommandService.agregarInscripciones()`

```typescript
// Crea nueva inscripción en inscripcion_actividad (línea 399-411)
const nueva = await tx.inscripcionActividad.create({
  data: {
    suscripcion_familiar_id: suscripcionFamiliarId,
    estudiante_id: insc.estudianteId,
    producto_id: insc.productoId,
    clase_grupo_id: insc.claseGrupoId ?? null,
    comision_id: insc.comisionId ?? null,
    estado: EstadoInscripcionActividad.ACTIVA,
    tier: insc.tier ?? suscripcion.tier,
  },
});
```

---

### Cambiar Horario de Inscripción

#### `PATCH /suscripciones/familiar/inscripciones/horario`

**Service:** `SuscripcionFamiliarCommandService.cambiarHorario()`

```typescript
// 1. Validar que el nuevo ClaseGrupo pertenece al mismo producto
const nuevoClaseGrupo = await this.prisma.claseGrupo.findUnique({
  where: { id: nuevoClaseGrupoId },
  select: { id: true, nombre: true, producto_id: true },
});

// 2. Actualizar inscripción (línea 686-688)
await tx.inscripcionActividad.update({
  where: { id: inscripcionId },
  data: { clase_grupo_id: nuevoClaseGrupoId },
});
```

---

## COMPARACIÓN: ClaseGrupo vs Comision vs Clase (Legacy)

### Modelo de Datos del Tutor

```
                         TUTOR
                           │
              ┌────────────┴────────────┐
              │                         │
       ESTUDIANTES              SUSCRIPCION_FAMILIAR
              │                         │
              │                   INSCRIPCION_ACTIVIDAD
              │                    (clase_grupo_id ó
              │                     comision_id)
              │                         │
              │                         ▼
              │            ┌─────────────────────────┐
              │            │ VISTA UNIFICADA         │
              │            │ (alimentada por         │
              │            │  inscripcion_actividad) │
              │            └─────────────────────────┘
              │
       INSCRIPCION_CLASE (legacy)
              │
            CLASE (legacy)
```

### Uso por Endpoint del Portal Tutor

| Endpoint                  | Sistema Antiguo         | Sistema 2026              | Usa Vista |
| ------------------------- | ----------------------- | ------------------------- | --------- |
| dashboard-resumen         | ✅ (Clase)              | ❌ NO                     | ❌ NO     |
| calcularMetricasDashboard | ✅ (InscripcionClase)   | ❌ NO                     | ❌ NO     |
| obtenerClasesHoy          | ✅ (Clase)              | ❌ NO                     | ❌ NO     |
| getProximasClases         | ✅ (Clase)              | ✅ (InscripcionActividad) | ❌ NO     |
| obtenerHijos              | N/A                     | N/A                       | N/A       |
| obtenerPagosPendientes    | ✅ (InscripcionMensual) | N/A                       | N/A       |
| alertas                   | ✅ (Clase, Asistencia)  | ❌ NO                     | ❌ NO     |

---

## PROBLEMAS IDENTIFICADOS

### 1. Dashboard no ve clases del sistema 2026

**Ubicación:** `tutor-stats.service.ts:164-175` y `307-360`

```typescript
// ACTUAL (problemático) - Solo ve sistema antiguo
const clasesDelMes = await this.prisma.inscripcionClase.count({...});
const clasesHoy = await this.prisma.clase.findMany({...});
```

**Impacto:**

- El tutor NO VE las clases de hijos inscritos via suscripción familiar 2026
- El conteo de "clases del mes" no incluye ClaseGrupo
- "Clases de hoy" solo muestra el sistema antiguo

**Solución propuesta:**

```typescript
// Agregar consulta a inscripcionActividad similar a getProximasClases
const [clasesAntiguas, clasesNuevas] = await Promise.all([
  // Sistema antiguo
  this.prisma.clase.findMany({...}),
  // Sistema 2026
  this.prisma.inscripcionActividad.findMany({
    where: {
      estudiante_id: { in: estudiantesIdsArray },
      estado: 'ACTIVA',
      suscripcion_familiar: { estado: 'AUTHORIZED' },
    },
    include: { clase_grupo: true },
  }),
]);
```

### 2. getProximasClases no incluye inscripciones manuales

**Ubicación:** `tutor-query.service.ts:241-287`

El query solo busca `inscripcionActividad` (suscripciones), pero NO incluye inscripciones manuales de `inscripcion_clase_grupo` que también deberían aparecer.

**Impacto:**

- Si admin inscribe manualmente a un hijo (beca), el tutor no lo verá

**Solución propuesta:**

```typescript
// Usar vista unificada en lugar de inscripcionActividad directa
const inscripciones = await this.prisma.inscripcionUnificada.findMany({
  where: {
    estudiante_id: { in: estudiantesIdsArray },
    estado: 'ACTIVA',
  },
  include: { claseGrupo: { include: { docente, producto } } },
});
```

### 3. No hay sincronización entre modelos

El portal tutor tiene lógica duplicada:

- Busca en sistema antiguo (Clase)
- Busca en sistema 2026 (InscripcionActividad)
- Combina resultados manualmente

Debería usar la vista unificada o un servicio compartido.

---

## TABLAS REQUERIDAS PARA EL PORTAL TUTOR

### Tablas Críticas

| Tabla                 | Propósito        | Seed requerido     |
| --------------------- | ---------------- | ------------------ |
| `tutores`             | Base del portal  | ✅ Sí              |
| `estudiantes`         | Hijos del tutor  | ✅ Sí              |
| `casas`               | Para XP de hijos | ✅ Sí              |
| `recursos_estudiante` | XP y puntos      | Se crea automático |

### Tablas de Inscripción (Sistema Antiguo - Legacy)

| Tabla                 | Propósito                       |
| --------------------- | ------------------------------- |
| `clases`              | Clases individuales programadas |
| `inscripciones_clase` | Estudiante → Clase              |
| `asistencias`         | Registro de asistencia          |

### Tablas de Inscripción (Sistema 2026)

| Tabla                      | Propósito                                 |
| -------------------------- | ----------------------------------------- |
| `suscripciones_familiares` | Suscripción del tutor                     |
| `inscripciones_actividad`  | Estudiante → ClaseGrupo (via suscripción) |
| `clase_grupo`              | Clases semanales recurrentes              |
| `productos`                | Productos/actividades disponibles         |
| `docentes`                 | Profesores                                |

### Tablas de Pagos

| Tabla                     | Propósito          |
| ------------------------- | ------------------ |
| `inscripciones_mensuales` | Pagos mensuales    |
| `pagos`                   | Historial de pagos |

### Tablas de Notificaciones

| Tabla            | Propósito                |
| ---------------- | ------------------------ |
| `notificaciones` | Notificaciones del tutor |

---

## FLUJO DE INSCRIPCIÓN: ¿Cómo inscribe un tutor a sus hijos?

### Opción 1: Suscripción Familiar 2026 (Recomendada)

```
1. Tutor crea suscripción familiar
   POST /suscripciones/familiar
   ↓
2. Elige productos y horarios (ClaseGrupo)
   { inscripciones: [{ estudianteId, productoId, claseGrupoId }] }
   ↓
3. Sistema crea InscripcionActividad
   → Esto alimenta la VISTA inscripciones_unificadas
   ↓
4. MercadoPago cobra mensualmente
   ↓
5. Estudiante puede acceder a clases en vivo
   (via inscripcionUnificada en portal estudiante)
```

### Opción 2: Inscripción Manual (Admin)

```
1. Admin crea inscripción manual
   → Escribe a inscripciones_clase_grupo
   → Esto también alimenta la VISTA inscripciones_unificadas
   ↓
2. Estudiante puede acceder a clases
```

### Opción 3: Sistema Legacy (Clase individual)

```
1. Admin crea clase y la asigna
   → Escribe a inscripciones_clase
   → NO alimenta la vista unificada
   ↓
2. Solo visible en sistema antiguo
```

---

## COMPARACIÓN CON PORTALES DOCENTE Y ESTUDIANTE

| Aspecto                    | Portal Docente | Portal Estudiante | Portal Tutor              |
| -------------------------- | -------------- | ----------------- | ------------------------- |
| Usa inscripcionUnificada   | ⚠️ Parcial     | ✅ Mayormente     | ❌ No usa                 |
| Usa inscripcionActividad   | ❌ No          | ✅ Sí             | ✅ Solo en proximasClases |
| Usa sistema legacy (Clase) | ⚠️ Parcial     | ❌ Poco           | ✅ Mucho                  |
| Modelo principal           | Comision       | ClaseGrupo        | Dual (Clase + ClaseGrupo) |

---

## RECOMENDACIONES

### Prioridad Alta

1. **Actualizar `obtenerClasesHoy` para incluir sistema 2026**
   - Agregar query a `inscripcionActividad` o usar vista unificada
   - Impacta: tutor no ve clases de hijos con suscripción

2. **Actualizar `calcularMetricasDashboard` para contar ClaseGrupo**
   - El conteo de "clases del mes" está incompleto
   - Impacta: métricas del dashboard incorrectas

### Prioridad Media

3. **Usar vista unificada en `getProximasClases`**
   - Incluiría inscripciones manuales (becas)
   - Código más simple y consistente

4. **Revisar alertas de asistencia**
   - Las asistencias están ligadas al sistema antiguo
   - ClaseGrupo tiene su propio sistema de estado de clase

### Prioridad Baja

5. **Documentar transición sistema antiguo → 2026**
   - Clarificar cuándo usar cada sistema
   - Plan de migración de datos legacy

---

## CONCLUSIÓN

El portal del tutor es el **más desalineado** de los tres portales auditados:

1. **Usa extensivamente el sistema legacy** (Clase + InscripcionClase)
2. **Solo `getProximasClases` consulta el sistema 2026**
3. **No usa la vista `inscripcionUnificada`**

Sin embargo, el **flujo de suscripción familiar está bien implementado**:

- Crea correctamente `InscripcionActividad`
- Esto alimenta la vista unificada
- Los portales de estudiante y docente pueden ver estas inscripciones

### Resumen de Estado

| Componente           | Estado                   |
| -------------------- | ------------------------ |
| Dashboard (métricas) | ❌ Solo sistema legacy   |
| Clases de hoy        | ❌ Solo sistema legacy   |
| Próximas clases      | ⚠️ Dual (pero sin vista) |
| Suscripción familiar | ✅ Correcto              |
| Gestión de hijos     | ✅ Correcto              |
| Notificaciones       | ✅ Correcto              |
| Pagos/Alertas        | ✅ Correcto              |

### Impacto en el Seed

Para que el portal tutor funcione completamente, el seed debe crear:

**Para sistema legacy:**

- `clases` con `fecha_hora_inicio` futuras
- `inscripciones_clase` para los estudiantes

**Para sistema 2026:**

- `suscripciones_familiares` en estado AUTHORIZED
- `inscripciones_actividad` con `clase_grupo_id`
- `clase_grupo` activos

**O simplemente:**

- Usar SOLO el sistema 2026 y actualizar el portal tutor para usar la vista unificada
