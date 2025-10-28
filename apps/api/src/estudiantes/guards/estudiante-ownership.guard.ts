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
 * O que el estudiante está accediendo a su propio perfil
 * Se aplica a rutas con parámetro :id para validar ownership
 */
@Injectable()
export class EstudianteOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser; params: { id?: string } }>();
    const user = request.user;
    const estudianteId = request.params.id; // De la URL

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!estudianteId) {
      // Si no hay ID en la ruta, permitir (ej: GET /estudiantes)
      return true;
    }

    // CASO 1: El estudiante accede a su propio perfil
    if (user.role === 'estudiante' && user.id === estudianteId) {
      return true;
    }

    // CASO 2: El tutor accede al perfil de su estudiante
    if (user.role === 'tutor') {
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
    if (user.role === 'admin' || user.role === 'docente') {
      return true;
    }

    // Otros casos: denegar
    throw new ForbiddenException(
      'No tienes permiso para acceder a este estudiante',
    );
  }
}
