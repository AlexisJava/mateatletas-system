import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  TutorHandler,
  DocenteHandler,
  AdminHandler,
  EstudianteHandler,
} from './strategies/role-handlers';
import { DatabaseModule } from '../core/database/database.module';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklistGuard } from './guards/token-blacklist.guard';

/**
 * Módulo de autenticación
 *
 * ETAPA 2: Implementación de Strategy Pattern para roles
 *
 * Este módulo configura:
 * - PassportModule para estrategias de autenticación
 * - JwtModule para generación y validación de tokens
 * - JwtStrategy para validar tokens JWT
 * - AuthService para lógica de negocio
 * - AuthController para endpoints públicos
 * - Role Handlers (Strategy Pattern) para cada tipo de usuario
 */
@Module({
  imports: [
    DatabaseModule, // Para PrismaService en handlers
    // Configuración de Passport
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    // Configuración de JWT con variables de entorno
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET no está configurado en las variables de entorno',
          );
        }

        // En desarrollo: tokens de larga duración (7d) para evitar re-login constante
        // En producción: tokens de corta duración (1h) para mayor seguridad
        const nodeEnv = config.get<string>('NODE_ENV') || 'development';
        const defaultExpiration = nodeEnv === 'production' ? '1h' : '7d';
        const expiresIn =
          config.get<string>('JWT_EXPIRATION') || defaultExpiration;

        return {
          secret,
          signOptions: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresIn: expiresIn as any, // string is compatible with StringValue from jsonwebtoken
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Strategy Pattern handlers
    TutorHandler,
    DocenteHandler,
    AdminHandler,
    EstudianteHandler,
    // Token Blacklist (Fix #6: P3 - Security Improvement)
    TokenBlacklistService,
    TokenBlacklistGuard,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    TokenBlacklistService,
    TokenBlacklistGuard,
  ],
})
export class AuthModule {}
