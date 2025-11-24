import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { Request } from 'express';

import { Role } from '../decorators/roles.decorator';

/**
 * Payload del JWT token
 * Contiene la información mínima necesaria para identificar al usuario
 */
export interface JwtPayload {
  sub: string; // ID del usuario
  email: string; // Email del usuario
  role: Role | string; // Rol principal del usuario (legacy support)
  roles?: Role[]; // Array completo de roles del usuario
}

/**
 * Estrategia JWT para validar tokens de autenticación
 *
 * Esta estrategia:
 * 1. Extrae el token desde httpOnly cookie (fallback a Bearer header)
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
      // Extraer token desde cookie 'auth-token' o fallback a Bearer header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request & { cookies?: { 'auth-token'?: string } }) => {
          console.log('🔍 [JWT-STRATEGY] Extrayendo token...');
          console.log('🍪 [JWT-STRATEGY] request.cookies:', request?.cookies);
          console.log('🔑 [JWT-STRATEGY] Authorization header:', request?.headers?.authorization);

          // Prioridad 1: Intentar desde cookie
          const token = request?.cookies?.['auth-token'];
          if (token) {
            console.log('✅ [JWT-STRATEGY] Token extraído de COOKIE (primeros 20 chars):', token.substring(0, 20) + '...');
            return token;
          }

          // Prioridad 2: Fallback a Bearer header (para Swagger y tests)
          const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          if (bearerToken) {
            console.log('✅ [JWT-STRATEGY] Token extraído de HEADER (primeros 20 chars):', bearerToken.substring(0, 20) + '...');
            return bearerToken;
          }

          console.log('❌ [JWT-STRATEGY] NO se encontró token en cookie ni en header');
          return null;
        },
      ]),
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
    console.log('🔐 [JWT-VALIDATE] Token decodificado exitosamente');
    console.log('📦 [JWT-VALIDATE] Payload:', { sub: payload.sub, email: payload.email, role: payload.role });

    const { sub: userId, role, roles } = payload;

    const normalizedRoles =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : role
          ? [role as Role]
          : [];

    console.log('👤 [JWT-VALIDATE] Buscando usuario:', { userId, role, normalizedRoles });

    let user;

    // Normalizar el rol a lowercase para comparación case-insensitive
    const normalizedRole = role?.toLowerCase();
    console.log('🔄 [JWT-VALIDATE] Role normalizado:', normalizedRole);

    // Buscar según el rol especificado en el token
    if (normalizedRole === 'estudiante') {
      user = await this.prisma.estudiante.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          edad: true,
          nivelEscolar: true,
          fotoUrl: true,
          puntos_totales: true,
          nivel_actual: true,
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          equipo: {
            select: {
              id: true,
              nombre: true,
              color_primario: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (normalizedRole === 'docente') {
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
    } else if (normalizedRole === 'admin') {
      user = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          fecha_registro: true,
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
      console.log('❌ [JWT-VALIDATE] Usuario NO encontrado en BD:', { userId, role });
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }

    console.log('✅ [JWT-VALIDATE] Usuario encontrado en BD:', { id: user.id, email: user.email });
    console.log('✅ [JWT-VALIDATE] Inyectando usuario en request.user');

    // El objeto user se inyectará en request.user
    return { ...user, role, roles: normalizedRoles };
  }
}
