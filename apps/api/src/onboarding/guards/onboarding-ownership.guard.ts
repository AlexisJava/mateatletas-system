import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../core/database/prisma.service';
import { AuthUser } from '../../auth/interfaces';
import { Role } from '../../domain/constants';

/**
 * Request type with authenticated user and route params
 */
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  params: {
    estudianteId?: string;
  };
}

/**
 * OnboardingOwnershipGuard - Prevención de IDOR en endpoints de onboarding
 *
 * Verifica que el usuario autenticado tiene permiso para acceder/modificar
 * el onboarding del estudiante especificado en :estudianteId
 *
 * REGLAS DE ACCESO:
 * - ESTUDIANTE: Solo puede acceder a su propio onboarding (user.id === estudianteId)
 * - TUTOR: Solo puede acceder al onboarding de sus hijos (estudiante.tutor_id === user.id)
 * - ADMIN: Puede acceder a cualquier onboarding
 * - DOCENTE: Puede acceder a cualquier onboarding (para seguimiento)
 *
 * SEGURIDAD:
 * - OWASP A01:2021 - Broken Access Control (IDOR Prevention)
 * - ISO 27001 A.9.4.1 - Information access restriction
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, OnboardingOwnershipGuard)
 * @Get(':estudianteId/estado')
 * async getEstado(@Param('estudianteId') estudianteId: string) { ... }
 * ```
 */
@Injectable()
export class OnboardingOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OnboardingOwnershipGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const estudianteId = request.params.estudianteId;

    this.logger.debug(
      `Validating onboarding ownership - userId: ${user?.id}, role: ${user?.role}, estudianteId: ${estudianteId}`,
    );

    // 1. Verificar que hay usuario autenticado
    if (!user) {
      this.logger.error(
        `🚨 INTENTO DE ACCESO SIN AUTENTICACIÓN: estudianteId=${estudianteId}`,
      );
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 2. Si no hay estudianteId, permitir (no aplica ownership)
    if (!estudianteId) {
      this.logger.debug('No estudianteId in params - allowing access');
      return true;
    }

    // 3. CASO ESTUDIANTE: Solo puede acceder a su propio onboarding
    if (user.role === Role.ESTUDIANTE) {
      if (user.id === estudianteId) {
        this.logger.debug(
          `✅ Self-access granted for estudiante ${estudianteId}`,
        );
        return true;
      }
      this.logger.error(
        `🚨 VIOLACIÓN DE OWNERSHIP: estudiante=${user.id} intentó acceder a onboarding de estudiante=${estudianteId}`,
      );
      throw new ForbiddenException(
        'No tienes permiso para acceder a este onboarding',
      );
    }

    // 4. CASO ADMIN/DOCENTE: Acceso total
    if (user.role === Role.ADMIN || user.role === Role.DOCENTE) {
      this.logger.debug(
        `✅ Admin/Docente access granted for onboarding ${estudianteId}`,
      );
      return true;
    }

    // 5. CASO TUTOR: Verificar que el estudiante es su hijo
    if (user.role === Role.TUTOR) {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId },
        select: { tutor_id: true },
      });

      if (!estudiante) {
        this.logger.warn(`Estudiante no encontrado: ${estudianteId}`);
        throw new NotFoundException('Estudiante no encontrado');
      }

      if (estudiante.tutor_id !== user.id) {
        this.logger.error(
          `🚨 VIOLACIÓN DE OWNERSHIP: tutor=${user.id} intentó acceder a onboarding de estudiante=${estudianteId} (tutor_id=${estudiante.tutor_id})`,
        );
        throw new ForbiddenException(
          'No tienes permiso para acceder al onboarding de este estudiante',
        );
      }

      this.logger.debug(
        `✅ OWNERSHIP VALIDADO: tutor=${user.id} -> estudiante=${estudianteId}`,
      );
      return true;
    }

    // 6. Cualquier otro rol: denegar
    this.logger.warn(
      `Acceso denegado para rol desconocido: ${user.role}, estudianteId: ${estudianteId}`,
    );
    throw new ForbiddenException(
      'No tienes permiso para acceder a este onboarding',
    );
  }
}
