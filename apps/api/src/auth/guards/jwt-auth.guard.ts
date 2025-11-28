import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard para proteger rutas que requieren autenticación JWT
 *
 * Este guard utiliza la estrategia JWT configurada en jwt.strategy.ts
 * para validar el token y extraer el usuario del payload
 *
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtectedResource() {
 *   return 'Este recurso está protegido';
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Aquí se puede agregar lógica personalizada antes de la validación
    // Por ejemplo: verificar si el token está en una lista negra
    return super.canActivate(context);
  }
}
