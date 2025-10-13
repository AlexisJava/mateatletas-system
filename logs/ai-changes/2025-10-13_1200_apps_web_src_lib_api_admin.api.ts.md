# Cambio: apps/web/src/lib/api/admin.api.ts
**Descripción:** Dejé que axios devuelva directamente los datos tipados.
**Motivo:** Evitar doble acceso a `.data` después del interceptor.
**Fecha:** 2025-10-13 12:00
```ts
export const getAllUsers = async (): Promise<AdminUser[]> => {
  return axios.get('/admin/usuarios') as Promise<AdminUser[]>;
};
```
