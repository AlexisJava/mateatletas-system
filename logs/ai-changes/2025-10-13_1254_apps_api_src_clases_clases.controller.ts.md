# Cambio: apps/api/src/clases/clases.controller.ts
**Descripción:** Extendí los roles permitidos para programar clases y consultar rutas.
**Motivo:** El test de integración usa el token de tutor, por lo que necesitaba autorización para esos endpoints.
**Fecha:** 2025-10-13 12:54
```ts
@Post()
@Roles(Role.Admin, Role.Tutor)
async programarClase(@Body() dto: CrearClaseDto) {
  return this.clasesService.programarClase(dto);
}
```

