import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard para proteger rutas que requieren autenticación JWT
 *
 * Este guard utiliza la estrategia JWT configurada en jwt.strategy.ts
 * para validar el token y extraer el usuario del payload
 *
 * Comportamiento:
 * - Si el endpoint está marcado con @Public(), permite acceso sin token
 * - Si no está marcado, requiere token JWT válido
 *
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtectedResource() {
 *   return 'Este recurso está protegido';
 * }
 *
 * @Public()
 * @Get('public')
 * getPublicResource() {
 *   return 'Este recurso es público';
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Verificar si el endpoint está marcado como público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Si no es público, validar el token JWT
    return super.canActivate(context);
  }
}
