# 📊 ANÁLISIS Y DISEÑO - Refactor ClasesManagementService

**Fecha:** 2025-11-14
**Archivo origen:** `apps/api/src/clases/services/clases-management.service.ts`
**Líneas actuales:** 849 líneas
**Métodos actuales:** 15 métodos
**Patrón objetivo:** CQRS + Facade Pattern

---

## 🎯 Objetivo

Refactorizar `ClasesManagementService` aplicando el mismo patrón exitoso usado en `EstudiantesService`:
- ✅ **Fase 2.2:** EstudiantesService refactorizado (1,293 → 6 servicios)
- 🔄 **Fase 2.2b:** ClasesManagementService refactorizar (849 → 5 servicios)

---

## 📋 Sección 1: Inventario de Métodos Actuales

| # | Método | Líneas | Tipo | Dependencias |
|---|--------|--------|------|--------------|
| 1 | `programarClase()` | ~120 | Command | Prisma, Validator |
| 2 | `cancelarClase()` | ~100 | Command | Prisma, Notificaciones |
| 3 | `eliminarClase()` | ~40 | Command | Prisma |
| 4 | `listarTodasLasClases()` | ~80 | Query | Prisma |
| 5 | `listarClasesParaTutor()` | ~70 | Query | Prisma |
| 6 | `obtenerCalendarioTutor()` | ~90 | Query | Prisma |
| 7 | `listarClasesDeDocente()` | ~30 | Query | Prisma |
| 8 | `obtenerClase()` | ~50 | Query | Prisma |
| 9 | `listarRutasCurriculares()` | ~35 | Query | Prisma, Cache |
| 10 | `obtenerRutaCurricularPorId()` | ~30 | Query | Prisma, Cache |
| 11 | `asignarEstudiantesAClase()` | ~120 | Command | Prisma, Validator |
| 12 | `obtenerEstudiantesDeClase()` | ~80 | Query | Prisma |
| 13-15 | Validaciones internas | ~4 | Validation | - |

**Total:** 849 líneas

---

## 🏗️ Sección 2: Categorización CQRS

### 🛡️ ClaseBusinessValidator (validaciones puras)

Validaciones extraídas de los métodos actuales:

```typescript
// Desde programarClase()
- validarRutaCurricularExiste(rutaCurricularId: string)
- validarDocenteExiste(docenteId: string)
- validarSectorExiste(sectorId: string)
- validarProductoEsCurso(productoId: string)
- validarFechaFutura(fecha: Date)

// Desde cancelarClase()
- validarPermisosCancelacion(clase, userId, userRole)
- validarClaseNoCancelada(clase)

// Desde asignarEstudiantesAClase()
- validarCuposDisponibles(clase, cantidadEstudiantes)
- validarEstudiantesExisten(estudianteIds: string[])
- validarEstudiantesNoInscritos(clase, estudianteIds)
- validarClaseActiva(clase)
```

**Total:** ~150 líneas, 11 métodos de validación

---

### 📖 ClaseQueryService (solo lectura)

| Método | Descripción | Líneas | Cache | Paginación |
|--------|-------------|--------|-------|------------|
| `listarTodasLasClases()` | Lista con filtros y paginación | ~80 | ❌ | ✅ |
| `listarClasesParaTutor()` | Clases disponibles según inscripciones | ~70 | ❌ | ❌ |
| `obtenerCalendarioTutor()` | Clases del mes con estudiantes inscritos | ~90 | ❌ | ❌ |
| `listarClasesDeDocente()` | Clases de un docente específico | ~30 | ❌ | ❌ |
| `obtenerClase()` | Detalle completo con includes | ~50 | ❌ | ❌ |
| `listarRutasCurriculares()` | Todas las rutas curriculares | ~35 | ✅ (10min) | ❌ |
| `obtenerRutaCurricularPorId()` | Ruta curricular específica | ~30 | ✅ (10min) | ❌ |
| `obtenerEstudiantesDeClase()` | Estudiantes inscritos + info tutor | ~80 | ❌ | ❌ |

**Total:** ~465 líneas, 8 métodos

**Características:**
- **Includes complejos:** Todos los métodos usan includes de Prisma
- **Filtrado:** 5 métodos tienen filtros condicionales
- **Ordenamiento:** Todos ordenan por `fecha_hora_inicio` o `nombre`
- **Transformación:** Varios métodos formatean la respuesta

---

### ✍️ ClaseCommandService (escritura)

| Método | Descripción | Líneas | Transacción | Notificaciones |
|--------|-------------|--------|-------------|----------------|
| `programarClase()` | Crear nueva clase con validaciones | ~120 | ❌ | ❌ |
| `cancelarClase()` | Cancelar + liberar cupos + notificar | ~100 | ❌ | ✅ |
| `eliminarClase()` | Delete físico con cascada | ~40 | ❌ | ❌ |
| `asignarEstudiantesAClase()` | Inscripciones masivas + actualizar cupos | ~120 | ✅ | ❌ |

**Total:** ~380 líneas, 4 métodos

**Características:**
- **Validaciones:** Todos los comandos validan antes de ejecutar
- **Atomicidad:** `asignarEstudiantesAClase()` usa `$transaction`
- **Resiliencia:** `cancelarClase()` usa `Promise.allSettled` para notificaciones
- **Logging:** Todos los comandos registran operaciones críticas

---

### 📊 ClaseStatsService (estadísticas y agregaciones)

Nuevas funcionalidades a extraer de queries existentes:

```typescript
// Extraído de listarTodasLasClases()
- obtenerEstadisticasOcupacion(filtros?)
  * Total clases programadas
  * Total clases canceladas
  * Promedio de ocupación
  * Clases llenas vs disponibles

// Extraído de obtenerCalendarioTutor()
- obtenerResumenMensual(tutorId, mes, año)
  * Total clases del mes
  * Total horas de clase
  * Estudiantes únicos participando

// Nueva funcionalidad
- obtenerReporteAsistencia(claseId)
  * Total inscripciones
  * Asistencias confirmadas
  * % de asistencia
```

**Total:** ~100 líneas, 3 métodos

---

## 🔗 Sección 3: Dependencias Identificadas

### Dependencias por servicio

```typescript
// ClaseBusinessValidator
- PrismaService (solo queries de validación)
- No tiene dependencias de otros servicios

// ClaseQueryService
- PrismaService (queries complejas)
- CACHE_MANAGER (solo para rutas curriculares)
- No tiene dependencias de otros servicios

// ClaseCommandService
- PrismaService (operaciones de escritura)
- ClaseBusinessValidator (validaciones)
- NotificacionesService (solo en cancelarClase)
- No tiene dependencias circulares

// ClaseStatsService
- PrismaService (queries de agregación)
- No tiene dependencias de otros servicios

// ClasesManagementFacade
- ClaseQueryService
- ClaseCommandService
- ClaseStatsService
- ClaseBusinessValidator (opcional, si expone validaciones públicas)
```

### Matriz de dependencias

|                          | Prisma | Cache | Notificaciones | Validator | Query | Command | Stats |
|--------------------------|--------|-------|----------------|-----------|-------|---------|-------|
| ClaseBusinessValidator   | ✅     | ❌    | ❌             | -         | ❌    | ❌      | ❌    |
| ClaseQueryService        | ✅     | ✅    | ❌             | ❌        | -     | ❌      | ❌    |
| ClaseCommandService      | ✅     | ❌    | ✅             | ✅        | ❌    | -       | ❌    |
| ClaseStatsService        | ✅     | ❌    | ❌             | ❌        | ❌    | ❌      | -     |
| ClasesManagementFacade   | ❌     | ❌    | ❌             | ⚠️        | ✅    | ✅      | ✅    |

✅ Depende
❌ No depende
⚠️ Opcional

---

## 🏛️ Sección 4: Arquitectura Propuesta

### Estructura de archivos

```
apps/api/src/clases/
├── services/
│   ├── ❌ clases-management.service.ts (849 líneas) → ELIMINAR
│   ├── ✅ clases-reservas.service.ts → MANTENER (ya refactorizado)
│   ├── ✅ clases-asistencia.service.ts → MANTENER (ya refactorizado)
│   │
│   ├── 🆕 clase-query.service.ts (~465 líneas, 8 métodos)
│   ├── 🆕 clase-command.service.ts (~380 líneas, 4 métodos)
│   ├── 🆕 clase-stats.service.ts (~100 líneas, 3 métodos)
│   └── 🆕 clases-management-facade.service.ts (~150 líneas, 15 métodos)
│
├── validators/
│   └── 🆕 clase-business.validator.ts (~150 líneas, 11 métodos)
│
├── __tests__/
│   ├── ✅ clases-reservas.service.spec.ts (ya existe)
│   ├── ✅ clases-asistencia.service.spec.ts (ya existe)
│   │
│   ├── 🆕 clase-business.validator.spec.ts
│   ├── 🆕 clase-query.service.spec.ts
│   ├── 🆕 clase-command.service.spec.ts
│   ├── 🆕 clase-stats.service.spec.ts
│   └── 🆕 clases-management-facade.service.spec.ts
│
├── clases.module.ts → Actualizar providers
├── clases.service.ts → Actualizar para usar nuevo Facade
└── clases.controller.ts → No requiere cambios (usa ClasesService)
```

---

### Diagrama de flujo

```
┌──────────────────────┐
│ ClasesController     │
│ (sin cambios)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ClasesService        │
│ (Facade principal)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────┐
│ ClasesManagementFacade 🆕        │
│ (Facade secundario)              │
│ - programarClase()               │
│ - cancelarClase()                │
│ - listarTodasLasClases()         │
│ - obtenerCalendarioTutor()       │
│ - ...15 métodos públicos         │
└──────────┬───────────────────────┘
           │
     ┌─────┴─────┬─────────┬─────────┐
     ▼           ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│ Query   │ │Command  │ │ Stats   │ │Validator │
│ Service │ │Service  │ │Service  │ │ 🆕       │
│ 🆕      │ │ 🆕      │ │ 🆕      │ │          │
└─────────┘ └─────────┘ └─────────┘ └──────────┘
     │           │          │            │
     └───────────┴──────────┴────────────┘
                    │
                    ▼
           ┌────────────────┐
           │ PrismaService  │
           └────────────────┘
```

---

### Responsabilidades detalladas

#### 1️⃣ ClaseBusinessValidator

**Responsabilidad:** Validaciones de negocio puras (sin side effects)

**Métodos públicos:**
```typescript
class ClaseBusinessValidator {
  // Validaciones de existencia
  async validarRutaCurricularExiste(id: string): Promise<void>
  async validarDocenteExiste(id: string): Promise<void>
  async validarSectorExiste(id: string): Promise<void>

  // Validaciones de lógica de negocio
  async validarProductoEsCurso(id: string): Promise<void>
  validarFechaFutura(fecha: Date): void
  validarClaseNoCancelada(clase: Clase): void
  validarClaseActiva(clase: Clase): void

  // Validaciones de autorización
  validarPermisosCancelacion(clase: Clase, userId: string, userRole: string): void

  // Validaciones de cupos
  validarCuposDisponibles(clase: Clase, cantidadEstudiantes: number): void
  async validarEstudiantesExisten(estudianteIds: string[]): Promise<Estudiante[]>
  validarEstudiantesNoInscritos(clase: Clase, estudianteIds: string[]): void
}
```

**Características:**
- Sin dependencias de otros servicios del dominio
- Solo usa PrismaService para queries de validación
- Lanza excepciones específicas (NotFoundException, BadRequestException, ForbiddenException)
- Métodos síncronos cuando no requieren BD

---

#### 2️⃣ ClaseQueryService

**Responsabilidad:** Todas las operaciones de solo lectura

**Métodos públicos:**
```typescript
class ClaseQueryService {
  // Listados con filtros
  async listarTodasLasClases(filtros?, page?, limit?): Promise<PaginatedResponse>
  async listarClasesParaTutor(tutorId: string): Promise<Clase[]>
  async listarClasesDeDocente(docenteId: string, incluirPasadas?): Promise<Clase[]>

  // Calendarios
  async obtenerCalendarioTutor(tutorId: string, mes?, año?): Promise<CalendarioResponse>

  // Detalles
  async obtenerClase(id: string): Promise<ClaseDetalle>
  async obtenerEstudiantesDeClase(claseId: string): Promise<EstudiantesClaseResponse>

  // Rutas curriculares (con caché)
  async listarRutasCurriculares(): Promise<RutaCurricular[]>
  async obtenerRutaCurricularPorId(id: string): Promise<RutaCurricular>
}
```

**Características:**
- Solo dependencias: PrismaService, CACHE_MANAGER
- Todos los métodos son `async`
- No modifica estado
- Includes complejos de Prisma
- Caché solo en métodos de rutas curriculares (10 min)

---

#### 3️⃣ ClaseCommandService

**Responsabilidad:** Todas las operaciones de escritura

**Métodos públicos:**
```typescript
class ClaseCommandService {
  // Crear y modificar
  async programarClase(dto: CrearClaseDto): Promise<Clase>
  async cancelarClase(id: string, userId: string, userRole: string): Promise<Clase>
  async eliminarClase(id: string): Promise<DeleteResponse>

  // Inscripciones masivas
  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]): Promise<AsignacionResponse>
}
```

**Características:**
- Dependencias: PrismaService, ClaseBusinessValidator, NotificacionesService
- Usa validaciones antes de ejecutar
- `cancelarClase()` usa `Promise.allSettled` para resiliencia
- `asignarEstudiantesAClase()` usa `$transaction` para atomicidad
- Logging exhaustivo de operaciones

---

#### 4️⃣ ClaseStatsService

**Responsabilidad:** Estadísticas y agregaciones

**Métodos públicos:**
```typescript
class ClaseStatsService {
  // Estadísticas de ocupación
  async obtenerEstadisticasOcupacion(filtros?): Promise<EstadisticasOcupacion>

  // Resumen mensual para tutores
  async obtenerResumenMensual(tutorId: string, mes: number, año: number): Promise<ResumenMensual>

  // Reportes de asistencia
  async obtenerReporteAsistencia(claseId: string): Promise<ReporteAsistencia>
}
```

**Características:**
- Solo PrismaService como dependencia
- Queries con agregaciones (`count`, `avg`, `sum`)
- No modifica estado
- Puede cachear resultados en el futuro

---

#### 5️⃣ ClasesManagementFacade

**Responsabilidad:** Unificar los 3 servicios especializados

**Métodos públicos:**
```typescript
class ClasesManagementFacade {
  constructor(
    private queryService: ClaseQueryService,
    private commandService: ClaseCommandService,
    private statsService: ClaseStatsService,
  ) {}

  // Queries (delegación simple)
  async listarTodasLasClases(filtros?, page?, limit?) {
    return this.queryService.listarTodasLasClases(filtros, page, limit);
  }

  async obtenerClase(id: string) {
    return this.queryService.obtenerClase(id);
  }

  // Commands (delegación simple)
  async programarClase(dto: CrearClaseDto) {
    return this.commandService.programarClase(dto);
  }

  async cancelarClase(id: string, userId: string, userRole: string) {
    return this.commandService.cancelarClase(id, userId, userRole);
  }

  // Stats (delegación simple)
  async obtenerEstadisticasOcupacion(filtros?) {
    return this.statsService.obtenerEstadisticasOcupacion(filtros);
  }

  // ...todos los demás métodos delegados
}
```

**Características:**
- **Delegación pura:** No contiene lógica de negocio
- **API unificada:** Punto único de entrada para ClasesService
- **Sin dependencias externas:** Solo los 3 servicios especializados
- **~10 líneas por método:** Solo llamadas de delegación

---

## 📅 Sección 5: Plan de Migración (12 Pasos)

### Fase 1: Validaciones y Queries (Pasos 1-3)

#### ✅ Paso 1: Análisis completo
- [x] Crear documento `ANALYSIS-CLASES-MANAGEMENT.md`
- [x] Categorizar todos los métodos
- [x] Definir arquitectura
- [x] Definir plan de migración

**Entregable:** Este documento

---

#### 🔄 Paso 2: Crear ClaseBusinessValidator + Tests

**Archivos a crear:**
- `validators/clase-business.validator.ts`
- `__tests__/clase-business.validator.spec.ts`

**Tareas:**
1. Extraer validaciones de `programarClase()`
2. Extraer validaciones de `cancelarClase()`
3. Extraer validaciones de `asignarEstudiantesAClase()`
4. Escribir 30+ tests unitarios

**Tests a escribir:**
```typescript
describe('ClaseBusinessValidator', () => {
  describe('validarRutaCurricularExiste', () => {
    it('debe pasar si la ruta existe');
    it('debe lanzar NotFoundException si no existe');
  });

  describe('validarDocenteExiste', () => {
    it('debe pasar si el docente existe');
    it('debe lanzar NotFoundException si no existe');
  });

  describe('validarProductoEsCurso', () => {
    it('debe pasar si el producto es de tipo Curso');
    it('debe lanzar NotFoundException si no existe');
    it('debe lanzar BadRequestException si no es Curso');
  });

  describe('validarFechaFutura', () => {
    it('debe pasar si la fecha es futura');
    it('debe lanzar BadRequestException si es pasada');
    it('debe lanzar BadRequestException si es hoy');
  });

  describe('validarPermisosCancelacion', () => {
    it('debe permitir cancelación si es admin');
    it('debe permitir cancelación si es docente propietario');
    it('debe denegar si es docente no propietario');
    it('debe denegar si es tutor');
    it('debe denegar si es estudiante');
  });

  describe('validarCuposDisponibles', () => {
    it('debe pasar si hay cupos suficientes');
    it('debe lanzar BadRequestException si no hay cupos');
    it('debe lanzar BadRequestException si cupos exactos');
  });

  describe('validarEstudiantesExisten', () => {
    it('debe retornar estudiantes si todos existen');
    it('debe lanzar BadRequestException si falta alguno');
  });

  describe('validarEstudiantesNoInscritos', () => {
    it('debe pasar si ninguno está inscrito');
    it('debe lanzar BadRequestException si alguno está inscrito');
  });
});
```

**Estimación:** 2-3 horas

---

#### 🔄 Paso 3: Crear ClaseQueryService + Tests

**Archivos a crear:**
- `services/clase-query.service.ts`
- `__tests__/clase-query.service.spec.ts`

**Tareas:**
1. Mover 8 métodos de query de `clases-management.service.ts`
2. Mantener lógica de caché intacta
3. Escribir 40+ tests unitarios

**Métodos a migrar:**
```typescript
// Con paginación
listarTodasLasClases(filtros?, page?, limit?)

// Con filtrado complejo
listarClasesParaTutor(tutorId)
obtenerCalendarioTutor(tutorId, mes?, año?)
listarClasesDeDocente(docenteId, incluirPasadas?)

// Detalle
obtenerClase(id)
obtenerEstudiantesDeClase(claseId)

// Con caché (10 min)
listarRutasCurriculares()
obtenerRutaCurricularPorId(id)
```

**Tests a escribir:**
```typescript
describe('ClaseQueryService', () => {
  describe('listarTodasLasClases', () => {
    it('debe listar todas las clases con paginación');
    it('debe filtrar por fechaDesde');
    it('debe filtrar por fechaHasta');
    it('debe filtrar por estado');
    it('debe filtrar por docenteId');
    it('debe filtrar por rutaCurricularId');
    it('debe calcular totalPages correctamente');
    it('debe retornar campos formateados');
  });

  describe('listarClasesParaTutor', () => {
    it('debe listar solo clases programadas');
    it('debe listar solo clases futuras');
    it('debe incluir clases sin producto (suscripción)');
    it('debe incluir clases de cursos activos del tutor');
    it('debe excluir clases de cursos no activos');
    it('debe lanzar NotFoundException si tutor no existe');
  });

  describe('obtenerCalendarioTutor', () => {
    it('debe obtener clases del mes actual por defecto');
    it('debe filtrar por mes específico');
    it('debe validar mes válido (1-12)');
    it('debe incluir solo estudiantes del tutor');
    it('debe incluir asistencias de los estudiantes');
    it('debe retornar 0 clases si tutor sin estudiantes');
  });

  describe('listarRutasCurriculares', () => {
    it('debe obtener del caché si existe');
    it('debe consultar BD si no hay caché');
    it('debe guardar en caché por 10 minutos');
    it('debe ordenar por nombre');
  });

  // ...más tests para otros métodos
});
```

**Estimación:** 3-4 horas

---

### Fase 2: Commands y Stats (Pasos 4-5)

#### 🔄 Paso 4: Crear ClaseCommandService + Tests

**Archivos a crear:**
- `services/clase-command.service.ts`
- `__tests__/clase-command.service.spec.ts`

**Tareas:**
1. Mover 4 métodos de comando de `clases-management.service.ts`
2. Integrar ClaseBusinessValidator
3. Mantener lógica de resiliencia en `cancelarClase()`
4. Escribir 35+ tests unitarios

**Métodos a migrar:**
```typescript
programarClase(dto: CrearClaseDto)
cancelarClase(id, userId, userRole)
eliminarClase(id)
asignarEstudiantesAClase(claseId, estudianteIds)
```

**Tests a escribir:**
```typescript
describe('ClaseCommandService', () => {
  describe('programarClase', () => {
    it('debe crear clase con datos completos');
    it('debe crear clase sin rutaCurricularId (opcional)');
    it('debe crear clase sin sectorId (opcional)');
    it('debe crear clase sin productoId (opcional)');
    it('debe usar ClaseBusinessValidator para validar');
    it('debe lanzar error si validación falla');
    it('debe logear creación exitosa');
  });

  describe('cancelarClase', () => {
    it('debe cancelar clase si es admin');
    it('debe cancelar clase si es docente propietario');
    it('debe denegar cancelación si es docente no propietario');
    it('debe actualizar estado a Cancelada');
    it('debe liberar cupos (cupos_ocupados = 0)');
    it('debe enviar notificación al docente');
    it('debe continuar si notificación falla (Promise.allSettled)');
    it('debe logear warning si notificación falla');
    it('debe lanzar NotFoundException si clase no existe');
    it('debe lanzar BadRequestException si ya está cancelada');
  });

  describe('eliminarClase', () => {
    it('debe eliminar clase exitosamente');
    it('debe eliminar inscripciones en cascada');
    it('debe retornar count de inscripciones eliminadas');
    it('debe lanzar NotFoundException si no existe');
  });

  describe('asignarEstudiantesAClase', () => {
    it('debe asignar estudiantes en transacción');
    it('debe actualizar cupos_ocupados');
    it('debe crear inscripciones con observaciones');
    it('debe validar cupos disponibles');
    it('debe validar que estudiantes existen');
    it('debe validar que no están ya inscritos');
    it('debe lanzar error si clase cancelada');
    it('debe rollback si falla alguna inscripción');
  });
});
```

**Estimación:** 3-4 horas

---

#### 🔄 Paso 5: Crear ClaseStatsService + Tests

**Archivos a crear:**
- `services/clase-stats.service.ts`
- `__tests__/clase-stats.service.spec.ts`

**Tareas:**
1. Extraer lógica de agregaciones de queries existentes
2. Crear 3 métodos nuevos de estadísticas
3. Escribir 20+ tests unitarios

**Métodos a crear:**
```typescript
async obtenerEstadisticasOcupacion(filtros?): Promise<{
  totalClasesProgramadas: number;
  totalClasesCanceladas: number;
  promedioOcupacion: number;
  clasesLlenas: number;
  clasesDisponibles: number;
}>

async obtenerResumenMensual(tutorId: string, mes: number, año: number): Promise<{
  totalClases: number;
  totalHoras: number;
  estudiantesUnicos: number;
  clasesPorDia: Record<number, number>;
}>

async obtenerReporteAsistencia(claseId: string): Promise<{
  totalInscripciones: number;
  asistenciasConfirmadas: number;
  porcentajeAsistencia: number;
  estudiantesPresentes: string[];
  estudiantesAusentes: string[];
}>
```

**Tests a escribir:**
```typescript
describe('ClaseStatsService', () => {
  describe('obtenerEstadisticasOcupacion', () => {
    it('debe calcular estadísticas sin filtros');
    it('debe filtrar por fechaDesde');
    it('debe filtrar por docenteId');
    it('debe calcular promedio de ocupación correctamente');
    it('debe contar clases llenas (cupos_ocupados = cupos_maximo)');
    it('debe retornar 0 si no hay clases');
  });

  describe('obtenerResumenMensual', () => {
    it('debe calcular resumen del mes');
    it('debe contar total de horas (duracion_minutos / 60)');
    it('debe contar estudiantes únicos');
    it('debe agrupar clases por día');
    it('debe lanzar NotFoundException si tutor no existe');
  });

  describe('obtenerReporteAsistencia', () => {
    it('debe calcular porcentaje de asistencia');
    it('debe listar estudiantes presentes');
    it('debe listar estudiantes ausentes');
    it('debe manejar clase sin inscripciones');
    it('debe lanzar NotFoundException si clase no existe');
  });
});
```

**Estimación:** 2-3 horas

---

### Fase 3: Facade e Integración (Pasos 6-9)

#### 🔄 Paso 6: Crear ClasesManagementFacade + Tests

**Archivos a crear:**
- `services/clases-management-facade.service.ts`
- `__tests__/clases-management-facade.service.spec.ts`

**Tareas:**
1. Crear facade que unifica los 3 servicios
2. Implementar 15 métodos de delegación
3. Escribir 20+ tests de integración

**Estructura:**
```typescript
@Injectable()
export class ClasesManagementFacade {
  constructor(
    private queryService: ClaseQueryService,
    private commandService: ClaseCommandService,
    private statsService: ClaseStatsService,
  ) {}

  // === QUERIES (8 métodos) ===
  async listarTodasLasClases(filtros?, page?, limit?) {
    return this.queryService.listarTodasLasClases(filtros, page, limit);
  }

  async listarClasesParaTutor(tutorId: string) {
    return this.queryService.listarClasesParaTutor(tutorId);
  }

  async obtenerCalendarioTutor(tutorId: string, mes?: number, año?: number) {
    return this.queryService.obtenerCalendarioTutor(tutorId, mes, año);
  }

  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    return this.queryService.listarClasesDeDocente(docenteId, incluirPasadas);
  }

  async obtenerClase(id: string) {
    return this.queryService.obtenerClase(id);
  }

  async listarRutasCurriculares() {
    return this.queryService.listarRutasCurriculares();
  }

  async obtenerRutaCurricularPorId(id: string) {
    return this.queryService.obtenerRutaCurricularPorId(id);
  }

  async obtenerEstudiantesDeClase(claseId: string) {
    return this.queryService.obtenerEstudiantesDeClase(claseId);
  }

  // === COMMANDS (4 métodos) ===
  async programarClase(dto: CrearClaseDto) {
    return this.commandService.programarClase(dto);
  }

  async cancelarClase(id: string, userId: string, userRole: string) {
    return this.commandService.cancelarClase(id, userId, userRole);
  }

  async eliminarClase(id: string) {
    return this.commandService.eliminarClase(id);
  }

  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]) {
    return this.commandService.asignarEstudiantesAClase(claseId, estudianteIds);
  }

  // === STATS (3 métodos) ===
  async obtenerEstadisticasOcupacion(filtros?) {
    return this.statsService.obtenerEstadisticasOcupacion(filtros);
  }

  async obtenerResumenMensual(tutorId: string, mes: number, año: number) {
    return this.statsService.obtenerResumenMensual(tutorId, mes, año);
  }

  async obtenerReporteAsistencia(claseId: string) {
    return this.statsService.obtenerReporteAsistencia(claseId);
  }
}
```

**Tests a escribir:**
```typescript
describe('ClasesManagementFacade', () => {
  it('debe delegar listarTodasLasClases a queryService');
  it('debe delegar programarClase a commandService');
  it('debe delegar obtenerEstadisticasOcupacion a statsService');
  it('debe propagar errores de queryService');
  it('debe propagar errores de commandService');
  it('debe propagar errores de statsService');
  // ...tests para todos los métodos
});
```

**Estimación:** 2 horas

---

#### 🔄 Paso 7: Actualizar ClasesModule

**Archivo a modificar:**
- `clases.module.ts`

**Tareas:**
1. Agregar nuevos providers
2. Mantener exports de servicios públicos
3. Verificar dependencias de cache

**Cambios:**
```typescript
@Module({
  imports: [
    CacheModule.register({
      ttl: 600000, // 10 minutos para rutas curriculares
    }),
  ],
  providers: [
    // Servicios existentes
    ClasesService,
    ClasesReservasService,
    ClasesAsistenciaService,

    // 🆕 Servicios nuevos
    ClaseBusinessValidator,
    ClaseQueryService,
    ClaseCommandService,
    ClaseStatsService,
    ClasesManagementFacade,

    // Dependencias externas
    PrismaService,
    NotificacionesService,
  ],
  exports: [
    ClasesService, // API pública principal
    ClasesManagementFacade, // Para otros módulos si lo necesitan
  ],
})
export class ClasesModule {}
```

**Estimación:** 30 minutos

---

#### 🔄 Paso 8: Actualizar ClasesService

**Archivo a modificar:**
- `clases.service.ts`

**Tareas:**
1. Reemplazar `ClasesManagementService` por `ClasesManagementFacade`
2. Actualizar llamadas a métodos
3. Verificar que no hay imports rotos

**Cambios:**
```typescript
@Injectable()
export class ClasesService {
  constructor(
    // ❌ ANTES
    // private clasesManagement: ClasesManagementService,

    // ✅ DESPUÉS
    private clasesManagement: ClasesManagementFacade,

    private clasesReservas: ClasesReservasService,
    private clasesAsistencia: ClasesAsistenciaService,
  ) {}

  // Todos los métodos siguen igual, solo cambia la dependencia
  async programarClase(dto: CrearClaseDto) {
    return this.clasesManagement.programarClase(dto);
  }

  async listarTodasLasClases(filtros?, page?, limit?) {
    return this.clasesManagement.listarTodasLasClases(filtros, page, limit);
  }

  // ...resto de métodos sin cambios
}
```

**Estimación:** 30 minutos

---

#### 🔄 Paso 9: Verificar con Madge (0 circulares)

**Tareas:**
1. Ejecutar `madge` en módulo de clases
2. Verificar que no hay dependencias circulares
3. Generar gráfico de dependencias

**Comandos:**
```bash
# Verificar circulares en módulo completo
npx madge --circular apps/api/src/clases

# Verificar servicios específicos
npx madge --circular apps/api/src/clases/services

# Generar gráfico
npx madge --image clases-deps.svg apps/api/src/clases/services
```

**Resultado esperado:**
```
✓ No circular dependencies found!
```

**Si hay circulares:**
- Identificar la dependencia circular
- Refactorizar usando EventEmitter2
- Volver a ejecutar madge

**Estimación:** 30 minutos

---

### Fase 4: Validación y Limpieza (Pasos 10-12)

#### 🔄 Paso 10: Ejecutar Tests (todos pasando)

**Tareas:**
1. Ejecutar suite completa de tests
2. Verificar cobertura >80%
3. Corregir tests fallidos

**Comandos:**
```bash
# Ejecutar todos los tests del módulo clases
npm test -- clases

# Ejecutar tests específicos con cobertura
npm test -- clases --coverage

# Ejecutar solo tests nuevos
npm test -- clase-business.validator.spec
npm test -- clase-query.service.spec
npm test -- clase-command.service.spec
npm test -- clase-stats.service.spec
npm test -- clases-management-facade.service.spec
```

**Resultado esperado:**
```
Test Suites: 8 passed, 8 total
Tests:       120 passed, 120 total
Coverage:    85% statements, 82% branches, 88% functions, 85% lines
```

**Estimación:** 1-2 horas

---

#### 🔄 Paso 11: Eliminar clases-management.service.ts

**Tareas:**
1. Verificar que ningún archivo importa `ClasesManagementService`
2. Eliminar archivo viejo
3. Verificar que la app compila

**Comandos:**
```bash
# Buscar referencias al servicio viejo
grep -r "ClasesManagementService" apps/api/src/

# Si no hay referencias, eliminar
rm apps/api/src/clases/services/clases-management.service.ts

# Compilar y verificar
npx tsc --noEmit
```

**Estimación:** 15 minutos

---

#### 🔄 Paso 12: Commit con Mensaje Descriptivo

**Tareas:**
1. Revisar todos los cambios
2. Crear commit atómico
3. Verificar CI pasa

**Mensaje de commit:**
```
refactor(clases): dividir ClasesManagementService con CQRS + Facade (849→5 servicios)

ANTES:
- ❌ ClasesManagementService: 849 líneas, 15 métodos, múltiples responsabilidades

DESPUÉS:
- ✅ ClaseBusinessValidator: 150 líneas, 11 validaciones puras
- ✅ ClaseQueryService: 465 líneas, 8 queries con caché
- ✅ ClaseCommandService: 380 líneas, 4 comandos con notificaciones
- ✅ ClaseStatsService: 100 líneas, 3 métodos de agregación
- ✅ ClasesManagementFacade: 150 líneas, 15 métodos de delegación

BENEFICIOS:
- Separación clara de responsabilidades (CQRS)
- Validaciones reutilizables y testeables
- Queries optimizadas con caché
- Commands con resiliencia (Promise.allSettled)
- Sin dependencias circulares (verificado con madge)
- +120 tests nuevos, cobertura >80%

TESTING:
- Tests exhaustivos para cada servicio
- Mocks de PrismaService, Cache, Notificaciones
- Tests de integración en Facade

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Estimación:** 30 minutos

---

## 📊 Sección 6: Métricas Esperadas

### Métricas de código

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| **Total líneas** | 849 | ~1,245 | +396 (+47%) |
| **Archivos** | 1 | 5 | +4 |
| **Métodos** | 15 | 26 | +11 (nuevos en Stats) |
| **Líneas por archivo** | 849 | ~249 | -71% |
| **Servicios** | 1 | 5 | +4 |
| **Validators** | 0 | 1 | +1 |

### Métricas de testing

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| **Tests totales** | ~30 | ~150 | +120 (+400%) |
| **Cobertura statements** | ~65% | >85% | +20% |
| **Cobertura branches** | ~60% | >80% | +20% |
| **Test files** | 2 | 7 | +5 |

### Distribución de líneas

```
ANTES (849 líneas):
┌────────────────────────────────────────────────┐
│ clases-management.service.ts         (849)    │
│ ├─ Queries:              465 líneas (55%)     │
│ ├─ Commands:             380 líneas (45%)     │
│ └─ Validaciones inline:   ~4 líneas          │
└────────────────────────────────────────────────┘

DESPUÉS (1,245 líneas):
┌────────────────────────────────────────────────┐
│ clase-business.validator.ts          (150)    │
│ clase-query.service.ts               (465)    │
│ clase-command.service.ts             (380)    │
│ clase-stats.service.ts               (100)    │
│ clases-management-facade.service.ts  (150)    │
├────────────────────────────────────────────────┤
│ TOTAL:                             1,245 líneas│
│ + Tests:                           ~1,500 líneas│
└────────────────────────────────────────────────┘
```

### Complejidad ciclomática

| Servicio | Complejidad promedio | Max complejidad |
|----------|---------------------|-----------------|
| **Validator** | 2.5 | 5 (validarPermisos) |
| **QueryService** | 4.0 | 8 (listarTodasLasClases) |
| **CommandService** | 6.0 | 10 (asignarEstudiantes) |
| **StatsService** | 3.5 | 6 (estadísticasOcupacion) |
| **Facade** | 1.0 | 1 (solo delegación) |

---

## ✅ Criterios de Éxito

### Funcionales
- ✅ Todos los métodos originales mantienen su funcionalidad
- ✅ API pública de ClasesService no cambia
- ✅ Caché de rutas curriculares funciona igual (10 min)
- ✅ Resiliencia de notificaciones se mantiene (Promise.allSettled)
- ✅ Transacciones atómicas funcionan (asignarEstudiantes)

### No funcionales
- ✅ Ningún archivo supera 500 líneas
- ✅ 0 dependencias circulares (verificado con madge)
- ✅ Cobertura de tests >80%
- ✅ Todos los tests pasando
- ✅ Build de TypeScript exitoso

### Arquitectura
- ✅ Separación clara Query/Command (CQRS)
- ✅ Validaciones en capa independiente
- ✅ Facade con delegación pura (<10 líneas por método)
- ✅ Sin lógica de negocio en Facade
- ✅ Estadísticas en servicio especializado

### Mantenibilidad
- ✅ Cada servicio tiene responsabilidad única
- ✅ Tests unitarios aislados por servicio
- ✅ Mocks limpios y reutilizables
- ✅ Logging consistente en operaciones críticas
- ✅ Documentación JSDoc en métodos públicos

---

## 🚀 Siguiente Paso

**Continuar con PROMPT 2:** Crear ClaseBusinessValidator + Tests

**Comando:**
```bash
# Crear archivos
touch apps/api/src/clases/validators/clase-business.validator.ts
touch apps/api/src/clases/__tests__/clase-business.validator.spec.ts
```

**Objetivo:** Extraer las 11 validaciones en un servicio independiente con >30 tests unitarios.

---

## 📝 Notas Finales

### Decisiones de diseño

1. **¿Por qué no usar eventos para Commands?**
   - Los comandos actuales no tienen dependencias circulares
   - EventEmitter2 solo si aparecen circulares en Paso 9
   - Mantener simplicidad mientras sea posible

2. **¿Por qué StatsService separado?**
   - Las estadísticas pueden crecer mucho (reportes futuros)
   - Evitar contaminar QueryService con agregaciones
   - Facilita agregar caché específico para stats

3. **¿Por qué caché solo en Queries?**
   - Rutas curriculares rara vez cambian (datos casi estáticos)
   - Otros queries son dinámicos (clases, inscripciones)
   - Stats pueden cachear en el futuro

4. **¿Por qué Facade si ya hay ClasesService?**
   - ClasesService es el facade principal (unifica Management + Reservas + Asistencia)
   - ClasesManagementFacade es facade secundario (unifica Query + Command + Stats)
   - Permite evolucionar Management sin tocar el API principal

### Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Dependencia circular Query↔Command | Media | Alto | Verificar con madge en Paso 9 |
| Tests frágiles por mocks complejos | Media | Medio | Usar prisma-mock o similar |
| Caché invalidado incorrectamente | Baja | Medio | Tests específicos de TTL |
| Transacciones rollback fallidos | Baja | Alto | Tests exhaustivos de $transaction |

### Referencias

- **Patrón CQRS:** https://martinfowler.com/bliki/CQRS.html
- **Facade Pattern:** https://refactoring.guru/design-patterns/facade
- **Testing NestJS:** https://docs.nestjs.com/fundamentals/testing
- **Prisma Transactions:** https://www.prisma.io/docs/concepts/components/prisma-client/transactions

---

**Documento generado:** 2025-11-14
**Última actualización:** 2025-11-14
**Versión:** 1.0
**Estado:** ✅ COMPLETO - Listo para Paso 2
