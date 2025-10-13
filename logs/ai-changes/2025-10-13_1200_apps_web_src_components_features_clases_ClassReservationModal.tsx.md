# Cambio: apps/web/src/components/features/clases/ClassReservationModal.tsx
**Descripción:** Eliminé date-fns y di título explícito al modal.
**Motivo:** Mantener compatibilidad sin nuevas dependencias y conservar cabecera.
**Fecha:** 2025-10-13 12:00
```tsx
  const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
```
