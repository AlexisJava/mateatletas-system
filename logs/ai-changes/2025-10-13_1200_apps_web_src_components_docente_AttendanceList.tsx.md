# Cambio: apps/web/src/components/docente/AttendanceList.tsx
**Descripción:** Alineé tipos de asistencia y campos de estudiante.
**Motivo:** Compatibilizar con los DTO y evitar nulls inesperados.
**Fecha:** 2025-10-13 12:00
```tsx
    const data: MarcarAsistenciaDto = {
      estudianteId,
      estado,
      puntosOtorgados: puntos[estudianteId] ?? puntosDefault,
      observaciones: observaciones[estudianteId] ?? undefined,
    };
```
