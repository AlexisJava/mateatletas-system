# DFD NIVEL 2 - P2: GESTIÓN DE CLASES

## Ecosistema Mateatletas

**Versión:** 1.0  
**Fecha:** 2025-10-24  
**Descripción:** Descomposición detallada del proceso P2 - Gestión de Clases

---

## Diagrama de Nivel 2 - P2: Gestión de Clases

```mermaid
flowchart TB
    %% Entidades Externas
    ADMIN[👤 ADMIN]
    DOCENTE[👨‍🏫 DOCENTE]
    TUTOR[👨‍👩‍👧 TUTOR]
    ESTUDIANTE[🎓 ESTUDIANTE]
    GOOGLE[📧 Google Calendar]

    %% Subprocesos de P2
    P2_1[P2.1<br/>CREAR CLASE<br/>INDIVIDUAL]
    P2_2[P2.2<br/>CREAR GRUPO<br/>RECURRENTE]
    P2_3[P2.3<br/>GESTIONAR<br/>INSCRIPCIONES]
    P2_4[P2.4<br/>REGISTRAR<br/>ASISTENCIA]
    P2_5[P2.5<br/>CONSULTAR<br/>CLASES]
    P2_6[P2.6<br/>SINCRONIZAR<br/>CALENDARIO]

    %% Almacenes de Datos
    D1[(D1<br/>USUARIOS)]
    D2[(D2<br/>CLASES Y<br/>GRUPOS)]
    D3[(D3<br/>INSCRIPCIONES)]
    D4[(D4<br/>ASISTENCIAS)]

    %% Procesos Externos
    P3[P3<br/>GAMIFICACIÓN]
    P6[P6<br/>NOTIFICACIONES]

    %% === FLUJOS DESDE ENTIDADES EXTERNAS ===

    ADMIN -->|Datos nueva clase| P2_1
    ADMIN -->|Datos nuevo grupo| P2_2
    DOCENTE -->|Consulta clases asignadas| P2_5
    DOCENTE -->|Registro de asistencia| P2_4
    TUTOR -->|Solicitud de reserva| P2_3
    TUTOR -->|Solicitud de cancelación| P2_3
    TUTOR -->|Consulta calendario hijos| P2_5
    ESTUDIANTE -->|Consulta calendario personal| P2_5

    %% === FLUJOS HACIA ENTIDADES EXTERNAS ===

    P2_5 -->|Lista de clases| DOCENTE
    P2_5 -->|Calendario| TUTOR
    P2_5 -->|Calendario| ESTUDIANTE
    P2_6 -->|Eventos| GOOGLE

    %% === P2.1: CREAR CLASE INDIVIDUAL ===

    P2_1 -->|Validar docente| D1
    D1 -->|Datos docente| P2_1
    P2_1 -->|Verificar disponibilidad| D2
    D2 -->|Clases existentes| P2_1
    P2_1 -->|Crear clase| D2
    P2_1 -->|Evento: Clase creada| P6
    P2_1 -->|Evento: Sincronizar| P2_6

    %% === P2.2: CREAR GRUPO RECURRENTE ===

    P2_2 -->|Validar docente(s)| D1
    D1 -->|Datos docente| P2_2
    P2_2 -->|Crear grupo| D2
    P2_2 -->|Evento: Grupo creado| P6
    P2_2 -->|Evento: Sincronizar| P2_6

    %% === P2.3: GESTIONAR INSCRIPCIONES ===

    P2_3 -->|Validar estudiante-tutor| D1
    D1 -->|Datos estudiante/tutor| P2_3
    P2_3 -->|Verificar cupos| D2
    D2 -->|Datos clase/grupo| P2_3
    P2_3 -->|Verificar duplicados| D3
    D3 -->|Inscripciones existentes| P2_3
    P2_3 -->|Crear inscripción| D3
    P2_3 -->|Actualizar cupos| D2
    P2_3 -->|Eliminar inscripción| D3
    P2_3 -->|Evento: Inscripción creada| P6
    P2_3 -->|Evento: Inscripción cancelada| P6

    %% === P2.4: REGISTRAR ASISTENCIA ===

    P2_4 -->|Validar clase| D2
    D2 -->|Datos clase| P2_4
    P2_4 -->|Validar inscripciones| D3
    D3 -->|Lista estudiantes| P2_4
    P2_4 -->|Crear registros asistencia| D4
    P2_4 -->|Evento: Asistencia registrada| P3
    P2_4 -->|Evento: Notificar tutores| P6

    %% === P2.5: CONSULTAR CLASES ===

    P2_5 -->|Leer clases por docente| D2
    P2_5 -->|Leer clases por estudiante| D3
    P2_5 -->|Leer grupos| D2
    D2 -->|Clases/Grupos| P2_5
    D3 -->|Inscripciones| P2_5
    P2_5 -->|Leer estudiantes| D1
    D1 -->|Datos estudiantes| P2_5

    %% === P2.6: SINCRONIZAR CALENDARIO ===

    P2_6 -->|Leer clases| D2
    D2 -->|Datos clases| P2_6
    P2_6 -->|Leer inscripciones| D3
    D3 -->|Lista participantes| P2_6
    P2_6 -->|Leer usuarios| D1
    D1 -->|Emails usuarios| P2_6

    %% Estilos
    classDef userExternal fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef systemExternal fill:#E24A4A,stroke:#8A2E2E,stroke-width:2px,color:#fff
    classDef subprocess fill:#50C878,stroke:#2E8A57,stroke-width:2px,color:#fff
    classDef datastore fill:#FFB84D,stroke:#CC8A3D,stroke-width:2px,color:#000
    classDef externalProcess fill:#9B59B6,stroke:#6C3483,stroke-width:2px,color:#fff

    class ADMIN,DOCENTE,TUTOR,ESTUDIANTE userExternal
    class GOOGLE systemExternal
    class P2_1,P2_2,P2_3,P2_4,P2_5,P2_6 subprocess
    class D1,D2,D3,D4 datastore
    class P3,P6 externalProcess
```

---

## SUBPROCESO P2.1: CREAR CLASE INDIVIDUAL

### Descripción

Permite al Admin crear una clase individual (one-off) con un docente específico, fecha/hora, duración y cupos.

### Entradas

**Desde ADMIN:**

```typescript
{
  docente_id: string
  fecha_hora_inicio: DateTime
  duracion_minutos: number
  cupos_maximo: number
  nombre: string
  descripcion?: string
  ruta_curricular_id?: string
  sector_id?: string
  producto_id?: string
  link_reunion?: string
}
```

### Proceso Detallado

#### Paso 1: Validar Docente

```
Entrada: docente_id
Acción: SELECT * FROM docentes WHERE id = docente_id AND activo = true
Validación:
  - Docente existe
  - Docente está activo
Salida: Datos del docente
```

#### Paso 2: Verificar Disponibilidad (Opcional)

```
Entrada: docente_id, fecha_hora_inicio, duracion_minutos
Acción: SELECT * FROM clases
        WHERE docente_id = docente_id
        AND estado != 'Cancelada'
        AND (
          (fecha_hora_inicio BETWEEN ? AND ?) OR
          (fecha_hora_fin BETWEEN ? AND ?)
        )
Validación: No hay clases conflictivas
Salida: true/false
```

#### Paso 3: Validar Fecha

```
Validación:
  - fecha_hora_inicio > NOW()
  - duracion_minutos > 0
  - cupos_maximo > 0
```

#### Paso 4: Crear Registro de Clase

```sql
INSERT INTO clases (
  id,
  docente_id,
  fecha_hora_inicio,
  duracion_minutos,
  cupos_maximo,
  cupos_ocupados,
  estado,
  nombre,
  descripcion,
  ruta_curricular_id,
  sector_id,
  producto_id,
  link_reunion,
  createdAt,
  updatedAt
) VALUES (
  cuid(),
  ?,
  ?,
  ?,
  ?,
  0, -- cupos_ocupados inicial
  'Programada',
  ?,
  ?,
  ?,
  ?,
  ?,
  ?, -- Link Google Meet si se proporciona
  NOW(),
  NOW()
)
```

#### Paso 5: Enviar Evento a P6 (Notificaciones)

```typescript
{
  tipo: 'ClaseCreada',
  destinatario_id: docente_id,
  destinatario_tipo: 'DOCENTE',
  metadata: {
    clase_id,
    nombre,
    fecha_hora_inicio,
    duracion_minutos
  }
}
```

#### Paso 6: Enviar Evento a P2.6 (Sincronizar Calendario)

```typescript
{
  tipo: 'SincronizarClase',
  clase_id,
  accion: 'crear'
}
```

### Salidas

**A ADMIN:**

```typescript
{
  id: string
  docente_id: string
  docente: { nombre, email }
  fecha_hora_inicio: DateTime
  duracion_minutos: number
  cupos_maximo: number
  cupos_ocupados: 0
  estado: "Programada"
  nombre: string
  link_reunion?: string
}
```

**A D2 (CLASES):** INSERT
**A P6:** Evento de notificación
**A P2.6:** Evento de sincronización

### Validaciones Críticas

1. ✅ Docente existe y está activo
2. ✅ Fecha es futura
3. ✅ Duracion > 0
4. ✅ Cupos > 0
5. ⚠️ No hay clases conflictivas (opcional)

### Estado Implementación

- Backend: ✅ 100%
- Frontend: ✅ 100%

---

## SUBPROCESO P2.2: CREAR GRUPO RECURRENTE

### Descripción

Permite al Admin crear un grupo de clases recurrentes (semanales) con uno o más docentes.

### Entradas

**Desde ADMIN:**

```typescript
{
  nombre: string
  descripcion?: string
  dia_semana: number // 0=Domingo, 1=Lunes, ..., 6=Sábado
  hora_inicio: string // "HH:mm" formato 24h
  duracion_minutos: number
  cupos_maximo: number
  docente_id: string // Principal
  docentes_secundarios?: string[] // Opcionales
  ruta_curricular_id?: string
  sector_id?: string
  link_reunion?: string
  activo: boolean
}
```

### Proceso Detallado

#### Paso 1: Validar Docente Principal

```
Entrada: docente_id
Acción: SELECT * FROM docentes WHERE id = docente_id AND activo = true
Validación: Docente existe y está activo
```

#### Paso 2: Validar Docentes Secundarios (si aplica)

```
Entrada: docentes_secundarios[]
Acción: SELECT * FROM docentes WHERE id IN (?) AND activo = true
Validación: Todos los docentes existen
```

#### Paso 3: Validar Horarios

```
Validación:
  - dia_semana BETWEEN 0 AND 6
  - hora_inicio formato válido "HH:mm"
  - duracion_minutos > 0
  - cupos_maximo > 0
```

#### Paso 4: Crear Registro de Grupo

```sql
INSERT INTO clase_grupos (
  id,
  nombre,
  descripcion,
  dia_semana,
  hora_inicio,
  duracion_minutos,
  cupos_maximo,
  docente_id,
  ruta_curricular_id,
  sector_id,
  link_reunion,
  activo,
  createdAt,
  updatedAt
) VALUES (
  cuid(),
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  true,
  NOW(),
  NOW()
)
```

#### Paso 5: Asociar Docentes Secundarios (si aplica)

```sql
INSERT INTO clase_grupo_docentes (
  clase_grupo_id,
  docente_id
) VALUES (?, ?)
-- Para cada docente secundario
```

#### Paso 6: Enviar Evento a P6 (Notificaciones)

```typescript
{
  tipo: 'GrupoCreado',
  destinatarios: [docente_id, ...docentes_secundarios],
  destinatario_tipo: 'DOCENTE',
  metadata: {
    grupo_id,
    nombre,
    dia_semana,
    hora_inicio
  }
}
```

#### Paso 7: Enviar Evento a P2.6 (Sincronizar Calendario)

```typescript
{
  tipo: 'SincronizarGrupo',
  grupo_id,
  accion: 'crear'
}
```

### Salidas

**A ADMIN:**

```typescript
{
  id: string
  nombre: string
  dia_semana: number
  hora_inicio: string
  duracion_minutos: number
  cupos_maximo: number
  docente: { id, nombre, email }
  docentes_secundarios?: Array<{ id, nombre, email }>
  activo: true
  link_reunion?: string
}
```

**A D2 (GRUPOS):** INSERT
**A P6:** Evento de notificación
**A P2.6:** Evento de sincronización

### Validaciones Críticas

1. ✅ Docente principal existe
2. ✅ Docentes secundarios existen (si aplica)
3. ✅ Día de semana válido (0-6)
4. ✅ Hora inicio válida
5. ✅ Duración > 0, Cupos > 0

### Estado Implementación

- Backend: ✅ 100%
- Frontend: ⚠️ 50%

---

## SUBPROCESO P2.3: GESTIONAR INSCRIPCIONES

### Descripción

Permite a Tutores reservar/cancelar clases para sus estudiantes. También permite al Admin hacer inscripciones masivas.

### Operaciones

1. **Reservar Clase Individual**
2. **Cancelar Reserva de Clase Individual**
3. **Inscribir a Grupo Recurrente**
4. **Desinscribir de Grupo Recurrente**

---

### OPERACIÓN 1: Reservar Clase Individual

#### Entradas

**Desde TUTOR o ADMIN:**

```typescript
{
  clase_id: string;
  estudiante_id: string;
  reservada_por: 'TUTOR' | 'ADMIN';
}
```

#### Proceso Detallado

##### Paso 1: Validar Ownership (si es TUTOR)

```
Si actor = TUTOR:
  SELECT * FROM estudiantes
  WHERE id = estudiante_id AND tutor_id = user.id

  Validación: Estudiante pertenece al tutor
```

##### Paso 2: Verificar Clase Existe y Tiene Cupos

```sql
SELECT id, cupos_maximo, cupos_ocupados, estado, fecha_hora_inicio
FROM clases
WHERE id = clase_id
```

Validaciones:

- Clase existe
- estado = "Programada"
- cupos_ocupados < cupos_maximo
- fecha_hora_inicio > NOW()

##### Paso 3: Verificar No Está Inscrito

```sql
SELECT COUNT(*) FROM inscripciones_clase
WHERE clase_id = ? AND estudiante_id = ?
```

Validación: COUNT = 0 (no existe inscripción previa)

##### Paso 4: Crear Inscripción

```sql
INSERT INTO inscripciones_clase (
  id,
  clase_id,
  estudiante_id,
  reservada_por_tutor,
  fecha_inscripcion,
  createdAt
) VALUES (
  cuid(),
  ?,
  ?,
  ?, -- true si actor=TUTOR, false si ADMIN
  NOW(),
  NOW()
)
```

##### Paso 5: Actualizar Cupos de Clase

```sql
UPDATE clases
SET cupos_ocupados = cupos_ocupados + 1,
    updatedAt = NOW()
WHERE id = clase_id
```

##### Paso 6: Enviar Evento a P6 (Notificar Docente)

```typescript
{
  tipo: 'NuevaInscripcion',
  destinatario_id: clase.docente_id,
  destinatario_tipo: 'DOCENTE',
  metadata: {
    clase_id,
    estudiante: { nombre, id },
    cupos_ocupados: X,
    cupos_maximo: Y
  }
}
```

##### Paso 7: Enviar Confirmación a TUTOR

```typescript
{
  tipo: 'ReservaConfirmada',
  destinatario_id: tutor_id,
  destinatario_tipo: 'TUTOR',
  metadata: {
    clase_id,
    estudiante_id,
    fecha_hora_inicio
  }
}
```

#### Salidas

**A TUTOR:**

```typescript
{
  inscripcion_id: string
  clase: {
    id, nombre, fecha_hora_inicio, docente: { nombre }
  },
  estudiante: { id, nombre }
}
```

**A D3 (INSCRIPCIONES):** INSERT
**A D2 (CLASES):** UPDATE cupos_ocupados
**A P6:** Eventos de notificación

---

### OPERACIÓN 2: Cancelar Reserva de Clase Individual

#### Entradas

**Desde TUTOR o ADMIN:**

```typescript
{
  inscripcion_id: string;
}
```

#### Proceso Detallado

##### Paso 1: Validar Inscripción Existe

```sql
SELECT inscripciones_clase.*, clases.estado, clases.fecha_hora_inicio, estudiantes.tutor_id
FROM inscripciones_clase
JOIN clases ON inscripciones_clase.clase_id = clases.id
JOIN estudiantes ON inscripciones_clase.estudiante_id = estudiantes.id
WHERE inscripciones_clase.id = ?
```

##### Paso 2: Validar Ownership (si es TUTOR)

```
Si actor = TUTOR:
  Validación: estudiantes.tutor_id = user.id
```

##### Paso 3: Validar Cancelación Permitida

```
Validaciones:
  - clases.estado = "Programada"
  - clases.fecha_hora_inicio > NOW()
  - Opcional: fecha_hora_inicio - NOW() > 24 horas (política de cancelación)
```

##### Paso 4: Eliminar Inscripción

```sql
DELETE FROM inscripciones_clase
WHERE id = inscripcion_id
```

##### Paso 5: Actualizar Cupos de Clase

```sql
UPDATE clases
SET cupos_ocupados = cupos_ocupados - 1,
    updatedAt = NOW()
WHERE id = clase_id
```

##### Paso 6: Enviar Evento a P6 (Notificar Docente)

```typescript
{
  tipo: 'InscripcionCancelada',
  destinatario_id: clase.docente_id,
  destinatario_tipo: 'DOCENTE',
  metadata: {
    clase_id,
    estudiante: { nombre, id }
  }
}
```

#### Salidas

**A TUTOR:**

```typescript
{
  mensaje: 'Reserva cancelada exitosamente';
}
```

**A D3 (INSCRIPCIONES):** DELETE
**A D2 (CLASES):** UPDATE cupos_ocupados
**A P6:** Evento de notificación

---

### OPERACIÓN 3: Inscribir a Grupo Recurrente

#### Entradas

**Desde ADMIN o TUTOR:**

```typescript
{
  clase_grupo_id: string;
  estudiante_id: string;
}
```

#### Proceso Detallado

##### Paso 1: Validar Ownership

```
(Igual que en reserva de clase individual)
```

##### Paso 2: Verificar Grupo Existe y Está Activo

```sql
SELECT * FROM clase_grupos
WHERE id = clase_grupo_id AND activo = true
```

##### Paso 3: Verificar No Está Inscrito

```sql
SELECT COUNT(*) FROM inscripciones_clase_grupo
WHERE clase_grupo_id = ? AND estudiante_id = ? AND activo = true
```

##### Paso 4: Crear Inscripción a Grupo

```sql
INSERT INTO inscripciones_clase_grupo (
  id,
  clase_grupo_id,
  estudiante_id,
  activo,
  fecha_inscripcion,
  createdAt
) VALUES (
  cuid(),
  ?,
  ?,
  true,
  NOW(),
  NOW()
)
```

##### Paso 5: Notificar Docente(s)

```typescript
{
  tipo: 'NuevaInscripcionGrupo',
  destinatarios: [docente_id, ...docentes_secundarios],
  destinatario_tipo: 'DOCENTE',
  metadata: {
    grupo_id,
    grupo_nombre,
    estudiante: { nombre, id }
  }
}
```

#### Salidas

**A TUTOR/ADMIN:**

```typescript
{
  inscripcion_id: string;
  grupo: {
    (id, nombre, dia_semana, hora_inicio);
  }
  estudiante: {
    (id, nombre);
  }
}
```

**A D3 (INSCRIPCIONES):** INSERT
**A P6:** Evento de notificación

---

### OPERACIÓN 4: Desinscribir de Grupo Recurrente

#### Entradas

```typescript
{
  inscripcion_grupo_id: string;
}
```

#### Proceso Detallado

##### Paso 1-2: Validar y Verificar Ownership

(Similar a cancelar reserva individual)

##### Paso 3: Desactivar Inscripción

```sql
UPDATE inscripciones_clase_grupo
SET activo = false,
    fecha_desinscripcion = NOW(),
    updatedAt = NOW()
WHERE id = inscripcion_grupo_id
```

##### Paso 4: Notificar Docente(s)

```typescript
{
  tipo: 'InscripcionGrupoCancelada',
  destinatarios: [docente_id],
  destinatario_tipo: 'DOCENTE',
  metadata: {
    grupo_id,
    estudiante: { nombre, id }
  }
}
```

#### Salidas

**A TUTOR/ADMIN:**

```typescript
{
  mensaje: 'Desinscripción exitosa';
}
```

**A D3 (INSCRIPCIONES):** UPDATE activo=false
**A P6:** Evento de notificación

### Estado Implementación

- Backend: ✅ 100%
- Frontend: ✅ 95%

---

## SUBPROCESO P2.4: REGISTRAR ASISTENCIA

### Descripción

Permite a Docentes registrar asistencia de estudiantes en clases individuales o grupos.

### Operaciones

1. **Registrar Asistencia de Clase Individual**
2. **Registrar Asistencia de Clase Grupo**

---

### OPERACIÓN 1: Registrar Asistencia Clase Individual

#### Entradas

**Desde DOCENTE:**

```typescript
{
  clase_id: string;
  asistencias: Array<{
    estudiante_id: string;
    estado: 'Presente' | 'Ausente' | 'Justificado';
    observaciones?: string;
  }>;
}
```

#### Proceso Detallado

##### Paso 1: Validar Clase Existe

```sql
SELECT * FROM clases
WHERE id = clase_id
```

Validación: Clase existe

##### Paso 2: Validar Docente Tiene Permisos

```sql
SELECT docente_id FROM clases WHERE id = clase_id
```

Validación: docente_id = user.id

##### Paso 3: Obtener Lista de Estudiantes Inscritos

```sql
SELECT estudiante_id FROM inscripciones_clase
WHERE clase_id = ?
```

##### Paso 4: Validar Todos los Estudiantes Están Inscritos

```
Para cada estudiante en asistencias:
  Validar: estudiante_id IN lista_inscritos
```

##### Paso 5: Crear Registros de Asistencia

```sql
INSERT INTO asistencias (
  id,
  clase_id,
  estudiante_id,
  estado,
  observaciones,
  fecha,
  puntos_otorgados,
  createdAt
) VALUES (cuid(), ?, ?, ?, ?, NOW(), NULL, NOW())
-- Para cada estudiante
```

##### Paso 6: Actualizar Estado de Clase

```sql
UPDATE clases
SET estado = 'Finalizada',
    updatedAt = NOW()
WHERE id = clase_id
```

##### Paso 7: Enviar Evento a P3 (Gamificación)

```typescript
Para cada asistencia con estado = 'Presente':
{
  tipo: 'AsistenciaRegistrada',
  estudiante_id,
  clase_id,
  accion_puntuable: 'Asistencia a Clase', // 10 puntos por defecto
  metadata: { fecha, docente_id }
}
```

##### Paso 8: Enviar Evento a P6 (Notificar Tutores)

```typescript
Para cada estudiante:
{
  tipo: 'AsistenciaRegistrada',
  destinatario_id: estudiante.tutor_id,
  destinatario_tipo: 'TUTOR',
  metadata: {
    estudiante: { nombre, id },
    clase: { nombre, fecha },
    estado: 'Presente' | 'Ausente' | 'Justificado'
  }
}
```

#### Salidas

**A DOCENTE:**

```typescript
{
  clase_id: string;
  asistencias_registradas: number;
  estudiantes: Array<{
    estudiante_id;
    nombre;
    estado;
    puntos_otorgados?: number;
  }>;
}
```

**A D4 (ASISTENCIAS):** INSERT múltiples
**A D2 (CLASES):** UPDATE estado='Finalizada'
**A P3:** Eventos de asistencia (→ otorgar puntos)
**A P6:** Eventos de notificación a tutores

---

### OPERACIÓN 2: Registrar Asistencia Clase Grupo

#### Entradas

**Desde DOCENTE:**

```typescript
{
  clase_grupo_id: string;
  fecha: Date; // Fecha específica de la clase
  asistencias: Array<{
    estudiante_id: string;
    estado: 'Presente' | 'Ausente' | 'Justificado';
    observaciones?: string;
  }>;
}
```

#### Proceso Detallado

##### Paso 1: Validar Grupo Existe

```sql
SELECT * FROM clase_grupos
WHERE id = clase_grupo_id
```

##### Paso 2: Validar Docente Tiene Permisos

```sql
SELECT docente_id FROM clase_grupos WHERE id = clase_grupo_id

-- O si es docente secundario:
SELECT * FROM clase_grupo_docentes
WHERE clase_grupo_id = ? AND docente_id = user.id
```

##### Paso 3: Obtener Estudiantes Inscritos al Grupo

```sql
SELECT estudiante_id FROM inscripciones_clase_grupo
WHERE clase_grupo_id = ? AND activo = true
```

##### Paso 4: Validar Todos los Estudiantes Están Inscritos

(Igual que en clase individual)

##### Paso 5: Verificar No Existe Asistencia Previa para Esta Fecha

```sql
SELECT COUNT(*) FROM asistencias_clase_grupo
WHERE clase_grupo_id = ? AND fecha = ?
```

Validación: COUNT = 0 (evitar duplicados)

##### Paso 6: Crear Registros de Asistencia

```sql
INSERT INTO asistencias_clase_grupo (
  id,
  clase_grupo_id,
  estudiante_id,
  estado,
  observaciones,
  fecha,
  puntos_otorgados,
  createdAt
) VALUES (cuid(), ?, ?, ?, ?, ?, NULL, NOW())
-- Para cada estudiante
```

##### Paso 7: Enviar Evento a P3 (Gamificación)

```typescript
Para cada asistencia con estado = 'Presente':
{
  tipo: 'AsistenciaGrupoRegistrada',
  estudiante_id,
  clase_grupo_id,
  fecha,
  accion_puntuable: 'Asistencia a Clase Grupo', // 10 puntos
}
```

##### Paso 8: Enviar Evento a P6 (Notificar Tutores)

(Igual que en clase individual, pero con metadata de grupo)

#### Salidas

**A DOCENTE:**

```typescript
{
  clase_grupo_id: string
  fecha: Date
  asistencias_registradas: number
  estudiantes: Array<{...}>
}
```

**A D4 (ASISTENCIAS):** INSERT múltiples
**A P3:** Eventos de asistencia
**A P6:** Eventos de notificación

### Estado Implementación

- Backend: ✅ 100%
- Frontend: ✅ 90% (clase individual), ⚠️ 50% (grupos)

---

## SUBPROCESO P2.5: CONSULTAR CLASES

### Descripción

Permite a usuarios consultar clases según su rol y permisos.

### Operaciones

1. **Consultar Clases como DOCENTE**
2. **Consultar Clases como TUTOR**
3. **Consultar Clases como ESTUDIANTE**
4. **Consultar Grupos Recurrentes**

---

### OPERACIÓN 1: Consultar Clases como DOCENTE

#### Entradas

**Desde DOCENTE:**

```typescript
{
  filtros?: {
    fecha_desde?: Date
    fecha_hasta?: Date
    estado?: 'Programada' | 'Finalizada' | 'Cancelada'
  }
}
```

#### Proceso

##### Paso 1: Obtener Clases Asignadas

```sql
SELECT
  c.id,
  c.nombre,
  c.fecha_hora_inicio,
  c.duracion_minutos,
  c.cupos_maximo,
  c.cupos_ocupados,
  c.estado,
  c.link_reunion
FROM clases c
WHERE c.docente_id = user.id
  AND (fecha_desde IS NULL OR c.fecha_hora_inicio >= fecha_desde)
  AND (fecha_hasta IS NULL OR c.fecha_hora_inicio <= fecha_hasta)
  AND (estado IS NULL OR c.estado = estado)
ORDER BY c.fecha_hora_inicio ASC
```

##### Paso 2: Para Cada Clase, Obtener Estudiantes Inscritos

```sql
SELECT
  e.id,
  e.nombre,
  e.apellido,
  t.nombre as tutor_nombre,
  t.email as tutor_email
FROM inscripciones_clase ic
JOIN estudiantes e ON ic.estudiante_id = e.id
JOIN tutores t ON e.tutor_id = t.id
WHERE ic.clase_id = ?
```

##### Paso 3: Verificar Si Tiene Asistencia Registrada

```sql
SELECT COUNT(*) FROM asistencias
WHERE clase_id = ?
```

#### Salidas

**A DOCENTE:**

```typescript
Array<{
  id: string;
  nombre: string;
  fecha_hora_inicio: DateTime;
  duracion_minutos: number;
  cupos_maximo: number;
  cupos_ocupados: number;
  estado: string;
  link_reunion?: string;
  estudiantes: Array<{
    id;
    nombre;
    apellido;
    tutor: { nombre; email };
  }>;
  asistencia_registrada: boolean;
}>;
```

---

### OPERACIÓN 2: Consultar Clases como TUTOR

#### Entradas

**Desde TUTOR:**

```typescript
{
  estudiante_id?: string // Si no se proporciona, todas sus hijos
  fecha_desde?: Date
  fecha_hasta?: Date
}
```

#### Proceso

##### Paso 1: Obtener Estudiantes del Tutor

```sql
SELECT id FROM estudiantes
WHERE tutor_id = user.id
  AND (estudiante_id IS NULL OR id = estudiante_id)
```

##### Paso 2: Obtener Clases Inscritas

```sql
SELECT
  c.id,
  c.nombre,
  c.fecha_hora_inicio,
  c.duracion_minutos,
  c.link_reunion,
  d.nombre as docente_nombre,
  e.nombre as estudiante_nombre,
  e.id as estudiante_id
FROM inscripciones_clase ic
JOIN clases c ON ic.clase_id = c.id
JOIN docentes d ON c.docente_id = d.id
JOIN estudiantes e ON ic.estudiante_id = e.id
WHERE ic.estudiante_id IN (lista_estudiantes)
  AND c.estado != 'Cancelada'
  AND (fecha_desde IS NULL OR c.fecha_hora_inicio >= fecha_desde)
  AND (fecha_hasta IS NULL OR c.fecha_hora_inicio <= fecha_hasta)
ORDER BY c.fecha_hora_inicio ASC
```

##### Paso 3: Verificar Asistencia (si clase ya pasó)

```sql
SELECT estado FROM asistencias
WHERE clase_id = ? AND estudiante_id = ?
```

#### Salidas

**A TUTOR:**

```typescript
Array<{
  clase: {
    id;
    nombre;
    fecha_hora_inicio;
    duracion_minutos;
    link_reunion;
  };
  docente: { nombre };
  estudiante: { id; nombre };
  asistencia?: 'Presente' | 'Ausente' | 'Justificado';
}>;
```

---

### OPERACIÓN 3: Consultar Clases como ESTUDIANTE

#### Entradas

**Desde ESTUDIANTE:**

```typescript
{
  fecha_desde?: Date
  fecha_hasta?: Date
}
```

#### Proceso

##### Paso 1: Obtener Clases Inscritas

```sql
SELECT
  c.id,
  c.nombre,
  c.fecha_hora_inicio,
  c.duracion_minutos,
  c.link_reunion,
  d.nombre as docente_nombre
FROM inscripciones_clase ic
JOIN clases c ON ic.clase_id = c.id
JOIN docentes d ON c.docente_id = d.id
WHERE ic.estudiante_id = user.id
  AND c.estado != 'Cancelada'
  AND (fecha_desde IS NULL OR c.fecha_hora_inicio >= fecha_desde)
  AND (fecha_hasta IS NULL OR c.fecha_hora_inicio <= fecha_hasta)
ORDER BY c.fecha_hora_inicio ASC
```

##### Paso 2: Verificar Asistencia

```sql
SELECT estado FROM asistencias
WHERE clase_id = ? AND estudiante_id = user.id
```

#### Salidas

**A ESTUDIANTE:**

```typescript
Array<{
  id: string;
  nombre: string;
  fecha_hora_inicio: DateTime;
  duracion_minutos: number;
  link_reunion?: string;
  docente: { nombre };
  asistencia?: 'Presente' | 'Ausente' | 'Justificado';
}>;
```

---

### OPERACIÓN 4: Consultar Grupos Recurrentes

#### Proceso

Similar a consultar clases, pero consultando:

- `clase_grupos` en lugar de `clases`
- `inscripciones_clase_grupo` en lugar de `inscripciones_clase`
- `asistencias_clase_grupo` en lugar de `asistencias`

#### Salidas

Incluyen:

- `dia_semana` y `hora_inicio` en lugar de `fecha_hora_inicio`
- `activo` (boolean) del grupo

### Estado Implementación

- Backend: ✅ 100%
- Frontend: ✅ 95%

---

## SUBPROCESO P2.6: SINCRONIZAR CALENDARIO

### Descripción

Sincroniza clases y grupos con Google Calendar, enviando invitaciones a participantes.

### Entradas

**Desde P2.1, P2.2:**

```typescript
{
  tipo: 'SincronizarClase' | 'SincronizarGrupo';
  entidad_id: string;
  accion: 'crear' | 'actualizar' | 'eliminar';
}
```

### Proceso Detallado (Sincronizar Clase)

#### Paso 1: Obtener Datos de la Clase

```sql
SELECT
  c.*,
  d.email as docente_email,
  d.nombre as docente_nombre
FROM clases c
JOIN docentes d ON c.docente_id = d.id
WHERE c.id = ?
```

#### Paso 2: Obtener Participantes (Estudiantes + Tutores)

```sql
SELECT
  e.email as estudiante_email,
  e.nombre as estudiante_nombre,
  t.email as tutor_email,
  t.nombre as tutor_nombre
FROM inscripciones_clase ic
JOIN estudiantes e ON ic.estudiante_id = e.id
JOIN tutores t ON e.tutor_id = t.id
WHERE ic.clase_id = ?
```

#### Paso 3: Crear Evento en Google Calendar

```javascript
// Usando Google Calendar API
const event = {
  summary: clase.nombre,
  description: clase.descripcion,
  start: {
    dateTime: clase.fecha_hora_inicio,
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  end: {
    dateTime: fecha_hora_inicio + duracion_minutos,
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  attendees: [
    { email: docente_email },
    ...estudiantes.map((e) => ({ email: e.email })),
    ...tutores.map((t) => ({ email: t.email })),
  ],
  conferenceData: {
    createRequest: {
      requestId: `clase-${clase.id}`,
      conferenceSolutionKey: { type: 'hangoutsMeet' },
    },
  },
};

const response = await calendar.events.insert({
  calendarId: 'primary',
  resource: event,
  conferenceDataVersion: 1,
  sendUpdates: 'all', // Enviar invitaciones por email
});
```

#### Paso 4: Guardar Google Event ID (Opcional)

```sql
UPDATE clases
SET google_event_id = ?,
    link_reunion = ?, -- Link de Google Meet generado
    updatedAt = NOW()
WHERE id = clase_id
```

### Salidas

**A GOOGLE:** Evento de calendario creado
**A D2 (CLASES):** UPDATE con google_event_id y link_reunion

### Notas Importantes

- La sincronización con Google Calendar es **opcional**
- Si falla, no debe bloquear la creación de la clase
- Se usa circuit breaker para evitar fallos en cascada
- Los links de Google Meet se generan automáticamente si se usa `conferenceData`

### Estado Implementación

- Backend: ⚠️ 75% (funcionalidad básica, sin error handling robusto)
- Frontend: N/A (transparente para el usuario)

---

## MATRIZ DE TRANSACCIONES

| Subproceso | Operación            | Tablas Afectadas                    | Tipo           | Atomicidad     |
| ---------- | -------------------- | ----------------------------------- | -------------- | -------------- |
| P2.1       | Crear Clase          | D2 (clases)                         | INSERT         | ✅             |
| P2.2       | Crear Grupo          | D2 (clase_grupos)                   | INSERT         | ✅             |
| P2.3       | Reservar Clase       | D3 (inscripciones), D2 (cupos)      | INSERT, UPDATE | ✅ Transacción |
| P2.3       | Cancelar Reserva     | D3 (inscripciones), D2 (cupos)      | DELETE, UPDATE | ✅ Transacción |
| P2.4       | Registrar Asistencia | D4 (asistencias), D2 (estado clase) | INSERT, UPDATE | ✅ Transacción |
| P2.5       | Consultar            | Todas                               | SELECT         | N/A            |
| P2.6       | Sincronizar          | D2 (google_event_id)                | UPDATE         | ⚠️ Eventual    |

---

## VALIDACIONES CRÍTICAS DE INTEGRIDAD

### 1. Cupos de Clases

```sql
-- Constraint a nivel de aplicación
ASSERT: cupos_ocupados <= cupos_maximo

-- Validación antes de inscripción:
SELECT cupos_ocupados < cupos_maximo FROM clases WHERE id = ?
```

### 2. No Inscripciones Duplicadas

```sql
-- Constraint único en BD:
UNIQUE INDEX idx_inscripciones_clase_unique
ON inscripciones_clase(clase_id, estudiante_id)
```

### 3. Ownership de Estudiantes (TUTOR)

```sql
-- Validación en cada operación:
SELECT COUNT(*) FROM estudiantes
WHERE id = estudiante_id AND tutor_id = user.id
```

### 4. Asistencia Solo para Inscritos

```sql
-- Validación antes de registrar asistencia:
SELECT estudiante_id FROM inscripciones_clase
WHERE clase_id = ? AND estudiante_id IN (lista_estudiantes)
```

### 5. No Asistencia Duplicada (Grupos)

```sql
UNIQUE INDEX idx_asistencias_grupo_unique
ON asistencias_clase_grupo(clase_grupo_id, estudiante_id, fecha)
```

---

## ÍNDICES PARA PERFORMANCE

```sql
-- Clases
CREATE INDEX idx_clases_docente ON clases(docente_id);
CREATE INDEX idx_clases_fecha ON clases(fecha_hora_inicio);
CREATE INDEX idx_clases_estado ON clases(estado);

-- Grupos
CREATE INDEX idx_grupos_docente ON clase_grupos(docente_id);
CREATE INDEX idx_grupos_dia ON clase_grupos(dia_semana);

-- Inscripciones Clase
CREATE INDEX idx_inscripciones_clase ON inscripciones_clase(clase_id);
CREATE INDEX idx_inscripciones_estudiante ON inscripciones_clase(estudiante_id);

-- Inscripciones Grupo
CREATE INDEX idx_inscripciones_grupo ON inscripciones_clase_grupo(clase_grupo_id);
CREATE INDEX idx_inscripciones_grupo_estudiante ON inscripciones_clase_grupo(estudiante_id);

-- Asistencias
CREATE INDEX idx_asistencias_clase ON asistencias(clase_id);
CREATE INDEX idx_asistencias_estudiante ON asistencias(estudiante_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
```

---

## EVENTOS EMITIDOS A OTROS PROCESOS

### A P3 (Gamificación)

```typescript
{
  tipo: 'AsistenciaRegistrada',
  estudiante_id: string,
  clase_id: string,
  fecha: Date,
  estado: 'Presente' // Solo si presente
}
```

### A P6 (Notificaciones)

```typescript
// Clase creada
{ tipo: 'ClaseCreada', destinatario_id, metadata }

// Inscripción creada
{ tipo: 'NuevaInscripcion', destinatario_id, metadata }

// Inscripción cancelada
{ tipo: 'InscripcionCancelada', destinatario_id, metadata }

// Asistencia registrada
{ tipo: 'AsistenciaRegistrada', destinatario_id, metadata }

// Grupo creado
{ tipo: 'GrupoCreado', destinatarios: [], metadata }
```

---

## CASOS DE ERROR Y MANEJO

### Error 1: Clase Sin Cupos

```typescript
if (cupos_ocupados >= cupos_maximo) {
  throw new BadRequestException('No hay cupos disponibles');
}
```

### Error 2: Inscripción Duplicada

```typescript
const existe = await prisma.inscripcionClase.findFirst({
  where: { clase_id, estudiante_id },
});
if (existe) {
  throw new ConflictException('El estudiante ya está inscrito');
}
```

### Error 3: Estudiante No Pertenece al Tutor

```typescript
if (actor === 'TUTOR') {
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudiante_id },
  });
  if (estudiante.tutor_id !== user.id) {
    throw new ForbiddenException('No tienes permisos para inscribir a este estudiante');
  }
}
```

### Error 4: Clase Ya Finalizada

```typescript
if (clase.estado === 'Finalizada') {
  throw new BadRequestException('No se puede modificar una clase finalizada');
}
```

### Error 5: Asistencia Ya Registrada

```typescript
const asistencias = await prisma.asistencia.findMany({
  where: { clase_id },
});
if (asistencias.length > 0) {
  throw new ConflictException('La asistencia ya fue registrada para esta clase');
}
```

---

## RESUMEN DE ESTADO DE IMPLEMENTACIÓN

| Subproceso                   | Backend | Frontend                             | Notas                                        |
| ---------------------------- | ------- | ------------------------------------ | -------------------------------------------- |
| P2.1 Crear Clase             | ✅ 100% | ✅ 100%                              | Funcional end-to-end                         |
| P2.2 Crear Grupo             | ✅ 100% | ⚠️ 50%                               | Backend listo, UI básica                     |
| P2.3 Gestionar Inscripciones | ✅ 100% | ✅ 95%                               | Casi completo                                |
| P2.4 Registrar Asistencia    | ✅ 100% | ✅ 90% (Individual), ⚠️ 50% (Grupos) | Clase individual completo                    |
| P2.5 Consultar Clases        | ✅ 100% | ✅ 95%                               | Funcional                                    |
| P2.6 Sincronizar Calendario  | ⚠️ 75%  | N/A                                  | Funcionalidad básica, mejorar error handling |

---

## PRÓXIMOS PASOS

### Para MVP (26 de Octubre)

1. ✅ Completar UI de grupos recurrentes en Portal Admin
2. ⚠️ Completar registro de asistencia grupos en Portal Docente
3. ⚠️ Mejorar manejo de errores en P2.6

### Post-Lanzamiento

1. Implementar políticas de cancelación avanzadas (24h, 48h)
2. Sistema de lista de espera para clases llenas
3. Reprogramación automática de clases canceladas
4. Analíticas de asistencia por docente/grupo

---

**Fin del DFD Nivel 2 - P2: Gestión de Clases**
