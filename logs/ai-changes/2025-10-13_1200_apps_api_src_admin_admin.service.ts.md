# Cambio: apps/api/src/admin/admin.service.ts
**Descripción:** Implementé cálculos de stats, listado y migración real de roles.
**Motivo:** Responder al panel admin y permitir cambiar roles cuando no hay dependencias.
**Fecha:** 2025-10-13 12:00
```ts
  async changeUserRole(id: string, role: Role) {
    const current = await this.getUserRecordWithDependencies(id);

    if (current.role === role) {
      return this.findUserById(id);
    }
```
