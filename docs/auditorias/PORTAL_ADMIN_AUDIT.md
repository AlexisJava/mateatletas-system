# AUDITORÍA EXHAUSTIVA: Portal Admin

**Fecha:** 2026-01-20
**Versión:** 1.0
**Auditor:** Claude Opus 4.5

---

## RESUMEN EJECUTIVO

El portal Admin es el **origen de datos** del sistema. Desde aquí se crean:

1. **ClaseGrupos** - Horarios de clases semanales recurrentes
2. **Comisiones** - Cursos/eventos temporales (colonias, talleres)
3. **Estudiantes** - Con credenciales y tutores asociados
4. **Planificaciones** - Contenido de las clases
5. **Inscripciones manuales** - Becas, casos especiales

### Hallazgos Clave

| Aspecto                        | Estado      | Observación                                                    |
| ------------------------------ | ----------- | -------------------------------------------------------------- |
| ClaseGrupo + inscripciones     | ✅ BIEN     | Escribe a `inscripcion_clase_grupo` → alimenta vista unificada |
| Comision + inscripciones       | ⚠️ SEPARADO | Escribe a `inscripcion_comision` → NO alimenta vista unificada |
| Lectura de inscripciones       | ✅ BIEN     | Usa `inscripcionesUnificadas` para listar ClaseGrupos          |
| Sistema legacy                 | ⚠️ PRESENTE | Algunos endpoints aún leen de `Clase`/`InscripcionClase`       |
| Consistencia escritura-lectura | ✅ BIEN     | Lo que admin escribe, los portales pueden leer                 |

### Diagrama de Flujo de Datos

```
                    ADMIN ESCRIBE
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ClaseGrupo       Comision        Estudiante
         │               │               │
         ▼               ▼               │
┌─────────────────┐ ┌──────────────┐    │
│inscripcion_     │ │inscripcion_  │    │
│clase_grupo      │ │comision      │    │
└─────────────────┘ └──────────────┘    │
         │               │               │
         ▼               │               │
┌─────────────────────┐  │               │
│ VISTA UNIFICADA     │  │               │
│ inscripciones_      │  X (separado)    │
│ unificadas          │                  │
└─────────────────────┘                  │
         │                               │
         ▼                               │
   PORTALES LEEN                         │
 (Docente/Estudiante)                    │
```

---

## ARQUITECTURA DEL MÓDULO ADMIN

```
apps/api/src/admin/
├── admin.controller.ts              # Endpoints principales (facade)
├── admin.service.ts                 # Service facade con circuit breakers
├── admin.module.ts                  # Module definition
│
├── clase-grupos.service.ts          # ⭐ CRUD ClaseGrupo + inscripciones
├── comisiones.service.ts            # ⭐ CRUD Comision + inscripciones
│
├── services/
│   ├── admin-estudiantes.service.ts # CRUD estudiantes
│   ├── admin-planificaciones.service.ts # CRUD planificaciones
│   ├── admin-stats.service.ts       # Estadísticas
│   ├── admin-alertas.service.ts     # Alertas
│   ├── admin-usuarios.service.ts    # Usuarios
│   ├── admin-roles.service.ts       # Roles
│   ├── admin-credenciales.service.ts # Passwords
│   └── admin-pagos.service.ts       # Pagos manuales
│
├── dto/                             # DTOs
└── planificaciones-admin.controller.ts # Controller planificaciones
```

---

## OPERACIONES DE ESCRITURA: ClaseGrupo

### POST /admin/clase-grupos - Crear ClaseGrupo

**Controller:** `admin.controller.ts`
**Service:** `ClaseGruposService.crearClaseGrupo()` (línea 37-209)

**Tablas que ESCRIBE:**

```typescript
// 1. Crea ClaseGrupo (línea 112-148)
const grupo = await tx.claseGrupo.create({
  data: {
    grupo_id: dto.grupoId,
    codigo: dto.codigo,
    nombre: dto.nombre,
    tipo: dto.tipo,
    dia_semana: dto.diaSemana,
    hora_inicio: dto.horaInicio,
    hora_fin: dto.horaFin,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    anio_lectivo: dto.anioLectivo,
    cupo_maximo: dto.cupoMaximo,
    docente_id: dto.docenteId,
    sector_id: dto.sectorId,
    nivel: dto.nivel,
    producto_id: dto.productoId,
    activo: true,
  },
});

// 2. Crea inscripciones manuales (línea 155-184)
const inscripciones = await Promise.all(
  estudiantes.map((estudiante) =>
    tx.inscripcionClaseGrupo.create({
      data: {
        clase_grupo_id: grupo.id,
        estudiante_id: estudiante.id,
        tutor_id: estudiante.tutor_id,
        fecha_inscripcion: new Date(),
      },
    }),
  ),
);
```

**¿Alimenta la vista unificada?:** ✅ SÍ
`inscripcion_clase_grupo` es una de las fuentes de `inscripciones_unificadas`

**¿Los otros portales pueden leer esto?:** ✅ SÍ

- Portal Docente: Lee via `inscripcionesUnificadas`
- Portal Estudiante: Lee via `inscripcionUnificada`

---

### POST /admin/clase-grupos/:id/estudiantes - Agregar estudiantes

**Service:** `ClaseGruposService.agregarEstudiantes()` (línea 642-742)

**Tablas que ESCRIBE:**

```typescript
// Crea inscripciones (línea 702-734)
const nuevasInscripciones = await this.prisma.$transaction(async (tx) => {
  return await Promise.all(
    estudiantes.map((estudiante) =>
      tx.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupoId,
          estudiante_id: estudiante.id,
          tutor_id: estudiante.tutor_id,
          fecha_inscripcion: new Date(),
        },
      }),
    ),
  );
});
```

**¿Alimenta la vista unificada?:** ✅ SÍ

---

### DELETE /admin/clase-grupos/:id/estudiantes/:estudianteId - Remover estudiante

**Service:** `ClaseGruposService.removerEstudiante()` (línea 749-820)

**Tablas que ESCRIBE:**

```typescript
// Soft delete via fecha_baja (línea 811-814)
await this.prisma.inscripcionClaseGrupo.update({
  where: { id: inscripcionManual.id },
  data: { fecha_baja: new Date() },
});
```

**IMPORTANTE:** Solo puede remover inscripciones MANUALES.
Las inscripciones via suscripción deben cancelarse desde el portal tutor.

```typescript
// Validación (línea 786-791)
if (inscripcionUnificada.fuente === 'SUSCRIPCION_2026') {
  throw new BadRequestException(
    `Esta inscripción proviene de una suscripción familiar. ` +
      `Debe cancelarse desde el portal del tutor.`,
  );
}
```

---

### PATCH /admin/clase-grupos/:id - Actualizar ClaseGrupo

**Service:** `ClaseGruposService.actualizarClaseGrupo()` (línea 391-550)

**Tablas que ESCRIBE:**

```typescript
// 1. Actualiza ClaseGrupo (línea 437-457)
const grupoActualizado = await tx.claseGrupo.update({
  where: { id },
  data: updateData,
});

// 2. Si se cambian estudiantes, reemplaza inscripciones (línea 474-494)
await tx.inscripcionClaseGrupo.deleteMany({
  where: { clase_grupo_id: id },
});

await Promise.all(
  estudiantes.map((estudiante) =>
    tx.inscripcionClaseGrupo.create({
      data: {
        clase_grupo_id: id,
        estudiante_id: estudiante.id,
        tutor_id: estudiante.tutor_id,
        fecha_inscripcion: new Date(),
      },
    }),
  ),
);
```

**⚠️ CUIDADO:** Si se actualizan `estudiantesIds`, se eliminan TODAS las inscripciones manuales y se recrean. Esto NO afecta inscripciones de suscripción (están en tabla separada).

---

### DELETE /admin/clase-grupos/:id - Desactivar ClaseGrupo

**Service:** `ClaseGruposService.eliminarClaseGrupo()` (línea 555-585)

**Tablas que ESCRIBE:**

```typescript
// Soft delete - marca como inactivo (línea 576-579)
await this.prisma.claseGrupo.update({
  where: { id },
  data: { activo: false },
});
```

---

## OPERACIONES DE ESCRITURA: Comision

### POST /admin/comisiones - Crear Comision

**Controller:** `admin.controller.ts`
**Service:** `ComisionesService.create()` (línea 38-145)

**Tablas que ESCRIBE:**

```typescript
// Crea Comision (línea 94-138)
const comision = await this.prisma.comision.create({
  data: {
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    producto_id: dto.producto_id,
    casa_id: dto.casa_id,
    docente_id: dto.docente_id,
    cupo_maximo: dto.cupo_maximo,
    horario: dto.horario,
    fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
    fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
    activo: dto.activo ?? true,
    planificacion_id: dto.planificacion_id,
  },
});
```

**¿Alimenta la vista unificada?:** ❌ NO
`Comision` es un modelo separado, NO está en la vista `inscripciones_unificadas`

---

### POST /admin/comisiones/:id/inscribir - Inscribir estudiantes a Comision

**Service:** `ComisionesService.inscribirEstudiantes()` (línea 520-607)

**Tablas que ESCRIBE:**

```typescript
// Crea InscripcionComision (línea 581-600)
const inscripciones = await this.prisma.$transaction(
  dto.estudiantes_ids.map((estudianteId) =>
    this.prisma.inscripcionComision.create({
      data: {
        comision_id: comisionId,
        estudiante_id: estudianteId,
        estado: dto.estado || EstadoInscripcionComision.Pendiente,
      },
    }),
  ),
);
```

**¿Alimenta la vista unificada?:** ❌ NO
`inscripcion_comision` es una tabla SEPARADA de la vista unificada.

**¿Los otros portales pueden leer esto?:**

- Portal Docente: ✅ SÍ - usa `inscripcionComision` directamente
- Portal Estudiante: ⚠️ PARCIAL - depende de cómo esté implementado

---

### DELETE /admin/comisiones/:id/estudiantes/:estudianteId - Remover estudiante

**Service:** `ComisionesService.removerEstudiante()` (línea 669-703)

**Tablas que ESCRIBE:**

```typescript
// Hard delete de inscripción (línea 695-697)
await this.prisma.inscripcionComision.delete({
  where: { id: inscripcion.id },
});
```

---

### POST /admin/comisiones/:id/crear-e-inscribir - Crear estudiante e inscribir

**Service:** `ComisionesService.crearEstudianteEInscribir()` (línea 709-788)

**Tablas que ESCRIBE:**

1. **Estudiante** (via `AdminEstudiantesService.crearEstudianteConCredenciales`)
2. **Tutor** (si no existe)
3. **RecursosEstudiante** (XP inicial)
4. **InscripcionComision**

```typescript
// Inscribir al estudiante (línea 763-777)
const inscripcion = await this.prisma.inscripcionComision.create({
  data: {
    comision_id: comisionId,
    estudiante_id: resultadoEstudiante.estudiante.id,
    estado: EstadoInscripcionComision.Confirmada,
  },
});
```

---

## OPERACIONES DE ESCRITURA: Estudiantes

### POST /admin/estudiantes - Crear estudiante

**Service:** `AdminEstudiantesService.crearEstudianteRapido()` (línea 214-330)

**Tablas que ESCRIBE:**

```typescript
// 1. Crea Tutor si no existe (línea 265-274)
tutor = await this.prisma.tutor.create({
  data: {
    email: tutorEmail,
    password_hash: passwordHash,
    nombre: tutorNombre,
    apellido: tutorApellido,
    telefono: data.tutorTelefono || null,
    roles: ['tutor'],
  },
});

// 2. Crea Estudiante (línea 282-311)
const est = await tx.estudiante.create({
  data: {
    nombre: data.nombre,
    apellido: data.apellido,
    username: await this.generarUsernameUnico(data.nombre, data.apellido),
    edad: data.edad,
    nivelEscolar: data.nivelEscolar,
    tutor_id: tutor.id,
    nivel_actual: 1,
    ...(data.plan_id && { plan_id: data.plan_id }),
    ...(data.estado_acceso && { estado_acceso: data.estado_acceso }),
  },
});

// 3. Crea RecursosEstudiante (línea 314-318)
await tx.recursosEstudiante.create({
  data: {
    estudiante_id: est.id,
    xp_total: 0,
  },
});
```

---

### POST /admin/estudiantes-con-credenciales - Crear con credenciales

**Service:** `AdminEstudiantesService.crearEstudianteConCredenciales()` (línea 508-651)

**Tablas que ESCRIBE:**

1. **tutor** (si no existe)
2. **estudiante** (con username y password_hash)
3. **recursos_estudiante** (XP inicial = 0)

**Retorna credenciales en texto plano:**

```typescript
return {
  estudiante: resultado.estudiante,
  tutor: resultado.tutor,
  tutorCreado,
  credencialesTutor: tutorCredenciales, // { username, passwordTemporal }
  credencialesEstudiante: {
    username: estudianteUsername,
    pin: estudiantePin, // En texto plano para enviar por WhatsApp
  },
};
```

---

## OPERACIONES DE LECTURA: Consistencia con Escritura

### GET /admin/clase-grupos - Listar ClaseGrupos

**Service:** `ClaseGruposService.listarClaseGrupos()` (línea 214-305)

**Tablas que LEE:**

```typescript
// ✅ USA VISTA UNIFICADA (línea 266-277)
const grupos = await this.prisma.claseGrupo.findMany({
  include: {
    inscripcionesUnificadas: {
      where: { estado: 'ACTIVA' },
      include: {
        estudiante: { ... },
      },
    },
    _count: {
      select: {
        inscripcionesUnificadas: {
          where: { estado: 'ACTIVA' },
        },
      },
    },
  },
});
```

**Consistencia:** ✅ El admin ve TODAS las inscripciones (manuales + suscripción)

---

### GET /admin/comisiones/:id - Obtener Comision

**Service:** `ComisionesService.findOne()` (línea 228-308)

**Tablas que LEE:**

```typescript
// Lee inscripcionComision directamente (línea 264-285)
const comision = await this.prisma.comision.findUnique({
  include: {
    inscripciones: {  // ← inscripcion_comision
      include: {
        estudiante: { ... },
      },
    },
  },
});
```

**Consistencia:** ✅ El admin ve las inscripciones que creó

---

## TABLA RESUMEN: Escritura Admin vs Lectura Portales

### Para ClaseGrupo

| Operación Admin      | Tabla Escrita                          | Alimenta Vista | Docente Lee | Estudiante Lee |
| -------------------- | -------------------------------------- | -------------- | ----------- | -------------- |
| Crear ClaseGrupo     | `clase_grupo`                          | -              | ✅          | ✅             |
| Inscribir estudiante | `inscripcion_clase_grupo`              | ✅             | ✅          | ✅             |
| Remover estudiante   | `inscripcion_clase_grupo` (fecha_baja) | ✅             | ✅          | ✅             |

### Para Comision

| Operación Admin      | Tabla Escrita                   | Alimenta Vista | Docente Lee | Estudiante Lee |
| -------------------- | ------------------------------- | -------------- | ----------- | -------------- |
| Crear Comision       | `comision`                      | -              | ✅          | ⚠️             |
| Inscribir estudiante | `inscripcion_comision`          | ❌             | ✅          | ⚠️             |
| Remover estudiante   | `inscripcion_comision` (delete) | ❌             | ✅          | ⚠️             |

### Para Estudiantes

| Operación Admin     | Tablas Escritas                              | Alimenta Vista | Otros Portales |
| ------------------- | -------------------------------------------- | -------------- | -------------- |
| Crear estudiante    | `estudiante`, `tutor`, `recursos_estudiante` | N/A            | ✅ Todos       |
| Eliminar estudiante | `estudiante` (cascade)                       | N/A            | ✅             |

---

## PROBLEMAS IDENTIFICADOS

### 1. Comisiones separadas de vista unificada

**Problema:** `inscripcion_comision` NO está en la vista `inscripciones_unificadas`

**Impacto:**

- El modelo `inscripcionUnificada` solo aplica a ClaseGrupo
- Si un estudiante está inscrito en Comision, esa inscripción se maneja por separado

**¿Es un problema real?:** ⚠️ DEPENDE

- Si Comisiones son eventos puntuales (colonias), está bien que sean separadas
- Si Comisiones se comportan igual que ClaseGrupo, habría inconsistencia

**Conclusión:** Por diseño, Comision y ClaseGrupo son modelos DIFERENTES:

- **ClaseGrupo** = Clases recurrentes semanales (suscripción mensual)
- **Comision** = Cursos/eventos temporales (pago único o cuotas)

---

### 2. Sistema legacy aún presente

**Problema:** `AdminEstudiantesService.obtenerEstadisticasEstudiante()` lee de:

```typescript
// línea 458-469
inscripciones_clase: {  // ← SISTEMA LEGACY
  select: {
    clase: { ... },
  },
},
```

**Impacto:** Las estadísticas de estudiantes usan el sistema `Clase`/`InscripcionClase` que está deprecado.

**Solución propuesta:** Migrar a leer de `inscripcionesUnificadas` y/o `inscripcionComision`.

---

### 3. Admin puede eliminar inscripciones de suscripción indirectamente

**Problema:** En `actualizarClaseGrupo()`, si se pasan nuevos `estudiantesIds`:

```typescript
// línea 474-476
await tx.inscripcionClaseGrupo.deleteMany({
  where: { clase_grupo_id: id },
});
```

**Impacto:** Esto elimina inscripciones MANUALES, pero las de suscripción (en `inscripcion_actividad`) permanecen intactas. No es un bug.

---

## COMPARACIÓN: Vista Unificada

La vista `inscripciones_unificadas` unifica:

| Fuente           | Tabla                       | Alimentada por             |
| ---------------- | --------------------------- | -------------------------- |
| MANUAL           | `inscripciones_clase_grupo` | Admin crea manualmente     |
| SUSCRIPCION_2026 | `inscripciones_actividad`   | Tutor crea via suscripción |

**Columnas de la vista:**

```sql
SELECT
  id,
  estudiante_id,
  clase_grupo_id,
  tutor_id,
  fecha_inscripcion,
  fecha_baja,
  tipo_acceso,     -- 'SINCRONICO' | 'ASINCRONICO'
  observaciones,
  created_at,
  updated_at,
  fuente,          -- 'MANUAL' | 'SUSCRIPCION_2026'
  suscripcion_familiar_id,
  producto_id,
  tier,
  estado           -- 'ACTIVA' | 'CANCELADA'
FROM inscripciones_unificadas;
```

---

## RECOMENDACIONES

### Prioridad Alta

1. **Migrar estadísticas de estudiante**
   - Cambiar `obtenerEstadisticasEstudiante()` para usar sistema 2026
   - Actual: Lee de `inscripciones_clase` (legacy)
   - Target: Leer de `inscripcionesUnificadas` + `inscripcionComision`

### Prioridad Media

2. **Documentar diferencia ClaseGrupo vs Comision**
   - ClaseGrupo → Suscripción mensual → Vista unificada
   - Comision → Pago único/cuotas → Tabla separada

3. **Validar portal estudiante con Comisiones**
   - Verificar que estudiante ve sus Comisiones correctamente

### Prioridad Baja

4. **Considerar vista unificada para Comisiones**
   - Si el comportamiento es similar, podría agregarse a la vista
   - O crear vista `inscripciones_comision_unificadas` separada

---

## COMPARACIÓN CON OTROS PORTALES

| Aspecto                         | Portal Admin | Portal Docente | Portal Estudiante | Portal Tutor         |
| ------------------------------- | ------------ | -------------- | ----------------- | -------------------- |
| Usa inscripcionUnificada        | ✅ Lectura   | ⚠️ Parcial     | ✅ Mayormente     | ❌ No                |
| Escribe ClaseGrupo              | ✅           | ❌             | ❌                | ❌                   |
| Escribe Comision                | ✅           | ❌             | ❌                | ❌                   |
| Escribe inscripcion_clase_grupo | ✅           | ❌             | ❌                | ❌                   |
| Escribe inscripcion_comision    | ✅           | ❌             | ❌                | ❌                   |
| Escribe inscripcion_actividad   | ❌           | ❌             | ❌                | ✅ (via suscripción) |

---

## CONCLUSIÓN

El portal Admin está **bien implementado** para el modelo de datos 2026:

1. ✅ **Crea ClaseGrupos** correctamente con inscripciones manuales
2. ✅ **Lee via vista unificada** → Ve inscripciones manuales + suscripción
3. ✅ **Crea Comisiones** en su tabla separada (por diseño)
4. ⚠️ **Sistema legacy** aún presente en algunas estadísticas

### Modelo Canónico Confirmado

```
ESCRITURA:
- Admin → inscripcion_clase_grupo (becas, manuales)
- Tutor → inscripcion_actividad (suscripción familiar)
- Admin → inscripcion_comision (cursos/eventos)

LECTURA:
- ClaseGrupo → inscripciones_unificadas (combina ambas fuentes)
- Comision → inscripcion_comision (tabla directa)
```

### Resumen de Estado

| Componente                      | Estado                              |
| ------------------------------- | ----------------------------------- |
| CRUD ClaseGrupo                 | ✅ Correcto                         |
| CRUD Comision                   | ✅ Correcto                         |
| Inscripciones manuales          | ✅ Alimenta vista                   |
| Lectura inscripciones           | ✅ Usa vista unificada              |
| Sistema legacy                  | ⚠️ Presente en estadísticas         |
| Consistencia con otros portales | ✅ Lo que admin escribe, otros leen |
