# Cambio: apps/api/src/auth/auth.controller.ts
**Descripción:** Actualicé profile para delegar en AuthService según rol.
**Motivo:** Unificar la obtención de perfil entre tutores, docentes y admins.
**Fecha:** 2025-10-13 12:00
```ts
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser() user: any) {
    return this.authService.getProfile(user.id, user.role);
  }
```
