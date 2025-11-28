# Tests E2E con Playwright - SLICE #14

Este directorio contiene los tests end-to-end (E2E) para el **SLICE #14: Portal Docente Completo** usando Playwright.

## 📋 Estructura de Tests

```
tests/e2e/
├── helpers/
│   └── auth.ts                        # Helper de autenticación
├── slice-14-perfil-docente.spec.ts    # Tests de perfil
├── slice-14-calendario.spec.ts        # Tests de calendario
├── slice-14-observaciones.spec.ts     # Tests de observaciones
├── slice-14-reportes.spec.ts          # Tests de reportes
├── slice-14-integracion.spec.ts       # Tests de integración
└── README.md                          # Este archivo
```

## 🎯 Cobertura de Tests

### 1. Perfil del Docente (6 tests)

- ✅ Carga de página
- ✅ Visualización de datos
- ✅ Validación de campos
- ✅ Actualización de perfil
- ✅ Estados de carga
- ✅ Navegación

### 2. Calendario de Clases (6 tests)

- ✅ Carga de página
- ✅ Grid del calendario
- ✅ Navegación entre meses
- ✅ Toggle calendario/lista
- ✅ Código de colores
- ✅ Responsive design

### 3. Observaciones (9 tests)

- ✅ Carga de página
- ✅ Campo de búsqueda
- ✅ Filtros de fecha
- ✅ Limpiar filtros
- ✅ Lista de observaciones
- ✅ Fotos de estudiantes
- ✅ Modal de detalles
- ✅ Badges de estado
- ✅ Responsive design

### 4. Reportes con Gráficos (11 tests)

- ✅ Carga de página
- ✅ 4 tarjetas de estadísticas
- ✅ Gráfico de barras (semanal)
- ✅ Gráfico de dona (estados)
- ✅ Gráfico de líneas (rutas)
- ✅ Tabla top 10 estudiantes
- ✅ Tabla por ruta curricular
- ✅ Estado de carga
- ✅ Caso sin datos
- ✅ Responsive design
- ✅ Carga de Chart.js

### 5. Integración (7 tests)

- ✅ Flujo completo de navegación
- ✅ Navegación consistente
- ✅ Sin errores en consola
- ✅ Tiempo de carga
- ✅ Persistencia de autenticación
- ✅ Navegación directa por URL
- ✅ Botón volver atrás

**Total: 39 tests**

## 🚀 Ejecución de Tests

### Prerequisitos

1. **Backend corriendo**: `http://localhost:3001`
2. **Frontend corriendo**: `http://localhost:3000` (Playwright lo inicia automáticamente)
3. **Usuario docente creado** con credenciales:
   - Email: `docente.test@mateatletas.com`
   - Password: `Docente123!`

### Ejecutar Todos los Tests

```bash
# Desde la raíz del proyecto
npx playwright test

# Con UI mode (recomendado para debugging)
npx playwright test --ui

# En modo headed (ver el navegador)
npx playwright test --headed

# Un solo archivo
npx playwright test slice-14-perfil-docente.spec.ts

# Con reporte HTML
npx playwright test --reporter=html
```

### Scripts NPM

```bash
# Ejecutar tests
npm run test:e2e

# Ejecutar con UI
npm run test:e2e:ui

# Ver reporte
npm run test:e2e:report
```

## 📊 Reportes

Después de ejecutar los tests, puedes ver el reporte HTML:

```bash
npx playwright show-report
```

El reporte incluye:

- Screenshots de fallos
- Traces para debugging
- Tiempos de ejecución
- Videos (si se configuran)

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts` en la raíz del proyecto.

### Configuración Actual

- **Browser**: Firefox (compatible con Linux)
- **Base URL**: http://localhost:3000
- **Timeout**: 30 segundos por test
- **Screenshots**: Solo en fallos
- **Trace**: En primer reintento
- **Workers**: Paralelo (excepto en CI)

## 🛠️ Debugging

### Con Playwright Inspector

```bash
npx playwright test --debug
```

### Con VS Code

Instala la extensión "Playwright Test for VSCode" y ejecuta los tests desde el panel de tests.

### Ver Traces

```bash
npx playwright show-trace trace.zip
```

## ✅ Mejores Prácticas

1. **Esperas**: Usar `page.waitForTimeout()` solo cuando sea necesario
2. **Selectores**: Preferir selectores por texto y ARIA labels
3. **Assertions**: Usar `expect()` de Playwright
4. **Cleanup**: Los tests son independientes
5. **Autenticación**: Se hace por API (más rápido)

## 📝 Crear Nuevos Tests

```typescript
import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

test.describe('Nueva Funcionalidad', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDocente(page);
  });

  test('debe hacer algo', async ({ page }) => {
    await page.goto('/ruta');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## 🐛 Troubleshooting

### Tests fallan con timeout

- Aumentar timeout en `playwright.config.ts`
- Verificar que el backend esté corriendo
- Verificar que el frontend esté corriendo

### Error de autenticación

- Verificar que existe el usuario docente
- Verificar credenciales en `tests/e2e/helpers/auth.ts`
- Verificar que el token se guarda en localStorage

### Navegador no se abre

```bash
# Reinstalar navegadores
npx playwright install firefox

# O reinstalar todos (forzar)
npx playwright install --force
```

**Nota**: El proyecto usa Firefox por compatibilidad con Linux. Si deseas usar otro navegador, edita `playwright.config.ts`.

### Tests pasan localmente pero fallan en CI

- Configurar headless mode
- Aumentar timeouts
- Verificar dependencias del sistema

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Locators](https://playwright.dev/docs/locators)

## 🎉 Resultados Esperados

Al ejecutar todos los tests, deberías ver:

```
Running 39 tests using 1 worker

  ✓ Perfil del Docente (6/6)
  ✓ Calendario de Clases (6/6)
  ✓ Observaciones (9/9)
  ✓ Reportes (11/11)
  ✓ Integración (7/7)

39 passed (Xs)
```

---

**Desarrollado para**: SLICE #14 - Portal Docente Completo
**Fecha**: Octubre 2025
**Framework**: Playwright + TypeScript
