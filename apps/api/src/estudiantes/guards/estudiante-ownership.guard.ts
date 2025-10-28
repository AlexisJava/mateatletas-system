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

    console.log('[EstudianteOwnershipGuard] DEBUG:', {
      userId: user?.id,
      userRole: user?.role,
      userRoles: user?.roles,
      estudianteId,
      url: request.url,
      method: request.method,
    });

    if (!user) {
      console.log('[EstudianteOwnershipGuard] ❌ No user found');
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!estudianteId) {
      // Si no hay ID en la ruta, permitir (ej: GET /estudiantes)
      console.log('[EstudianteOwnershipGuard] ✅ No estudianteId in route, allowing');
      return true;
    }

    // CASO 1: El estudiante accede a su propio perfil
    if (user.role === 'estudiante' && user.id === estudianteId) {
      console.log('[EstudianteOwnershipGuard] ✅ CASO 1: Estudiante self-access');
      return true;
    }

    // CASO 2: El tutor accede al perfil de su estudiante
    if (user.role === 'tutor') {
      console.log('[EstudianteOwnershipGuard] Checking CASO 2: Tutor ownership');
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId },
        select: { tutor_id: true },
      });

      if (!estudiante) {
        console.log('[EstudianteOwnershipGuard] ❌ Estudiante not found');
        throw new NotFoundException('Estudiante no encontrado');
      }

      if (estudiante.tutor_id !== user.id) {
        console.log('[EstudianteOwnershipGuard] ❌ Tutor ownership mismatch');
        throw new ForbiddenException(
          'No tienes permiso para acceder a este estudiante',
        );
      }

      console.log('[EstudianteOwnershipGuard] ✅ CASO 2: Tutor ownership verified');
      return true;
    }

    // CASO 3: Admin o docente (pueden acceder a cualquier estudiante)
    if (user.role === 'admin' || user.role === 'docente') {
      console.log('[EstudianteOwnershipGuard] ✅ CASO 3: Admin/Docente access');
      return true;
    }

    // Otros casos: denegar
    console.log('[EstudianteOwnershipGuard] ❌ No valid case matched, denying access');
    throw new ForbiddenException(
      'No tienes permiso para acceder a este estudiante',
    );
  }
}
