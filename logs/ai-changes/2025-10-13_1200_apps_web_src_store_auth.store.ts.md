# Cambio: apps/web/src/store/auth.store.ts
**Descripción:** Extendí el tipo User con información de rol y campos opcionales.
**Motivo:** Persistir el rol del usuario autenticado en el frontend.
**Fecha:** 2025-10-13 12:00
```ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
```
