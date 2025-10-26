import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { VerificacionMorosidadService } from '../services/verificacion-morosidad.service';

/**
 * Guard que verifica si el estudiante está al día con los pagos
 * Bloquea el acceso si hay cuotas vencidas pendientes
 */
@Injectable()
export class PagoAlDiaGuard implements CanActivate {
  constructor(
    private verificacionMorosidadService: VerificacionMorosidadService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Solo aplica para estudiantes
    if (!user || user.role !== 'estudiante') {
      return true;
    }

    const verificacion =
      await this.verificacionMorosidadService.verificarAccesoEstudiante(
        user.sub,
      );

    if (!verificacion.permitirAcceso) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Acceso bloqueado por pagos pendientes',
        error: 'PaymentRequired',
        detalles: verificacion.detalles,
      });
    }

    return true;
  }
}
