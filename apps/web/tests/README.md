# Tests E2E - Colonia de Verano Landing Page

Este directorio contiene los tests end-to-end (E2E) de Playwright para la landing page de la Colonia de Verano 2026.

## 🚀 Configuración de Nivel Producción

Este proyecto utiliza una configuración avanzada de Playwright con:

- ✅ **Multi-browser testing**: Chrome, Firefox, Safari (WebKit)
- ✅ **Mobile & Tablet testing**: Android (Pixel 5), iOS (iPhone 13), iPad Pro
- ✅ **Video recording**: Grabación automática de fallos para debugging
- ✅ **HAR files**: Captura de requests/responses de red
- ✅ **Multiple reporters**: HTML, JSON, JUnit, GitHub Actions
- ✅ **Accessibility testing**: Tests WCAG 2.1 AA con axe-core
- ✅ **Global setup/teardown**: Preparación y limpieza automática
- ✅ **CI/CD ready**: Configuración optimizada para pipelines

## Estructura de Tests

```
tests/e2e/
├── 01-smoke.spec.ts                    # Tests de humo básicos
├── 02-colonia-landing.spec.ts          # Tests visuales de landing page
├── 03-colonia-catalog.spec.ts          # Tests de catálogo y filtros
├── 04-colonia-inscription-form.spec.ts # Tests del formulario de inscripción
├── 05-colonia-e2e-flow.spec.ts         # Tests de flujo completo de usuario
├── 06-accessibility.spec.ts            # Tests de accesibilidad WCAG 2.1 AA
├── global-setup.ts                     # Setup global (BD, auth, etc.)
└── global-teardown.ts                  # Limpieza global
```

## Tests Implementados

### 01-smoke.spec.ts (2 tests)

- ✅ Verificación básica de que la aplicación carga
- ✅ Página principal accesible
- ✅ Página de colonia 2025 accesible

### 02-colonia-landing.spec.ts (11 tests)

- ✅ Landing page carga correctamente
- ✅ HeroSection - Elementos principales visibles
- ✅ HeroSection - CTAs funcionales
- ✅ CourseCatalog visible
- ✅ PricingSection visible
- ✅ Tests responsive (mobile, tablet)

### 03-colonia-catalog.spec.ts (13 tests)

- ✅ Filtros de área y edad funcionales
- ✅ Combinación de filtros
- ✅ Course cards interactivas
- ✅ Tests de performance

### 04-colonia-inscription-form.spec.ts (20 tests)

- ✅ Modal de inscripción
- ✅ Formulario multi-paso (5 pasos)
- ✅ Validaciones de campos
- ✅ Navegación entre pasos
- ✅ Progress bar

### 05-colonia-e2e-flow.spec.ts (6 tests)

- ✅ Journey completo de usuario
- ✅ Journey alternativo
- ✅ Edge cases

### 06-accessibility.spec.ts (19 tests) 🆕

- ✅ WCAG 2.1 Level AA compliance
- ✅ Navegación por teclado
- ✅ Color contrast
- ✅ ARIA attributes
- ✅ Mobile accessibility

**Total: 71 tests implementados** ✅

## 📦 Comandos Disponibles

### Comandos Básicos

```bash
# Ejecutar todos los tests (todos los browsers)
yarn workspace web test:e2e

# Ejecutar en modo UI (interfaz visual interactiva)
yarn workspace web test:e2e:ui

# Ejecutar con navegador visible
yarn workspace web test:e2e:headed

# Modo debug (pausa en cada acción)
yarn workspace web test:e2e:debug

# Ver reporte de resultados
yarn workspace web test:e2e:report
```

### Comandos por Browser 🆕

```bash
# Solo Chromium (más rápido)
yarn workspace web test:e2e:chromium

# Solo Firefox
yarn workspace web test:e2e:firefox

# Solo WebKit (Safari)
yarn workspace web test:e2e:webkit

# Todos los browsers desktop
yarn workspace web test:e2e:desktop

# Solo mobile devices
yarn workspace web test:e2e:mobile
```

### Comandos por Test Suite 🆕

```bash
# Solo smoke tests (rápido)
yarn workspace web test:e2e:smoke

# Solo tests de accesibilidad
yarn workspace web test:e2e:accessibility
```

### Comandos para CI/CD 🆕

```bash
# Ejecutar en modo CI (con todos los reporters)
yarn workspace web test:e2e:ci

# Instalar browsers (primera vez o en CI)
yarn workspace web test:e2e:install
```

## ⚙️ Configuración

La configuración de Playwright se encuentra en [playwright.config.ts](../playwright.config.ts)

### Variables de Entorno

```bash
# Base URL (default: http://localhost:3000)
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Número de workers (default: auto en dev, 1 en CI)
PLAYWRIGHT_WORKERS=4

# Forzar modo CI
CI=1
```

### Projects Configurados

1. **chromium** - Desktop Chrome (1920x1080)
2. **firefox** - Desktop Firefox (1920x1080)
3. **webkit** - Desktop Safari (1920x1080)
4. **Mobile Chrome** - Android Pixel 5
5. **Mobile Safari** - iPhone 13
6. **iPad** - iPad Pro

## 🎯 Global Setup & Teardown

### Global Setup

Ejecuta UNA VEZ antes de todos los tests:

- Verifica que la aplicación está disponible
- Puede preparar BD de prueba
- Valida variables de entorno críticas

### Global Teardown

Ejecuta UNA VEZ después de todos los tests:

- Limpia datos de prueba
- Elimina archivos temporales
- Genera reportes consolidados

## 📊 Reportes

### HTML Report

```bash
yarn workspace web test:e2e:report
```

### JSON Report

Ubicación: `test-results/results.json`

### JUnit Report

Ubicación: `test-results/junit.xml` (para CI/CD)

### GitHub Actions

Annotations automáticas en PRs

## 🎬 Videos y Screenshots

- **Videos**: `test-results/videos/` (solo en fallos)
- **Screenshots**: `test-results/screenshots/` (solo en fallos)
- **HAR files**: `test-results/hars/` (solo en desarrollo)

## 🔍 Debugging

```bash
# Playwright Inspector
yarn workspace web test:e2e:debug

# Ver trace
npx playwright show-trace test-results/.../trace.zip
```

## 🔒 Accessibility Testing

Tests de accesibilidad con axe-core verifican:

- WCAG 2.1 Level AA compliance
- Color contrast (4.5:1 mínimo)
- Keyboard navigation
- Screen reader support
- Form labels
- Semantic HTML

```bash
yarn workspace web test:e2e:accessibility
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
- name: Install Playwright browsers
  run: yarn workspace web test:e2e:install

- name: Run E2E tests
  run: yarn workspace web test:e2e:ci

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: apps/web/test-results/
```

### GitLab CI

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.56.0-noble
  script:
    - yarn workspace web test:e2e:ci
  artifacts:
    reports:
      junit: apps/web/test-results/junit.xml
```

## 🐛 Troubleshooting

### Tests fallan por timeout

- Aumentar timeout: `timeout: 60000` en config
- Marcar test lento: `test.slow()`

### Modal no se abre

- Verificar scroll antes de clickear
- Usar `{ force: true }` si necesario

### Browsers no instalados

```bash
yarn workspace web test:e2e:install
```

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
