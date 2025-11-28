# 🧪 Testing Strategy - Mateatletas (ENTERPRISE EDITION)

![Coverage](https://img.shields.io/codecov/c/github/mateatletasclub/mateatletas?style=for-the-badge)
![Tests](https://img.shields.io/github/actions/workflow/status/mateatletasclub/mateatletas/ci.yml?label=tests&style=for-the-badge)
![Quality Gate](https://img.shields.io/badge/quality%20gate-passing-brightgreen?style=for-the-badge)

Este documento describe la estrategia completa de testing para el proyecto Mateatletas.

---

## 📋 Índice

1. [Testing Pyramid](#testing-pyramid)
2. [Quick Start](#quick-start)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Load/Performance Tests](#loadperformance-tests)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Coverage Requirements](#coverage-requirements)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Testing Pyramid

```
         /\
        /  \     E2E Tests (13 tests) - Playwright
       /    \    ├─ Critical user flows
      /------\   └─ Multi-browser (Chrome, Firefox, Safari)
     /        \
    /  Integration\  Integration Tests (5 tests) - Supertest + DB real
   /    Tests      \ ├─ API + Database
  /-----------------\ └─ End-to-end module testing
 /                   \
/   Unit Tests (458)  \ Jest + Vitest
---------------------- ├─ Business logic
                       ├─ Services
                       └─ Guards & Pipes
```

**Distribución:**

- **Unit Tests:** 90% del coverage (458 tests)
- **Integration Tests:** 5% (5 tests contra DB real)
- **E2E Tests:** 5% (13 critical path tests)

---

## ⚡ Quick Start

### Setup Inicial

```bash
# 1. Instalar dependencias
yarn install

# 2. Levantar infraestructura de testing
docker-compose -f docker-compose.test.yml up -d

# 3. Ejecutar migraciones en DB de test
cd apps/api
DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" \
  npx prisma migrate deploy

# 4. Instalar navegadores Playwright (solo primera vez)
npx playwright install --with-deps
```

### Ejecutar Tests

```bash
# Unit tests (API)
cd apps/api && npm test

# Unit tests con coverage (API)
cd apps/api && npm run test:cov

# Unit tests (Web)
cd apps/web && npm test

# Integration tests
cd apps/api && npm run test:integration

# E2E tests (local)
npx playwright test

# E2E tests con UI
npx playwright test --ui

# Load tests
npm install -g artillery
artillery run artillery.yml

# Smoke tests (producción)
./scripts/smoke-test-production.sh
```

---

## 🧪 Unit Tests

### API (Backend) - Jest

**Location:** `apps/api/src/**/*.spec.ts`

**Run:**

```bash
cd apps/api

# Todos los tests
npm test

# Con coverage
npm run test:cov

# Watch mode
npm run test:watch

# Test específico
npm test -- auth.service.spec.ts
```

**Coverage Thresholds:**

- Lines: 70%
- Functions: 65%
- Branches: 60%
- Statements: 70%

**Ejemplo:**

```typescript
// apps/api/src/auth/__tests__/auth.service.spec.ts
describe('AuthService', () => {
  it('should register new tutor', async () => {
    const result = await authService.register({
      email: 'test@test.com',
      password: 'Test123!',
      role: Role.TUTOR,
    });

    expect(result).toHaveProperty('access_token');
    expect(result.user.role).toBe(Role.TUTOR);
  });
});
```

### Web (Frontend) - Vitest

**Location:** `apps/web/src/**/*.{test,spec}.{ts,tsx}`

**Run:**

```bash
cd apps/web

# Todos los tests
npm test

# Con coverage
npm run test:coverage

# UI mode
npm run test:ui
```

**Coverage Thresholds:**

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

---

## 🔗 Integration Tests

Tests que verifican la integración entre módulos y la base de datos REAL.

**Location:** `apps/api/test/integration/**/*.spec.ts`

**Setup:**

```bash
# 1. Levantar PostgreSQL de test
docker-compose -f docker-compose.test.yml up -d postgres-test

# 2. Ejecutar migraciones
DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" \
  npx prisma migrate deploy

# 3. Ejecutar tests
npm run test:integration
```

**Ejemplo:**

```typescript
// test/integration/auth.integration.spec.ts
describe('[INTEGRATION] Auth Module', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup app con DB real
    app = await setupTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  it('should register and login successfully', async () => {
    // Registrar
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'Test123!' })
      .expect(201);

    // Verificar en DB real
    const user = await prisma.tutor.findUnique({
      where: { email: 'test@test.com' },
    });
    expect(user).toBeDefined();

    // Login
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'Test123!' })
      .expect(200);
  });
});
```

**Best Practices:**

- Limpiar DB antes de cada test (`beforeEach`)
- No compartir estado entre tests
- Probar constraints de DB (unique, foreign keys, etc.)

---

## 🎭 E2E Tests

Tests end-to-end con Playwright que simulan usuarios reales.

**Location:** `tests/e2e/**/*.spec.ts`, `apps/web/e2e/**/*.spec.ts`

### Environments

**Local:**

```bash
npx playwright test
```

**Staging:**

```bash
E2E_ENV=staging npx playwright test
```

**Production (smoke tests only):**

```bash
E2E_ENV=production npx playwright test --grep @smoke
```

### Critical Paths

```typescript
// tests/e2e/00-critical-launch.spec.ts
test('Estudiante login + hub gimnasio', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', 'prueba');
  await page.fill('[name="password"]', 'prueba123');
  await page.click('button[type="submit"]');

  // Verificar redirección
  await expect(page).toHaveURL(/\/estudiante/);

  // Hub gimnasio carga
  await expect(page.getByText('Hub del Gimnasio')).toBeVisible();
});
```

### Browsers

- ✅ **Chromium** (default)
- ✅ **Firefox**
- ✅ **Safari** (solo en CI)

---

## ⚡ Load/Performance Tests

Tests de carga con Artillery para medir performance bajo estrés.

**Location:** `artillery.yml`

### Scenarios

1. **Health Check** (20% tráfico)
2. **Login Attempts** (50% tráfico)
3. **Swagger Docs** (10% tráfico)
4. **Frontend Pages** (20% tráfico)

### Ejecutar

```bash
# Instalar Artillery
npm install -g artillery

# Test local
artillery run artillery.yml

# Test staging
artillery run -e staging artillery.yml

# Test production (smoke)
artillery run -e production-smoke artillery.yml

# Stress test
artillery run -e stress artillery.yml

# Con reporte HTML
artillery run artillery.yml --output report.json
artillery report report.json
```

### Métricas

- **p95:** 95% de requests < 2s
- **p99:** 99% de requests < 5s
- **Error Rate:** < 1%

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Jobs:**

1. **Lint & Type Check** (2 min) - ESLint + TypeScript
2. **Unit Tests - API** (5 min) - Jest con PostgreSQL + Redis
3. **Unit Tests - Web** (3 min) - Vitest
4. **E2E Tests** (10 min) - Playwright multi-browser
5. **Build Verification** (5 min) - Producción builds
6. **Security Audit** (2 min) - npm audit + Dependency Review

**Total Time:** ~15 min (jobs en paralelo)

### Triggers

- **Pull Requests** a `main` o `develop`
- **Push** a `main` o `develop`
- **Manual** (`workflow_dispatch`)

### Quality Gate

El merge solo se permite si:

- ✅ Todos los tests pasan
- ✅ Coverage >= thresholds
- ✅ No errores de lint/type check
- ✅ Build exitoso
- ✅ No vulnerabilidades críticas

### PR Comments

El pipeline comenta automáticamente en PRs con:

- ✅ Coverage reports
- ✅ Test results summary
- ✅ Build artifacts links

---

## 📊 Coverage Requirements

### API (Backend)

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 60,
      "functions": 65,
      "lines": 70,
      "statements": 70
    }
  }
}
```

**Excluido de coverage:**

- `*.spec.ts` (tests)
- `*.interface.ts` (interfaces)
- `*.dto.ts` (DTOs)
- `*.module.ts` (módulos)

### Web (Frontend)

```typescript
{
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  }
}
```

**Excluido de coverage:**

- `*.test.ts`
- `*.config.ts`
- `*.stories.tsx`
- `layout.tsx`, `error.tsx`, `loading.tsx` (Next.js)

---

## ✅ Best Practices

### 1. **Naming Conventions**

```typescript
// ✅ GOOD
describe('AuthService - register()', () => {
  it('should register new tutor with valid data', () => {});
  it('should reject duplicate email', () => {});
  it('should hash password with bcrypt', () => {});
});

// ❌ BAD
describe('Test 1', () => {
  it('works', () => {});
});
```

### 2. **Arrange-Act-Assert (AAA)**

```typescript
it('should calculate total price correctly', () => {
  // Arrange
  const item = { price: 100, quantity: 2 };
  const taxRate = 0.21;

  // Act
  const total = calculateTotal(item, taxRate);

  // Assert
  expect(total).toBe(242);
});
```

### 3. **Avoid Test Interdependence**

```typescript
// ❌ BAD - Tests dependen uno del otro
let userId: string;

it('creates user', async () => {
  userId = await createUser();
});

it('updates user', async () => {
  await updateUser(userId); // Falla si test anterior falla
});

// ✅ GOOD - Tests independientes
it('creates user', async () => {
  const userId = await createUser();
  expect(userId).toBeDefined();
});

it('updates user', async () => {
  const userId = await createUser(); // Setup propio
  await updateUser(userId);
  expect(await getUser(userId)).toHaveProperty('updated', true);
});
```

### 4. **Mock External Services**

```typescript
// ✅ GOOD
jest.mock('@/services/email');

it('sends welcome email on registration', async () => {
  await authService.register({ email: 'test@test.com' });

  expect(emailService.send).toHaveBeenCalledWith({
    to: 'test@test.com',
    subject: 'Bienvenido a Mateatletas',
  });
});
```

---

## 🐛 Troubleshooting

### Tests fallan en CI pero pasan localmente

**Causa:** Diferencias de environment (DB, timing, parallelización)

**Solución:**

```bash
# Ejecutar tests en modo CI localmente
CI=true npm test

# Deshabilitar paralelización
npm test -- --runInBand
```

### E2E tests timeout

**Causa:** App no levanta a tiempo en CI

**Solución:** Aumentar timeout en `playwright.config.ts`:

```typescript
webServer: {
  timeout: 180000,  // 3 minutos
}
```

### Coverage por debajo del threshold

**Causa:** Archivos nuevos sin tests

**Solución:**

```bash
# Ver archivos sin coverage
npm run test:cov -- --verbose

# Ver coverage detallado
open apps/api/coverage/lcov-report/index.html
```

### Docker Compose falla

**Causa:** Puerto ya en uso

**Solución:**

```bash
# Liberar puerto 5433
lsof -ti:5433 | xargs kill -9

# Reiniciar containers
docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Artillery Documentation](https://artillery.io/docs/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 Next Steps

- [ ] Agregar visual regression testing (Playwright)
- [ ] Contract testing con Pactum
- [ ] Mutation testing con Stryker
- [ ] Performance budgets
- [ ] Accessibility testing (axe-core)

---

**Mantenido por:** Equipo Mateatletas
**Última actualización:** 2025-11-03
**Versión:** 2.0.0 (Enterprise Edition)
