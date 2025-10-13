# Cambio: apps/api/prisma/seed.ts
**Descripción:** Ajusté el upsert de rutas para usar el campo único `nombre`.
**Motivo:** Evitar el choque por unique constraint cuando ya existen rutas con IDs distintos.
**Fecha:** 2025-10-13 12:35
```ts
await prisma.rutaCurricular.upsert({
  where: { nombre: ruta.nombre },
  update: data,
  create: { id, ...data },
});
```

