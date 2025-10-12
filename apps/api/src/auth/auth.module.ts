import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticación
 *
 * Este módulo configura:
 * - PassportModule para estrategias de autenticación
 * - JwtModule para generación y validación de tokens
 * - JwtStrategy para validar tokens JWT
 * - AuthService para lógica de negocio
 * - AuthController para endpoints públicos
 */
@Module({
  imports: [
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
        const expiresIn = config.get<string>('JWT_EXPIRATION') || '7d';
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any, // StringValue es un tipo de jsonwebtoken
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
