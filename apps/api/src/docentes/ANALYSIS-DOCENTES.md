# Análisis de DocentesService - Fase 2.2

**Fecha**: 2025-11-17
**Archivo**: `src/docentes/docentes.service.ts`
**Líneas actuales**: 927

---

## Métodos Públicos Categorizados

### QUERIES (Lectura) - 4 métodos
1. `findAll(page?, limit?)` - Línea 107 - Lista todos los docentes con paginación
2. `findByEmail(email)` - Línea 142 - Busca docente por email (para autenticación)
3. `findById(id)` - Línea 153 - Busca docente por ID con sectores
4. `getDashboard(docenteId)` - Línea 345 - Dashboard completo del docente (clase inminente, alertas, stats)
5. `getEstadisticasCompletas(docenteId)` - Línea 674 - Estadísticas detalladas (top estudiantes, asistencia, ranking grupos)

### COMMANDS (Escritura) - 5 métodos
1. `create(createDto)` - Línea 38 - Crear docente (con generación de password)
2. `update(id, updateDto)` - Línea 199 - Actualizar docente
3. `remove(id)` - Línea 259 - Eliminar docente (con validación de clases)
4. `reasignarClases(fromDocenteId, toDocenteId)` - Línea 296 - Reasignar clases entre docentes

### STATISTICS - 2 métodos
1. `getDashboard(docenteId)` - Línea 345 - Dashboard con estadísticas en tiempo real
2. `getEstadisticasCompletas(docenteId)` - Línea 674 - Estadísticas detalladas para página de observaciones

---

## Dependencias Inyectadas

```typescript
constructor(private prisma: PrismaService) {}
```

**Dependencias detectadas:**
- `PrismaService` - Base de datos (TODOS los servicios)
- `bcrypt` - Hashing de contraseñas (solo COMMANDS create/update)
- `generateSecurePassword` util - Generación de contraseñas seguras

**✅ NO HAY DEPENDENCIAS CIRCULARES**

---

## Complejidad del Servicio

### Métodos Complejos (>100 líneas)
1. **`getDashboard()`** - Líneas 345-662 (317 líneas)
   - Calcula clase inminente de hoy
   - Obtiene stats resumen (clases hoy/semana, asistencia promedio)
   - Genera alertas (estudiantes con faltas)
   - Retorna clases del día con estudiantes
   - Retorna grupos completos del docente
   - **Problema**: Mezcla queries + lógica de negocio + transformaciones

2. **`getEstadisticasCompletas()`** - Líneas 674-927 (253 líneas)
   - Top 10 estudiantes por puntos (gamificación)
   - Estudiantes con asistencia perfecta
   - Estudiantes sin tareas
   - Ranking de grupos por puntos totales
   - **Problema**: God Method que hace 4 cálculos diferentes

### Métodos con Lógica de Negocio
1. **`create()`** - Línea 38
   - Validación de email duplicado
   - Generación automática de password si no se provee
   - Hashing de password
   - Flag `debe_cambiar_password` automático
   - Retorna `generatedPassword` si se auto-generó

2. **`remove()`** - Línea 259
   - Validación de existencia
   - Validación de clases asignadas (no se puede eliminar si tiene clases)
   - Mensaje de error detallado

3. **`reasignarClases()`** - Línea 296
   - Validación de ambos docentes
   - Validación de no reasignar al mismo docente
   - Actualización masiva de clases

---

## Distribución Propuesta

### DocenteBusinessValidator (150 líneas estimadas)
**Responsabilidad**: Validaciones de negocio reutilizables

**Métodos:**
- `validarDocenteExiste(id)` - Verificar existencia
- `validarEmailUnico(email, excludeId?)` - Email no duplicado
- `validarDocenteTieneClases(docenteId)` - Verificar clases asignadas
- `validarPasswordSegura(password)` - Validar contraseña (opcional, podría usarse para updates)
- `validarReasignacionValida(fromId, toId)` - Validar que ambos existen y no son el mismo

**Dependencias:**
- PrismaService

---

### DocenteQueryService (200 líneas estimadas)
**Responsabilidad**: Operaciones de lectura/búsqueda

**Métodos:**
- `findAll(page?, limit?)` - Lista con paginación
- `findByEmail(email)` - Buscar por email (para auth)
- `findById(id)` - Buscar por ID con sectores
- `findByIds(ids)` - Buscar múltiples docentes (helper interno)

**Dependencias:**
- PrismaService

---

### DocenteCommandService (250 líneas estimadas)
**Responsabilidad**: Operaciones de escritura (Create, Update, Delete)

**Métodos:**
- `create(createDto)` - Crear docente
- `update(id, updateDto)` - Actualizar docente
- `remove(id)` - Eliminar docente
- `reasignarClases(fromDocenteId, toDocenteId)` - Reasignar clases

**Helpers privados:**
- `generarYHashearPassword(password?)` - Generar/hashear contraseña
- `excluirPasswordHash(docente)` - Eliminar password_hash de respuesta

**Dependencias:**
- PrismaService
- DocenteBusinessValidator (para validaciones)
- bcrypt (para hashing)
- generateSecurePassword util

**Eventos a emitir:**
- `docente.created` - Cuando se crea docente
- `docente.updated` - Cuando se actualiza docente
- `docente.deleted` - Cuando se elimina docente

---

### DocenteStatsService (350 líneas estimadas)
**Responsabilidad**: Estadísticas y reportes del docente

**Métodos:**
- `getDashboard(docenteId)` - Dashboard completo
- `getEstadisticasCompletas(docenteId)` - Estadísticas detalladas
- `calcularClaseInminente(docenteId)` - Helper privado
- `calcularStatsResumen(docenteId)` - Helper privado
- `obtenerClasesDelDia(docenteId, dia)` - Helper privado
- `obtenerAlertasActivas(docenteId)` - Helper privado
- `calcularTopEstudiantesPorPuntos(estudiantesIds, limit)` - Helper privado
- `calcularAsistenciaPorEstudiante(estudiantesIds, docenteId)` - Helper privado
- `calcularRankingGrupos(gruposIds)` - Helper privado

**Dependencias:**
- PrismaService
- DocenteBusinessValidator (para validar existencia)

---

### DocentesFacade (100 líneas estimadas)
**Responsabilidad**: Fachada que unifica Query, Command y Stats

**Métodos (todos delegación):**
- `create(createDto)` → CommandService
- `update(id, updateDto)` → CommandService
- `remove(id)` → CommandService
- `reasignarClases(fromId, toId)` → CommandService
- `findAll(page?, limit?)` → QueryService
- `findByEmail(email)` → QueryService
- `findById(id)` → QueryService
- `getDashboard(docenteId)` → StatsService
- `getEstadisticasCompletas(docenteId)` → StatsService

**Dependencias:**
- DocenteQueryService
- DocenteCommandService
- DocenteStatsService

---

## Métricas Objetivo

| Servicio | Líneas objetivo | Responsabilidades |
|----------|----------------|-------------------|
| DocentesService (Facade) | ~100 | Orquestación |
| DocenteQueryService | ~200 | Queries |
| DocenteCommandService | ~250 | Commands |
| DocenteStatsService | ~350 | Statistics |
| DocenteBusinessValidator | ~150 | Business validation |
| **TOTAL** | **~1,050** | **5 servicios** |

**Reducción por servicio**: -84% (de 927 a ~210 líneas promedio)

---

## Orden de Implementación

1. ✅ DocenteBusinessValidator (más simple, sin dependencias complejas)
2. ✅ DocenteQueryService (solo lectura, sin side effects)
3. ✅ DocenteCommandService (escritura, usa validator)
4. ✅ DocenteStatsService (usa validator, queries complejas)
5. ✅ DocentesFacade (orquesta todo)
6. ✅ DocentesService (actualizar para usar facade)

---

## Casos Especiales a Considerar

### 1. Generación de Contraseñas
- `create()` genera contraseña automática si no se provee
- Retorna `generatedPassword` en la respuesta si se generó
- Flag `debe_cambiar_password` se activa automáticamente
- Guardar `password_temporal` solo si se auto-generó

### 2. Exclusión de Password Hash
- TODOS los métodos deben excluir `password_hash` de la respuesta
- Solo `findByEmail()` retorna password_hash (para auth)
- Helper `excluirPasswordHash()` reutilizable

### 3. Validación de Eliminación
- No se puede eliminar docente con clases asignadas
- Mensaje de error debe indicar cuántas clases tiene
- Sugerir reasignar clases primero

### 4. Queries con Raw SQL
- `getDashboard()` usa `prisma.$queryRaw` para estudiantes con faltas
- `getEstadisticasCompletas()` usa `prisma.$queryRaw` para estudiantes con faltas
- Mantener estas queries en StatsService

### 5. Cálculo de Clase Inminente
- Solo considerar clases de hoy (dia_semana actual)
- Ventana de tiempo: -10 minutos a +60 minutos
- Calcular fecha/hora combinando fecha actual + hora_inicio de ClaseGrupo

---

## Verificación Final

**Criterios de éxito:**
- ✅ DocentesService < 150 líneas
- ✅ Cada servicio especializado < 350 líneas
- ✅ 0 dependencias circulares (madge)
- ✅ 50+ tests para módulo docentes
- ✅ 900+ tests totales pasando
- ✅ API externa idéntica (0 breaking changes)

---

## Plan de Testing

### DocenteBusinessValidator (15 tests)
- ✅ Validar docente existe (éxito)
- ✅ Validar docente no existe (error)
- ✅ Validar email único (éxito)
- ✅ Validar email duplicado (error)
- ✅ Validar email único excluyendo propio ID (update)
- ✅ Validar docente con clases (error)
- ✅ Validar docente sin clases (éxito)
- ✅ Validar reasignación válida (éxito)
- ✅ Validar reasignación mismo docente (error)
- ✅ Validar reasignación docente origen no existe (error)
- ✅ Validar reasignación docente destino no existe (error)

### DocenteQueryService (12 tests)
- ✅ findAll - sin paginación
- ✅ findAll - con paginación
- ✅ findAll - excluye password_hash
- ✅ findByEmail - existe
- ✅ findByEmail - no existe
- ✅ findByEmail - incluye password_hash (para auth)
- ✅ findById - existe
- ✅ findById - no existe (NotFoundException)
- ✅ findById - excluye password_hash
- ✅ findById - incluye sectores únicos

### DocenteCommandService (20 tests)
- ✅ create - con password proporcionada
- ✅ create - auto-generar password
- ✅ create - retorna generatedPassword si se generó
- ✅ create - email duplicado (ConflictException)
- ✅ create - excluye password_hash
- ✅ create - flag debe_cambiar_password = true si se generó
- ✅ create - flag debe_cambiar_password = false si se proporcionó
- ✅ update - datos básicos
- ✅ update - cambiar email válido
- ✅ update - cambiar email duplicado (ConflictException)
- ✅ update - docente no existe (NotFoundException)
- ✅ update - actualizar password (hashea correctamente)
- ✅ update - excluye password_hash
- ✅ remove - docente sin clases (éxito)
- ✅ remove - docente con clases (ConflictException)
- ✅ remove - docente no existe (NotFoundException)
- ✅ reasignarClases - válido
- ✅ reasignarClases - mismo docente (ConflictException)
- ✅ reasignarClases - origen no existe (NotFoundException)
- ✅ reasignarClases - destino no existe (NotFoundException)

### DocenteStatsService (8 tests)
- ✅ getDashboard - estructura completa
- ✅ getDashboard - clase inminente existe
- ✅ getDashboard - clase inminente null
- ✅ getDashboard - stats resumen correctos
- ✅ getDashboard - docente no existe (NotFoundException)
- ✅ getEstadisticasCompletas - estructura completa
- ✅ getEstadisticasCompletas - top estudiantes por puntos
- ✅ getEstadisticasCompletas - ranking grupos

**Total: ~55 tests**

---

## Próximos Pasos

1. Crear DocenteBusinessValidator + tests
2. Crear DocenteQueryService + tests
3. Crear DocenteCommandService + tests
4. Crear DocenteStatsService + tests
5. Crear DocentesFacade (delegación pura)
6. Actualizar DocentesModule (providers)
7. Actualizar DocentesService (usar facade)
8. Ejecutar madge (0 circulares)
9. Ejecutar todos los tests (100% passing)
10. Eliminar código viejo si hay duplicación
11. Commit con mensaje descriptivo

---

**Duración estimada**: 5-6 horas
**Impacto**: Reducción de 927 → ~210 líneas promedio por servicio
**Breaking changes**: 0 (API externa idéntica)
