# Cambio: apps/web/src/app/(protected)/membresia/planes/page.tsx
**Descripción:** Limpié imports sin uso en la página de planes.
**Motivo:** Eliminar warnings de TypeScript por variables no utilizadas.
**Fecha:** 2025-10-13 12:00
```tsx
-import { useRouter } from 'next/navigation';
-import { Producto, TipoProducto } from '@/types/catalogo.types';
+import { TipoProducto } from '@/types/catalogo.types';
```
