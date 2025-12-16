# TODO: Tests Desactualizados - Post Colonia

## Prioridad: MEDIA (no bloqueante)

## Contexto

Durante la auditoría de Diciembre 2025 se detectaron 9 test suites fallando.
El código de producción funciona correctamente - los tests están desactualizados.

## Tests a arreglar

### Config de tests (5 min cada uno)

- [ ] `throttler-integration.spec.ts` - Agregar ConfigService mock
- [ ] `tiers.service.spec.ts` - Cambiar a `await expect(...).rejects.toThrow()`

### rutaCurricular removido (verificar si intencional)

- [ ] `clase-business.validator.spec.ts` - validarRutaCurricularExiste
- [ ] `clases-reservas.service.spec.ts` - rutaCurricular en response
- [ ] `admin-alertas.service.spec.ts` - rutaCurricular en query
- [ ] `clases-cancelar-security.spec.ts` - rutaCurricular en update

### Lógica cambió

- [ ] `queue-health.indicator.spec.ts` - Mock de Redis
- [ ] `gamificacion-progreso-optimized.spec.ts` - groupBy/findMany
- [ ] `docente-stats.service.spec.ts` - estudiantesSinTareas

## Métricas actuales

- Tests pasando: 1917
- Tests fallando: 42
- Coverage: 48%

## Target post-Colonia

- Tests fallando: 0
- Coverage: 80%
