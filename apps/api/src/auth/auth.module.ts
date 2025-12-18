import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { MfaModule } from './mfa/mfa.module';
import { LoginAttemptService } from './services/login-attempt.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { UserLookupService } from './services/user-lookup.service';
import { UserProfileService } from './services/user-profile.service';
import { UserUpdateService } from './services/user-update.service';
// FASE 2: Servicios de autenticación por tipo de usuario
import { TutorAuthService } from './services/tutor-auth.service';
import { DocenteAuthService } from './services/docente-auth.service';
import { AdminAuthService } from './services/admin-auth.service';
import { EstudianteAuthService } from './services/estudiante-auth.service';
import { AuthOrchestratorService } from './services/auth-orchestrator.service';

/**
 * Módulo de autenticación
 *
 * ETAPA 2: Implementación de Strategy Pattern para roles
 * ETAPA 3: Event-Driven Architecture para eliminar dependencias circulares
 *
 * Este módulo configura:
 * - PassportModule para estrategias de autenticación
 * - JwtModule para generación y validación de tokens
 * - JwtStrategy para validar tokens JWT
 * - AuthService para lógica de negocio (emite eventos)
 * - AuthController para endpoints públicos
 * - Role Handlers (Strategy Pattern) para cada tipo de usuario
 *
 * Dependencias circulares resueltas:
 * - AuthModule ya NO importa GamificacionModule
 * - En su lugar, AuthService emite eventos que GamificacionModule escucha
 * - Ver: src/gamificacion/listeners/auth-events.listener.ts
 */
@Module({
  imports: [
    DatabaseModule, // Para PrismaService en handlers
    MfaModule, // Multi-Factor Authentication para cuentas administrativas
    // Configuración de Passport
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    // Configuración de JWT con variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule],
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
        const defaultExpiration: string =
          nodeEnv === 'production' ? '1h' : '7d';
        const expiresIn: string =
          config.get<string>('JWT_EXPIRATION') || defaultExpiration;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        } as JwtModuleOptions;
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
    // Login Attempt Tracking (Brute Force Protection)
    LoginAttemptService,
    // Token Service (JWT generation and cookie management)
    TokenService,
    // Password Service (hashing, verification, strength validation)
    PasswordService,
    // User Services (centralized user operations)
    UserProfileService,
    UserUpdateService,
    UserLookupService,
    // FASE 2: Servicios de autenticación por tipo de usuario
    TutorAuthService,
    DocenteAuthService,
    AdminAuthService,
    EstudianteAuthService,
    AuthOrchestratorService,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    TokenBlacklistService,
    TokenBlacklistGuard,
    TokenService,
    PasswordService,
    UserLookupService,
  ],
})
export class AuthModule {}
