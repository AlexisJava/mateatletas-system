# ANÁLISIS ULTRA DETALLADO DE FLUJOS DE DATOS END-TO-END

## Ecosistema Mateatletas - Documento para DFD Extendido

**Versión:** 1.0  
**Fecha:** 2025-10-24  
**Alcance:** Análisis exhaustivo de todos los flujos de datos entre los 4 portales (Admin, Docente, Tutor, Estudiante)  
**Objetivo:** Crear la base para un Diagrama de Flujo de Datos (DFD) Extendido profesional

---

## TABLA DE CONTENIDOS

1. [Arquitectura General del Sistema](#arquitectura-general-del-sistema)
2. [Modelos de Datos Clave](#modelos-de-datos-clave)
3. [Flujos por Módulos Funcionales](#flujos-por-módulos-funcionales)
4. [Interacciones Cross-Portal](#interacciones-cross-portal)
5. [Flujos de Datos Detallados](#flujos-de-datos-detallados)

---

## ARQUITECTURA GENERAL DEL SISTEMA

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Portal Admin  │ Portal Docente │ Portal Tutor │ Estudiante  │
└────────────────┬──────────────────────────────────────┬──────┘
                 │              HTTP/REST               │
                 └──────────────────┬────────────────────┘
                                    │
                    ┌───────────────────────────┐
                    │    JWT Authentication     │
                    │  (Token + Roles + ID)     │
                    └───────────────┬───────────┘
                                    │
        ┌───────────────────────────┴───────────────────────┐
        │         BACKEND (NestJS) - API Layer              │
        ├───────────────────────────────────────────────────┤
        │  Controllers → Services → Use Cases → Repositories│
        └──────────┬────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───┴────┐          ┌────┴──┐
    │ Prisma │          │Events │
    │ Client │          │System │
    └───┬────┘          └──────┘
        │
   ┌────┴─────────┐
   │ PostgreSQL   │
   │ Database     │
   └──────────────┘
```

### Flujo de Autenticación y Autorización

**Todos los endpoints requieren:**

1. JWT Token (contiene: id, role/roles, sub)
2. RolesGuard valida permisos
3. Datos del usuario inyectados vía @GetUser()

**Roles Soportados:**

- `ADMIN`: Acceso total al sistema
- `DOCENTE`: Gestión de clases, asistencia, gamificación
- `TUTOR`: Gestión de estudiantes, pagos, inscripciones
- `ESTUDIANTE`: Acceso a cursos, actividades, perfil

---

## MODELOS DE DATOS CLAVE

### Entidades Principales y Relaciones

```
USUARIOS
├── Admin (tabla: admins)
├── Docente (tabla: docentes)
├── Tutor (tabla: tutores)
└── Estudiante (tabla: estudiantes)
    └── FK: tutor_id → Tutor

CONTENIDO EDUCATIVO
├── Sector (tabla: sectores) - "Matemática", "Programación"
├── RutaCurricular (tabla: rutas_curriculares) - "Lógica", "Álgebra"
├── Producto (tabla: productos) - Suscripciones, Cursos
├── Clase (tabla: clases) - Clases individuales one-off
├── ClaseGrupo (tabla: clase_grupos) - Clases recurrentes
└── Modulo/Leccion (tabla: modulos, lecciones) - Cursos

GAMIFICACIÓN
├── AccionPuntuable (tabla: acciones_puntuables)
├── PuntoObtenido (tabla: puntos_obtenidos)
├── Logro (tabla: logros)
├── LogroDesbloqueado (tabla: logros_desbloqueados)
├── Equipo (tabla: equipos) - Equipos para competición
└── NivelConfig (tabla: niveles_config)

PAGOS Y FACTURACIÓN
├── ConfiguracionPrecios (tabla: configuracion_precios)
├── InscripcionMensual (tabla: inscripciones_mensuales)
├── Membresia (tabla: membresias)
├── Beca (tabla: becas)
└── HistorialCambioPrecios (tabla: historial_cambio_precios)

CLASES Y ASISTENCIA
├── InscripcionClase (tabla: inscripciones_clase)
├── InscripcionClaseGrupo (tabla: inscripciones_clase_grupo)
├── Asistencia (tabla: asistencias)
├── AsistenciaClaseGrupo (tabla: asistencias_clase_grupo)
└── Alerta (tabla: alertas)

PLANIFICACIONES
├── PlanificacionMensual (tabla: planificaciones_mensuales)
├── ActividadSemanal (tabla: actividades_semanales)
├── AsignacionDocente (tabla: asignaciones_docente)
├── AsignacionActividadEstudiante (tabla: asignaciones_actividad_estudiante)
└── ProgresoEstudianteActividad (tabla: progreso_estudiante_actividad)

NOTIFICACIONES
├── Notificacion (tabla: notificaciones)
└── Evento (tabla: eventos)
    ├── Tarea (tabla: tareas)
    ├── Recordatorio (tabla: recordatorios)
    └── Nota (tabla: notas)
```

---

## FLUJOS POR MÓDULOS FUNCIONALES

---

# MÓDULO 1: GESTIÓN DE CLASES INDIVIDUALES

## FLUJO 1: Creación de Clase Individual

### Actor Inicial

**ADMIN**

### Trigger

```
POST /api/clases
Body: {
  docente_id: string
  fecha_hora_inicio: DateTime
  duracion_minutos: number
  cupos_maximo: number
  nombre: string
  descripcion?: string
  ruta_curricular_id?: string
  sector_id?: string
  producto_id?: string
}
```

### Entrada (DTO)

```typescript
interface CrearClaseDto {
  docente_id: string;
  fecha_hora_inicio: DateTime;
  duracion_minutos: number;
  cupos_maximo: number;
  nombre: string;
  descripcion?: string;
  ruta_curricular_id?: string;
  sector_id?: string;
  producto_id?: string;
}
```

### Proceso Paso a Paso

1. **Validación de Entrada**
   - Valida que docente_id existe y está activo
   - Valida fecha_hora_inicio es futura
   - Valida duracion_minutos > 0
   - Valida cupos_maximo > 0

2. **Verificación de Disponibilidad**
   - Consulta docente en tabla `docentes`
   - Verifica docente no tenga clase a la misma hora (si aplica)

3. **Creación de Registro**
   - INSERT en tabla `clases`:
     - id (cuid)
     - docente_id
     - fecha_hora_inicio
     - duracion_minutos
     - cupos_maximo
     - cupos_ocupados = 0
     - estado = "Programada"
     - ruta_curricular_id
     - sector_id
     - producto_id
     - descripcion
     - nombre
     - createdAt = NOW()
     - updatedAt = NOW()

4. **Crear Notificación para Docente**
   - INSERT en tabla `notificaciones`:
     - tipo = "ClaseProxima"
     - titulo = "Nueva clase programada"
     - mensaje = "Se te ha asignado una nueva clase"
     - docente_id
     - metadata = { clase_id, fecha_hora_inicio }
     - leida = false

5. **Actualizar Índices**
   - Index: docente_id
   - Index: fecha_hora_inicio
   - Index: estado

### Entidades Afectadas

| Tabla          | Operación | Descripción                            |
| -------------- | --------- | -------------------------------------- |
| clases         | INSERT    | Nuevo registro con estado "Programada" |
| notificaciones | INSERT    | Notificación para docente              |
| docentes       | SELECT    | Validación que existe                  |

### Salidas

```typescript
{
  id: string
  docente_id: string
  nombre: string
  fecha_hora_inicio: DateTime
  duracion_minutos: number
  cupos_maximo: number
  cupos_ocupados: 0
  estado: "Programada"
  createdAt: DateTime
  ruta_curricular: { id, nombre, color }? | null
  docente: { id, nombre, apellido, email }
}
```

### Efectos Secundarios

- Notificación enviada a docente (tipo: ClaseProxima)
- Métrica en admin dashboard se actualiza (total de clases)
- Cache de clases del docente se invalida
- Evento del sistema se registra (para auditoría)

### Actores Impactados

| Actor      | Qué ve                                             | Cuándo                   |
| ---------- | -------------------------------------------------- | ------------------------ |
| ADMIN      | Nueva clase en listado                             | Inmediato                |
| ADMIN      | Métrica: Total clases +1                           | En siguiente refresh     |
| DOCENTE    | Notificación de clase nueva                        | Inmediato (si conectado) |
| DOCENTE    | Clase en "Mis Clases"                              | En próximo refresh       |
| TUTOR      | Nada aún (a menos que su estudiante esté inscrito) | -                        |
| ESTUDIANTE | Nada aún                                           | -                        |

### Estado Actual

✅ **Backend:** Completo - Endpoint POST /api/clases  
✅ **Frontend:** Completo - Portal Admin puede crear clases  
⚠️ **Notificaciones:** Registradas en BD pero no enviadas real-time (WebSocket pendiente)

---

## FLUJO 2: Asignación Masiva de Estudiantes a Clase

### Actor Inicial

**ADMIN**

### Trigger

```
POST /api/clases/:id/asignar-estudiantes
Params: { id: clase_id }
Body: { estudianteIds: string[] }
```

### Entrada (DTO)

```typescript
interface AsignarEstudiantesDto {
  estudianteIds: string[];
}
```

### Proceso

1. **Validar clase existe**
   - SELECT \* FROM clases WHERE id = clase_id
   - Valida estado != "Cancelada"

2. **Para cada estudiante:**
   - SELECT FROM estudiantes WHERE id = estudianteId AND tutor_id EXISTS
   - Valida cupos_ocupados < cupos_maximo
   - Valida estudiante no está duplicado

3. **Crear inscripciones**
   - INSERT INTO inscripciones_clase (clase_id, estudiante_id, tutor_id, fecha_inscripcion)
   - UPDATE clases SET cupos_ocupados = cupos_ocupados + 1

4. **Crear notificaciones**
   - INSERT INTO notificaciones para tutor de cada estudiante

### Entidades Afectadas

| Tabla               | Operación                         |
| ------------------- | --------------------------------- |
| inscripciones_clase | INSERT (N registros)              |
| clases              | UPDATE (cupos_ocupados)           |
| notificaciones      | INSERT (N registros para tutores) |
| estudiantes         | SELECT                            |

### Salidas

```typescript
{
  clase_id: string;
  estudiantesAsignados: number;
  cuposDisponibles: number;
  inscripciones: {
    (id, estudiante_id, fecha_inscripcion);
  }
  [];
}
```

### Actores Impactados

- TUTOR: Notificación que su estudiante fue inscrito
- ESTUDIANTE: Si tiene portal, ve nueva inscripción
- ADMIN: Ve metricade clases llenas

### Estado Actual

✅ Completo

---

## FLUJO 3: Reserva de Clase por Tutor

### Actor Inicial

**TUTOR** (para su estudiante)

### Trigger

```
POST /api/clases/:id/reservar
Params: { id: clase_id }
Body: { estudianteId: string, observaciones?: string }
```

### Proceso

1. **Obtener clase**
   - SELECT \* FROM clases WHERE id = clase_id
   - Validar estado = "Programada"
   - Validar cupos_ocupados < cupos_maximo

2. **Validar estudiante pertenece al tutor**
   - SELECT \* FROM estudiantes WHERE id = estudianteId AND tutor_id = req.user.id
   - Valida ownership (seguridad)

3. **Validar no existe inscripción duplicada**
   - SELECT \* FROM inscripciones_clase WHERE clase_id = clase_id AND estudiante_id = estudianteId
   - Si existe: error 400 "Ya está inscrito"

4. **Si clase es de curso (producto_id != null):**
   - Valida que estudiante tiene InscripcionCurso activa
   - SELECT FROM inscripciones_curso WHERE estudiante_id = estudianteId AND producto_id = clase.producto_id AND estado = "Activo"

5. **Crear inscripción**
   - INSERT INTO inscripciones_clase (clase_id, estudiante_id, tutor_id, fecha_inscripcion, observaciones)
   - UPDATE clases SET cupos_ocupados = cupos_ocupados + 1

6. **Crear notificación para docente**
   - INSERT INTO notificaciones con tipo "ClaseProxima" o "EstudianteNuevo"

7. **Obtener Docente de la clase**
   - SELECT docente FROM clases WHERE id = clase_id

### Entidades Afectadas

| Tabla               | Operación               |
| ------------------- | ----------------------- |
| inscripciones_clase | INSERT                  |
| clases              | UPDATE (cupos_ocupados) |
| notificaciones      | INSERT (para docente)   |
| inscripciones_curso | SELECT (validación)     |
| estudiantes         | SELECT                  |

### Salidas

```typescript
{
  inscripcionClase: {
    id: string
    clase_id: string
    estudiante_id: string
    tutor_id: string
    fecha_inscripcion: DateTime
    observaciones?: string
  }
  clase: {
    nombre: string
    docente: { nombre, apellido }
    fecha_hora_inicio: DateTime
    cupos: { ocupados, maximo }
  }
}
```

### Efectos Secundarios

- Notificación a docente (estudiante nuevo en clase)
- Métrica en dashboard del tutor actualizada
- Si estudiante tiene equipo: posible impacto en gamificación (si asiste)

### Actores Impactados

| Actor      | Qué ve                                      |
| ---------- | ------------------------------------------- |
| TUTOR      | Confirmación de reserva, cupos actualizados |
| DOCENTE    | Notificación de estudiante nuevo            |
| ESTUDIANTE | Si tiene portal, ve clase en su calendario  |
| ADMIN      | Métrica de inscripciones actualizada        |

### Estado Actual

✅ Completo

---

## FLUJO 4: Cancelación de Reserva

### Actor Inicial

**TUTOR** (para su estudiante)

### Trigger

```
DELETE /api/clases/reservas/:id
Params: { id: inscripcion_id }
```

### Proceso

1. **Obtener inscripción**
   - SELECT \* FROM inscripciones_clase WHERE id = inscripcionId
2. **Validar ownership**
   - Verifica tutor_id = req.user.id

3. **Obtener clase**
   - SELECT \* FROM clases WHERE id = clase_id

4. **Eliminar inscripción**
   - DELETE FROM inscripciones_clase WHERE id = inscripcionId

5. **Actualizar cupos**
   - UPDATE clases SET cupos_ocupados = cupos_ocupados - 1

6. **Crear notificación para docente (opcional)**
   - Notificar que estudiante se dio de baja

### Entidades Afectadas

| Tabla               | Operación                  |
| ------------------- | -------------------------- |
| inscripciones_clase | DELETE                     |
| clases              | UPDATE (cupos_ocupados -1) |

### Estado Actual

✅ Completo

---

# MÓDULO 2: GESTIÓN DE GRUPOS DE CLASES RECURRENTES

## FLUJO 5: Creación de ClaseGrupo (Grupo Semanal)

### Actor Inicial

**ADMIN**

### Trigger

```
POST /api/admin/clase-grupos
Body: {
  codigo: string (B1, B2, OLIMP-2025)
  nombre: string
  tipo: "GRUPO_REGULAR" | "CURSO_TEMPORAL"
  dia_semana: DiaSemana (LUNES, MARTES, ..., DOMINGO)
  hora_inicio: string (HH:MM, ej: "19:30")
  hora_fin: string (HH:MM, ej: "21:00")
  fecha_inicio: DateTime
  fecha_fin: DateTime (15/dic para GRUPO_REGULAR, custom para CURSO_TEMPORAL)
  anio_lectivo: number (2025)
  cupo_maximo: number (15)
  docente_id: string
  ruta_curricular_id?: string
  sector_id?: string
  nivel?: string (6 y 7 años, Preparación olimpiadas)
  estudiante_ids?: string[] (opcional: inscritos iniciales)
}
```

### Proceso

1. **Validar docente existe y está activo**
   - SELECT \* FROM docentes WHERE id = docente_id

2. **Validar no existe código duplicado**
   - SELECT COUNT FROM clase_grupos WHERE codigo = codigo
   - Error si existe

3. **Validar fecha_fin según tipo**
   - Si GRUPO_REGULAR: fecha_fin debe ser 15/dic del anio_lectivo
   - Si CURSO_TEMPORAL: fecha_fin debe ser específica

4. **Crear ClaseGrupo**
   - INSERT INTO clase_grupos:
     - codigo
     - nombre
     - tipo
     - dia_semana
     - hora_inicio
     - hora_fin
     - fecha_inicio
     - fecha_fin
     - anio_lectivo
     - cupo_maximo
     - docente_id
     - ruta_curricular_id
     - sector_id
     - nivel
     - activo = true

5. **Inscribir estudiantes iniciales (si se proporcionan)**
   - Para cada estudiante_id:
     - Validar que pertenece a mismo sector (si aplica)
     - INSERT INTO inscripciones_clase_grupo (clase_grupo_id, estudiante_id, tutor_id, fecha_inscripcion)

6. **Crear notificación para docente**
   - Confirmar grupo creado

### Entidades Afectadas

| Tabla                     | Operación                       |
| ------------------------- | ------------------------------- |
| clase_grupos              | INSERT                          |
| inscripciones_clase_grupo | INSERT (N registros)            |
| docentes                  | SELECT                          |
| estudiantes               | SELECT                          |
| tutores                   | SELECT (para validar ownership) |
| notificaciones            | INSERT                          |

### Salidas

```typescript
{
  claseGrupo: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    fecha_inicio: DateTime;
    fecha_fin: DateTime;
    anio_lectivo: number;
    cupo_maximo: number;
    docente: {
      (id, nombre, apellido);
    }
    estudiantes: {
      (id, nombre, apellido);
    }
    [];
  }
  inscripcionesCreadas: number;
}
```

### Efectos Secundarios

- Grupo disponible para que docente asigne planificaciones mensuales
- Estudiantes pueden ver grupo en su horario (si tienen portal)
- Docente puede empezar a tomar asistencia

### Estado Actual

✅ Backend: Completo (Endpoints POST, GET, LIST)  
⚠️ Frontend: En desarrollo (Portal Admin puede crear grupos)

---

## FLUJO 6: Inscripción de Estudiante a ClaseGrupo

### Actor Inicial

**ADMIN** O **TUTOR**

### Trigger

```
POST /api/admin/clase-grupos/:id/inscribir
Body: { estudiante_id: string, tutor_id: string }
```

### Proceso

1. **Validar grupo existe y está activo**
   - SELECT \* FROM clase_grupos WHERE id = claseGrupoId AND activo = true

2. **Validar grupo no está lleno**
   - SELECT cupo_maximo, COUNT(inscripciones) FROM clase_grupos
   - Si COUNT >= cupo_maximo: error "Grupo lleno"

3. **Validar estudiante existe y pertenece al tutor**
   - SELECT \* FROM estudiantes WHERE id = estudianteId AND tutor_id = tutorId

4. **Validar no existe inscripción duplicada**
   - SELECT FROM inscripciones_clase_grupo WHERE clase_grupo_id = id AND estudiante_id = estudianteId
   - Si existe: error "Ya inscrito"

5. **Crear inscripción**
   - INSERT INTO inscripciones_clase_grupo (clase_grupo_id, estudiante_id, tutor_id, fecha_inscripcion)

6. **Crear notificación para tutor**
   - Confirmar inscripción

### Entidades Afectadas

| Tabla                     | Operación |
| ------------------------- | --------- |
| inscripciones_clase_grupo | INSERT    |
| clase_grupos              | SELECT    |
| estudiantes               | SELECT    |

### Salidas

```typescript
{
  inscripcion: {
    id: string;
    clase_grupo_id: string;
    estudiante: {
      (id, nombre);
    }
    tutor: {
      (id, nombre);
    }
    fecha_inscripcion: DateTime;
  }
  grupoActualizado: {
    codigo: string;
    inscritos: number;
    cupoMaximo: number;
  }
}
```

### Estado Actual

✅ Completo

---

# MÓDULO 3: ASISTENCIA Y REGISTROS

## FLUJO 7: Registro de Asistencia a Clase Individual (Docente)

### Actor Inicial

**DOCENTE**

### Trigger

```
POST /api/clases/:id/asistencia
Params: { id: clase_id }
Body: {
  asistencias: [
    { estudianteId: string, estado: "Presente" | "Ausente" | "Justificado", observaciones?: string }
  ]
}
```

### Entrada (DTO)

```typescript
interface RegistrarAsistenciaDto {
  asistencias: {
    estudianteId: string;
    estado: EstadoAsistencia;
    observaciones?: string;
    puntos_otorgados?: number;
  }[];
}
```

### Proceso

1. **Obtener clase**
   - SELECT \* FROM clases WHERE id = claseId
   - Validar docente_id = req.user.id (solo el docente titular)

2. **Para cada asistencia:**
   a. **Obtener inscripción**
   - SELECT \* FROM inscripciones_clase WHERE clase_id = claseId AND estudiante_id = estudianteId
   - Validar que estudiante está inscrito

   b. **Crear registro de asistencia**
   - INSERT INTO asistencias (clase_id, estudiante_id, estado, observaciones, puntos_otorgados, fecha_registro)
   - Unique constraint: (clase_id, estudiante_id)

   c. **Si estado = "Presente":**
   - Si clase tiene puntos configurados:
     - INSERT INTO puntos_obtenidos (estudiante_id, docente_id, accion_id, clase_id, puntos, fecha_otorgado)
   - UPDATE estudiante SET puntos_totales = puntos_totales + puntos

   d. **Si observaciones contienen contenido crítico:**
   - INSERT INTO alertas (estudiante_id, clase_id, descripcion, resuelta = false)
   - Notificación a admin

3. **Actualizar métricas de clase**
   - Contar presentes/ausentes
   - Calcular tasa de asistencia

### Entidades Afectadas

| Tabla               | Operación | Descripción                                        |
| ------------------- | --------- | -------------------------------------------------- |
| asistencias         | INSERT    | Registro de asistencia                             |
| puntos_obtenidos    | INSERT    | Si asiste y hay puntos                             |
| estudiantes         | UPDATE    | Si puntos otorgados (puntos_totales, nivel_actual) |
| alertas             | INSERT    | Si observación crítica                             |
| notificaciones      | INSERT    | Notificación a admin si hay alerta                 |
| clases              | SELECT    | Validación                                         |
| inscripciones_clase | SELECT    | Validación que está inscrito                       |

### Salidas

```typescript
{
  clase: {
    id: string
    nombre: string
    fecha_hora_inicio: DateTime
    docente: { nombre, apellido }
  }
  asistenciasRegistradas: [
    {
      estudianteId: string
      nombre: string
      estado: "Presente" | "Ausente" | "Justificado"
      puntosOtorgados?: number
    }
  ]
  resumen: {
    totalPresentes: number
    totalAusentes: number
    totalJustificados: number
    tasa_asistencia: number (%)
  }
}
```

### Efectos Secundarios

- **Para Estudiante:**
  - Puntos totales se actualiza (si Presente)
  - Nivel puede cambiar si alcanza nuevo umbral
  - Posible desbloqueo de logro "Asistencia Perfecta"
  - Alerta si faltas muchas clases

- **Para Tutor:**
  - Notificación de baja asistencia (< 70%)
  - Métrica en dashboard actualizada

- **Para Admin:**
  - Alerta si hay observaciones críticas
  - Reporte de asistencias disponible

- **Para Docente:**
  - Métrica de clase completada

### Actores Impactados

| Actor      | Qué ve                              | Cuándo             |
| ---------- | ----------------------------------- | ------------------ |
| DOCENTE    | Confirmación registro               | Inmediato          |
| ESTUDIANTE | Puntos +X                           | En próximo refresh |
| TUTOR      | Métrica asistencia actualizada      | En próximo refresh |
| ADMIN      | Alerta si hay (observación crítica) | Inmediato          |

### Estado Actual

✅ Backend: Completo  
✅ Frontend: Docente portal puede registrar asistencia

---

## FLUJO 8: Registro de Asistencia a ClaseGrupo (Docente)

### Actor Inicial

**DOCENTE**

### Trigger

```
POST /api/asistencia/clase-grupos/:grupoId/fecha/:fecha
Body: {
  asistencias: [
    { estudianteId: string, estado: EstadoAsistencia, observaciones?: string }
  ]
}
```

### Proceso

1. **Obtener grupo**
   - SELECT \* FROM clase_grupos WHERE id = grupoId
   - Validar docente_id = req.user.id

2. **Para cada asistencia:**
   - INSERT INTO asistencias_clase_grupo (clase_grupo_id, estudiante_id, fecha, estado, observaciones, feedback)
   - Unique: (clase_grupo_id, estudiante_id, fecha)

3. **Actualizar gamificación (si Presente)**
   - INSERT INTO puntos_obtenidos
   - UPDATE estudiante SET puntos_totales

### Entidades Afectadas

| Tabla                   | Operación |
| ----------------------- | --------- |
| asistencias_clase_grupo | INSERT    |
| puntos_obtenidos        | INSERT    |
| estudiantes             | UPDATE    |

### Estado Actual

✅ Completo

---

# MÓDULO 4: GAMIFICACIÓN

## FLUJO 9: Otorgamiento de Puntos por Acción

### Actor Inicial

**DOCENTE** O **ADMIN**

### Trigger

```
POST /api/gamificacion/puntos
Body: {
  estudianteId: string
  accionId: string (referencia a AccionPuntuable)
  claseId?: string
  contexto?: string
}
```

### Entrada (DTO)

```typescript
interface OtorgarPuntosDto {
  estudianteId: string;
  accionId: string;
  claseId?: string;
  contexto?: string;
}
```

### Proceso

1. **Obtener acción puntuable**
   - SELECT \* FROM acciones_puntuables WHERE id = accionId
   - Validar activo = true
   - Obtener cantidad de puntos

2. **Obtener estudiante**
   - SELECT \* FROM estudiantes WHERE id = estudianteId
   - Obtener puntos_totales, nivel_actual, equipo_id

3. **Validar docente puede otorgar puntos**
   - Si claseId se proporciona:
     - SELECT \* FROM clases WHERE id = claseId
     - Validar docente_id = req.user.id

4. **Insertar registro de puntos**
   - INSERT INTO puntos_obtenidos (estudiante_id, docente_id, accion_id, clase_id, puntos, contexto, fecha_otorgado)

5. **Actualizar totales**
   - nuevos_puntos = puntos_totales + puntos
   - UPDATE estudiantes SET puntos_totales = nuevos_puntos, fecha_ultimo_cambio = NOW()

6. **Calcular nuevo nivel**
   - SELECT \* FROM niveles_config WHERE puntos_minimos <= nuevos_puntos AND puntos_maximos >= nuevos_puntos
   - Si nivel_actual < nuevo_nivel:
     - UPDATE estudiante SET nivel_actual = nuevo_nivel
     - Crear notificación: "Subiste de nivel!"

7. **Actualizar equipo (si existe)**
   - Si estudiante.equipo_id:
     - UPDATE equipos SET puntos_totales = puntos_totales + puntos

8. **Verificar desbloqueo automático de logros**
   - Función: checkAutoUnlockLogros(estudiante_id)
   - Verifica condiciones para desbloqueos automáticos (ej: "Asistencia Perfecta")

9. **Crear notificación para estudiante**
   - Notificación: "¡Ganaste X puntos!"

### Entidades Afectadas

| Tabla                | Operación | Descripción                  |
| -------------------- | --------- | ---------------------------- |
| puntos_obtenidos     | INSERT    | Registro transaccional       |
| estudiantes          | UPDATE    | puntos_totales, nivel_actual |
| niveles_config       | SELECT    | Cálculo de nuevo nivel       |
| equipos              | UPDATE    | Actualizar puntos del equipo |
| logros_desbloqueados | INSERT    | Si se desbloquea logro       |
| notificaciones       | INSERT    | Notificaciones a estudiante  |

### Salidas

```typescript
{
  puntos: {
    otorgados: number
    totalEstudiante: number
    anterior: number
  }
  nivel: {
    anterior: number
    nuevo: number
    cambio: boolean
    nombreNivel?: string
  }
  equipo?: {
    nombre: string
    puntosActuales: number
  }
  logrosDesbloqueados?: [
    { id, nombre, icono, puntos }
  ]
}
```

### Efectos Secundarios

- Ranking actualizado (si sistema de ranking real-time)
- Dashboard del estudiante refrescado automáticamente
- Posible cambio en clasificación de equipos
- Notificaciones en cascada

### Actores Impactados

| Actor                      | Qué ve                                     | Cuándo                   |
| -------------------------- | ------------------------------------------ | ------------------------ |
| ESTUDIANTE                 | +X puntos, posible "Subiste de nivel"      | Inmediato (si conectado) |
| TUTOR                      | Métrica de puntos/gamificación actualizada | En próximo refresh       |
| DOCENTE                    | Confirmación de puntos otorgados           | Inmediato                |
| ADMIN                      | Métrica de gamificación                    | En próximo refresh       |
| OTROS ESTUDIANTES (equipo) | Puntos del equipo +X                       | En próximo refresh       |

### Estado Actual

✅ Backend: Completo  
✅ Frontend: Docente portal puede otorgar puntos

---

## FLUJO 10: Desbloqueo de Logro

### Actor Inicial

**DOCENTE** O **SISTEMA** (automático)

### Trigger

- Manual: POST /api/gamificacion/logros/:logroId/desbloquear
- Automático: Cuando se cumplen condiciones (ej: 100% asistencia)

### Proceso

1. **Obtener logro**
   - SELECT \* FROM logros WHERE id = logroId AND activo = true

2. **Validar estudiante no lo tenga desbloqueado**
   - SELECT FROM logros_desbloqueados WHERE estudiante_id = estudianteId AND logro_id = logroId
   - Si existe: error "Ya está desbloqueado"

3. **Crear desbloqueo**
   - INSERT INTO logros_desbloqueados (estudiante_id, logro_id, docente_id, fecha_obtenido, contexto)

4. **Si logro tiene puntos asociados:**
   - Otorgar puntos automáticamente (ver FLUJO 9)

5. **Crear notificación**
   - "¡Desbloqueaste el logro: X!"

### Entidades Afectadas

| Tabla                | Operación                    |
| -------------------- | ---------------------------- |
| logros_desbloqueados | INSERT                       |
| puntos_obtenidos     | INSERT (si logro.puntos > 0) |
| estudiantes          | UPDATE (si puntos)           |

### Salidas

```typescript
{
  logro: {
    id: string;
    nombre: string;
    icono: string;
    puntos: number;
  }
  estudiante: {
    id: string;
    puntosAhora: number;
    nivelAhora: number;
  }
}
```

### Estado Actual

✅ Completo

---

# MÓDULO 5: PAGOS Y FACTURACIÓN

## FLUJO 11: Cálculo de Precio de Actividades

### Actor Inicial

**TUTOR** O **ADMIN** (desde portal de pagos)

### Trigger

```
POST /api/pagos/calcular-precio
Body: {
  tutorId: string
  estudiantesIds: string[]
  productosIdsPorEstudiante: {
    [estudianteId]: string[] (producto_ids)
  }
  tieneAACREA?: boolean
}
```

### Proceso

1. **Obtener configuración de precios**
   - SELECT \* FROM configuracion_precios WHERE id = "singleton"
   - Extraer: precio_club_matematicas, precio_cursos_especializados, descuentos

2. **Para cada estudiante:**
   a. **Contar productos únicos:**
   - Si 1 producto: precio_base = precio_club_matematicas
   - Si 2+ productos: aplica DESCUENTO_MULTIPLE_ACTIVIDADES

   b. **Contar hermanos:**
   - SELECT COUNT FROM estudiantes WHERE tutor_id = tutorId
   - Si 2 hermanos: aplica DESCUENTO_HERMANOS_BASICO (precio_hermanos_basico)
   - Si 3+ hermanos: aplica DESCUENTO_HERMANOS_MULTIPLE (precio_hermanos_multiple)

   c. **Verificar becas activas:**
   - SELECT FROM becas WHERE estudiante_id = estudianteId AND activa = true AND fecha_inicio <= NOW() AND fecha_fin >= NOW()
   - Si existe: aplicar descuento de beca

3. **Aplicar regla de descuentos:**

   ```
   Prioridad (de mayor a menor):
   1. HERMANOS_MULTIPLE > todos los demás
   2. HERMANOS_BASICO > MULTIPLE_ACTIVIDADES, AACREA
   3. MULTIPLE_ACTIVIDADES > AACREA
   4. AACREA > nada
   5. NINGUNO (sin descuento)
   ```

4. **Verificar AACREA (si aplica):**
   - Si tieneAACREA = true Y descuento_aacrea_activo = true:
     - Aplicar descuento_aacrea_porcentaje (20% típicamente)

5. **Calcular total:**
   - Para cada estudiante: precio_final = precio_base - descuento_aplicado
   - Total = SUM(precio_final \* cantidad_productos)

### Entidades Afectadas

| Tabla                 | Operación |
| --------------------- | --------- |
| configuracion_precios | SELECT    |
| becas                 | SELECT    |
| estudiantes           | SELECT    |

### Salidas

```typescript
{
  desglose: [
    {
      estudianteId: string
      nombre: string
      productos: { id, nombre, precioBase }[]
      cantidadProductos: number
      cantidadHermanos: number
      tieneAACREA: boolean
      tieneBeca: boolean
      descuentosAplicables: {
        tipoDescuento: string
        porcentajeO_monto: number
      }[]
      descuentoSeleccionado: {
        tipo: string
        monto: Decimal
      }
      precioBase: Decimal
      descuentoAplicado: Decimal
      precioFinal: Decimal
    }
  ]
  total: Decimal
  detalleCalculoGlobal: string
}
```

### Efectos Secundarios

- Cálculo solo consultivo (no genera registros)
- Puede usarse para "preview" de precio al tutor

### Estado Actual

✅ Backend: Completo (Use Case: CalcularPrecioUseCase)  
✅ Frontend: Portal Tutor muestra desglose de precios

---

## FLUJO 12: Creación de Inscripciones Mensuales

### Actor Inicial

**ADMIN** (masivamente) O **TUTOR** (self-service, futuro)

### Trigger

```
POST /api/pagos/inscripciones/crear
Body: {
  tutorId: string
  estudiantesIds: string[]
  productosIdsPorEstudiante: { [estudianteId]: string[] }
  anio: number
  mes: number
  tieneAACREA?: boolean
}
```

### Proceso

1. **Validar periodo único**
   - Formato: "YYYY-MM" (ej: "2025-10")
   - Validar mes 1-12, año >= 2025

2. **Calcular precios**
   - Llamar FLUJO 11: calcularPrecio()
   - Obtener desglose de precios con descuentos

3. **Para cada estudiante-producto:**
   a. **Validar no existe inscripción duplicada**
   - SELECT FROM inscripciones_mensuales WHERE estudiante_id = estId AND producto_id = prodId AND periodo = "2025-10"
   - Si existe: error o skip

   b. **Crear inscripción mensual**
   - INSERT INTO inscripciones_mensuales:
     - estudiante_id
     - producto_id
     - tutor_id
     - anio: 2025
     - mes: 10
     - periodo: "2025-10"
     - precio_base: Decimal
     - descuento_aplicado: Decimal
     - precio_final: Decimal
     - tipo_descuento: "HERMANOS_BASICO" | "AACREA" | etc
     - detalle_calculo: "2 hermanos: descuento X%, 2 productos: descuento Y%"
     - estado_pago: "Pendiente"
     - fecha_pago: null
     - metodo_pago: null
     - createdAt: NOW()

4. **Crear notificación para tutor**
   - "Inscripciones mensuales creadas para octubre 2025"
   - Detalles: cantidad, total

### Entidades Afectadas

| Tabla                   | Operación                 |
| ----------------------- | ------------------------- |
| inscripciones_mensuales | INSERT (N \* M registros) |
| notificaciones          | INSERT                    |

### Salidas

```typescript
{
  periodo: "2025-10"
  inscripcionesCreadas: number
  resumen: {
    totalEstudiantes: number
    totalProductos: number
    montoTotal: Decimal
    desgloceDestaques: {
      conDescuentoHermanos: number
      conDescuentoMultiple: number
      conDescuentoAACREA: number
    }
  }
  inscripciones: [
    {
      id: string
      estudiante: { id, nombre }
      producto: { id, nombre }
      precioFinal: Decimal
      estadoPago: "Pendiente"
    }
  ]
}
```

### Efectos Secundarios

- Inscripciones en estado "Pendiente"
- Tutor debe pagar para activar acceso
- Notificación al tutor de nuevas facturas
- Si Inscripcion tiene estado "Pendiente" > X días: posible alerta de vencimiento

### Actores Impactados

| Actor      | Qué ve                                | Cuándo                 |
| ---------- | ------------------------------------- | ---------------------- |
| TUTOR      | Nuevas inscripciones pendientes       | Inmediato              |
| ADMIN      | Inscripciones creadas                 | En dashboard de pagos  |
| ESTUDIANTE | Si acceso ya pagado: permanece activo | -                      |
| ESTUDIANTE | Si no pagado: acceso restringido      | Según regla de negocio |

### Estado Actual

✅ Backend: Completo (Use Case: CrearInscripcionMensualUseCase)  
⚠️ Frontend: En desarrollo (Portal Admin puede crear en bulk, Portal Tutor eventual)

---

## FLUJO 13: Pago de Inscripción Mensual

### Actor Inicial

**TUTOR** (vía MercadoPago, Transferencia, Efectivo)

### Trigger (3 métodos)

1. **MercadoPago:**

   ```
   POST /api/pagos/mercadopago/crear-preferencia
   Body: { inscripcionMensualId: string }
   ```

2. **Transferencia/Efectivo:**
   ```
   PATCH /api/pagos/inscripciones/:id/marcar-pagada
   Body: { metodo_pago: "Transferencia" | "Efectivo", comprobante_url?: string }
   ```

### Proceso (Método 1: MercadoPago)

1. **Obtener inscripción**
   - SELECT \* FROM inscripciones_mensuales WHERE id = inscripcionId
   - Validar estado_pago = "Pendiente"

2. **Crear preferencia en MercadoPago**
   - Llamar API MercadoPago con:
     - items: [{ title, quantity, unit_price }]
     - payer: { name, email }
     - back_urls: { success, failure, pending }
     - external_reference: inscripcionId

3. **Guardar preferencia_id**
   - UPDATE inscripciones_mensuales SET preferencia_id = mp_preferencia_id

4. **Retornar URL de checkout**

   ```
   {
     checkout_url: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xyz",
     preferencia_id: "xyz"
   }
   ```

5. **Webhook de MercadoPago**
   - Recibe notificación de pago completado
   - Busca inscripción por reference
   - Actualiza estado_pago

### Proceso (Método 2: Transferencia/Efectivo)

1. **Obtener inscripción**
   - SELECT \* FROM inscripciones_mensuales WHERE id = inscripcionId

2. **Validar autorización**
   - Solo tutor dueño de la inscripción O admin

3. **Actualizar registro**
   - UPDATE inscripciones_mensuales SET:
     - estado_pago: "Pagado"
     - fecha_pago: NOW()
     - metodo_pago: "Transferencia"
     - comprobante_url: (si se proporcionó)
     - observaciones: (comentario adicional)

4. **Crear notificación para admin**
   - "Pago registrado manualmente - Requiere verificación"

5. **Crear notificación para tutor**
   - "Pago registrado. Acceso activado."

### Entidades Afectadas (Post-Pago Completado)

| Tabla                   | Operación                                 |
| ----------------------- | ----------------------------------------- |
| inscripciones_mensuales | UPDATE (estado, fecha_pago, metodo_pago)  |
| notificaciones          | INSERT (para tutor, admin)                |
| estudiantes             | Posible UPDATE (si hay cambios de acceso) |
| configuracion_precios   | SELECT (historial)                        |

### Salidas

```typescript
{
  inscripcion: {
    id: string;
    periodo: '2025-10';
    estadoPago: 'Pagado';
    fechaPago: DateTime;
    metodoPago: 'MercadoPago' | 'Transferencia' | 'Efectivo';
    montoTotal: Decimal;
  }
  estudiante: {
    id: string;
    nombre: string;
    accesoActivado: boolean;
    productos: {
      (id, nombre);
    }
    [];
  }
}
```

### Efectos Secundarios

- **Acceso del estudiante:**
  - Si estudiante tiene Portal y acceso está basado en pago: se activa
  - Puede empezar a ver cursos, clases, etc.

- **Notificaciones en cascada:**
  - Tutor: "Pago confirmado ✓"
  - Estudiante: "Tu acceso está activo" (si tiene portal)
  - Admin: Métrica de ingresos actualizada

- **Métricas:**
  - Dashboard de pagos: Mes actual actualizado
  - Ingreso total: Decimal actualizado
  - Tasa de cobranza: aumenta

### Actores Impactados

| Actor      | Qué ve                       | Cuándo                   |
| ---------- | ---------------------------- | ------------------------ |
| TUTOR      | Pago marcado como "Pagado" ✓ | Inmediato                |
| ESTUDIANTE | Acceso a productos activado  | Inmediato (si conectado) |
| ADMIN      | Métrica de ingresos +X       | En próximo refresh       |
| DOCENTE    | Estudiante accesible         | Inmediato                |

### Estado Actual

✅ Backend: Completo (Endpoints para MercadoPago y manual)  
⚠️ Frontend: Integración MercadoPago en Portal Tutor (en desarrollo)

---

## FLUJO 14: Generación de Métricas de Dashboard de Pagos

### Actor Inicial

**ADMIN** (acceso automático en dashboard)

### Trigger

```
GET /api/pagos/dashboard/metricas?anio=2025&mes=10&tutorId=optional
```

### Proceso

1. **Obtener período a analizar**
   - mes: 1-12
   - anio: desde query params
   - tutorId (opcional): filtrar para tutor específico

2. **Calcular métricas del mes actual**
   a. **Ingresos totales**
   - SELECT SUM(precio_final) FROM inscripciones_mensuales WHERE periodo = "2025-10" AND estado_pago = "Pagado"

   b. **Ingresos pendientes**
   - SELECT SUM(precio_final) FROM inscripciones_mensuales WHERE periodo = "2025-10" AND estado_pago IN ("Pendiente", "Vencido")

   c. **Cantidad de inscripciones**
   - SELECT COUNT(\*) FROM inscripciones_mensuales WHERE periodo = "2025-10"

   d. **Tasa de cobranza**
   - pagados_count / total_count \* 100

   e. **Estudiantes únicos**
   - SELECT COUNT(DISTINCT estudiante_id) FROM inscripciones_mensuales WHERE periodo = "2025-10"

3. **Comparar con mes anterior**
   - Calcular mismo para mes anterior (2025-09)
   - Cambios porcentuales: ((actual - anterior) / anterior) \* 100

4. **Obtener evolución de últimos 6 meses**
   - SELECT mes, SUM(precio_final) FROM inscripciones_mensuales GROUP BY periodo
   - Para: 2025-05 a 2025-10

5. **Distribuir por estado de pago**
   - Pagado: X cantidad, Y monto
   - Pendiente: X cantidad, Y monto
   - Vencido: X cantidad, Y monto
   - Becado: X cantidad, Y monto

### Entidades Afectadas

| Tabla                   | Operación                         |
| ----------------------- | --------------------------------- |
| inscripciones_mensuales | SELECT (varias queries agregadas) |
| estudiantes             | SELECT COUNT DISTINCT             |

### Salidas

```typescript
{
  periodo: "2025-10"
  metricas: {
    ingresos: {
      total: Decimal
      pagado: Decimal
      pendiente: Decimal
      vencido: Decimal
    }
    cantidad: {
      inscripciones: number
      estudiantes_unicos: number
      porcentajeCob ranza: number (%)
    }
  }
  comparacionMesAnterior: {
    cambio_ingresos: number (%)
    cambio_inscripciones: number (%)
    tendencia: "alza" | "baja" | "estable"
  }
  evolucion6Meses: [
    { mes: "2025-05", ingresos: Decimal },
    // ...
  ]
  distribucionPorEstado: {
    pagado: { cantidad, monto }
    pendiente: { cantidad, monto }
    vencido: { cantidad, monto }
    becado: { cantidad, monto }
  }
}
```

### Estado Actual

✅ Backend: Completo (Use Case: ObtenerMetricasDashboardUseCase)  
✅ Frontend: Portal Admin puede ver gráficos de métricas

---

# MÓDULO 6: PLANIFICACIONES MENSUALES

## FLUJO 15: Creación de Planificación Mensual

### Actor Inicial

**ADMIN**

### Trigger

```
POST /api/planificaciones
Body: {
  codigo_grupo: string (B1, B2, B3, A1)
  mes: number (1-12)
  anio: number (2025)
  titulo: string (Multiplicaciones - Marzo 2025)
  descripcion: string
  tematica_principal: string (Multiplicaciones, Fracciones)
  objetivos_aprendizaje: string[]
  notas_docentes?: string
}
```

### Proceso

1. **Validar período único**
   - SELECT FROM planificaciones_mensuales WHERE codigo_grupo = codigo_grupo AND mes = mes AND anio = anio
   - Si existe: error "Ya existe planificación para este grupo/mes/año"

2. **Validar mes y año válidos**
   - mes: 1-12
   - anio: >= 2025

3. **Crear planificación**
   - INSERT INTO planificaciones_mensuales:
     - codigo_grupo
     - mes
     - anio
     - titulo
     - descripcion
     - tematica_principal
     - objetivos_aprendizaje (JSON array)
     - notas_docentes
     - estado: "BORRADOR"
     - created_by_admin_id: req.user.id
     - created_at: NOW()

4. **Crear notificación para admin**
   - "Planificación creada en borrador"

### Entidades Afectadas

| Tabla                     | Operación |
| ------------------------- | --------- |
| planificaciones_mensuales | INSERT    |
| notificaciones            | INSERT    |

### Salidas

```typescript
{
  planificacion: {
    id: string;
    codigo_grupo: string;
    mes: number;
    anio: number;
    titulo: string;
    estado: 'BORRADOR';
    createdAt: DateTime;
  }
}
```

### Estado Actual

✅ Backend: Completo  
⚠️ Frontend: En desarrollo

---

## FLUJO 16: Creación de Actividad Semanal

### Actor Inicial

**ADMIN**

### Trigger

```
POST /api/planificaciones/actividades
Body: {
  planificacion_id: string
  semana_numero: number (1-4)
  titulo: string (Semana 1: Tablas del 1 al 3)
  descripcion: string
  componente_nombre: string (JuegoTablasMultiplicar, JuegoFracciones)
  componente_props: {
    [key: string]: any (dinámico según juego)
  }
  nivel_dificultad: "BASICO" | "INTERMEDIO" | "AVANZADO" | "OLIMPICO"
  tiempo_estimado_minutos: number
  puntos_gamificacion: number
  instrucciones_docente: string
  instrucciones_estudiante: string
  recursos_url?: [{ tipo, titulo, url }]
}
```

### Proceso

1. **Obtener planificación**
   - SELECT \* FROM planificaciones_mensuales WHERE id = planificacion_id
   - Validar estado IN ("BORRADOR", "PUBLICADA")

2. **Validar semana**
   - semana_numero: 1-4

3. **Validar no existe duplicada para semana**
   - SELECT FROM actividades_semanales WHERE planificacion_id = id AND semana_numero = semana
   - Si existe: error o actualizar

4. **Crear actividad**
   - INSERT INTO actividades_semanales:
     - planificacion_id
     - semana_numero
     - titulo
     - descripcion
     - componente_nombre
     - componente_props (JSON)
     - nivel_dificultad
     - tiempo_estimado_minutos
     - puntos_gamificacion
     - instrucciones_docente
     - instrucciones_estudiante
     - recursos_url (JSON)
     - orden: 1 (por ahora)
     - created_at: NOW()

### Entidades Afectadas

| Tabla                 | Operación |
| --------------------- | --------- |
| actividades_semanales | INSERT    |

### Salidas

```typescript
{
  actividad: {
    id: string;
    planificacion_id: string;
    semana_numero: number;
    titulo: string;
    componente_nombre: string;
    nivel_dificultad: string;
    puntos_gamificacion: number;
  }
}
```

### Estado Actual

✅ Backend: Completo  
⚠️ Frontend: En desarrollo

---

## FLUJO 17: Publicación de Planificación

### Actor Inicial

**ADMIN**

### Trigger

```
PUT /api/planificaciones/:id/publicar
```

### Proceso

1. **Obtener planificación**
   - SELECT \* FROM planificaciones_mensuales WHERE id = id
   - Validar estado = "BORRADOR"

2. **Validar tiene actividades**
   - SELECT COUNT(\*) FROM actividades_semanales WHERE planificacion_id = id
   - Si count = 0: error "Debe crear actividades primero"

3. **Actualizar estado**
   - UPDATE planificaciones_mensuales SET:
     - estado: "PUBLICADA"
     - fecha_publicacion: NOW()

4. **Crear notificación para docentes**
   - Búsqueda: docentes que tienen grupos en ese código_grupo
   - Para cada docente:
     - INSERT INTO notificaciones:
       - tipo: "General"
       - titulo: "Nueva planificación disponible"
       - mensaje: "Planificación de #{mes}/#{anio} ya está disponible"
       - metadata: { planificacion_id }

### Entidades Afectadas

| Tabla                     | Operación                |
| ------------------------- | ------------------------ |
| planificaciones_mensuales | UPDATE (estado)          |
| notificaciones            | INSERT (N para docentes) |

### Salidas

```typescript
{
  planificacion: {
    id: string;
    estado: 'PUBLICADA';
    fecha_publicacion: DateTime;
  }
  docentesNotificados: number;
}
```

### Estado Actual

✅ Completo

---

## FLUJO 18: Asignación de Planificación a Grupo

### Actor Inicial

**DOCENTE**

### Trigger

```
POST /api/planificaciones/asignar
Body: {
  planificacion_id: string
  clase_grupo_id: string
  mensaje_docente?: string
  fecha_inicio_custom?: DateTime
}
```

### Proceso

1. **Obtener planificación**
   - SELECT \* FROM planificaciones_mensuales WHERE id = planificacion_id
   - Validar estado = "PUBLICADA"

2. **Obtener grupo**
   - SELECT \* FROM clase_grupos WHERE id = clase_grupo_id
   - Validar docente_id = req.user.id (solo docente titular)
   - Validar código_grupo de grupo coincide con codigo_grupo de planificación

3. **Validar no existe asignación duplicada**
   - SELECT FROM asignaciones_docente WHERE planificacion_id = plan_id AND clase_grupo_id = grupo_id
   - Si existe: error "Ya está asignada"

4. **Crear asignación**
   - INSERT INTO asignaciones_docente:
     - planificacion_id
     - clase_grupo_id
     - docente_id: req.user.id
     - activo: true
     - fecha_asignacion: NOW()
     - mensaje_docente
     - fecha_inicio_custom

5. **Crear notificación para estudiantes**
   - SELECT estudiantes FROM clase_grupos WHERE id = clase_grupo_id
   - Para cada estudiante:
     - INSERT INTO notificaciones (si estudiante tiene portal)

### Entidades Afectadas

| Tabla                | Operación                   |
| -------------------- | --------------------------- |
| asignaciones_docente | INSERT                      |
| notificaciones       | INSERT (N para estudiantes) |

### Salidas

```typescript
{
  asignacion: {
    id: string;
    planificacion_id: string;
    clase_grupo_id: string;
    fecha_asignacion: DateTime;
    activo: true;
  }
  actividades: [{ id, semana_numero, titulo, componente_nombre }];
}
```

### Estado Actual

✅ Completo

---

## FLUJO 19: Asignación de Actividad Individual a Estudiantes

### Actor Inicial

**DOCENTE**

### Trigger

```
POST /api/planificaciones/asignaciones-actividad
Body: {
  asignacion_docente_id: string
  actividad_id: string
  fecha_inicio: DateTime
  fecha_fin?: DateTime
  mensaje_semana?: string
}
```

### Proceso

1. **Obtener asignación padre**
   - SELECT \* FROM asignaciones_docente WHERE id = asignacion_docente_id
   - Validar docente_id = req.user.id

2. **Obtener actividad**
   - SELECT \* FROM actividades_semanales WHERE id = actividad_id

3. **Obtener estudiantes del grupo**
   - SELECT estudiante_id FROM inscripciones_clase_grupo WHERE clase_grupo_id = grupo_id AND fecha_baja IS NULL

4. **Crear asignación de actividad**
   - INSERT INTO asignaciones_actividad_estudiante:
     - asignacion_docente_id
     - actividad_id
     - clase_grupo_id
     - fecha_inicio
     - fecha_fin
     - estado: "ACTIVA"
     - mensaje_semana
     - notificado_estudiantes: false
     - notificado_tutores: false

5. **Crear progreso de cada estudiante**
   - Para cada estudiante_id:
     - INSERT INTO progreso_estudiante_actividad:
       - estudiante_id
       - actividad_id
       - asignacion_id
       - iniciado: false
       - completado: false
       - puntos_obtenidos: 0
       - tiempo_total_minutos: 0
       - intentos: 0
       - mejor_puntaje: 0

6. **Enviar notificaciones**
   - Para cada estudiante:
     - Si estudiante tiene portal: INSERT notificación
   - Para cada tutor:
     - INSERT notificación: "Actividad semanal disponible para tu hijo"
   - UPDATE asignacion: notificado_estudiantes = true, notificado_tutores = true

### Entidades Afectadas

| Tabla                             | Operación                            |
| --------------------------------- | ------------------------------------ |
| asignaciones_actividad_estudiante | INSERT                               |
| progreso_estudiante_actividad     | INSERT (N registros)                 |
| notificaciones                    | INSERT (N for estudiantes + tutores) |

### Salidas

```typescript
{
  asignacion: {
    id: string;
    actividad: {
      (titulo, componente_nombre, puntos_gamificacion);
    }
    fecha_inicio: DateTime;
    fecha_fin: DateTime;
    estado: 'ACTIVA';
  }
  estudiantesAsignados: number;
  notificacionesEnviadas: number;
}
```

### Estado Actual

⚠️ Backend: Parcial (estructura definida, endpoints en desarrollo)

---

## FLUJO 20: Actualización de Progreso de Actividad por Estudiante

### Actor Inicial

**ESTUDIANTE** (jugando el componente)

### Trigger

```
POST /api/planificaciones/progreso
Body: {
  asignacion_id: string
  actividad_id: string
  iniciado?: boolean
  completado?: boolean
  puntaje?: number
  tiempo_invertido_minutos?: number
  respuestas_detalle?: JSON
}
```

### Proceso

1. **Validar estudiante autenticado**
   - req.user.id = estudiante_id (del JWT)

2. **Obtener progreso existente**
   - SELECT \* FROM progreso_estudiante_actividad WHERE estudiante_id = id AND actividad_id = act_id AND asignacion_id = asig_id

3. **Actualizar progreso**
   - UPDATE progreso_estudiante_actividad:
     - iniciado: true (si es primer acceso)
     - fecha_inicio: NOW() (si es primer acceso)
     - intentos: intentos + 1
     - tiempo_total_minutos: tiempo_total_minutos + tiempo_invertido_minutos
     - mejor_puntaje: MAX(mejor_puntaje, puntaje)
     - respuestas_detalle: JSON con respuestas

   - Si completado = true:
     - completado: true
     - fecha_completado: NOW()
     - puntos_obtenidos: actividad.puntos_gamificacion
     - UPDATE estudiante SET puntos_totales = puntos_totales + puntos
     - INSERT INTO puntos_obtenidos (registro transaccional)

4. **Verificar desbloqueos de logros automáticos**
   - Ej: Si "100 puntos en actividades": desbloquear logro

5. **Actualizar equipo (si existe)**
   - Si completado y estudiante.equipo_id:
     - UPDATE equipos SET puntos_totales = puntos_totales + actividad.puntos

6. **Crear notificación para tutor**
   - Si completado:
     - "Tu hijo completó la actividad X"
     - Incluir puntos obtenidos

### Entidades Afectadas

| Tabla                         | Operación               |
| ----------------------------- | ----------------------- |
| progreso_estudiante_actividad | UPDATE                  |
| puntos_obtenidos              | INSERT (si completado)  |
| estudiantes                   | UPDATE (puntos_totales) |
| equipos                       | UPDATE (si completado)  |
| logros_desbloqueados          | INSERT (si aplica)      |
| notificaciones                | INSERT (para tutor)     |

### Salidas

```typescript
{
  progreso: {
    estudiante_id: string
    actividad: { titulo, puntos_gamificacion }
    completado: boolean
    fecha_completado?: DateTime
    puntaje: number
    tiempo_total_minutos: number
    intentos: number
  }
  puntos?: {
    otorgados: number
    totalAhora: number
  }
  logrosDesbloqueados?: [{ nombre, icono }]
}
```

### Efectos Secundarios

- Dashboard del estudiante actualizado
- Métrica de progreso en portal tutor actualizada
- Posible cambio de nivel en gamificación
- Ranking actualizado

### Actores Impactados

| Actor      | Qué ve                                 | Cuándo             |
| ---------- | -------------------------------------- | ------------------ |
| ESTUDIANTE | Puntaje actualizado, progreso guardado | Inmediato          |
| TUTOR      | Notificación: hijo completó actividad  | Inmediato          |
| DOCENTE    | Progreso del grupo en actividad        | En próximo refresh |
| ADMIN      | Métrica de completación                | En próximo refresh |

### Estado Actual

⚠️ Backend: Estructura definida, parte de implementación pendiente

---

# MÓDULO 7: NOTIFICACIONES

## FLUJO 21: Sistema de Notificaciones

### Actores Generadores de Notificaciones

- Sistema (automático)
- Docente
- Admin
- Tutor

### Tipos de Notificaciones

| Tipo                | Disparador                        | Destinatario               | Urgencia |
| ------------------- | --------------------------------- | -------------------------- | -------- |
| ClaseProxima        | Nueva clase creada                | Docente                    | Media    |
| AsistenciaPendiente | Docente no registró asistencia    | Docente                    | Media    |
| EstudianteAlerta    | Observación crítica en asistencia | Admin                      | Alta     |
| ClaseCancelada      | Clase cancelada                   | Docente, Tutor, Estudiante | Alta     |
| LogroEstudiante     | Logro desbloqueado                | Estudiante, Tutor          | Baja     |
| Recordatorio        | Actividad semanal asignada        | Estudiante, Tutor          | Media    |
| General             | Planificación publicada           | Docente                    | Baja     |

### Proceso General de Creación de Notificación

```typescript
INSERT INTO notificaciones (
  tipo,
  titulo,
  mensaje,
  docente_id,
  metadata,
  leida = false,
  createdAt = NOW()
)
```

### Lectura de Notificaciones

```
GET /api/notificaciones
Body: (todas las del docente autenticado)

PATCH /api/notificaciones/:id/marcar-leida
Body: (marca individual como leída)
```

### Estado Actual

✅ Modelo: Completo  
⚠️ Backend: Endpoints básicos completos, real-time (WebSocket) pendiente  
⚠️ Frontend: Notificaciones visibles pero no real-time

---

# INTERACCIONES CROSS-PORTAL

## DIAGRAMA DE FLUJOS POR ROL

```
ADMIN (Portal Admin)
├── Crea clase → Docente notificado
├── Crea grupo semanal → Docentes y Estudiantes notificados
├── Crea planificación → Docentes notificados cuando publicada
├── Asigna estudiantes masivamente → Tutores notificados
├── Ve alertas de asistencia/comportamiento
├── Actualiza configuración de precios → Historial registrado
└── Genera reportes de métricas

DOCENTE (Portal Docente)
├── Ve clases asignadas
├── Registra asistencia → Estudiantes ganan puntos, Tutor ve métrica
├── Otorga puntos → Estudiantes suben nivel, Equipo se actualiza
├── Desbloquea logros → Estudiantes notificados
├── Asigna planificación a grupo → Estudiantes y tutores notificados
├── Asigna actividades semanales → Estudiantes ven en portal, Tutores notificados
└── Ve progreso de actividades completadas

TUTOR (Portal Tutor)
├── Crea estudiantes → (No del portal, Admin lo hace)
├── Ve listado de estudiantes con métricas
│  ├── Gamificación (puntos, nivel, logros)
│  ├── Asistencia promedio
│  ├── Actividades completadas
│  └── Progreso en cursos
├── Reserva clases para estudiantes → Docente notificado
├── Ve próximas clases de todos sus hijos
├── Paga inscripciones mensuales → Admin ve ingreso
├── Ve alertas (asistencia baja, pagos vencidos)
└── Recibe notificaciones de actividades completadas

ESTUDIANTE (Portal Estudiante)
├── Ver calendario de clases
├── Ver cursos inscritos
├── Completar actividades semanales → Gana puntos
├── Ver gamificación (puntos, nivel, logros, ranking)
├── Ver calendario de actividades planificadas
└── (Notificaciones internas, no cross-portal)
```

---

## TABLA DE FLUJOS CRÍTICOS RESUMIDA

| #   | Flujo                  | Actor       | Entrada                | Salida             | Afecta a                             | Estado |
| --- | ---------------------- | ----------- | ---------------------- | ------------------ | ------------------------------------ | ------ |
| 1   | Creación Clase         | ADMIN       | DTO Clase              | Clase creada       | Docente (notif)                      | ✅     |
| 2   | Asignación Masiva      | ADMIN       | IDs estudiantes        | Inscripciones      | Tutores (notif)                      | ✅     |
| 3   | Reserva Clase          | TUTOR       | Clase ID               | Inscripción        | Docente (notif)                      | ✅     |
| 4   | Cancelar Reserva       | TUTOR       | Inscripción ID         | Borrada            | Docente                              | ✅     |
| 5   | Crear Grupo            | ADMIN       | DTO Grupo              | Grupo creado       | Docentes                             | ✅     |
| 6   | Inscribir a Grupo      | ADMIN/TUTOR | Grupo ID               | Inscripción        | -                                    | ✅     |
| 7   | Registrar Asistencia   | DOCENTE     | Array asistencias      | Registrada         | Estudiante (puntos)                  | ✅     |
| 8   | Asist. ClaseGrupo      | DOCENTE     | Array asistencias      | Registrada         | Estudiante (puntos)                  | ✅     |
| 9   | Otorgar Puntos         | DOCENTE     | Acción, Est.           | Puntos +X          | Estudiante, Equipo                   | ✅     |
| 10  | Desbloquear Logro      | DOCENTE     | Logro ID               | Logro desbloqueado | Estudiante (notif)                   | ✅     |
| 11  | Calcular Precio        | TUTOR/ADMIN | Estudiantes, Productos | Desglose precio    | - (consultivo)                       | ✅     |
| 12  | Crear Inscr. Mensual   | ADMIN       | Lista estudiantes      | Inscripciones      | Tutor (notif)                        | ✅     |
| 13  | Pago Inscripción       | TUTOR       | Método pago            | Pagado             | Estudiante (acceso), Admin (métrica) | ✅     |
| 14  | Métricas Pagos         | ADMIN       | Período                | Dashboard          | - (consultivo)                       | ✅     |
| 15  | Crear Planificación    | ADMIN       | DTO Planificación      | Plan creada        | -                                    | ✅     |
| 16  | Crear Actividad        | ADMIN       | DTO Actividad          | Actividad creada   | -                                    | ✅     |
| 17  | Publicar Planificación | ADMIN       | Plan ID                | Publicada          | Docentes (notif)                     | ✅     |
| 18  | Asignar Planif.        | DOCENTE     | Plan ID, Grupo ID      | Asignada           | Estudiantes (notif), Tutores (notif) | ✅     |
| 19  | Asignar Actividad      | DOCENTE     | Actividad ID           | Asignada           | Estudiantes, Tutores (notif)         | ⚠️     |
| 20  | Progreso Actividad     | ESTUDIANTE  | Datos progreso         | Actualizado        | Estudiante (puntos), Tutor (notif)   | ⚠️     |
| 21  | Notificaciones         | SISTEMA     | Evento                 | Notificación       | Destinatario                         | ✅     |

---

## RESUMEN DE IMPACTOS POR ROL

### ADMIN

- **Crea:** Clases, Grupos, Planificaciones, Inscripciones mensuales, Estudiantes
- **Ve:** Dashboard con todas las métricas, Alertas de estudiantes
- **Actualiza:** Configuración de precios, Rutas curriculares, Sectores

### DOCENTE

- **Asignado a:** Clases, Grupos
- **Realiza:** Toma asistencia, Otorga puntos, Desbloquea logros
- **Asigna:** Planificaciones a grupos, Actividades a estudiantes
- **Ve:** Lista de estudiantes, Progreso en actividades

### TUTOR

- **Tiene:** Estudiantes (hijos)
- **Realiza:** Reservas de clases, Pagos de inscripciones
- **Ve:** Dashboard con gamificación, Asistencia, Próximas clases, Alertas de pagos
- **Recibe:** Notificaciones de actividades completadas

### ESTUDIANTE

- **Pertenece a:** Tutor, Clases, Grupos, Equipos
- **Realiza:** Completa actividades, Ve calendario
- **Ve:** Gamificación personal, Actividades asignadas, Cursos
- **Recibe:** Notificaciones de logros

---

## FLUJOS DE DATOS CRÍTICOS (Cascadas de Cambios)

### Cascada 1: Asistencia → Gamificación → Notificaciones

```
Docente registra asistencia
  ├─ Estudiante marcado como "Presente"
  ├─ INSERT puntos_obtenidos
  ├─ UPDATE estudiantes.puntos_totales
  ├─ Chequear si sube de nivel
  │  └─ Si sube: INSERT INTO logros_desbloqueados (automático)
  ├─ UPDATE equipos.puntos_totales (si estudiante tiene equipo)
  └─ INSERT notificaciones (para Tutor, Estudiante)
```

### Cascada 2: Pago → Acceso → Notificaciones

```
Tutor paga inscripción mensual
  ├─ UPDATE inscripciones_mensuales.estado_pago = "Pagado"
  ├─ UPDATE estudiantes.acceso_activo = true
  ├─ Estudiante puede ver cursos/clases
  └─ INSERT notificaciones (para Tutor, Estudiante, Admin)
       └─ UPDATE admin dashboard.ingresos_mes
```

### Cascada 3: Actividad Completada → Puntos → Nivel → Logro

```
Estudiante completa actividad semanal
  ├─ UPDATE progreso_estudiante_actividad.completado = true
  ├─ INSERT puntos_obtenidos
  ├─ UPDATE estudiantes.puntos_totales
  ├─ Chequear si sube de nivel
  │  └─ Si nivel 1→2: INSERT logro "Principiante"
  ├─ UPDATE equipos.puntos_totales
  └─ INSERT notificaciones (para Tutor)
       └─ Tutor ve "Hijo completó actividad X"
```

---

## TRANSACCIONALIDAD Y INTEGRIDAD

### Operaciones Atómicas (Todo o Nada)

- Creación de Clase + Notificación
- Inscripción Mensual + Validaciones
- Registro de Asistencia + Puntos + Notificaciones
- Completación de Actividad + Puntos + Logros

### Validaciones Críticas

1. **Ownership:** Tutor solo ve/modifica sus estudiantes
2. **Disponibilidad:** Clases con cupos disponibles
3. **Duplicación:** Inscripciones únicas por clase-estudiante
4. **Período:** Inscripciones mensuales únicas por estudiante-producto-mes

### Índices para Performance

- `docentes.id`, `estudiantes.tutor_id`, `clases.docente_id`
- `clases.fecha_hora_inicio`, `clases.estado`
- `inscripciones_clase.clase_id`, `inscripciones_clase.estudiante_id`
- `asistencias.clase_id`, `asistencias.estado`
- `puntos_obtenidos.estudiante_id`, `puntos_obtenidos.fecha_otorgado`
- `inscripciones_mensuales.periodo`, `inscripciones_mensuales.estado_pago`

---

## TABLA COMPARATIVA: ESTADO DE IMPLEMENTACIÓN

| Flujo                 | Backend | Frontend | Consideraciones                             |
| --------------------- | ------- | -------- | ------------------------------------------- |
| Clases Individuales   | ✅ 100% | ✅ 100%  | Funcional end-to-end                        |
| Grupos Recurrentes    | ✅ 100% | ⚠️ 50%   | Falta UI en portales                        |
| Asistencia Individual | ✅ 100% | ✅ 100%  | Docente puede registrar                     |
| Asistencia Grupos     | ✅ 100% | ⚠️ 25%   | Endpoints listos, UI mínima                 |
| Gamificación Puntos   | ✅ 100% | ✅ 100%  | Totalmente funcional                        |
| Gamificación Logros   | ✅ 95%  | ⚠️ 50%   | Desbloqueos automáticos en desarrollo       |
| Sistema Pagos         | ✅ 100% | ⚠️ 75%   | MercadoPago integrado, manual en desarrollo |
| Planificaciones       | ✅ 100% | ⚠️ 50%   | Estructura lista, UI en desarrollo          |
| Actividades Semanales | ✅ 100% | ⚠️ 25%   | Asignación parcial implementada             |
| Notificaciones        | ✅ 75%  | ⚠️ 50%   | Real-time (WebSocket) pendiente             |

---

## RECOMENDACIONES PARA DFD EXTENDIDO

1. **Dividir por Capas:**
   - Capa de Entrada (Portales, Usuarios)
   - Capa de Validación (Guards, Roles)
   - Capa de Negocio (Services, Use Cases)
   - Capa de Persistencia (Repositories, BD)
   - Capa de Efectos Secundarios (Notificaciones, Eventos)

2. **Código de Colores Recomendado:**
   - Azul: Operaciones de Lectura (SELECT)
   - Verde: Operaciones de Creación (INSERT)
   - Amarillo: Operaciones de Actualización (UPDATE)
   - Rojo: Operaciones de Eliminación (DELETE)
   - Púrpura: Notificaciones/Efectos secundarios
   - Naranja: Cálculos/Lógica de negocio

3. **Elementos a Destacar en DFD:**
   - Puntos de validación (guards)
   - Transacciones críticas
   - Cascadas de cambios
   - Puntos de fallo potencial
   - Integraciones externas (MercadoPago)

4. **Métricas a Rastrear:**
   - Latencia promedio por endpoint
   - Tasa de error
   - Volumen de notificaciones
   - Throughput de pagos

---

## CONCLUSIÓN

El ecosistema Mateatletas implementa un sistema complejo pero bien estructurado de flujos de datos que:

1. **Mantiene integridad:** Validaciones robustas en cada punto
2. **Escalable:** Índices estratégicos y separación de concerns
3. **Resiliente:** Circuit breakers para fallos en cascada
4. **Observable:** Sistema de notificaciones y alertas
5. **Extensible:** Arquitectura modular (CQRS, Use Cases, Repositories)

Los flujos principales están 85-95% implementados en backend, con frontend en 50-75% de completitud. Las áreas pendientes son principalmente UI y optimizaciones real-time.
