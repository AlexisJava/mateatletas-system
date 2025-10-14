# 🧪 Tests E2E - Mateatletas

Tests de extremo a extremo (E2E) con Playwright para el flujo de autenticación de Mateatletas.

---

## 📋 Tests Implementados

### Suite Principal: Autenticación - Flujo Completo (7 tests)

1. **✅ Registro exitoso de un nuevo tutor**
   - Verifica que un usuario puede registrarse correctamente
   - Valida redirección automática al dashboard
   - Confirma que se muestra el saludo personalizado

2. **✅ Error de registro con email duplicado**
   - Intenta registrar el mismo email dos veces
   - Verifica que muestra mensaje de error apropiado
   - Confirma que NO redirige al dashboard

3. **✅ Login exitoso con credenciales válidas**
   - Registra un usuario y hace logout
   - Login con las credenciales correctas
   - Verifica acceso al dashboard

4. **✅ Error de login con credenciales inválidas**
   - Intenta login con credenciales que no existen
   - Verifica mensaje de error
   - Confirma que permanece en página de login

5. **✅ Persistencia de sesión después de recargar**
   - Registra un usuario
   - Recarga la página
   - Verifica que sigue autenticado

6. **✅ Logout correcto y limpieza de sesión**
   - Login con un usuario
   - Ejecuta logout
   - Verifica redirección a login
   - Intenta acceder a dashboard sin auth
   - Confirma protección de ruta

7. **✅ Protección de rutas sin autenticación**
   - Limpia localStorage
   - Intenta acceder directamente a /dashboard
   - Verifica redirección automática a login

### Suite Adicional: Casos Edge (3 tests)

8. **✅ Validación de contraseña débil**
   - Intenta registrar con contraseña débil
   - Verifica mensaje de validación

9. **✅ Validación de contraseñas no coinciden**
   - Ingresa contraseñas diferentes en confirmación
   - Verifica mensaje de error

10. **✅ Toggle de visibilidad de contraseña**
    - Verifica botón de mostrar/ocultar contraseña
    - Alterna entre visible y oculto
    - Confirma cambio de tipo de input

---

## 🚀 Ejecutar Tests

### Opción 1: Modo headless (sin UI)

```bash
cd apps/web

# Todos los tests
npm run test:e2e

# Solo tests de auth
npm run test:e2e auth

# Con más detalles
npm run test:e2e -- --debug
```

### Opción 2: Modo headed (con browser visible)

```bash
npm run test:e2e:headed
```

### Opción 3: Modo UI interactivo (recomendado para desarrollo)

```bash
npm run test:e2e:ui
```

Esto abre una interfaz gráfica donde puedes:
- Ver todos los tests
- Ejecutarlos uno por uno
- Ver el browser en acción
- Debuggear paso a paso
- Ver timeline de eventos

### Opción 4: Ver reporte después de ejecutar

```bash
npm run test:e2e:report
```

---

## 📁 Estructura de Archivos

```
apps/web/e2e/
├── auth.spec.ts              # Tests de autenticación (10 tests)
├── helpers/
│   └── test-helpers.ts       # Funciones auxiliares reutilizables
└── README.md                 # Este archivo
```

---

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts`:

```typescript
- Base URL: http://localhost:3000
- Timeout por test: 30 segundos
- Retries: 1 (2 en CI)
- Screenshot: Solo en fallos
- Video: Solo en fallos
- Trace: Solo en fallos
- Browser: Chromium
```

### Modificar configuración

Edita `apps/web/playwright.config.ts` para:
- Cambiar timeouts
- Agregar más browsers (Firefox, Safari)
- Testear en mobile
- Cambiar estrategia de screenshots/videos

---

## 🛠️ Funciones Helper Disponibles

### `registerUser(page, email, password, nombre, apellido)`

Registra un nuevo usuario y espera redirección a dashboard.

**Ejemplo:**
```typescript
await registerUser(page, 'test@example.com', 'Pass123!', 'Juan', 'Pérez');
```

### `loginUser(page, email, password)`

Hace login con un usuario existente.

**Ejemplo:**
```typescript
await loginUser(page, 'test@example.com', 'Pass123!');
```

### `logoutUser(page)`

Cierra sesión del usuario actual.

**Ejemplo:**
```typescript
await logoutUser(page);
```

### `generateUniqueEmail()`

Genera un email único basado en timestamp.

**Ejemplo:**
```typescript
const email = generateUniqueEmail(); // tutor1234567890@test.com
```

### `clearStorage(page)`

Limpia localStorage y sessionStorage.

**Ejemplo:**
```typescript
await clearStorage(page);
```

---

## 📊 Interpretación de Resultados

### ✅ Todos los tests pasan

```
Running 10 tests using 1 worker

  ✓ [chromium] › auth.spec.ts:25:3 › debería registrar un nuevo tutor exitosamente (5.2s)
  ✓ [chromium] › auth.spec.ts:50:3 › debería mostrar error si el email ya existe (8.1s)
  ...

  10 passed (45.3s)
```

**Acción**: Todo funciona correctamente. Puedes hacer deploy.

### ❌ Algunos tests fallan

```
  ✓ [chromium] › auth.spec.ts:25:3 › debería registrar un nuevo tutor exitosamente (5.2s)
  ✗ [chromium] › auth.spec.ts:50:3 › debería mostrar error si el email ya existe (8.1s)

  1 failed
    [chromium] › auth.spec.ts:50:3 › debería mostrar error si el email ya existe
  9 passed (45.3s)
```

**Acción**:
1. Ver el error específico en la salida
2. Abrir el reporte HTML: `npm run test:e2e:report`
3. Ver screenshot del fallo
4. Ver video del fallo (si está disponible)
5. Debuggear con modo UI: `npm run test:e2e:ui`

---

## 🐛 Debugging

### Modo UI Interactivo

```bash
npm run test:e2e:ui
```

Ventajas:
- Ver cada paso del test
- Pausar y reanudar
- Ver DOM en cada momento
- Ver network requests
- Ver console logs

### Agregar breakpoints en el código

```typescript
test('mi test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  // Pausar aquí
  await page.pause();

  await page.fill('input[type="email"]', 'test@example.com');
});
```

### Ver screenshots de fallos

Los screenshots se guardan automáticamente en:
```
apps/web/test-results/
```

### Ver videos de fallos

Los videos se guardan en:
```
apps/web/test-results/[test-name]/video.webm
```

---

## 🔄 Integración Continua (CI)

### GitHub Actions

Agregar al workflow `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

---

## 📝 Agregar Nuevos Tests

### 1. Crear archivo de test

```typescript
// e2e/mi-nuevo-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mi nueva feature', () => {
  test('debería hacer X', async ({ page }) => {
    // Tu test aquí
  });
});
```

### 2. Usar helpers existentes

```typescript
import { registerUser, loginUser } from './helpers/test-helpers';

test('mi test', async ({ page }) => {
  await registerUser(page, 'test@example.com', 'Pass123!', 'Juan', 'Pérez');
  // Continuar con tu test
});
```

### 3. Agregar nuevos helpers

Edita `helpers/test-helpers.ts` para agregar funciones reutilizables.

---

## 🎯 Best Practices

### ✅ DO

- Usar funciones helper para acciones repetitivas
- Generar emails únicos con timestamp
- Limpiar localStorage antes de cada test
- Usar `waitForURL()` para verificar navegación
- Usar locators semánticos (text, role, etc.)
- Agregar timeouts explícitos cuando sea necesario

### ❌ DON'T

- No hardcodear delays con `page.waitForTimeout()`
- No usar IDs o clases inestables como selectores
- No crear dependencias entre tests
- No compartir estado entre tests
- No usar credenciales reales en tests

---

## 📚 Recursos

- [Documentación Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

## ✅ Checklist antes de Deploy

- [ ] Todos los tests E2E pasan
- [ ] No hay tests flakey (que fallen intermitentemente)
- [ ] Screenshots y videos de fallos revisados
- [ ] Nuevas features tienen tests E2E
- [ ] Tests corren en CI/CD

---

**Última Actualización**: 2025-10-12
**Cobertura**: 10 tests E2E para flujo de autenticación
**Estado**: ✅ Todos los tests implementados y documentados
