# Slice #8: Sistema de Asistencia - Resumen

## Estado: ✅ COMPLETADO

Fecha de implementación: 13/10/2025

## Descripción

Sistema completo de registro y seguimiento de asistencia para clases en vivo, con endpoints para que docentes registren asistencia, obtengan estadísticas, y tutores puedan consultar el historial de sus estudiantes.

## Endpoints Implementados

### 1. **POST** `/api/asistencia/clases/:claseId/estudiantes/:estudianteId`
**Marcar o actualizar asistencia de un estudiante**

- **Rol**: Docente
- **Validaciones**:
  - Solo el docente titular de la clase puede marcar asistencia
  - El estudiante debe estar inscrito en la clase
  - Si ya existe un registro, se actualiza en lugar de crear uno nuevo
- **Body**:
```json
{
  "estado": "Presente" | "Ausente" | "Justificado",
  "observaciones": "Llegó puntual y participó activamente",
  "puntos_otorgados": 10
}
```
- **Response**:
```json
{
  "id": "cmgp3dp7j0007xwfot0wfy0am",
  "estudiante": {
    "id": "cmgp3dp1f0001xwfo4wa8n5sa",
    "nombre": "Estudiante",
    "apellido": "Asistencia"
  },
  "estado": "Presente",
  "observaciones": "Llegó puntual y participó activamente",
  "puntos_otorgados": 10,
  "fecha_registro": "2025-10-13T12:10:59.935Z"
}
```

### 2. **GET** `/api/asistencia/clases/:claseId`
**Obtener lista de asistencia de una clase (roster)**

- **Rol**: Docente, Admin
- **Descripción**: Retorna todos los estudiantes inscritos con su estado de asistencia
- **Response**:
```json
{
  "clase": {
    "id": "cmgp3dp4z0003xwfonqoxqlx7"
  },
  "total_inscritos": 1,
  "total_presentes": 1,
  "total_ausentes": 0,
  "total_justificados": 0,
  "lista": [
    {
      "inscripcion_id": "cmgp3dp5s0005xwfoe8z2no8b",
      "estudiante": {
        "id": "cmgp3dp1f0001xwfo4wa8n5sa",
        "nombre": "Estudiante",
        "apellido": "Asistencia",
        "nivel_escolar": "Primaria"
      },
      "estado_asistencia": "Presente",
      "observaciones": "Llegó puntual y participó activamente",
      "puntos_otorgados": 10,
      "asistencia_id": "cmgp3dp7j0007xwfot0wfy0am"
    }
  ]
}
```

### 3. **GET** `/api/asistencia/clases/:claseId/estadisticas`
**Obtener estadísticas de asistencia de una clase**

- **Rol**: Docente, Admin
- **Descripción**: Calcula estadísticas agregadas de asistencia
- **Response**:
```json
{
  "clase_id": "cmgp3dp4z0003xwfonqoxqlx7",
  "total_inscritos": 1,
  "presentes": 1,
  "ausentes": 0,
  "justificados": 0,
  "pendientes": 0,
  "porcentaje_asistencia": 100
}
```

### 4. **GET** `/api/asistencia/estudiantes/:estudianteId`
**Obtener historial de asistencia de un estudiante**

- **Rol**: Tutor, Docente, Admin
- **Query Params (opcionales)**:
  - `clase_id`: Filtrar por clase específica
- **Response**:
```json
{
  "estudiante": {
    "id": "cmgp3dp1f0001xwfo4wa8n5sa",
    "nombre": "Estudiante",
    "apellido": "Asistencia"
  },
  "estadisticas": {
    "total_clases": 1,
    "presentes": 1,
    "ausentes": 0,
    "justificados": 0,
    "porcentaje_asistencia": 100
  },
  "historial": [
    {
      "clase_id": "cmgp3dp4z0003xwfonqoxqlx7",
      "fecha_clase": "2025-10-14T10:00:00.000Z",
      "duracion_minutos": 90,
      "estado_clase": "Programada",
      "estado_asistencia": "Presente",
      "observaciones": "Llegó puntual y participó activamente",
      "puntos_otorgados": 10,
      "fecha_registro": "2025-10-13T12:10:59.935Z"
    }
  ]
}
```

### 5. **GET** `/api/asistencia/docente/resumen`
**Obtener resumen de asistencia del docente**

- **Rol**: Docente
- **Descripción**: Retorna todas las clases del docente con estadísticas de asistencia
- **Response**:
```json
{
  "docente_id": "cmgoeb0j40003xwblmy9c7wyc",
  "total_clases": 4,
  "estadisticas_globales": {
    "total_estudiantes": 6,
    "total_presentes": 1,
    "total_ausentes": 0,
    "total_justificados": 0,
    "porcentaje_asistencia_global": 16.67
  },
  "clases": [
    {
      "clase_id": "cmgoeb0mn0005xwblirgtd5zw",
      "fecha_hora_inicio": "2025-10-14T10:00:00.000Z",
      "duracion_minutos": 60,
      "estado": "Programada",
      "total_inscritos": 3,
      "presentes": 0,
      "ausentes": 0,
      "justificados": 0,
      "pendientes": 3,
      "porcentaje_asistencia": 0
    }
  ]
}
```

## Modelo de Base de Datos

```prisma
model Asistencia {
  id String @id @default(cuid())

  // Relaciones directas con Clase y Estudiante
  clase_id String
  clase Clase @relation(fields: [clase_id], references: [id], onDelete: Cascade)

  estudiante_id String
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  // Campos de asistencia
  estado EstadoAsistencia  // Presente, Ausente, Justificado
  observaciones String?
  puntos_otorgados Int @default(0)

  fecha_registro DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("asistencias")
  @@unique([clase_id, estudiante_id])  // Un registro por estudiante por clase
  @@index([estudiante_id])
  @@index([estado])
}

enum EstadoAsistencia {
  Presente
  Ausente
  Justificado
}
```

## DTOs

### MarcarAsistenciaDto
```typescript
{
  estado: EstadoAsistencia;  // Presente | Ausente | Justificado
  observaciones?: string;
  puntos_otorgados?: number;
}
```

### FiltrarAsistenciaDto
```typescript
{
  clase_id?: string;  // Opcional: filtrar por clase específica
}
```

## Lógica de Negocio

### Marcar Asistencia
1. Verificar que la clase existe
2. Verificar que el docente es el titular de la clase
3. Verificar que el estudiante está inscrito en la clase
4. Buscar si ya existe un registro de asistencia
5. Si existe: actualizar
6. Si no existe: crear nuevo registro

### Obtener Lista de Asistencia
1. Obtener todas las inscripciones de la clase
2. Obtener todas las asistencias de la clase
3. Combinar inscripciones con asistencias usando un Map
4. Calcular totales por estado
5. Retornar lista completa con totales

### Estadísticas
- **Por Clase**: Cuenta presentes, ausentes, justificados y pendientes
- **Por Estudiante**: Calcula porcentaje de asistencia histórico
- **Por Docente**: Agrega estadísticas de todas sus clases

## Testing

### Script de Testing
- **Ubicación**: `/tests/scripts/test-asistencia.sh`
- **Tests**: 13 pasos que validan todo el flujo
- **Estado**: ✅ **100% PASANDO**

### Flujo de Testing
1. ✅ Login de tutor
2. ✅ Crear estudiante
3. ✅ Login/crear docente
4. ✅ Obtener ruta curricular
5. ✅ Programar clase
6. ✅ Inscribir estudiante
7. ✅ Marcar asistencia (Presente)
8. ✅ Obtener lista de asistencia
9. ✅ Obtener estadísticas
10. ✅ Obtener historial de estudiante (como Tutor)
11. ✅ Obtener resumen de docente
12. ✅ Actualizar asistencia (Ausente)
13. ✅ Actualizar asistencia (Justificado)

### Comando de Testing
```bash
chmod +x tests/scripts/test-asistencia.sh
./tests/scripts/test-asistencia.sh
```

## Guards y Seguridad

- **JwtAuthGuard**: Requiere autenticación en todos los endpoints
- **RolesGuard**: Control de acceso basado en roles
- **Validaciones**:
  - Docentes solo pueden marcar asistencia en sus propias clases
  - Tutores solo pueden ver historial de sus propios estudiantes
  - Admin tiene acceso completo

## Issues Resueltos

### Problema Principal: Prisma Schema Mismatch
**Error**: `PrismaClientValidationError` - campos de relación incorrectos

**Causa Raíz**:
- El modelo `Asistencia` tiene relación **directa** con `Clase` y `Estudiante`
- NO tiene relación con `InscripcionClase`
- Usábamos `inscripcion_clase_id` que no existe en el schema

**Solución**:
- Reescribir servicio para usar `clase_id` y `estudiante_id` directamente
- Cambiar estrategia: obtener inscripciones y asistencias por separado
- Combinar usando Maps para eficiencia O(n)

### Lecciones Aprendidas
1. **Verificar Prisma Schema primero**: Siempre leer el schema antes de escribir queries
2. **Relaciones en camelCase**: Prisma genera relaciones en camelCase (ej: `rutaCurricular`, no `ruta_curricular`)
3. **TypeScript no catch schema errors**: `// @ts-nocheck` oculta errores que explotan en runtime
4. **Testing inmediato**: Tests e2e exponen problemas que TypeScript no detecta

## Estructura de Archivos

```
apps/api/src/asistencia/
├── asistencia.controller.ts   # 5 endpoints REST
├── asistencia.service.ts      # Lógica de negocio (453 líneas)
├── asistencia.module.ts       # Módulo NestJS
└── dto/
    ├── marcar-asistencia.dto.ts
    └── filtrar-asistencia.dto.ts

tests/scripts/
└── test-asistencia.sh         # 13 tests E2E
```

## Próximos Pasos

Con Slice #8 completado, tenemos **8/10 slices** implementados:

✅ Slice #1: Autenticación de Tutores
✅ Slice #2: Gestión de Estudiantes
✅ Slice #3: Gamificación (Equipos)
✅ Slice #4: Docentes
✅ Slice #5: Catálogo de Productos
✅ Slice #6: Pagos (MercadoPago)
✅ Slice #7: Clases
✅ Slice #8: **Asistencia**
⏳ Slice #9: Reserva de Clases (siguiente)
⏳ Slice #10: Admin Copilot

## Dependencias

- **Depende de**:
  - Slice #1 (Auth) - Para JwtAuthGuard y roles
  - Slice #2 (Estudiantes) - Para relación con estudiantes
  - Slice #4 (Docentes) - Para docentes que marcan asistencia
  - Slice #7 (Clases) - Para inscripciones y clases

- **Usado por**:
  - Slice #9 (Reserva) - Podría usar estadísticas de asistencia
  - Slice #10 (Admin) - Dashboard de asistencia

## Notas Técnicas

### Eficiencia de Queries
- Usamos `Map` para combinar inscripciones con asistencias en O(n)
- Queries separadas para inscripciones y asistencias (más eficiente que joins complejos)
- Índices en `clase_id`, `estudiante_id` y `estado` para búsquedas rápidas

### Constraint Único
```prisma
@@unique([clase_id, estudiante_id])
```
Garantiza un solo registro de asistencia por estudiante por clase, evitando duplicados.

### Gamificación
El campo `puntos_otorgados` permite integración futura con el sistema de gamificación para premiar asistencia.
