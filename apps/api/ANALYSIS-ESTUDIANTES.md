# Análisis de EstudiantesService - Fase 2.2

**Fecha**: 2025-11-13
**Archivo**: `src/estudiantes/estudiantes.service.ts`
**Líneas actuales**: 1,293

---

## Métodos Públicos Categorizados

### QUERIES (Lectura) - 10 métodos

1. `findAllByTutor(tutorId, query?)` - Línea 124 - Lista estudiantes de un tutor
2. `findOneById(id)` - Línea 182 - Busca estudiante por ID (sin ownership check)
3. `findOne(id, tutorId)` - Línea 286 - Busca estudiante verificando ownership
4. `findAll(page, limit)` - Línea 448 - Lista todos (admin/docente)
5. `countByTutor(tutorId)` - Línea 389 - Cuenta estudiantes de tutor
6. `getDetalleCompleto(estudianteId, tutorId)` - Línea 521 - Detalle completo con stats
7. `obtenerClasesDisponiblesParaEstudiante(estudianteId)` - Línea 983 - Clases disponibles
8. `obtenerProximaClase(estudianteId)` - Línea 1019 - Próxima clase del estudiante
9. `obtenerCompanerosDeClase(estudianteId)` - Línea 1172 - Compañeros de clase
10. `obtenerMisSectores(estudianteId)` - Línea 1221 - Sectores del estudiante

### COMMANDS (Escritura) - 7 métodos

1. `create(tutorId, createDto)` - Línea 74 - Crear estudiante
2. `update(id, tutorId, updateDto)` - Línea 320 - Actualizar estudiante
3. `remove(id, tutorId)` - Línea 372 - Eliminar estudiante
4. `updateAnimacionIdle(id, animacion_idle_url)` - Línea 258 - Actualizar animación
5. `updateAvatarGradient(id, gradientId)` - Línea 490 - Actualizar avatar gradient
6. `crearEstudiantesConTutor(dto)` - Línea 611 - Creación masiva con tutor
7. `asignarClaseAEstudiante(estudianteId, claseId)` - Línea 822 - Asignar a clase
8. `asignarClasesAEstudiante(estudianteId, clasesIds)` - Línea 895 - Asignar múltiples

### COPY OPERATIONS - 2 métodos

1. `copiarEstudianteASector(estudianteId, nuevoSectorId)` - Línea 722 - Copiar a sector
2. `copiarEstudiantePorDNIASector(email, nuevoSectorId)` - Línea 796 - Copiar por DNI

### STATISTICS - 1 método

1. `getEstadisticas(tutorId)` - Línea 400 - Estadísticas del tutor

### HELPERS PRIVADOS - 1 método

1. `generarUsernameUnico(nombre, apellido, sufijo?)` - Línea 45 - Generar username único

---

## Dependencias Inyectadas

```typescript
constructor(
  private prisma: PrismaService,
  @Inject(forwardRef(() => LogrosService)) private logrosService: LogrosService,
)
```

**Dependencias detectadas:**

- `PrismaService` - Base de datos (TODOS los servicios)
- `LogrosService` - Gamificación (solo COMMANDS que crean estudiantes)

**⚠️ CIRCULAR DEPENDENCY DETECTADA**:

- `LogrosService` con `forwardRef` - Debe manejarse con eventos

---

## Distribución Propuesta

### EstudianteQueryService (250 líneas estimadas)

**Responsabilidad**: Operaciones de lectura/búsqueda

**Métodos:**

- findAllByTutor()
- findOneById()
- findOne()
- findAll()
- countByTutor()
- getDetalleCompleto()
- obtenerClasesDisponiblesParaEstudiante()
- obtenerProximaClase()
- obtenerCompanerosDeClase()
- obtenerMisSectores()

**Dependencias:**

- PrismaService

---

### EstudianteCommandService (300 líneas estimadas)

**Responsabilidad**: Operaciones de escritura (Create, Update, Delete)

**Métodos:**

- create()
- update()
- remove()
- updateAnimacionIdle()
- updateAvatarGradient()
- crearEstudiantesConTutor()
- asignarClaseAEstudiante()
- asignarClasesAEstudiante()

**Helpers privados:**

- generarUsernameUnico() (mover aquí)

**Dependencias:**

- PrismaService
- EventEmitter2 (para emitir eventos en lugar de llamar LogrosService)

---

### EstudianteCopyService (200 líneas estimadas)

**Responsabilidad**: Operaciones de copia entre sectores

**Métodos:**

- copiarEstudianteASector()
- copiarEstudiantePorDNIASector()

**Dependencias:**

- PrismaService
- EstudianteCommandService (para crear la copia)

---

### EstudianteStatsService (150 líneas estimadas)

**Responsabilidad**: Estadísticas y reportes

**Métodos:**

- getEstadisticas()

**Dependencias:**

- PrismaService

---

### EstudianteBusinessValidator (120 líneas estimadas)

**Responsabilidad**: Validaciones de negocio

**Métodos a extraer:**

- validateTutorExists(tutorId)
- validateEquipoExists(equipoId)
- validateEdad(edad)
- validateOwnership(estudianteId, tutorId)

**Dependencias:**

- PrismaService

---

## Eliminación de Dependencia Circular

**PROBLEMA ACTUAL (línea 36-37):**

```typescript
@Inject(forwardRef(() => LogrosService))
private logrosService: LogrosService,
```

**SOLUCIÓN:**

1. En `EstudianteCommandService.create()`:
   - Emitir evento `estudiante.created` con EventEmitter2
   - GamificacionModule escuchará y asignará casa/logros

2. Eliminar `@Inject(forwardRef())` completamente
3. Inyectar `EventEmitter2` en CommandService

**Eventos a emitir:**

- `estudiante.created` - Cuando se crea estudiante
- `estudiante.updated` - Cuando se actualiza estudiante
- `estudiante.deleted` - Cuando se elimina estudiante

---

## Métricas Objetivo

| Servicio                    | Líneas objetivo | Responsabilidades   |
| --------------------------- | --------------- | ------------------- |
| EstudiantesService (Facade) | ~150            | Orquestación        |
| EstudianteQueryService      | ~250            | Queries             |
| EstudianteCommandService    | ~300            | Commands            |
| EstudianteCopyService       | ~200            | Copy operations     |
| EstudianteStatsService      | ~150            | Statistics          |
| EstudianteBusinessValidator | ~120            | Business validation |
| **TOTAL**                   | **~1,170**      | **6 servicios**     |

**Reducción por servicio**: -84% (de 1,293 a ~195 líneas promedio)

---

## Orden de Implementación

1. ✅ EstudianteBusinessValidator (más simple, sin dependencias complejas)
2. ✅ EstudianteQueryService (solo lectura, sin side effects)
3. ✅ EstudianteStatsService (solo lectura, usa queries)
4. ✅ EstudianteCommandService (escritura, emite eventos)
5. ✅ EstudianteCopyService (usa CommandService)
6. ✅ EstudiantesService (Facade, orquesta todo)

---

## Verificación Final

**Criterios de éxito:**

- ✅ EstudiantesService < 200 líneas
- ✅ Cada servicio especializado < 300 líneas
- ✅ 0 dependencias circulares (madge)
- ✅ 60+ tests para módulo estudiantes
- ✅ 850+ tests totales pasando
- ✅ API externa idéntica (0 breaking changes)
