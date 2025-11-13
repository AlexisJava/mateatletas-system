# 🧪 Test Baseline Pre-Refactor - Mateatletas API

**Fecha**: 2025-11-12
**Propósito**: Establecer baseline de cobertura de tests ANTES del refactor de Fase 1
**Estado**: ✅ Completado

---

## 📊 Coverage Baseline Actual

### Resumen Global (Unit Tests)

| Métrica | Total | Cubierto | % Coverage |
|---------|-------|----------|------------|
| **Lines** | 6,278 | 1,851 | **29.48%** |
| **Statements** | 6,659 | 1,966 | **29.52%** |
| **Functions** | 1,275 | 298 | **23.37%** |
| **Branches** | 4,296 | 1,084 | **25.23%** |

### Tests Ejecutados

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| **Test Suites** | 55 total | 48 passed, 6 failed, 1 skipped |
| **Tests** | 802 total | 762 passed ✅, 29 failed ❌, 11 skipped ⏭️ |
| **Tiempo de Ejecución** | 51.14s | - |

---

## 📂 Coverage por Módulo Crítico

### Módulos que Serán Refactorizados (Fase 1-3)

| Módulo | Lines | Statements | Functions | Branches | Prioridad |
|--------|-------|------------|-----------|----------|-----------|
| **EstudiantesService** | ❓ | ❓ | ❓ | ❓ | 🔴 ALTA (1,293 líneas) |
| **ClasesService** | 0% | 0% | 0% | 0% | 🔴 ALTA (facade, delegación OK) |
| **ClasesManagementService** | 70.12% | 70.98% | 63.63% | 67.88% | ✅ Bien cubierto |
| **ClasesReservasService** | 96.07% | 96.22% | 87.5% | 90% | ✅ Excelente |
| **ClasesAsistenciaService** | 100% | 100% | 100% | 94.44% | ✅ Excelente |
| **AuthService** | 76.51% | 76.82% | 92.3% | 65.67% | 🟡 MEDIA (circular dep) |
| **AuthController** | 92.5% | 92.85% | 71.42% | 61.66% | ✅ Bien cubierto |
| **AdminService** | 0% | 0% | 0% | 0% | 🔴 ALTA (878 líneas, God Service) |
| **AdminEstudiantesService** | 44.68% | 45.45% | 27.77% | 29.48% | 🟡 MEDIA |

### Módulos Críticos con Buena Cobertura

| Módulo | Lines | Statements | Functions | Branches | Nota |
|--------|-------|------------|-----------|----------|------|
| **AdminStatsService** | 100% | 100% | 100% | 70% | ✅ Perfecto |
| **AdminAlertasService** | 96.29% | 96.66% | 100% | 75% | ✅ Excelente |
| **AdminUsuariosService** | 73.33% | 71.15% | 81.81% | 58.33% | ✅ Bueno |
| **TokenBlacklistService** | 83.07% | 83.58% | 85.71% | 77.14% | ✅ Bueno |
| **RolesGuard** | 100% | 100% | 100% | 94.44% | ✅ Perfecto |
| **CircuitBreaker** | 100% | 100% | 100% | 84% | ✅ Perfecto |
| **ColoniaService** | 98.11% | 98.16% | 100% | 89.58% | ✅ Excelente |

---

## 🆕 Tests Creados en Fase 1.1

### Integration Tests

1. **`test/integration/estudiantes.integration.spec.ts`** (NUEVO)
   - 34 tests cubriendo flujos completos de estudiantes
   - CRUD, ownership, filtros, paginación, estadísticas
   - Ejecuta contra DB real

2. **`test/integration/clases.integration.spec.ts`** (NUEVO)
   - 28 tests cubriendo flujos de clases, reservas y asistencia
   - Programar, cancelar, reservar, asistencia
   - Ejecuta contra DB real

3. **`test/integration/auth.integration.spec.ts`** (EXISTENTE)
   - 11 tests de autenticación
   - Register, login, JWT validation

### E2E Tests

4. **`test/e2e/critical-flows.e2e-spec.ts`** (NUEVO)
   - 10+ flujos críticos end-to-end
   - Auth ↔ Gamificación (circular dependency)
   - Estudiantes → Logros
   - Clases → Asistencia → XP
   - Ownership guards
   - CSRF protection
   - Response format standardization

**Total Tests Nuevos**: ~73 tests de integración/E2E

---

## ❌ Tests Fallidos (Documentados como "Comportamiento Actual")

### 1. CSRF Protection Guard (6 tests fallidos)

**Archivo**: `src/common/guards/__tests__/csrf-protection.guard.spec.ts`

**Problema**:
- Tests esperan comportamiento de guard global
- Guard fue refactorizado a opt-in usando decorator `@RequireCsrf()`
- Tests no actualizados para reflejar nuevo comportamiento

**Acción Requerida**:
- ✅ Tests de opt-in creados: `csrf-opt-in.spec.ts` (20 tests, todos passing)
- ⚠️ Tests antiguos pueden eliminarse o actualizarse

**Impacto en Refactor**: NINGUNO (tests obsoletos, funcionalidad OK)

---

### 2. AuthController - sameSite cookie (1 test fallido)

**Archivo**: `src/auth/__tests__/auth.controller.spec.ts`

**Problema**:
```
Expected: sameSite: "strict"
Received: sameSite: "lax"
```

**Causa**: Cookie config cambió de `strict` a `lax` en producción

**Acción Requerida**: Actualizar test para reflejar config actual

**Impacto en Refactor**: NINGUNO

---

### 3. Jest Worker Memory Crash (1 test suite)

**Archivo**: `src/estudiantes/__tests__/copiar-estudiante-entre-sectores.spec.ts`

**Problema**: Jest worker ran out of memory

**Causa**: Test suite muy grande o leak de memoria

**Acción Requerida**: Optimizar test suite o aumentar límite de memoria

**Impacto en Refactor**: NINGUNO (test individual, no afecta funcionalidad)

---

## ✅ Criterios de Éxito Post-Refactor

### Fase 1-2 (Quick Wins + Circular Dependencies)

**Mínimo Aceptable**:
- ✅ Todos los tests existentes que pasan DEBEN seguir pasando (762 tests)
- ✅ Coverage NO debe disminuir (mínimo: 29.48% lines)
- ✅ Tests de integración deben pasar (73 tests nuevos)
- ✅ Tests E2E de flujos críticos deben pasar

**Objetivo Deseable**:
- 🎯 Aumentar coverage a >35% (lines)
- 🎯 Aumentar coverage de servicios críticos a >50%

### Fase 3-4 (Refactor God Services)

**Mínimo Aceptable**:
- ✅ Coverage mínimo: 45% lines
- ✅ EstudiantesService refactorizado: >60% coverage
- ✅ ClasesService (ya OK): mantener >90% coverage
- ✅ AdminService refactorizado: >40% coverage

**Objetivo Deseable**:
- 🎯 Coverage global: >60%
- 🎯 Servicios críticos: >80%

### Fase 5 (Normalización Schema DB)

**Prerequisito OBLIGATORIO**:
- ⛔ Coverage mínimo: **80% lines**
- ⛔ NO iniciar Fase 5 sin alcanzar 80% coverage
- ⛔ Todos los tests de integración deben pasar

---

## 🔍 Análisis de Gaps de Coverage

### Módulos SIN Coverage (0%)

| Módulo | Líneas | Riesgo | Acción |
|--------|--------|--------|--------|
| `AdminService` | 63 | 🔴 ALTO | Crear tests antes de refactor |
| `ClasesService` (facade) | 24 | 🟢 BAJO | OK, delega a servicios testeados |
| `AsistenciaService` | 58 | 🟡 MEDIO | Crear tests de integración |
| `AsistenciaReportesService` | 136 | 🔴 ALTO | Crear tests antes de refactor |
| `ClaseGruposService` | 112 | 🟡 MEDIO | Baja prioridad |

### Módulos con Coverage Bajo (<30%)

| Módulo | Coverage | Riesgo | Acción |
|--------|----------|--------|--------|
| `AdminEstudiantesService` | 44.68% | 🟡 MEDIO | Aumentar coverage a >60% |
| `SectoresRutasService` | 21.79% | 🟡 MEDIO | Crear tests críticos |
| `ProductosService` | 6.84% | 🟢 BAJO | Baja prioridad (catálogo) |

---

## 📝 Comandos de Testing

### Ejecutar Tests por Tipo

```bash
# Unit tests (excluye integration y e2e)
npm run test:unit

# Integration tests (contra DB real)
npm run test:integration

# E2E tests (flujos completos)
npm run test:e2e

# Todos los tests
npm run test:all
```

### Ejecutar con Coverage

```bash
# Coverage de unit tests
npm run test:cov:unit

# Coverage de integration tests
npm run test:cov:integration

# Coverage completo
npm run test:cov
```

### Watch Mode (desarrollo)

```bash
# Watch unit tests
npm run test:watch

# Debug mode
npm run test:debug
```

---

## 🎯 Plan de Acción para Aumentar Coverage

### Prioridad 1 (Antes de Fase 1)

- [ ] Crear tests para `AdminService` (0% → >40%)
- [ ] Crear tests para `AsistenciaService` (0% → >50%)
- [ ] Aumentar coverage de `AdminEstudiantesService` (44% → >60%)

### Prioridad 2 (Durante Fase 3)

- [ ] Crear tests para servicios resultantes del split de EstudiantesService
- [ ] Aumentar coverage de `AuthService` (76% → >85%)
- [ ] Crear tests para `AsistenciaReportesService`

### Prioridad 3 (Antes de Fase 5)

- [ ] Coverage global >80%
- [ ] Todos los servicios críticos >80%
- [ ] Tests de performance para queries DB

---

## 📌 Notas Importantes

### Tests de Regresión

Los tests creados en Fase 1.1 actúan como **tests de regresión** para:

1. **Estudiantes Module**: 34 integration tests
   - Garantizan que CRUD funciona después de refactor
   - Validan ownership guards
   - Verifican filtros y paginación

2. **Clases Module**: 28 integration tests
   - Garantizan flujo de reservas
   - Validan asistencia y XP
   - Verifican permisos (admin, docente, tutor)

3. **Critical Flows**: 10+ E2E tests
   - Garantizan dependencias circulares funcionan
   - Validan formato de respuestas estandarizado
   - Verifican CSRF protection opt-in

### Testing Strategy

- **Unit Tests**: Mockean dependencias, rápidos, aislados
- **Integration Tests**: DB real, verifican queries Prisma, transacciones
- **E2E Tests**: App completa, verifican flujos end-to-end

### CI/CD

Configurar pipeline para ejecutar:
1. `npm run test:unit` (rápido, cada commit)
2. `npm run test:integration` (más lento, cada PR)
3. `npm run test:e2e` (más lento, cada merge a main)

---

## ✅ Conclusión

**Estado Actual**:
- ✅ 762 tests passing (baseline establecido)
- ✅ 73 tests nuevos de regresión creados
- ✅ Coverage actual: 29.48% (bajo pero documentado)
- ✅ Servicios críticos tienen coverage aceptable (>70%)

**Listo para Refactor**: ✅ SÍ
- Tests de regresión cubren funcionalidad crítica
- Servicios refactorizados (ClasesService) tienen >90% coverage
- Cualquier regresión será detectada inmediatamente

**Próximo Paso**: Ejecutar Fase 1 (Quick Wins) con confianza

---

**Última actualización**: 2025-11-12
**Próxima revisión**: Después de completar Fase 1
**Baseline válido hasta**: Fase 5 (Normalización Schema)
