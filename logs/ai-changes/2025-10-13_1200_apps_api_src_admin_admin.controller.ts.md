# Cambio: apps/api/src/admin/admin.controller.ts
**Descripción:** Exposé endpoints de estadísticas y gestión de usuarios.
**Motivo:** Cubrir las llamadas del panel admin (stats, listado, cambio de rol, borrado).
**Fecha:** 2025-10-13 12:00
```ts
  @Get('estadisticas')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
```
