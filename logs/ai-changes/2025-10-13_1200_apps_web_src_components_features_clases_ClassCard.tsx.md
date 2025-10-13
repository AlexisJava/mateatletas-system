# Cambio: apps/web/src/components/features/clases/ClassCard.tsx
**Descripción:** Reemplacé formateo de fecha usando Intl.
**Motivo:** Evitar dependencias faltantes en tarjetas de clases.
**Fecha:** 2025-10-13 12:00
```tsx
  const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(fecha);
```
