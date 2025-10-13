# Cambio: apps/web/src/store/catalogo.store.ts
**Descripción:** Removí import innecesario de TipoProducto.
**Motivo:** Resolver advertencias de TypeScript por símbolos no usados.
**Fecha:** 2025-10-13 12:00
```ts
-import { Producto, FiltroProducto, TipoProducto } from '@/types/catalogo.types';
+import { Producto, FiltroProducto } from '@/types/catalogo.types';
```
