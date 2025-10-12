import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator personalizado para extraer el usuario autenticado del request
 *
 * Uso:
 * @Get('profile')
 * getProfile(@GetUser() user: Tutor) {
 *   return user;
 * }
 *
 * También se puede extraer una propiedad específica:
 * @Get('email')
 * getEmail(@GetUser('email') email: string) {
 *   return { email };
 * }
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica un campo, devolver solo ese campo
    return data ? user?.[data] : user;
  },
);
