# Cambio: apps/web/src/components/ui/Badge.tsx
**Descripción:** Permití pasar className y atributos nativos.
**Motivo:** Soportar estilos dinámicos usados en admin y catálogo.
**Fecha:** 2025-10-13 12:00
```tsx
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...rest
}: BadgeProps) {
```
