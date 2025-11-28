import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuthUser } from '../../auth/interfaces';
import { Role } from '../../domain/constants';

/**
 * Guard que verifica que un estudiante pertenece al tutor autenticado
 * O que el estudiante está accediendo a su propio perfil
 * Se aplica a rutas con parámetro :id para validar ownership
 */
@Injectable()
export class EstudianteOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(EstudianteOwnershipGuard.name);

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    const estudianteId = request.params?.id as string | undefined;

    this.logger.debug(
      `Validating ownership - userId: ${user?.id}, role: ${user?.role}, estudianteId: ${estudianteId}`,
    );

    if (!user) {
      this.logger.warn('Access denied - No authenticated user');
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!estudianteId) {
      this.logger.debug('No estudianteId in params - allowing access');
      return true;
    }

    // CASO 1: El estudiante accede a su propio perfil
    if (user.role === Role.ESTUDIANTE && user.id === estudianteId) {
      this.logger.debug(`Self-access granted for estudiante ${estudianteId}`);
      return true;
    }

    this.logger.debug('Checking tutor/admin/docente access...');

    // CASO 2: El tutor accede al perfil de su estudiante
    if (user.role === Role.TUTOR) {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId },
        select: { tutor_id: true },
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      if (estudiante.tutor_id !== user.id) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a este estudiante',
        );
      }

      return true;
    }

    // CASO 3: Admin o docente (pueden acceder a cualquier estudiante)
    if (user.role === Role.ADMIN || user.role === Role.DOCENTE) {
      return true;
    }

    // Otros casos: denegar
    throw new ForbiddenException(
      'No tienes permiso para acceder a este estudiante',
    );
  }
}
