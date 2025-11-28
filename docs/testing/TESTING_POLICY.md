# Política de Testing - Mateatletas Ecosystem

## Estado Actual

**Tests Críticos:** ✅ 65 tests pasando (Auth: 30, Pagos: 35)
**Tests Restantes:** ⚠️ ~70 tests con errores de compilación (WIP)
**Estrategia:** Opción B + C Híbrido

---

## Política para Nuevas Features (TDD Obligatorio)

### Regla de Oro

**TODA nueva feature DEBE incluir tests ANTES de merge a `main`.**

### Proceso TDD Requerido

1. **Escribir test que falla** (Red)

   ```bash
   npm test -- mi-feature.spec.ts
   # Debe fallar con razón clara
   ```

2. **Implementar código mínimo** (Green)
   - Escribir solo lo necesario para pasar el test
   - NO over-engineer

3. **Refactorizar** (Refactor)
   - Mejorar código manteniendo tests verdes
   - Eliminar duplicación

4. **Repetir** hasta completar feature

### Checklist de PR

Antes de crear PR, verificar:

- [ ] Tests escritos ANTES de implementación
- [ ] Todos los tests nuevos pasan (`npm test -- mi-feature.spec.ts`)
- [ ] Tests críticos siguen pasando (CI los verifica)
- [ ] Coverage de la nueva feature >= 80%
- [ ] Tests documentan el comportamiento esperado

### Tipos de Tests Requeridos

#### 1. Unit Tests (OBLIGATORIO)

- Servicios: `*.service.spec.ts`
- Controladores: `*.controller.spec.ts`
- Utilities: `*.utils.spec.ts`

**Ejemplo:**

```typescript
describe('MiNuevoService', () => {
  it('should do something', () => {
    // Arrange
    const service = new MiNuevoService();

    // Act
    const result = service.doSomething();

    // Assert
    expect(result).toBe(expected);
  });
});
```

#### 2. Integration Tests (RECOMENDADO)

- Flujos completos con DB
- Webhooks externos
- Autenticación end-to-end

#### 3. E2E Tests (Para features críticas de UI)

- Playwright
- Flujos críticos: login, pago, clase

---

## Tests Críticos Protegidos

Estos tests NUNCA deben romperse:

### Auth (30 tests)

- `apps/api/src/auth/__tests__/auth.service.spec.ts`
- Cubre: registro, login, validación, perfiles, security

### Pagos (35 tests)

- `apps/api/src/pagos/__tests__/pagos.service.spec.ts`
- Cubre: webhooks, procesamiento, membresías, historial

**CI/CD los ejecuta automáticamente en cada PR.**

---

## Tests Legacy (No Bloqueantes)

Tests con errores existentes:

- `admin-estudiantes.service.spec.ts`
- `auth-cambiar-password.service.spec.ts`
- `roles.guard.spec.ts`
- `asistencia-batch-upsert.spec.ts`
- ... ~20 archivos más

### Política para Legacy Tests

**NO es necesario arreglarlos INMEDIATAMENTE.**

**SÍ es obligatorio arreglarlos cuando:**

- Modificas el código que testean
- Agregas feature relacionada
- Tienes tiempo en sprint de refactor

---

## Comandos Útiles

```bash
# Ejecutar tests críticos (siempre deben pasar)
npm test -- auth.service.spec.ts
npm test -- pagos.service.spec.ts

# Ejecutar test específico
npm test -- mi-feature.spec.ts

# Ejecutar con coverage
npm run test:cov

# Watch mode (desarrollo)
npm run test:watch

# Ver qué tests fallan
npm test 2>&1 | grep "FAIL"
```

---

## Estándares de Calidad

### Coverage Mínimo

- **Nueva feature:** >= 80% coverage
- **Servicio crítico (auth, pagos):** >= 90% coverage
- **Utility/Helper:** >= 70% coverage

### Estructura de Tests

```typescript
describe('ComponentName - FeatureName', () => {
  // Setup
  beforeEach(() => {
    // Initialize mocks
  });

  describe('methodName', () => {
    it('should handle happy path', () => {
      // Arrange - Given
      // Act - When
      // Assert - Then
    });

    it('should throw error when invalid input', () => {
      // Test edge cases
    });
  });
});
```

### Nomenclatura

- **Archivos:** `*.spec.ts` (unit), `*.e2e.spec.ts` (e2e)
- **Describe:** Nombre del componente/servicio + feature
- **It:** Debe leer como frase completa ("should ...")

---

## CI/CD Integration

### GitHub Actions

Pipeline automático en `.github/workflows/ci.yml`:

1. **Lint** - ESLint + Prettier
2. **Type Check** - TypeScript compilación
3. **Tests Críticos** - Auth + Pagos (65 tests)
4. **Build** - Next.js + NestJS

**El PR se bloquea si cualquiera falla.**

### Workflow

```
Developer → PR → CI runs → ✅ Merge | ❌ Fix
```

---

## Migrando Tests Legacy

### Prioridad de Arreglo

**Alta (próximas 2 semanas):**

- Tests de gamificación (20 tests)
- Tests de clases/asistencia (15 tests)

**Media (próximo sprint):**

- Tests de admin services
- Tests de estudiantes

**Baja (backlog):**

- Tests de guards
- Tests de validators

### Cómo Arreglar un Test Legacy

1. **Leer el error TypeScript**

   ```bash
   npx tsc --noEmit | grep nombre-del-test.spec.ts
   ```

2. **Identificar categoría:**
   - Missing imports → agregar imports
   - Mock types → actualizar mocks
   - Método no existe → eliminar test o crear método
   - DTO changed → actualizar DTO test data

3. **Arreglar y verificar:**

   ```bash
   npm test -- nombre-del-test.spec.ts
   ```

4. **Commitear con contexto:**
   ```bash
   git commit -m "test(legacy): arreglar nombre-del-test - X tests pasando"
   ```

---

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing NestJS](https://docs.nestjs.com/fundamentals/testing)
- [Playwright E2E](https://playwright.dev/)
- [TDD by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

## Excepciones

### Cuándo NO es necesario TDD inmediato:

1. **Spike/Proof of Concept** - Experimento técnico
2. **Hotfix crítico de producción** - Arreglar después
3. **Documentación/README** - No requiere tests
4. **Configuración (eslint, prettier, etc.)** - No requiere tests

**Pero SIEMPRE agregar tests antes del siguiente sprint.**

---

## Contacto

Preguntas sobre testing:

- Slack: #testing
- Issues: Etiquetar con `testing`
- Code review: Pedir feedback sobre tests

---

**Última actualización:** 21 de Octubre, 2025
**Política aprobada por:** Equipo de desarrollo
**Revisión:** Cada sprint (bi-semanal)
