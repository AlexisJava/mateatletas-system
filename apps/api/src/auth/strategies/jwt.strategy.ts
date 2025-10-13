import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Payload del JWT token
 * Contiene la información mínima necesaria para identificar al usuario
 */
export interface JwtPayload {
  sub: string; // ID del tutor
  email: string; // Email del tutor
  role: string; // Rol del usuario (ej: 'tutor')
}

/**
 * Estrategia JWT para validar tokens de autenticación
 *
 * Esta estrategia:
 * 1. Extrae el token del header Authorization (Bearer token)
 * 2. Valida el token usando el JWT_SECRET
 * 3. Extrae el payload y busca al usuario en la base de datos
 * 4. Inyecta el usuario completo en request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET no está configurado en las variables de entorno',
      );
    }

    super({
      // Extraer token del header: "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No ignorar la expiración del token
      ignoreExpiration: false,
      // Secret para verificar la firma del token
      secretOrKey: secret,
    });
  }

  /**
   * Método llamado automáticamente después de validar el token
   * @param payload - Payload decodificado del JWT
   * @returns Usuario completo desde la base de datos
   */
  async validate(payload: JwtPayload) {
    const { sub: userId, role } = payload;

    let user;

    // Buscar según el rol especificado en el token
    if (role === 'docente') {
      user = await this.prisma.docente.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          titulo: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      // Por defecto buscar como tutor
      user = await this.prisma.tutor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          dni: true,
          telefono: true,
          fecha_registro: true,
          ha_completado_onboarding: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Si el usuario no existe, el token es inválido
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }

    // El objeto user se inyectará en request.user
    return { ...user, role };
  }
}
