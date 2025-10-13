# Cambio: apps/api/prisma/seed.ts
**Descripción:** Reescribí el seed principal para poblar admin, equipos, rutas y productos coherentes.
**Motivo:** El archivo se modificó accidentalmente y había perdido los datos base necesarios para levantar el entorno.
**Fecha:** 2025-10-13 12:30
```ts
await prisma.producto.upsert({
  where: { id: 'seed-suscripcion-mensual' },
  update: producto,
  create: producto,
});
```

