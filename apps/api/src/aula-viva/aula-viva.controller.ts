import { Controller, Post, UseGuards, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';
import { PrismaService } from '../core/database/prisma.service';
import type { RolAulaViva } from './interfaces';

/**
 * Respuesta del endpoint de token WebSocket
 */
interface WsTokenResponse {
  token: string;
}

/**
 * Payload del token para WebSocket de Aula Viva
 */
interface WsTokenPayload {
  sub: string;
  nombre: string;
  rol: RolAulaViva;
}

/**
 * Controller para Aula Virtual en Vivo
 *
 * Proporciona endpoint para obtener token de WebSocket
 */
@ApiTags('Aula Viva')
@ApiBearerAuth()
@Controller('aula-viva')
@UseGuards(JwtAuthGuard)
export class AulaVivaController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /aula-viva/token - Obtener token para conexión WebSocket
   *
   * Este endpoint devuelve un JWT que puede ser usado para autenticar
   * la conexión WebSocket al namespace /aula-viva
   */
  @Post('token')
  @ApiOperation({
    summary: 'Obtener token para WebSocket',
    description:
      'Genera un token JWT para autenticar la conexión WebSocket al aula virtual',
  })
  @ApiResponse({
    status: 200,
    description: 'Token generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT para WebSocket' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getWsToken(@GetUser() user: AuthUser): Promise<WsTokenResponse> {
    // Determinar rol principal del usuario
    const userRole = user.role ?? user.roles[0] ?? 'ESTUDIANTE';

    // Obtener nombre del usuario según su rol
    const nombre = await this.getUserNombre(user.id, userRole);

    // Mapear rol a formato de aula viva
    const rol = this.mapRolToAulaViva(userRole);

    // Generar token con datos para WebSocket
    const payload: WsTokenPayload = {
      sub: user.id,
      nombre,
      rol,
    };

    // Token de corta duración (5 minutos) - solo para iniciar conexión WS
    const token = this.jwtService.sign(payload, {
      expiresIn: '5m',
    });

    return { token };
  }

  /**
   * Obtiene el nombre completo del usuario según su rol
   */
  private async getUserNombre(userId: string, role: string): Promise<string> {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'docente') {
      const docente = await this.prisma.docente.findUnique({
        where: { id: userId },
        select: { nombre: true, apellido: true },
      });
      if (!docente) throw new NotFoundException('Docente no encontrado');
      return `${docente.nombre} ${docente.apellido}`;
    }

    if (normalizedRole === 'estudiante') {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: userId },
        select: { nombre: true, apellido: true },
      });
      if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
      return `${estudiante.nombre} ${estudiante.apellido}`;
    }

    if (normalizedRole === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: { nombre: true, apellido: true },
      });
      if (!admin) throw new NotFoundException('Admin no encontrado');
      return `${admin.nombre} ${admin.apellido}`;
    }

    // Fallback para tutor (aunque no debería usar aula viva)
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: { nombre: true, apellido: true },
    });
    if (!tutor) throw new NotFoundException('Usuario no encontrado');
    return `${tutor.nombre} ${tutor.apellido}`;
  }

  /**
   * Mapea el rol del sistema al formato de Aula Viva
   */
  private mapRolToAulaViva(role: string): RolAulaViva {
    const normalizedRole = role.toUpperCase();

    if (normalizedRole === 'DOCENTE') return 'DOCENTE';
    if (normalizedRole === 'ESTUDIANTE') return 'ESTUDIANTE';
    if (normalizedRole === 'ADMIN') return 'ADMIN';

    // Default para otros roles
    return 'ESTUDIANTE';
  }
}
