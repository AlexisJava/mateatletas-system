import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/database/prisma.service';
import { AuthUser } from '../../auth/interfaces';
import { Role, ROLE_HIERARCHY } from '../../domain/constants';

/**
 * Guard para validar ownership de inscripciones
 *
 * Valida que el usuario autenticado sea:
 * - El dueño de la inscripción (tutor_id === user.id), O
 * - Un administrador (ADMIN o SUPER_ADMIN)
 *
 * CONTEXTO DE SEGURIDAD:
 * - Previene que tutores vean inscripciones de otras familias
 * - Protege datos personales sensibles (nombres, emails, montos)
 * - Cumple con GDPR/LOPD (protección de datos)
 *
 * PROBLEMA QUE RESUELVE:
 * - Sin este guard: cualquier usuario autenticado puede enumerar IDs
 *   y ver datos completos de inscripciones ajenas
 * - Violación de privacidad: exposición de información familiar sensible
 * - Fraude potencial: uso de información para suplantación
 *
 * JERARQUÍA DE ACCESO:
 * - TUTOR: Solo sus propias inscripciones
 * - DOCENTE: Solo sus propias inscripciones (no bypasea ownership)
 * - ADMIN: Todas las inscripciones (jerarquía 4)
 * - SUPER_ADMIN: Todas las inscripciones (jerarquía 5)
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - OWASP A01:2021 - Broken Access Control
 * - GDPR Art. 32 - Security of processing
 * - ISO 27001 A.9.4.1 - Information access restriction
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, InscripcionOwnershipGuard)
 * @Get(':id')
 * getById(@Param('id') id: string) { }
 */
@Injectable()
export class InscripcionOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(InscripcionOwnershipGuard.name);

  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params: { id: string };
    }>();

    const user: AuthUser | undefined = request.user;
    const inscripcionId: string = request.params.id;

    // 1. Validar que hay usuario autenticado
    if (!user) {
      this.logger.error(
        `🚨 INTENTO DE ACCESO SIN AUTENTICACIÓN: inscripcionId=${inscripcionId}`,
      );
      throw new ForbiddenException(
        'You are not authorized to access this inscripción',
      );
    }

    // 2. Verificar si es ADMIN o superior (bypasea ownership check)
    const userRoles: Role[] = user.roles || [];
    const isAdmin: boolean = userRoles.some((role: Role) => {
      const hierarchy: number = ROLE_HIERARCHY[role] || 0;
      return hierarchy >= ROLE_HIERARCHY[Role.ADMIN]; // 4 o superior
    });

    if (isAdmin) {
      this.logger.log(
        `✅ ADMIN ACCESS: user=${user.id}, inscripcion=${inscripcionId}`,
      );
      return true;
    }

    // 3. Obtener inscripción de DB para verificar ownership
    const inscripcion = await this.prisma.inscripcion2026.findUnique({
      where: { id: inscripcionId },
      select: { tutor_id: true },
    });

    // 4. Validar que inscripción existe
    if (!inscripcion) {
      this.logger.warn(
        `⚠️  INTENTO DE ACCESO A INSCRIPCIÓN INEXISTENTE: ` +
          `user=${user.id}, inscripcionId=${inscripcionId}`,
      );
      throw new ForbiddenException(
        'You are not authorized to access this inscripción',
      );
    }

    // 5. Validar ownership: user.id debe coincidir con tutor_id
    const isOwner: boolean = inscripcion.tutor_id === user.id;

    if (!isOwner) {
      this.logger.error(
        `🚨 VIOLACIÓN DE OWNERSHIP: ` +
          `user=${user.id} intentó acceder a inscripción de tutor=${inscripcion.tutor_id}, ` +
          `inscripcionId=${inscripcionId}`,
      );
      throw new ForbiddenException(
        'You are not authorized to access this inscripción',
      );
    }

    // 6. Permitir acceso (es el dueño)
    this.logger.log(
      `✅ OWNERSHIP VALIDADO: user=${user.id}, inscripcion=${inscripcionId}`,
    );
    return true;
  }
}
