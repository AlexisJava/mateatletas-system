# Cambio: apps/web/src/app/docente/dashboard/page.tsx
**Descripción:** Sincronizé el nombre de la métrica de asistencia.
**Motivo:** Usar el campo correcto `promedioAsistencia` devuelto por el store.
**Fecha:** 2025-10-13 12:00
```tsx
                {isLoadingResumen
                  ? '...'
                  : resumenDocente
                    ? `${Math.round(resumenDocente.promedioAsistencia)}%`
                    : 'N/A'}
```
