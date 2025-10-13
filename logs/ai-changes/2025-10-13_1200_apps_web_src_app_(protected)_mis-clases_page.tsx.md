# Cambio: apps/web/src/app/(protected)/mis-clases/page.tsx
**Descripción:** Reemplacé date-fns por Intl y cálculos manuales.
**Motivo:** Resolver errores de tipo al no tener la dependencia instalada.
**Fecha:** 2025-10-13 12:00
```tsx
const reservasFuturas = misReservas.filter((reserva) => {
  if (!reserva.clase) return false;
  return new Date(reserva.clase.fechaHora).getTime() > Date.now();
});
```
