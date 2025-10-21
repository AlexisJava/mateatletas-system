import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuthUser } from '../../auth/interfaces';

/**
 * Guard que verifica que un estudiante pertenece al tutor autenticado
 * Se aplica a rutas con parámetro :id para validar ownership
 */
@Injectable()
export class EstudianteOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser; params: { id?: string } }>();
    const tutorId = request.user?.id; // Del JWT Strategy (user.id, NO user.sub)
    const estudianteId = request.params.id; // De la URL

    if (!tutorId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!estudianteId) {
      // Si no hay ID en la ruta, permitir (ej: GET /estudiantes)
      return true;
    }

    // Verificar que el estudiante existe y pertenece al tutor
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { tutor_id: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este estudiante',
      );
    }

    return true;
  }
}
