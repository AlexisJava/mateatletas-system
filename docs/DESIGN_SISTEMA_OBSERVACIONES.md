# Sistema de Observaciones Docente - Diseño Completo

## Resumen Ejecutivo

Sistema para que docentes registren observaciones sobre estudiantes de forma estructurada, con soporte para:

- Observaciones individuales y grupales
- Seguimiento y escalamiento
- Notificaciones a administración/pedagogía
- Historial inmutable con seguimientos

---

## 1. Análisis del Dominio

### 1.1 Actores

| Actor         | Puede crear    | Puede ver      | Puede agregar seguimiento | Puede eliminar |
| ------------- | -------------- | -------------- | ------------------------- | -------------- |
| **Docente**   | ✅ Sus propias | ✅ Sus propias | ✅ Sus propias            | ❌ Inmutable   |
| **Admin**     | ❌             | ✅ Todas       | ✅ Todas                  | ❌ Inmutable   |
| **Pedagogía** | ❌             | ✅ Todas       | ✅ Todas                  | ❌ Inmutable   |

> **Nota**: Pedagogía se implementa con flag `es_pedagogo: Boolean` en Admin. La pedagoga (Ayelén) tiene este flag en true. Todos los admins reciben alertas de observaciones urgentes.

### 1.2 Tipos de Observación

```
ACADEMICA     → Sobre desempeño académico
              Ejemplos: "Excelente resolución de problemas"
                       "Dificultad con fracciones"
                       "No entrega tareas"

CONDUCTUAL    → Sobre comportamiento
              Ejemplos: "Interrumpe frecuentemente"
                       "Ayuda a compañeros"
                       "Problemas de atención"

ASISTENCIA    → Sobre patrones de asistencia
              Ejemplos: "Faltó 3 clases seguidas"
                       "Siempre llega tarde"
                       "Mejoró asistencia este mes"

LOGRO         → Reconocimiento positivo
              Ejemplos: "Ganó olimpiada matemáticas"
                       "Mejor promedio del grupo"
                       "Completó ruta de álgebra"

INCIDENTE     → Situación que requiere documentación formal
              Ejemplos: "Conflicto con compañero"
                       "Malestar físico en clase"
                       "Situación familiar delicada"
```

### 1.3 Niveles de Prioridad

```
BAJA      → Informativo, no requiere acción
MEDIA     → Atención recomendada, sin urgencia
ALTA      → Requiere atención pronto
URGENTE   → Requiere acción inmediata
            Auto-notifica a admin/pedagogía
```

### 1.4 Estados del Ciclo de Vida

```
┌─────────┐     agregar        ┌──────────────┐
│ ABIERTA │ ──seguimiento───▶  │ EN_SEGUIMIENTO│
└─────────┘                    └──────────────┘
     │                               │
     │  resolver                     │ resolver
     ▼                               ▼
┌──────────┐                   ┌──────────┐
│ RESUELTA │                   │ RESUELTA │
└──────────┘                   └──────────┘
     │                               │
     │  cerrar                       │ cerrar
     ▼                               ▼
┌─────────┐                    ┌─────────┐
│ CERRADA │                    │ CERRADA │
└─────────┘                    └─────────┘
```

**Transiciones válidas:**

- `ABIERTA` → `EN_SEGUIMIENTO` (al agregar primer seguimiento)
- `ABIERTA` → `RESUELTA` (cerrar sin seguimiento)
- `EN_SEGUIMIENTO` → `RESUELTA` (marcar como resuelta)
- `RESUELTA` → `CERRADA` (archivar definitivamente)
- `RESUELTA` → `EN_SEGUIMIENTO` (reabrir si hay nuevo seguimiento)

---

## 2. Modelo de Datos

### 2.1 Diagrama ER

```
┌────────────────────────────────────────────────────────────────┐
│                        Observacion                              │
├────────────────────────────────────────────────────────────────┤
│ id                    String      PK, CUID                      │
│ docente_id            String      FK → Docente                  │
│ comision_id           String?     FK → Comision (opcional)      │
│ contenido             String      Texto de la observación       │
│ fecha_evento          DateTime    Cuándo ocurrió (puede ser pasado) │
│ tipo                  Enum        Académica/Conductual/etc      │
│ prioridad             Enum        Baja/Media/Alta/Urgente       │
│ requiere_seguimiento  Boolean     Default: false                │
│ notificar_admin       Boolean     Default: false                │
│ notificar_pedagogia   Boolean     Default: false                │
│ estado                Enum        Abierta/EnSeguimiento/etc     │
│ created_at            DateTime    Cuándo se creó el registro    │
│ updated_at            DateTime    Última modificación           │
└────────────────────────────────────────────────────────────────┘
         │                              │
         │ 1:N                          │ N:M
         ▼                              ▼
┌─────────────────────┐    ┌──────────────────────────┐
│ SeguimientoObs      │    │ ObservacionEstudiante    │
├─────────────────────┤    ├──────────────────────────┤
│ id         PK       │    │ observacion_id  PK, FK   │
│ observacion_id FK   │    │ estudiante_id   PK, FK   │
│ autor_id     String │    └──────────────────────────┘
│ autor_tipo   Enum   │
│ contenido    String │
│ created_at DateTime │
└─────────────────────┘
```

### 2.2 Schema Prisma

```prisma
/// Tipos de observación disponibles
enum TipoObservacion {
  Academica
  Conductual
  Asistencia
  Logro
  Incidente

  @@map("tipo_observacion")
}

/// Prioridad de la observación
enum PrioridadObservacion {
  Baja
  Media
  Alta
  Urgente

  @@map("prioridad_observacion")
}

/// Estado del ciclo de vida de la observación
enum EstadoObservacion {
  Abierta
  EnSeguimiento
  Resuelta
  Cerrada

  @@map("estado_observacion")
}

/// Tipo de autor de un seguimiento
enum TipoAutorSeguimiento {
  Docente
  Admin
  Pedagogia

  @@map("tipo_autor_seguimiento")
}

/// Observación de docente sobre estudiante(s)
/// Permite documentar situaciones académicas, conductuales, logros o incidentes
model Observacion {
  /// Identificador único
  id String @id @default(cuid())

  /// Docente que creó la observación
  docente_id String
  docente    Docente @relation(fields: [docente_id], references: [id], onDelete: Cascade)

  /// Comisión/contexto donde ocurrió (opcional)
  /// Si es null, es una observación general del estudiante
  comision_id String?
  comision    Comision? @relation(fields: [comision_id], references: [id], onDelete: SetNull)

  /// Contenido de la observación
  contenido String @db.Text

  /// Fecha en que ocurrió el evento observado
  /// Puede ser diferente a created_at (ej: documentar algo de ayer)
  fecha_evento DateTime

  /// Clasificación
  tipo      TipoObservacion
  prioridad PrioridadObservacion @default(Baja)

  /// Flags de notificación
  requiere_seguimiento Boolean @default(false)
  notificar_admin      Boolean @default(false)
  notificar_pedagogia  Boolean @default(false)

  /// Estado del ciclo de vida
  estado EstadoObservacion @default(Abierta)

  /// Timestamps
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  /// Relaciones
  estudiantes  ObservacionEstudiante[]
  seguimientos SeguimientoObservacion[]

  @@index([docente_id])
  @@index([comision_id])
  @@index([tipo])
  @@index([prioridad])
  @@index([estado])
  @@index([requiere_seguimiento, estado])
  @@index([fecha_evento])
  @@index([created_at])
  @@map("observaciones_docente")
}

/// Relación N:M entre Observación y Estudiante
/// Permite observaciones grupales (múltiples estudiantes)
model ObservacionEstudiante {
  observacion_id String
  estudiante_id  String

  observacion Observacion @relation(fields: [observacion_id], references: [id], onDelete: Cascade)
  estudiante  Estudiante  @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  @@id([observacion_id, estudiante_id])
  @@index([estudiante_id])
  @@map("observaciones_estudiantes")
}

/// Seguimiento agregado a una observación
/// Inmutable: no se puede editar, solo agregar nuevos
model SeguimientoObservacion {
  /// Identificador único
  id String @id @default(cuid())

  /// Observación padre
  observacion_id String
  observacion    Observacion @relation(fields: [observacion_id], references: [id], onDelete: Cascade)

  /// Autor del seguimiento (puede ser docente, admin o pedagogía)
  autor_id   String
  autor_tipo TipoAutorSeguimiento

  /// Contenido del seguimiento
  contenido String @db.Text

  /// Timestamp
  created_at DateTime @default(now())

  @@index([observacion_id])
  @@index([autor_id])
  @@map("seguimientos_observacion")
}
```

---

## 3. Reglas de Negocio

### 3.1 Creación

| Regla      | Descripción                                                             |
| ---------- | ----------------------------------------------------------------------- |
| **RN-001** | Solo DOCENTE puede crear observaciones                                  |
| **RN-002** | Debe incluir al menos 1 estudiante                                      |
| **RN-003** | `fecha_evento` no puede ser futura (máx: hoy 23:59:59)                  |
| **RN-004** | `contenido` mínimo 10 caracteres, máximo 2000                           |
| **RN-005** | Si `prioridad = Urgente`, auto-setear `notificar_admin = true`          |
| **RN-006** | Si `tipo = Incidente`, auto-setear `requiere_seguimiento = true`        |
| **RN-007** | Si `comision_id` presente, validar que docente pertenece a esa comisión |
| **RN-008** | Docente solo puede crear observaciones de estudiantes en sus comisiones |

### 3.2 Seguimiento

| Regla      | Descripción                                                             |
| ---------- | ----------------------------------------------------------------------- |
| **RN-010** | Solo autor original, ADMIN o PEDAGOGIA pueden agregar seguimiento       |
| **RN-011** | Agregar seguimiento cambia estado a `EnSeguimiento` si estaba `Abierta` |
| **RN-012** | No se puede agregar seguimiento a observación `Cerrada`                 |
| **RN-013** | `contenido` del seguimiento mínimo 5 caracteres                         |

### 3.3 Cambio de Estado

| Regla      | Descripción                                                 |
| ---------- | ----------------------------------------------------------- |
| **RN-020** | Solo autor, ADMIN o PEDAGOGIA pueden cambiar estado         |
| **RN-021** | Transiciones válidas según diagrama de estados              |
| **RN-022** | Al marcar `Resuelta`, se registra automáticamente timestamp |
| **RN-023** | Estado `Cerrada` es terminal, no se puede reabrir           |

### 3.4 Eliminación

| Regla      | Descripción                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| **RN-030** | ~~Docente puede eliminar sus propias observaciones~~ **NADIE puede eliminar** |
| **RN-031** | Las observaciones son inmutables para análisis de datos                       |
| **RN-032** | Solo se puede cambiar estado a `Cerrada` para archivar                        |
| **RN-033** | Soft-delete futuro: agregar campo `archived_at` si se necesita ocultar        |

### 3.5 Consultas

| Regla      | Descripción                                                               |
| ---------- | ------------------------------------------------------------------------- |
| **RN-040** | Docente solo ve sus propias observaciones                                 |
| **RN-041** | ADMIN y PEDAGOGIA ven todas las observaciones                             |
| **RN-042** | Por defecto, ordenar por `created_at DESC`                                |
| **RN-043** | Filtros disponibles: tipo, prioridad, estado, fecha, estudiante, comisión |

---

## 4. API Endpoints

### 4.1 CRUD Observaciones

```
POST   /api/observaciones
       Body: CreateObservacionDto
       Response: Observacion
       Roles: DOCENTE

GET    /api/observaciones
       Query: tipo?, prioridad?, estado?, estudianteId?, comisionId?,
              fechaDesde?, fechaHasta?, requiereSeguimiento?, limit?, offset?
       Response: { data: Observacion[], total: number, page: number }
       Roles: DOCENTE, ADMIN

GET    /api/observaciones/:id
       Response: Observacion (con estudiantes y seguimientos)
       Roles: DOCENTE (solo propias), ADMIN

# DELETE NO EXISTE - Las observaciones son inmutables para data analysis
```

### 4.2 Seguimientos

```
POST   /api/observaciones/:id/seguimientos
       Body: { contenido: string }
       Response: SeguimientoObservacion
       Roles: DOCENTE (solo autor), ADMIN

GET    /api/observaciones/:id/seguimientos
       Response: SeguimientoObservacion[]
       Roles: DOCENTE (solo autor), ADMIN
```

### 4.3 Cambio de Estado

```
PATCH  /api/observaciones/:id/estado
       Body: { estado: EstadoObservacion }
       Response: Observacion
       Roles: DOCENTE (solo autor), ADMIN
```

### 4.4 Consultas Específicas

```
GET    /api/observaciones/pendientes
       Response: Observacion[] (requiere_seguimiento=true, estado!=Cerrada)
       Roles: DOCENTE (propias), ADMIN (todas)

GET    /api/estudiantes/:id/observaciones
       Response: Observacion[] (del estudiante específico)
       Roles: DOCENTE (solo sus observaciones del estudiante), ADMIN

GET    /api/comisiones/:id/observaciones
       Response: Observacion[] (de la comisión)
       Roles: DOCENTE (si pertenece), ADMIN
```

---

## 5. DTOs

### 5.1 CreateObservacionDto

```typescript
class CreateObservacionDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un estudiante' })
  @IsString({ each: true })
  estudianteIds: string[];

  @IsOptional()
  @IsString()
  comisionId?: string;

  @IsString()
  @MinLength(10, { message: 'Contenido debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'Contenido no puede exceder 2000 caracteres' })
  contenido: string;

  @IsDateString()
  @MaxDate(new Date(), { message: 'Fecha no puede ser futura' })
  fechaEvento: string;

  @IsEnum(TipoObservacion)
  tipo: TipoObservacion;

  @IsOptional()
  @IsEnum(PrioridadObservacion)
  prioridad?: PrioridadObservacion;

  @IsOptional()
  @IsBoolean()
  requiereSeguimiento?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarPedagogia?: boolean;
}
```

### 5.2 CreateSeguimientoDto

```typescript
class CreateSeguimientoDto {
  @IsString()
  @MinLength(5, { message: 'Seguimiento debe tener al menos 5 caracteres' })
  @MaxLength(1000, { message: 'Seguimiento no puede exceder 1000 caracteres' })
  contenido: string;
}
```

### 5.3 UpdateEstadoDto

```typescript
class UpdateEstadoDto {
  @IsEnum(EstadoObservacion)
  estado: EstadoObservacion;
}
```

### 5.4 FiltrarObservacionesDto

```typescript
class FiltrarObservacionesDto {
  @IsOptional()
  @IsEnum(TipoObservacion)
  tipo?: TipoObservacion;

  @IsOptional()
  @IsEnum(PrioridadObservacion)
  prioridad?: PrioridadObservacion;

  @IsOptional()
  @IsEnum(EstadoObservacion)
  estado?: EstadoObservacion;

  @IsOptional()
  @IsString()
  estudianteId?: string;

  @IsOptional()
  @IsString()
  comisionId?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsBoolean()
  requiereSeguimiento?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
```

---

## 6. Casos de Test

### 6.1 Creación (RED → GREEN)

```typescript
describe('ObservacionesService - Crear', () => {
  describe('Validaciones básicas', () => {
    it('should_create_observation_when_valid_data');
    it('should_create_group_observation_when_multiple_students');
    it('should_fail_when_no_students_provided');
    it('should_fail_when_content_too_short');
    it('should_fail_when_content_too_long');
    it('should_fail_when_fecha_evento_is_future');
  });

  describe('Reglas de negocio automáticas', () => {
    it('should_auto_set_notificar_admin_when_prioridad_urgente');
    it('should_auto_set_requiere_seguimiento_when_tipo_incidente');
    it('should_default_prioridad_to_baja_when_not_provided');
    it('should_default_estado_to_abierta');
  });

  describe('Validaciones de pertenencia', () => {
    it('should_fail_when_docente_not_belongs_to_comision');
    it('should_fail_when_estudiante_not_in_docente_comisiones');
    it('should_allow_observation_without_comision_if_estudiante_in_any_comision');
    it('should_fail_when_estudiante_not_exists');
  });
});
```

### 6.2 Seguimiento (RED → GREEN)

```typescript
describe('ObservacionesService - Seguimiento', () => {
  describe('Creación de seguimiento', () => {
    it('should_add_seguimiento_when_autor_is_owner');
    it('should_add_seguimiento_when_autor_is_admin');
    it('should_fail_when_autor_is_different_docente');
    it('should_fail_when_observacion_is_cerrada');
    it('should_fail_when_contenido_too_short');
  });

  describe('Cambio de estado automático', () => {
    it('should_change_estado_to_en_seguimiento_when_first_seguimiento');
    it('should_keep_estado_en_seguimiento_when_already');
    it('should_reopen_to_en_seguimiento_when_resuelta_and_new_seguimiento');
  });
});
```

### 6.3 Cambio de Estado (RED → GREEN)

```typescript
describe('ObservacionesService - Estado', () => {
  describe('Transiciones válidas', () => {
    it('should_allow_abierta_to_en_seguimiento');
    it('should_allow_abierta_to_resuelta');
    it('should_allow_en_seguimiento_to_resuelta');
    it('should_allow_resuelta_to_cerrada');
    it('should_allow_resuelta_to_en_seguimiento');
  });

  describe('Transiciones inválidas', () => {
    it('should_fail_cerrada_to_any_state');
    it('should_fail_abierta_to_cerrada_directly');
  });

  describe('Permisos', () => {
    it('should_allow_owner_docente_to_change_estado');
    it('should_allow_admin_to_change_estado');
    it('should_fail_when_different_docente');
  });
});
```

### 6.4 Inmutabilidad (RED → GREEN)

```typescript
describe('ObservacionesService - Inmutabilidad', () => {
  describe('No existe endpoint DELETE', () => {
    it('should_not_have_delete_method_in_service');
    it('should_not_have_delete_endpoint_in_controller');
  });

  describe('Archivar observaciones', () => {
    it('should_allow_changing_estado_to_cerrada');
    it('should_hide_cerrada_observations_from_default_list');
    it('should_include_cerrada_observations_when_explicitly_filtered');
  });
});
```

### 6.5 Consultas (RED → GREEN)

```typescript
describe('ObservacionesService - Consultas', () => {
  describe('Listado básico', () => {
    it('should_return_only_own_observations_for_docente');
    it('should_return_all_observations_for_admin');
    it('should_order_by_created_at_desc');
  });

  describe('Filtros', () => {
    it('should_filter_by_tipo');
    it('should_filter_by_prioridad');
    it('should_filter_by_estado');
    it('should_filter_by_estudiante');
    it('should_filter_by_comision');
    it('should_filter_by_fecha_range');
    it('should_filter_by_requiere_seguimiento');
    it('should_combine_multiple_filters');
  });

  describe('Paginación', () => {
    it('should_respect_limit_parameter');
    it('should_respect_offset_parameter');
    it('should_return_total_count');
  });

  describe('Includes', () => {
    it('should_include_estudiantes_on_detail');
    it('should_include_seguimientos_on_detail');
    it('should_include_docente_name');
  });
});
```

### 6.6 Notificaciones (RED → GREEN)

```typescript
describe('ObservacionesService - Notificaciones', () => {
  describe('Creación', () => {
    it('should_create_notification_when_notificar_admin_true');
    it('should_create_notification_when_notificar_pedagogia_true');
    it('should_create_notification_when_prioridad_urgente');
  });

  describe('Seguimiento', () => {
    it('should_notify_owner_when_admin_adds_seguimiento');
    it('should_notify_admin_when_pending_observation_not_followed');
  });
});
```

---

## 7. Estructura de Archivos

```
apps/api/src/observaciones/
├── __tests__/
│   ├── observaciones.service.spec.ts      # Tests unitarios del servicio
│   ├── observaciones.controller.spec.ts   # Tests del controlador
│   └── observaciones.e2e-spec.ts          # Tests de integración
├── dto/
│   ├── create-observacion.dto.ts
│   ├── create-seguimiento.dto.ts
│   ├── update-estado.dto.ts
│   ├── filtrar-observaciones.dto.ts
│   └── index.ts
├── entities/
│   └── observacion.entity.ts              # Tipos de respuesta
├── guards/
│   └── observacion-owner.guard.ts         # Guard para verificar propiedad
├── observaciones.controller.ts
├── observaciones.service.ts
├── observaciones.module.ts
└── README.md
```

---

## 8. Integración con Sistema Existente

### 8.1 Notificaciones

Usar el sistema existente de `Notificacion` agregando nuevo tipo:

```prisma
enum TipoNotificacion {
  // ... existentes ...
  ObservacionUrgente      // Nueva observación urgente
  ObservacionSeguimiento  // Alguien agregó seguimiento a tu observación
  ObservacionPendiente    // Recordatorio de observación sin seguimiento
}
```

### 8.2 Relaciones a agregar en modelos existentes

```prisma
model Docente {
  // ... existente ...
  observaciones Observacion[]
}

model Estudiante {
  // ... existente ...
  observaciones ObservacionEstudiante[]
}

model Comision {
  // ... existente ...
  observaciones Observacion[]
}
```

---

## 9. Migración

### 9.1 Pasos

1. Crear enums en Prisma
2. Crear modelos Observacion, ObservacionEstudiante, SeguimientoObservacion
3. Agregar relaciones a modelos existentes
4. Agregar nuevo TipoNotificacion
5. Ejecutar `prisma migrate dev --name add_observaciones_system`

### 9.2 Script de migración

```bash
npx prisma migrate dev --name add_observaciones_system
npx prisma generate
```

---

## 10. Consideraciones Futuras

- [ ] **Adjuntos**: Permitir subir imágenes/archivos a observaciones
- [ ] **Templates**: Observaciones predefinidas para situaciones comunes
- [ ] **Estadísticas**: Dashboard de observaciones por tipo/estudiante
- [ ] **Exportación**: PDF/Excel de historial de observaciones
- [ ] **Alertas automáticas**: Detectar patrones (ej: 3 faltas seguidas → observación automática)
- [ ] **Integración con tutores**: Opcionalmente compartir ciertas observaciones con tutores
