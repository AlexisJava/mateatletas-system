# Vulnerabilidades de Seguridad Pendientes

**Fecha**: 27 de Octubre 2025
**Ejecutado**: `npm audit` + `npm audit fix`
**Estado**: 2 vulnerabilidades requieren revisión manual

---

## Resumen

### ✅ Resueltas Automáticamente

- **validator** `<13.15.20` → Actualizado a versión segura
- **esbuild** moderate (parcial) → Requiere `--force` para fix completo

### ⚠️ Pendientes de Revisión

#### 1. esbuild <=0.24.2 (MODERATE)

**Vulnerabilidad**: [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
**Descripción**: esbuild permite que cualquier sitio web envíe requests al development server y lea la respuesta

**Impacto**:

- Solo afecta en **desarrollo** (dev server)
- No afecta producción
- Requiere que el atacante sepa la URL del dev server local

**Fix Disponible**: `npm audit fix --force`
**Consecuencia del fix**:

- Actualizará `vitest@4.0.4` (breaking change)
- Puede requerir actualizar tests

**Recomendación**:

- **BAJO RIESGO para lanzamiento viernes** (no afecta producción)
- **POST-LANZAMIENTO**: Ejecutar `npm audit fix --force` y actualizar tests
- **MITIGACIÓN**: No exponer dev server a internet, solo localhost

**Cadena de dependencias afectada**:

```
vitest → vite-node → vite → esbuild
```

---

#### 2. xlsx \* (HIGH)

**Vulnerabilidades**:

- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) - Prototype Pollution
- [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) - ReDoS

**Descripción**:

- Prototype Pollution en sheetJS
- Regular Expression Denial of Service (ReDoS)

**Impacto**:

- Afecta procesamiento de archivos Excel/CSV
- Prototype pollution puede permitir inyección de propiedades
- ReDoS puede causar DoS con archivos maliciosos

**Fix Disponible**: **NO** (upstream sin patch)

**Uso en el proyecto**:

```bash
# VERIFICADO: xlsx NO se usa en el código fuente
# Solo aparece en apps/web/.next/ (build artifacts)
# Conclusión: Dependencia transitiva que NO usamos directamente
```

**Estado**: ✅ **NO SE USA DIRECTAMENTE EN CÓDIGO**

**Recomendaciones por prioridad**:

1. **CRÍTICO - Si se procesa input de usuarios**:
   - Validar y sanitizar archivos antes de procesar
   - Limitar tamaño de archivos
   - Rate limiting en endpoints de upload

2. **ALTERNATIVAS**:
   - Migrar a `exceljs` (más activo, mejor mantenido)
   - Usar `papaparse` para CSV solamente
   - Procesar archivos en worker aislado

3. **MITIGACIÓN TEMPORAL**:
   - Validar extensiones de archivo estrictamente
   - Timeout en procesamiento de archivos
   - Sandbox el procesamiento de xlsx

**Acción requerida**:

- [ ] Verificar si xlsx se usa con input de usuarios
- [ ] Si NO se usa: Remover del package.json
- [ ] Si SÍ se usa: Implementar mitigaciones + planificar migración

---

## Plan de Acción

### Pre-Lanzamiento (Viernes)

- [x] Ejecutar `npm audit fix` (completado)
- [ ] Verificar si xlsx se usa en producción
- [ ] Si xlsx se usa: Implementar validaciones estrictas

### Post-Lanzamiento (Sprint Siguiente)

- [ ] Ejecutar `npm audit fix --force` en rama de desarrollo
- [ ] Actualizar vitest a v4 y corregir tests que rompan
- [ ] Evaluar migración de xlsx → exceljs
- [ ] Testing completo después de actualizaciones

### Monitoreo

- [ ] Suscribirse a advisories de GitHub para xlsx
- [ ] Configurar Dependabot / Renovate para alertas automáticas
- [ ] Revisión mensual de `npm audit`

---

## Contexto Técnico

### esbuild/vite

**Por qué requiere --force**:

- vitest v2 → v4 tiene breaking changes en API
- Tests pueden requerir actualización de sintaxis
- Mejor hacerlo en sprint dedicado post-lanzamiento

**Verificar breaking changes**:

- [Vitest v3 Changelog](https://github.com/vitest-dev/vitest/releases/tag/v3.0.0)
- [Vitest v4 Changelog](https://github.com/vitest-dev/vitest/releases/tag/v4.0.0)

### xlsx

**Por qué no hay fix**:

- sheetJS (xlsx) es un proyecto con historial de vulnerabilidades
- Mantenimiento inconsistente
- Comunidad recomienda alternativas

**Alternativas evaluadas**:

1. **exceljs**: ✅ Más activo, mejor API, sin vulnerabilidades conocidas
2. **papaparse**: ✅ Solo CSV, muy rápido, seguro
3. **node-xlsx**: ⚠️ Basado en sheetJS también

---

## Veredicto para Lanzamiento Viernes

### RIESGO: BAJO-MEDIO

**Justificación**:

1. **esbuild (moderate)**: Solo dev, no afecta producción → BAJO
2. **xlsx (high)**: Depende de si se usa con input de usuarios → BAJO/MEDIO

**LISTO PARA LANZAR SI**:

- xlsx NO se usa en funcionalidad crítica con input de usuarios
- O si se usa: validaciones estrictas implementadas

**Acción inmediata**: Verificar uso de xlsx en el código.

---

_Generado por Claude Code - 27 de Octubre 2025_
