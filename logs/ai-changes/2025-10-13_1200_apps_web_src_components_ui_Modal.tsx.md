# Cambio: apps/web/src/components/ui/Modal.tsx
**Descripción:** Añadí className, contentClassName y título opcional.
**Motivo:** Permitir personalizar modales sin perder el botón de cierre.
**Fecha:** 2025-10-13 12:00
```tsx
interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  contentClassName?: string;
}
```
