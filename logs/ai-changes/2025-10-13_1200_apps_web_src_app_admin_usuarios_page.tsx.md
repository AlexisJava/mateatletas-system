# Cambio: apps/web/src/app/admin/usuarios/page.tsx
**Descripción:** Retiré la acción de cambio de rol aún no usada.
**Motivo:** Evitar advertencias mientras la UI de rol sigue pendiente.
**Fecha:** 2025-10-13 12:00
```tsx
-  const { users, fetchUsers, changeUserRole, deleteUser, isLoading, error } = useAdminStore();
+  const { users, fetchUsers, deleteUser, isLoading, error } = useAdminStore();
```
