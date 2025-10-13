# Cambio: apps/web/src/components/ui/Card.tsx
**Descripción:** Extendí Card para aceptar props HTML (onClick, etc.).
**Motivo:** Evitar errores al usar Card como contenedor interactivo.
**Fecha:** 2025-10-13 12:00
```tsx
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  className?: string;
  hoverable?: boolean;
}
```
