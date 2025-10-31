# 🧪 GUÍA DE EJECUCIÓN - TESTS E2E MATEATLETAS

**Última actualización**: 31 de octubre de 2025

---

## 📋 CONTENIDO

1. [Introducción](#introducción)
2. [Prerequisitos](#prerequisitos)
3. [Estructura de Tests](#estructura-de-tests)
4. [Comandos de Ejecución](#comandos-de-ejecución)
5. [Solución de Problemas](#solución-de-problemas)
6. [Mejoras Sugeridas](#mejoras-sugeridas)

---

## 🎯 INTRODUCCIÓN

Esta suite de tests End-to-End verifica las funcionalidades críticas de los **4 portales** de Mateatletas:

- ✅ **Portal Estudiante** (`/estudiante/*`)
- ✅ **Portal Docente** (`/docente/*`)
- ⚪ **Portal Tutor** (`/dashboard/*`) - Skip por ahora
- ⚪ **Portal Admin** (`/admin/*`) - Opcional

### Cobertura Actual:

| Portal | Tests | Estado | Prioridad |
|--------|-------|--------|-----------|
| Estudiante | 8 tests | ⚠️ Listo, requiere ajuste | 🔴 ALTA |
| Docente | 10 tests | ⚠️ Listo, requiere ajuste | 🔴 ALTA |
| Tutor | 6 tests | ⚪ Skip | 🟡 MEDIA |
| Admin | 0 tests | ⚪ No implementado | 🟢 BAJA |

---

## 📦 PREREQUISITOS

### 1. Instalar Dependencias

```bash
cd apps/web
npm install
```

Playwright ya está instalado en `package.json`:
```json
"@playwright/test": "^1.56.0"
```

### 2. Instalar Browsers de Playwright

```bash
npx playwright install
```

Esto descarga Chromium, Firefox y Webkit.

### 3. Verificar Usuarios de Prueba en BD

Los seeds ya deberían estar aplicados. Verificar con:

```bash
cd apps/api
npm run seed
```

**Usuarios esperados**:
- `lucas.garcia@email.com / Student123!` (Estudiante)
- `sofia.garcia@email.com / Student123!` (Estudiante)
- `juan.perez@docente.com / Test123!` (Docente)
- `maria.garcia@tutor.com / Test123!` (Tutor)
- `admin@mateatletas.com / Admin123!` (Admin)

### 4. Verificar Backend API

```bash
cd apps/api
npm run start:dev
```

API debería estar en: `http://localhost:4000`

Verificar con:
```bash
curl http://localhost:4000/api/health
```

---

## 📂 ESTRUCTURA DE TESTS

```
apps/web/e2e/
├── helpers/
│   └── portal-helpers.ts              (300+ líneas - funciones auxiliares)
│
├── 00-critical-launch.spec.ts         (5 tests - CRÍTICOS para lanzamiento)
├── 00-diagnostico.spec.ts             (3 tests - diagnóstico del sistema)
│
├── estudiante-critical.spec.ts        (8 tests - portal estudiante)
├── docente-critical.spec.ts           (10 tests - portal docente)
└── tutor-basic.spec.ts                (6 tests - skip por ahora)
```

### Descripción de Archivos:

#### `helpers/portal-helpers.ts`

Funciones compartidas:
- `loginEstudiante()` - Login automatizado de estudiante
- `loginDocente()` - Login automatizado de docente
- `loginAdmin()` - Login automatizado de admin
- `navigateToGimnasio()` - Ir al hub del gimnasio
- `waitForDashboardLoad()` - Esperar carga completa
- `expectNoServerError()` - Verificar sin errores 500
- `takeScreenshot()` - Capturar evidencia visual

#### `00-critical-launch.spec.ts` ⭐ CRÍTICO

5 tests que **DEBEN PASAR** antes del lanzamiento:
1. ✅ Estudiante puede hacer login y ver hub
2. ✅ Docente puede hacer login y ver dashboard
3. ✅ Páginas críticas sin errores 500
4. ✅ Navegación básica funciona
5. ✅ Múltiples usuarios pueden hacer login

**Ejecutar con**:
```bash
npx playwright test 00-critical-launch.spec.ts
```

#### `00-diagnostico.spec.ts` 🔍 DIAGNÓSTICO

3 tests para verificar infraestructura:
1. Servidor responde correctamente
2. Página de login carga
3. Estructura de login correcta

**Ejecutar con**:
```bash
npx playwright test 00-diagnostico.spec.ts
```

#### `estudiante-critical.spec.ts`

8 tests para portal estudiante:
- Login con credenciales válidas
- Hub del gimnasio carga sin errores
- Elementos principales visibles
- Navegación a perfil
- Botón "Crear Avatar" funcional
- Navegación a gamificación
- Logout funcional
- Múltiples estudiantes pueden hacer login

#### `docente-critical.spec.ts`

10 tests para portal docente:
- Login con credenciales válidas
- Dashboard carga sin errores
- Elementos principales visibles
- Navegación a clases
- Navegación a planificaciones
- Ver perfil docente
- Secciones adicionales (calendario, observaciones)
- Logout funcional
- Ver lista de estudiantes (si hay datos)
- Funcionalidad de asistencia (si hay datos)

#### `tutor-basic.spec.ts` ⚪ SKIP

6 tests básicos marcados como `.skip()` porque no son críticos para hoy:
- Login tutor
- Dashboard tutor
- Ver estudiantes asignados
- Navegación a planificaciones
- Ver clases
- Logout

---

## ⚡ COMANDOS DE EJECUCIÓN

### Ejecutar Todos los Tests

```bash
cd apps/web
npx playwright test
```

### Ejecutar Solo Tests Críticos

```bash
npx playwright test 00-critical-launch.spec.ts
```

### Ejecutar con UI Interactiva

```bash
npx playwright test --ui
```

Abre una interfaz gráfica donde puedes:
- Ver tests en tiempo real
- Debuggear paso a paso
- Ver screenshots y videos

### Ejecutar un Test Específico

```bash
# Por archivo
npx playwright test estudiante-critical.spec.ts

# Por nombre de test
npx playwright test -g "Estudiante puede hacer login"
```

### Ejecutar en Modo Debug

```bash
npx playwright test --debug
```

Abre Playwright Inspector para debugging interactivo.

### Ejecutar con Headed Mode (Ver Browser)

```bash
npx playwright test --headed
```

Útil para ver qué está haciendo el browser.

### Ver Reporte HTML

```bash
npx playwright show-report
```

Genera un reporte HTML con:
- ✅ Tests que pasaron
- ❌ Tests que fallaron
- 📸 Screenshots automáticos
- 🎥 Videos de fallos
- ⏱️ Tiempos de ejecución

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Problema 1: "Página de login no carga"

**Síntoma**:
```
Error: Timeout waiting for input[type="email"] to be visible
```

**Causa**: La página tiene animaciones de Framer Motion que pueden demorar.

**Solución**:

Opción A - Aumentar timeout en `portal-helpers.ts`:

```typescript
// Línea ~60
await page.waitForLoadState('networkidle', { timeout: 30000 }); // aumentar a 30s
```

Opción B - Esperar animaciones:

```typescript
// Después de navegar a /login
await page.waitForTimeout(2000); // esperar 2 segundos
```

Opción C - Usar selectores más específicos:

```typescript
// En lugar de:
await page.fill('input[type="email"]', email);

// Usar:
await page.fill('input#email', email);
```

### ❌ Problema 2: "Backend no responde"

**Síntoma**:
```
Error: WebServer timed out after 120000ms
```

**Solución**:

1. Verificar que el backend esté corriendo:

```bash
cd apps/api
npm run start:dev
```

2. Verificar puerto 4000:

```bash
lsof -i :4000
```

3. Si está ocupado, matar el proceso:

```bash
kill -9 $(lsof -t -i:4000)
```

### ❌ Problema 3: "Tests fallan aleatoriamente"

**Síntoma**: Tests pasan a veces y fallan otras veces (tests "flaky").

**Causas comunes**:
- Animaciones de UI
- Requests HTTP lentos
- Race conditions

**Solución**:

Aumentar retries en `playwright.config.ts`:

```typescript
retries: process.env.CI ? 2 : 1, // ya está configurado
```

### ❌ Problema 4: "No encuentra usuarios de prueba"

**Síntoma**:
```
Error: Email o contraseña incorrectos
```

**Solución**:

1. Verificar seeds:

```bash
cd apps/api
npm run seed
```

2. Verificar en BD:

```bash
npx prisma studio
```

Ir a tabla `estudiantes` y verificar que existen:
- `lucas.garcia@email.com`
- `sofia.garcia@email.com`

### ❌ Problema 5: "Screenshot no se guarda"

**Síntoma**: No hay screenshots en `test-results/`

**Solución**:

Verificar que el directorio existe:

```bash
mkdir -p test-results
```

Verificar configuración en `playwright.config.ts`:

```typescript
screenshot: 'only-on-failure', // toma screenshots solo en fallos
```

Para tomar screenshots siempre:

```typescript
screenshot: 'on', // toma screenshots siempre
```

---

## 🚀 MEJORAS SUGERIDAS

### 1. Ajustar Timeouts para Animaciones

**Archivo**: `apps/web/e2e/helpers/portal-helpers.ts`

**Líneas a modificar**:

```typescript
// Línea ~60 - Aumentar timeout de networkidle
await page.waitForLoadState('networkidle', { timeout: 30000 }); // de 10s a 30s

// Línea ~68 - Esperar 2 segundos después de click en toggle
if ((await estudianteToggle.count()) > 0) {
  await estudianteToggle.first().click();
  await page.waitForTimeout(2000); // dar tiempo para animación
}

// Línea ~79 - Esperar redirección con timeout mayor
await page.waitForURL('**/estudiante/**', { timeout: 15000 }); // de 10s a 15s
```

### 2. Usar Selectores Más Específicos

**Archivo**: `apps/web/e2e/helpers/portal-helpers.ts`

**Cambio sugerido**:

```typescript
// EN LUGAR DE:
await page.fill('input[type="email"]', email);

// USAR:
await page.fill('input#email[type="email"]', email);
```

Esto es más específico y menos propenso a fallar.

### 3. Agregar Test de Warm-up

**Archivo**: `apps/web/e2e/00-warmup.spec.ts` (NUEVO)

```typescript
import { test } from '@playwright/test';

test.describe('Warmup', () => {
  test('Calentar servidor antes de tests críticos', async ({ page }) => {
    // Hacer requests para calentar el servidor
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Dar 5 segundos para que el servidor esté listo
    await page.waitForTimeout(5000);
  });
});
```

Ejecutar antes de los critical paths:

```bash
npx playwright test 00-warmup.spec.ts 00-critical-launch.spec.ts
```

### 4. Agregar Data Attributes para Selectores

**Recomendación**: Agregar `data-testid` a elementos críticos en el código fuente.

**Archivo**: `apps/web/src/app/login/page.tsx`

**Cambio sugerido**:

```tsx
<input
  id="email"
  data-testid="login-email-input" // AGREGAR ESTO
  type="email"
  value={email}
  // ...
/>

<input
  id="password"
  data-testid="login-password-input" // AGREGAR ESTO
  type="password"
  value={password}
  // ...
/>

<button
  type="submit"
  data-testid="login-submit-button" // AGREGAR ESTO
  // ...
>
```

Luego en tests:

```typescript
await page.fill('[data-testid="login-email-input"]', email);
await page.fill('[data-testid="login-password-input"]', password);
await page.click('[data-testid="login-submit-button"]');
```

### 5. Implementar Page Object Model

**Beneficio**: Tests más mantenibles y legibles.

**Estructura sugerida**:

```
apps/web/e2e/
├── pages/
│   ├── LoginPage.ts
│   ├── EstudianteGimnasioPage.ts
│   └── DocenteDashboardPage.ts
├── helpers/
│   └── portal-helpers.ts
└── tests/
    ├── estudiante.spec.ts
    └── docente.spec.ts
```

**Ejemplo** (`LoginPage.ts`):

```typescript
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmail(email: string) {
    await this.page.fill('input#email', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('input#password', password);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async loginAs(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
```

Uso en tests:

```typescript
import { LoginPage } from '../pages/LoginPage';

test('Login estudiante', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginAs('lucas@email.com', 'Student123!');

  await expect(page).toHaveURL(/\/estudiante/);
});
```

### 6. Agregar Tests de Performance

**Archivo**: `apps/web/e2e/performance.spec.ts` (NUEVO)

```typescript
import { test, expect } from '@playwright/test';

test('Home page carga en menos de 3 segundos', async ({ page }) => {
  const start = Date.now();

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  const elapsed = Date.now() - start;

  console.log(`⏱️ Tiempo de carga: ${elapsed}ms`);

  expect(elapsed).toBeLessThan(3000); // menos de 3 segundos
});
```

---

## 📊 MÉTRICAS DE ÉXITO

### Pre-Lanzamiento (Hoy):

- [ ] Al menos 80% de tests críticos pasan (4 de 5)
- [ ] Login de estudiante funciona
- [ ] Login de docente funciona
- [ ] Sin errores 500 en páginas públicas
- [ ] Tiempo de ejecución < 2 minutos

### Post-Lanzamiento (Próxima semana):

- [ ] 90% de todos los tests pasan
- [ ] Tests de tutor implementados y pasando
- [ ] Tests de performance agregados
- [ ] Page Object Model implementado
- [ ] CI/CD integrado con GitHub Actions

---

## 🔗 RECURSOS ADICIONALES

### Documentación Oficial:

- **Playwright**: https://playwright.dev/docs/intro
- **Next.js Testing**: https://nextjs.org/docs/testing

### Comandos Útiles:

```bash
# Ver ayuda de Playwright
npx playwright --help

# Listar todos los tests sin ejecutar
npx playwright test --list

# Ejecutar solo tests que fallaron la última vez
npx playwright test --last-failed

# Generar código de test automáticamente
npx playwright codegen http://localhost:3000

# Ver trace de un test
npx playwright show-trace trace.zip
```

### Configuración Recomendada para VSCode:

Instalar extensión: **Playwright Test for VSCode**

Agregar a `.vscode/settings.json`:

```json
{
  "playwright.testDir": "apps/web/e2e",
  "playwright.testMatch": "**/*.spec.ts"
}
```

---

## ✅ CHECKLIST PRE-LANZAMIENTO

Antes de ejecutar los tests críticos:

- [ ] Backend API corriendo en `localhost:4000`
- [ ] Frontend corriendo en `localhost:3000`
- [ ] Seeds de usuarios aplicados
- [ ] Playwright browsers instalados
- [ ] Tests actualizados con timeouts adecuados

Ejecutar:

```bash
# 1. Diagnóstico
npx playwright test 00-diagnostico.spec.ts

# 2. Si diagnóstico pasa, ejecutar críticos
npx playwright test 00-critical-launch.spec.ts

# 3. Ver reporte
npx playwright show-report
```

---

## 📞 SOPORTE

**Problemas técnicos**: Ver sección "Solución de Problemas" arriba

**Tests fallando**: Revisar screenshots en `test-results/`

**Dudas sobre implementación**: Revisar código en `apps/web/e2e/`

---

*Última actualización: 31 de octubre de 2025*
*Creado por: Claude Code*
