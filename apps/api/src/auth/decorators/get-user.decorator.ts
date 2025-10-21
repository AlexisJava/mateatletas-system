import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthUser } from '../interfaces';

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
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    // Si se especifica un campo, devolver solo ese campo
    return data ? user?.[data] : user;
  },
);
