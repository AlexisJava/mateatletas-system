# Cambio: apps/api/src/catalogo/productos.controller.ts
**Descripción:** Protegí las operaciones de catálogo sensibles con RolesGuard.
**Motivo:** Restringir creación, edición y borrado de productos a administradores autenticados.
**Fecha:** 2025-10-13 12:00
```ts
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async create(@Body() createDto: CrearProductoDto) {
    return this.productosService.create(createDto);
  }
```
