# ANÁLISIS: TutorService (Refactor con CQRS + Facade)

**Fecha**: 2025-11-17
**Archivo**: `apps/api/src/tutor/tutor.service.ts`
**Estado**: God Service (676 líneas) → Refactor pendiente
**Patrón**: CQRS + Facade + Validators

---

## 📊 Métricas del God Service

```
Líneas totales:     676 líneas
Tests actuales:     0 tests (NO HAY TESTS EXISTENTES)
Dependencias:       InscripcionMensualRepository, PrismaService
```

---

## 📋 INVENTARIO DE MÉTODOS (14 métodos)

### QUERIES (4 métodos) - READ operations

1. ✅ `getMisInscripciones(tutorId, periodo?, estadoPago?)` - Líneas 56-80
   - Obtiene inscripciones mensuales con resumen financiero
   - Retorna: `Promise<MisInscripcionesResponse>`
   - Usa: `inscripcionRepo.obtenerPorTutor()` + `calcularResumen()`

2. ✅ `getDashboardResumen(tutorId)` - Líneas 127-144
   - Dashboard completo del tutor
   - Retorna: `Promise<DashboardResumenResponse>`
   - Ejecuta 4 queries en paralelo: métricas, pagos, clases hoy, alertas

3. ✅ `getProximasClases(tutorId, limit = 5)` - Líneas 398-534
   - Próximas N clases de todos los hijos
   - Retorna: `Promise<ProximasClasesResponse>`
   - Calcula flags: esHoy, esManana, puedeUnirse, labelFecha

4. ✅ `obtenerAlertas(tutorId)` - Líneas 542-675
   - Alertas activas ordenadas por prioridad
   - Retorna: `Promise<AlertasResponse>`
   - Tipos: pagos vencidos, clases hoy, asistencia baja

### HELPERS PRIVADOS (10 métodos) - Private utilities

5. ✅ `calcularResumen(inscripciones)` - Líneas 88-119
   - Calcula totales y estudiantes únicos
   - Retorna: Resumen financiero

6. ✅ `calcularMetricasDashboard(tutorId)` - Líneas 149-240
   - Calcula métricas principales del dashboard
   - Retorna: `Promise<MetricasDashboard>`
   - Incluye: totalHijos, clasesDelMes, totalPagadoAnio, asistenciaPromedio

7. ✅ `obtenerPagosPendientes(tutorId)` - Líneas 245-294
   - Obtiene pagos pendientes/vencidos con cálculo de días
   - Retorna: `Promise<PagoPendiente[]>`
   - Calcula: diasParaVencer, estaVencido

8. ✅ `obtenerClasesHoy(tutorId)` - Líneas 299-389
   - Clases de HOY de todos los hijos
   - Retorna: `Promise<ClaseHoy[]>`
   - Calcula: puedeUnirse (10 min antes)

---

## 🎯 ESTRATEGIA DE REFACTOR

### División propuesta (4 servicios especializados + 1 facade)

```
TutorService (676 líneas)
  ↓
  ├─ TutorQueryService       (~200 líneas) - 4 queries públicas
  ├─ TutorStatsService       (~280 líneas) - Cálculos y helpers privados
  ├─ TutorBusinessValidator  (~60 líneas)  - Validaciones de negocio
  ├─ TutorFacade            (~100 líneas) - Unifica Query + Stats
  └─ TutorService (NUEVO)    (~50 líneas)  - Facade wrapper
```

---

## 📂 DISTRIBUCIÓN DETALLADA

### 1️⃣ TutorQueryService (~200 líneas)

**Responsabilidad**: Consultas de lectura sin lógica compleja

**Métodos públicos** (4):

- `getMisInscripciones(tutorId, periodo?, estadoPago?)` - Delega a repo + StatsService
- `getDashboardResumen(tutorId)` - Orquesta 4 operaciones paralelas
- `getProximasClases(tutorId, limit)` - Query + transformación
- `obtenerAlertas(tutorId)` - Delega a StatsService

**Dependencias**:

- `InscripcionMensualRepository`
- `PrismaService`
- `TutorStatsService` (para cálculos)

---

### 2️⃣ TutorStatsService (~280 líneas)

**Responsabilidad**: Cálculos, agregaciones y estadísticas

**Métodos públicos** (6):

- `calcularResumen(inscripciones)` - Resumen financiero
- `calcularMetricasDashboard(tutorId)` - Métricas principales
- `obtenerPagosPendientes(tutorId)` - Pagos con días para vencer
- `obtenerClasesHoy(tutorId)` - Clases de hoy con flags
- `construirAlertas(tutorId)` - Construye alertas de pagos/clases/asistencia
- `calcularAsistenciaEstudiantes(estudiantesIds)` - Helper reutilizable

**Dependencias**:

- `PrismaService`

**Tipos internos** (sin `any`):

```typescript
type InscripcionFinanciera = {
  estadoPago: string;
  precioFinal: number;
  estudianteId: string;
};

type EstudianteConAsistencia = {
  id: string;
  nombre: string;
  apellido: string;
  totalAsistencias: number;
  asistenciasPresente: number;
  porcentajeAsistencia: number;
};

type ClaseConInscripcion = {
  id: string;
  fecha_hora_inicio: Date;
  duracion_minutos: number;
  estado: string;
  rutaCurricular: { nombre: string; color?: string } | null;
  docente: { nombre: string; apellido: string };
  inscripciones: Array<{
    estudiante: {
      id: string;
      nombre: string;
      apellido: string;
    };
  }>;
};
```

---

### 3️⃣ TutorBusinessValidator (~60 líneas)

**Responsabilidad**: Validaciones de reglas de negocio

**Métodos públicos** (3):

- `validarTutorExiste(tutorId)` - Verifica que el tutor existe
- `validarTutorTieneEstudiantes(tutorId)` - Al menos un hijo registrado
- `validarLimitProximasClases(limit)` - Entre 1 y 50

**Dependencias**:

- `PrismaService`

**Excepciones**:

- `NotFoundException` - Tutor no encontrado
- `BadRequestException` - Validación de límite

---

### 4️⃣ TutorFacade (~100 líneas)

**Responsabilidad**: Unificar operaciones Query + Stats

**Métodos públicos** (4):

```typescript
// Delegación a QueryService
async getMisInscripciones(tutorId, periodo?, estadoPago?)
async getProximasClases(tutorId, limit)

// Delegación a QueryService + StatsService
async getDashboardResumen(tutorId)
async obtenerAlertas(tutorId)
```

**Dependencias**:

- `TutorQueryService`
- `TutorStatsService`
- `TutorBusinessValidator`

---

### 5️⃣ TutorService (NUEVO) (~50 líneas)

**Responsabilidad**: Facade público que mantiene API original

```typescript
@Injectable()
export class TutorService {
  constructor(private facade: TutorFacade) {}

  async getMisInscripciones(tutorId, periodo?, estadoPago?) {
    return this.facade.getMisInscripciones(tutorId, periodo, estadoPago);
  }

  async getDashboardResumen(tutorId) {
    return this.facade.getDashboardResumen(tutorId);
  }

  async getProximasClases(tutorId, limit = 5) {
    return this.facade.getProximasClases(tutorId, limit);
  }

  async obtenerAlertas(tutorId) {
    return this.facade.obtenerAlertas(tutorId);
  }
}
```

---

## 🎓 TESTING (CREAR TESTS COMPLETOS)

**⚠️ IMPORTANTE**: El módulo TutorService NO tiene tests actualmente.
Después del refactor, crear suite completa de tests unitarios.

### Tests a crear:

#### `tutor-query.service.spec.ts` (~150 líneas, ~8 tests)

- ✅ getMisInscripciones: retorna inscripciones con resumen
- ✅ getMisInscripciones: filtra por período
- ✅ getMisInscripciones: filtra por estadoPago
- ✅ getDashboardResumen: estructura completa
- ✅ getProximasClases: retorna próximas clases
- ✅ getProximasClases: límite máximo 50
- ✅ obtenerAlertas: estructura correcta

#### `tutor-stats.service.spec.ts` (~200 líneas, ~12 tests)

- ✅ calcularResumen: suma correcta de totales
- ✅ calcularResumen: cuenta estudiantes únicos
- ✅ calcularMetricasDashboard: métricas correctas
- ✅ obtenerPagosPendientes: ordena por fecha
- ✅ obtenerPagosPendientes: calcula días para vencer
- ✅ obtenerClasesHoy: solo clases de hoy
- ✅ obtenerClasesHoy: calcula puedeUnirse correctamente
- ✅ construirAlertas: pagos vencidos prioridad alta
- ✅ construirAlertas: asistencia baja < 70%
- ✅ construirAlertas: ordena por prioridad

#### `tutor-business.validator.spec.ts` (~80 líneas, ~5 tests)

- ✅ validarTutorExiste: OK si existe
- ✅ validarTutorExiste: NotFoundException si no existe
- ✅ validarTutorTieneEstudiantes: OK si tiene hijos
- ✅ validarLimitProximasClases: rechaza límite < 1
- ✅ validarLimitProximasClases: rechaza límite > 50

**Total esperado**: ~25 tests (430 líneas de tests)

---

## 🚀 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Crear servicios especializados

- [ ] Crear `services/tutor-business.validator.ts`
- [ ] Crear `services/tutor-stats.service.ts` (sin `any`, sin `unknown`)
- [ ] Crear `services/tutor-query.service.ts`

### Fase 2: Crear facade

- [ ] Crear `services/tutor-facade.service.ts`

### Fase 3: Refactor principal

- [ ] Actualizar `tutor.service.ts` para delegar a Facade
- [ ] Actualizar `tutor.module.ts` con nuevos providers

### Fase 4: Verificación

- [ ] ✅ `npx tsc --noEmit` → 0 errores
- [ ] ✅ Buscar `: any` → 0 en código de producción
- [ ] ✅ Buscar `: unknown` → 0 en código de producción
- [ ] ✅ Buscar `as any` → 0 en código de producción

### Fase 5: Testing (NUEVA)

- [ ] Crear `__tests__/tutor-business.validator.spec.ts`
- [ ] Crear `__tests__/tutor-stats.service.spec.ts`
- [ ] Crear `__tests__/tutor-query.service.spec.ts`
- [ ] Ejecutar `npm test tutor` → ~25 tests passing

---

## 📈 BENEFICIOS ESPERADOS

### Antes del refactor:

```
✗ 1 archivo de 676 líneas (God Service)
✗ 0 tests
✗ Difícil de mantener
✗ Difícil de testear
✗ Responsabilidades mezcladas
```

### Después del refactor:

```
✓ 5 archivos especializados
✓ ~25 tests unitarios (100% cobertura)
✓ CQRS: Queries separados de Stats
✓ Facade mantiene API simple
✓ Type-safe (sin any/unknown)
✓ Fácil de extender
```

### Métricas finales esperadas:

```
TutorBusinessValidator:  ~60 líneas  (5 tests)
TutorStatsService:      ~280 líneas (12 tests)
TutorQueryService:      ~200 líneas  (8 tests)
TutorFacade:            ~100 líneas  (0 tests - delega)
TutorService (NUEVO):    ~50 líneas  (0 tests - delega)
─────────────────────────────────────
Total:                  ~690 líneas distribuidas
Tests:                   ~25 tests (430 líneas)
```

---

## 🎯 CONSISTENCIA CON REFACTORS PREVIOS

Este refactor sigue el mismo patrón usado en:

- ✅ EstudiantesService (1,293 → 6 servicios, 75 tests)
- ✅ ClasesManagementService (849 → 5 servicios, 36 tests)
- ✅ DocentesService (927 → 5 servicios, 58 tests)

**Próximo en cola**: TutorService (676 → 5 servicios, ~25 tests)

---

## 📝 NOTAS IMPORTANTES

1. **Sin `any` ni `unknown`**: Todos los tipos deben estar completamente tipados
2. **Tests obligatorios**: Este módulo no tiene tests, hay que crearlos
3. **Mantener API original**: TutorController no debe cambiar
4. **Performance**: Mantener `Promise.all()` en getDashboardResumen
5. **Dependencias externas**: InscripcionMensualRepository se mantiene
6. **Tipos externos**: `tutor-dashboard.types.ts` ya están definidos (no cambiar)

---

**FIN DEL ANÁLISIS** ✅
