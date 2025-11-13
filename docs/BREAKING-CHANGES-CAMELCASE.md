# 🔄 Breaking Changes: Normalización snake_case → camelCase

**Fecha**: 2025-11-12
**Versión**: 2.0.0 (Breaking Change Major)
**Estado**: ✅ Completado (Fase 1 - DTOs críticos)

---

## 📊 Resumen Ejecutivo

Se normalizó la nomenclatura de campos en DTOs y modelos de Prisma de **snake_case** a **camelCase** para seguir las convenciones estándar de JavaScript/TypeScript.

### Impacto

- ✅ **DTOs normalizados**: 69 archivos
- ✅ **Campos renombrados**: ~80+ campos
- ✅ **Tests actualizados**: 70 tests de validación + tests de integración
- ✅ **Compatibilidad de BD**: Preservada mediante `@map()` de Prisma
- ⚠️ **Breaking Change**: El frontend debe actualizar las peticiones HTTP

---

## 🎯 Campos Normalizados

### Estudiantes (Crítico - Completado 100%)

| Campo Anterior | Campo Nuevo | Ubicación |
|----------------|-------------|-----------|
| `nivel_escolar` | `nivelEscolar` | CreateEstudianteDto, QueryEstudiantesDto, Entity, Service |
| `foto_url` | `fotoUrl` | CreateEstudianteDto, Entity |
| `avatar_url` | `avatarUrl` | CreateEstudianteDto, Entity, Service, Controller |
| `equipo_id` | `equipoId` | CreateEstudianteDto, QueryEstudiantesDto, Entity, Service |

### DTOs Generales (Completado en 69 archivos)

| Patrón Anterior | Patrón Nuevo | Archivos Afectados |
|-----------------|--------------|-------------------|
| `estudiante_id:` | `estudianteId:` | Asistencia, Admin, Clases |
| `docente_id:` | `docenteId:` | Admin, Clases, Docentes |
| `clase_id:` | `claseId:` | Asistencia, Eventos |
| `grupo_id:` | `grupoId:` | Admin, Clases |
| `sector_id:` | `sectorId:` | Admin, Estudiantes |
| `tutor_id:` | `tutorId:` | DTOs generales |
| `inscripcion_id:` | `inscripcionId:` | Inscripciones 2026 |
| `curso_id:` | `cursoId:` | Cursos, Pagos |
| `course_id:` | `courseId:` | Inscripciones 2026 |
| `icono_url:` | `iconoUrl:` | Equipos |
| `tutor_nombre:` | `tutorNombre:` | Admin |
| `ruta_curricular_id:` | `rutaCurricularId:` | Admin |
| `logro_desbloqueable_id:` | `logroDesbloqueableId:` | Cursos |
| `leccion_prerequisito_id:` | `leccionPrerrequisitoId:` | Cursos |
| `clase_relacionada_id:` | `claseRelacionadaId:` | Eventos |
| `estudiante_relacionado_id:` | `estudianteRelacionadoId:` | Eventos |
| `producto_id:` | `productoId:` | Pagos, Clases |
| `user_id:` | `userId:` | Pagos (MercadoPago) |
| `mercadopago_preference_id:` | `mercadopagoPreferenceId:` | Inscripciones 2026 |

---

## 🗄️ Cambios en Prisma Schema

### Estrategia: `@map()` para Compatibilidad

Se usó `@map()` en Prisma para mantener los nombres de columnas en la BD mientras se renombra en el código:

```prisma
model Estudiante {
  // ANTES:
  // nivel_escolar String

  // DESPUÉS (código usa camelCase, BD mantiene snake_case):
  nivelEscolar String @map("nivel_escolar")
  avatarUrl    String? @map("avatar_url") @db.Text
  fotoUrl      String? @map("foto_url")
  equipoId     String? @map("equipo_id")

  // Relaciones actualizadas:
  equipo Equipo? @relation(fields: [equipoId], references: [id])
}
```

**Ventaja**: No se requiere migración de base de datos, solo regenerar Prisma Client.

---

## 📝 Cambios Requeridos en Frontend

### Antes (snake_case)

```typescript
// ❌ DEPRECADO
const estudiante = {
  nombre: 'Juan',
  apellido: 'Pérez',
  edad: 10,
  nivel_escolar: 'Primaria',  // ❌
  foto_url: 'https://...',     // ❌
  avatar_url: 'https://...',   // ❌
  equipo_id: 'uuid-123'        // ❌
}

const query = {
  equipo_id: 'uuid-123',       // ❌
  nivel_escolar: 'Primaria'    // ❌
}
```

### Después (camelCase)

```typescript
// ✅ NUEVO FORMATO
const estudiante = {
  nombre: 'Juan',
  apellido: 'Pérez',
  edad: 10,
  nivelEscolar: 'Primaria',    // ✅
  fotoUrl: 'https://...',      // ✅
  avatarUrl: 'https://...',    // ✅
  equipoId: 'uuid-123'         // ✅
}

const query = {
  equipoId: 'uuid-123',        // ✅
  nivelEscolar: 'Primaria'     // ✅
}
```

---

## 🧪 Tests Actualizados

### Tests de Validación (70 tests - ✅ Todos pasando)

- ✅ `create-estudiante.dto.spec.ts` - 25 tests
- ✅ `register.dto.spec.ts` - 29 tests
- ✅ `change-password.dto.spec.ts` - 16 tests

### Tests de Integración

- ✅ `estudiantes.integration.spec.ts` - 34 tests (actualizados)
- ✅ `clases.integration.spec.ts` - 28 tests (sin cambios necesarios)

---

## 🚀 Migración del Frontend

### Paso 1: Actualizar Tipos TypeScript

```typescript
// src/types/estudiante.ts

export interface CreateEstudianteRequest {
  nombre: string
  apellido: string
  edad: number
  nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad'  // ✅ Actualizado
  fotoUrl?: string          // ✅ Actualizado
  avatarUrl?: string        // ✅ Actualizado
  equipoId?: string         // ✅ Actualizado
}

export interface QueryEstudiantesParams {
  equipoId?: string         // ✅ Actualizado
  nivelEscolar?: string     // ✅ Actualizado
  page?: number
  limit?: number
}
```

### Paso 2: Actualizar Llamadas API

```typescript
// ANTES
const response = await axios.post('/api/estudiantes', {
  nombre: 'Juan',
  nivel_escolar: 'Primaria',  // ❌
  equipo_id: equipoId         // ❌
})

// DESPUÉS
const response = await axios.post('/api/estudiantes', {
  nombre: 'Juan',
  nivelEscolar: 'Primaria',   // ✅
  equipoId: equipoId          // ✅
})
```

### Paso 3: Actualizar Query Params

```typescript
// ANTES
const params = new URLSearchParams({
  equipo_id: equipoId,       // ❌
  nivel_escolar: 'Primaria'  // ❌
})

// DESPUÉS
const params = new URLSearchParams({
  equipoId: equipoId,        // ✅
  nivelEscolar: 'Primaria'   // ✅
})
```

### Paso 4: Actualizar Respuestas del Backend

```typescript
// Las respuestas del backend ahora devuelven camelCase
interface EstudianteResponse {
  id: string
  nombre: string
  apellido: string
  edad: number
  nivelEscolar: string       // ✅ Cambió de nivel_escolar
  fotoUrl?: string           // ✅ Cambió de foto_url
  avatarUrl?: string         // ✅ Cambió de avatar_url
  equipoId?: string          // ✅ Cambió de equipo_id
  createdAt: string
  updatedAt: string
}
```

---

## ⚠️ Advertencias y Consideraciones

### 1. Compatibilidad con Versiones Anteriores

**NO** hay compatibilidad hacia atrás. El frontend debe actualizar todas las referencias antes de desplegar.

### 2. Endpoints Afectados

Todos los endpoints que aceptan o devuelven estos campos:

- `POST /api/estudiantes` - Crear estudiante
- `PATCH /api/estudiantes/:id` - Actualizar estudiante
- `GET /api/estudiantes` - Listar estudiantes (query params)
- `GET /api/estudiantes/:id` - Obtener estudiante
- `PATCH /api/estudiantes/:id/avatar` - Actualizar avatar 3D
- Y **69 DTOs más** en módulos de Admin, Clases, Asistencia, etc.

### 3. Sincronización de Despliegue

1. **Backend primero**: Desplegar backend con cambios
2. **Frontend inmediatamente después**: Desplegar frontend actualizado
3. **Evitar**: Despliegues parciales que causen incompatibilidad

---

## ✅ Checklist de Migración

### Backend (✅ Completado)

- [x] Actualizar CreateEstudianteDto
- [x] Actualizar QueryEstudiantesDto
- [x] Actualizar UpdateEstudianteDto (hereda de Create)
- [x] Actualizar Prisma schema con `@map()`
- [x] Regenerar Prisma Client
- [x] Actualizar estudiantes.service.ts
- [x] Actualizar estudiantes.controller.ts
- [x] Actualizar estudiante.entity.ts
- [x] Actualizar 69 DTOs adicionales
- [x] Actualizar tests de validación
- [x] Actualizar tests de integración
- [x] Ejecutar suite de tests (70/70 pasando)

### Frontend (⏸️ Pendiente)

- [ ] Actualizar tipos TypeScript en `src/types/`
- [ ] Actualizar llamadas API en servicios
- [ ] Actualizar formularios de creación/edición
- [ ] Actualizar query params de filtros
- [ ] Actualizar transformación de respuestas
- [ ] Probar flujo completo en desarrollo
- [ ] Ejecutar tests E2E del frontend
- [ ] Desplegar a producción

---

## 🔍 Verificación Post-Despliegue

### Tests Manuales

1. **Crear estudiante nuevo**:
   ```bash
   curl -X POST https://api.mateatletas.com/api/estudiantes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "nombre": "Test",
       "apellido": "Usuario",
       "edad": 10,
       "nivelEscolar": "Primaria",
       "equipoId": "uuid-123"
     }'
   ```

2. **Listar con filtros**:
   ```bash
   curl "https://api.mateatletas.com/api/estudiantes?nivelEscolar=Primaria&equipoId=uuid-123" \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Actualizar avatar**:
   ```bash
   curl -X PATCH https://api.mateatletas.com/api/estudiantes/uuid-123/avatar \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"avatarUrl": "https://models.readyplayer.me/abc.glb"}'
   ```

### Verificar Respuestas

Todas las respuestas deben devolver campos en camelCase:

```json
{
  "data": {
    "id": "...",
    "nombre": "Test",
    "apellido": "Usuario",
    "edad": 10,
    "nivelEscolar": "Primaria",
    "fotoUrl": null,
    "avatarUrl": "https://...",
    "equipoId": "uuid-123"
  }
}
```

---

## 📚 Archivos Modificados

### DTOs Críticos

- `src/estudiantes/dto/create-estudiante.dto.ts`
- `src/estudiantes/dto/query-estudiantes.dto.ts`
- `src/estudiantes/dto/update-estudiante.dto.ts`
- `src/estudiantes/dto/crear-estudiantes-con-tutor.dto.ts`

### Servicios y Controllers

- `src/estudiantes/estudiantes.service.ts`
- `src/estudiantes/estudiantes.controller.ts`
- `src/estudiantes/entities/estudiante.entity.ts`

### Tests

- `src/estudiantes/dto/__tests__/create-estudiante.dto.spec.ts`
- `test/integration/estudiantes.integration.spec.ts`

### Schema y Configuración

- `prisma/schema.prisma` (modelo Estudiante)
- 69 archivos DTO adicionales normalizados

---

## 🐛 Troubleshooting

### Error: "nivel_escolar is not allowed"

**Causa**: Frontend enviando snake_case
**Solución**: Actualizar frontend a camelCase

### Error: "Cannot read property 'nivelEscolar' of undefined"

**Causa**: Código aún usando snake_case
**Solución**: Buscar y reemplazar todos los usos de campos antiguos

### Error 400: Validation failed

**Causa**: Request con campos en snake_case
**Solución**: Verificar que el payload use camelCase

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisar esta documentación
2. Verificar los tests de validación: `npm test -- create-estudiante.dto.spec.ts`
3. Revisar los logs del backend para errores de validación
4. Consultar el schema de Prisma actualizado

---

**Última actualización**: 2025-11-12
**Versión del documento**: 1.0
**Estado**: Producción Ready ✅
