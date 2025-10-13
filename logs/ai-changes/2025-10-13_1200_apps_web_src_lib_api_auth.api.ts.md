# Cambio: apps/web/src/lib/api/auth.api.ts
**Descripción:** Actualicé los tipos de respuesta para incluir role.
**Motivo:** Reflejar los cambios del backend en las llamadas de auth.
**Fecha:** 2025-10-13 12:00
```ts
export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: AuthRole;
```
