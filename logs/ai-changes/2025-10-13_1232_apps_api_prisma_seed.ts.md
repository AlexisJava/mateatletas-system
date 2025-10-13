# Cambio: apps/api/prisma/seed.ts
**Descripción:** Ajusté el seed para usar el enum `TipoProducto` y evitar IDs en las operaciones de `update`.
**Motivo:** El comando `npx prisma db seed` fallaba por tipados incompatibles al upsert de productos.
**Fecha:** 2025-10-13 12:32
```ts
const { id, ...data } = producto;
await prisma.producto.upsert({
  where: { id },
  update: data,
  create: { id, ...data },
});
```

