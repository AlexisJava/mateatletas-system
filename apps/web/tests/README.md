# Tests E2E - Colonia de Verano Landing Page

Este directorio contiene los tests end-to-end (E2E) de Playwright para la landing page de la Colonia de Verano 2026.

## Estructura de Tests

```
tests/e2e/
├── 01-smoke.spec.ts                  # Tests de humo básicos
├── 02-colonia-landing.spec.ts        # Tests visuales de landing page
├── 03-colonia-catalog.spec.ts        # Tests de catálogo y filtros
├── 04-colonia-inscription-form.spec.ts # Tests del formulario de inscripción
└── 05-colonia-e2e-flow.spec.ts       # Tests de flujo completo de usuario
```

## Tests Implementados

### 01-smoke.spec.ts
- ✅ Verificación básica de que la aplicación carga
- ✅ Página principal accesible
- ✅ Página de inscripción 2026 accesible

### 02-colonia-landing.spec.ts
**Smoke Tests de Landing Page:**
- ✅ Landing page carga correctamente
- ✅ HeroSection - Elementos principales visibles (título, fechas, badges)
- ✅ HeroSection - CTAs funcionales ("VER CURSOS", "VER PRECIOS")
- ✅ InfoSection visible
- ✅ CourseCatalog - Sección visible con título
- ✅ PricingSection visible
- ✅ Footer presente
- ✅ ScrollToTop aparece después de hacer scroll
- ✅ No hay errores en consola
- ✅ Responsive - Mobile viewport (375x667)
- ✅ Responsive - Tablet viewport (768x1024)

### 03-colonia-catalog.spec.ts
**Tests de Catálogo y Filtros:**
- ✅ Filtros de área están visibles y funcionales
- ✅ Filtros de edad están visibles
- ✅ Al inicio muestra todos los cursos (11 cursos)
- ✅ Filtro por área "Matemática" reduce la lista
- ✅ Filtro por área "Programación" muestra cursos correctos
- ✅ Filtro por edad "5-6 años" muestra cursos apropiados
- ✅ Combinación de filtros: área + edad
- ✅ Mensaje "No hay cursos" con filtros incompatibles
- ✅ Volver a "Todas" restaura la lista completa

**Tests de Course Cards:**
- ✅ Course cards están visibles
- ✅ Course card tiene botón "VER MÁS" o "ME INTERESA"
- ✅ Click en curso muestra modal con detalles

**Tests de Performance:**
- ✅ Los filtros responden rápidamente (< 2 segundos)

### 04-colonia-inscription-form.spec.ts
**Tests de Modal:**
- ✅ Botón "VER CURSOS DISPONIBLES" del Hero NO abre modal
- ✅ Hay botones de inscripción en diferentes secciones
- ✅ Click en botón de inscripción abre el modal
- ✅ Modal tiene botón de cerrar (X)
- ✅ Click en botón X cierra el modal

**Step 1: Tutor Data:**
- ✅ Paso 1 muestra todos los campos requeridos
- ✅ Campo CUIL formatea correctamente con guiones
- ✅ Contraseñas deben coincidir para avanzar
- ✅ Con datos válidos, botón Siguiente se habilita
- ✅ Click en Siguiente avanza al paso 2

**Step 2: Estudiantes:**
- ✅ Paso 2 muestra formulario de estudiante
- ✅ Botón "Agregar otro estudiante" funciona
- ✅ Agregar 2+ estudiantes muestra mensaje de descuento
- ✅ Agregar 3 estudiantes muestra descuento 24%
- ✅ Botón "Eliminar" elimina estudiante
- ✅ Con datos válidos, avanza al paso 3
- ✅ Botón "Atrás" vuelve al paso 1

**Step 3: Course Selection:**
- ✅ Paso 3 muestra lista de cursos disponibles
- ✅ Se puede seleccionar un curso
- ✅ Se pueden seleccionar hasta 2 cursos
- ✅ Con al menos 1 curso seleccionado, se puede avanzar

**Navigation & Progress:**
- ✅ Progress bar muestra paso actual
- ✅ Progress bar avanza con los pasos

### 05-colonia-e2e-flow.spec.ts
**User Journey Completo:**
- ✅ Journey completo: landing → filtros → inscripción (sin pago final)
- ✅ Journey alternativo: usuario sin hermanos, 1 solo curso
- ✅ Journey con navegación hacia atrás (back buttons)

**Edge Cases:**
- ✅ Cerrar modal en medio del proceso
- ✅ Intentar avanzar sin llenar campos requeridos

**Performance:**
- ✅ El flujo completo se completa en menos de 2 minutos

## Comandos

### Ejecutar todos los tests
```bash
yarn workspace web test:e2e
```

### Ejecutar tests en modo UI (interfaz visual)
```bash
yarn workspace web test:e2e:ui
```

### Ejecutar tests en modo headed (con navegador visible)
```bash
yarn workspace web test:e2e:headed
```

### Ver reporte de resultados
```bash
yarn workspace web test:e2e:report
```

### Ejecutar solo un archivo de tests
```bash
yarn workspace web test:e2e tests/e2e/02-colonia-landing.spec.ts
```

### Ejecutar tests por nombre
```bash
yarn workspace web test:e2e --grep "Filtros"
```

## Configuración

La configuración de Playwright se encuentra en `playwright.config.ts`:
- **testDir**: `./tests/e2e`
- **timeout**: 30 segundos por test
- **baseURL**: `http://localhost:3000`
- **webServer**: Arranca automáticamente el servidor Next.js antes de ejecutar tests
- **browsers**: Chromium (Desktop Chrome)

## Notas Importantes

### Tests sin Pago Real
Los tests del formulario de inscripción **NO** ejecutan el pago final en MercadoPago. Se detienen en el paso de "Resumen" antes de enviar el formulario. Esto evita crear pagos reales durante los tests.

### Servidor de Desarrollo
Los tests configuran automáticamente el servidor de desarrollo (`npm run dev`) antes de ejecutarse. Si el servidor ya está corriendo, se reutiliza.

### Timeouts
- Test timeout: 30 segundos
- Expect timeout: 5 segundos
- Tests E2E marcados como `.slow()`: 90 segundos

## Convenciones

1. **Archivos numerados**: Los tests están numerados para indicar el orden sugerido de ejecución
2. **Test.describe**: Los tests se agrupan en bloques descriptivos
3. **Test.beforeEach**: Setup común se extrae a beforeEach hooks
4. **Selectores semánticos**: Se prefieren selectores por texto visible al usuario
5. **Esperas inteligentes**: Se usan waitForTimeout solo cuando es necesario

## CI/CD

Los tests están configurados para CI/CD:
- **forbidOnly**: `true` en CI - Falla si hay `test.only`
- **retries**: 2 reintentos en CI
- **workers**: 1 worker en CI (sin paralelización)
- **reporter**: HTML report

## Troubleshooting

### Error: "test.describe() not expected to be called here"
- Asegúrate de ejecutar con `yarn workspace web test:e2e` (no `npx playwright test`)
- Los tests están excluidos de vitest en `vitest.config.ts`

### Tests fallan por timeout
- Aumenta el timeout en `playwright.config.ts`
- Verifica que el servidor de desarrollo esté corriendo correctamente
- Revisa logs de consola para errores de la aplicación

### Modal no se abre
- Verifica que el botón de inscripción esté visible
- Asegúrate de hacer scroll a la posición correcta antes de clickear
- Revisa que no haya errores de JavaScript en la consola

## Próximos Pasos

Para extender estos tests:
1. Agregar tests de accesibilidad (axe-core)
2. Tests visuales de regresión (screenshots comparison)
3. Tests de performance (Lighthouse CI)
4. Tests de SEO
5. Tests de internacionalización (i18n)
6. Tests con diferentes roles de usuario
7. Tests de integración con API real

## Referencias

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test selectors](https://playwright.dev/docs/selectors)
- [CI/CD setup](https://playwright.dev/docs/ci)
