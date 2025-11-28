import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../../domain/constants';
import { MfaService } from './mfa.service';
import { EnableMfaDto, VerifyMfaDto } from './dto/mfa.dto';
import { CompleteMfaLoginDto } from './dto/complete-mfa-login.dto';

/**
 * MFA Controller
 *
 * Endpoints para gestionar Multi-Factor Authentication (MFA)
 *
 * SEGURIDAD:
 * - ✅ Solo usuarios ADMIN pueden configurar MFA (por ahora)
 * - ✅ Rate limiting: 5 requests/minuto (previene brute force)
 * - ✅ JWT requerido (autenticación)
 * - ✅ Verificación de código antes de habilitar MFA
 *
 * Flujo de configuración:
 * 1. POST /mfa/setup - Genera QR code y backup codes
 * 2. POST /mfa/enable - Verifica código y activa MFA
 * 3. [Login con MFA activo] - Requiere código adicional
 * 4. DELETE /mfa - Deshabilita MFA
 *
 * @module auth/mfa
 */
@ApiTags('MFA')
@ApiBearerAuth('JWT-auth')
@Controller('auth/mfa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MfaController {
  private readonly logger = new Logger(MfaController.name);

  constructor(private readonly mfaService: MfaService) {}

  /**
   * Inicia el setup de MFA
   *
   * Genera:
   * - Secret TOTP
   * - QR code para escanear en app authenticator
   * - 8 backup codes para recuperación
   *
   * IMPORTANTE: El usuario debe escanear el QR y verificar el código
   * antes de que MFA se habilite realmente (endpoint /mfa/enable)
   *
   * @param req - Request con usuario autenticado
   * @returns QR code, secret y backup codes
   */
  @Post('setup')
  @Roles(Role.ADMIN) // Solo admins por ahora
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar configuración de MFA',
    description:
      'Genera QR code y backup codes para configurar MFA con Google Authenticator',
  })
  @ApiResponse({
    status: 200,
    description: 'MFA setup generado exitosamente',
    schema: {
      example: {
        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        backupCodes: [
          'ABCD-1234-EFGH-5678',
          'IJKL-9012-MNOP-3456',
          // ... 6 códigos más
        ],
        message:
          'Escanea el QR code con tu app authenticator y guarda los backup codes',
      },
    },
  })
  async setupMfa(@Request() req: { user: { id: string; email: string } }) {
    const { id: userId, email } = req.user;

    this.logger.log(`📱 Setup MFA iniciado para usuario: ${userId}`);

    const result = await this.mfaService.setupMfa(userId, email);

    return {
      qrCodeUrl: result.qrCodeUrl,
      backupCodes: result.backupCodes,
      message:
        'Escanea el QR code con tu app authenticator (Google Authenticator, Microsoft Authenticator, Authy) y guarda los backup codes en un lugar seguro. Luego, verifica el código para habilitar MFA.',
    };
  }

  /**
   * Habilita MFA después de verificar el código
   *
   * El usuario debe proporcionar:
   * - Secret (generado en /mfa/setup)
   * - Código de 6 dígitos de su app authenticator
   *
   * Si el código es válido, MFA se habilita permanentemente.
   *
   * @param req - Request con usuario autenticado
   * @param dto - Secret y código de verificación
   * @returns Confirmación de MFA habilitado
   */
  @Post('enable')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Habilitar MFA',
    description: 'Verifica el código TOTP y habilita MFA para la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'MFA habilitado exitosamente',
    schema: {
      example: {
        success: true,
        message:
          'MFA habilitado exitosamente. Ahora necesitarás un código adicional al iniciar sesión.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Código de verificación inválido',
  })
  async enableMfa(
    @Request() req: { user: { id: string } },
    @Body() dto: EnableMfaDto,
  ) {
    const { id: userId } = req.user;
    const { secret, token, backupCodes } = dto;

    this.logger.log(`🔐 Habilitando MFA para usuario: ${userId}`);

    // Hash backup codes antes de guardar
    const bcrypt = require('bcrypt');
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(async (code) => bcrypt.hash(code, 12)),
    );

    await this.mfaService.enableMfa(userId, secret, token, hashedBackupCodes);

    return {
      success: true,
      message:
        'MFA habilitado exitosamente. Ahora necesitarás un código adicional de tu app authenticator al iniciar sesión.',
    };
  }

  /**
   * Deshabilita MFA para la cuenta
   *
   * SEGURIDAD: Requiere verificación adicional antes de deshabilitar
   * (implementar en versión futura: requiere password o backup code)
   *
   * @param req - Request con usuario autenticado
   * @returns Confirmación de MFA deshabilitado
   */
  @Delete()
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests/minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deshabilitar MFA',
    description: 'Deshabilita MFA para la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'MFA deshabilitado exitosamente',
    schema: {
      example: {
        success: true,
        message:
          'MFA deshabilitado. Ya no necesitarás códigos adicionales al iniciar sesión.',
      },
    },
  })
  async disableMfa(@Request() req: { user: { id: string } }) {
    const { id: userId } = req.user;

    this.logger.log(`🔓 Deshabilitando MFA para usuario: ${userId}`);

    await this.mfaService.disableMfa(userId);

    return {
      success: true,
      message:
        'MFA deshabilitado exitosamente. Ya no necesitarás códigos adicionales al iniciar sesión.',
    };
  }

  /**
   * Verifica un código TOTP (usado durante el login)
   *
   * Este endpoint es llamado por AuthService durante el login
   * cuando detecta que el usuario tiene MFA habilitado.
   *
   * @param req - Request con usuario autenticado
   * @param dto - Código de verificación
   * @returns true si el código es válido
   */
  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests/minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código MFA',
    description: 'Verifica un código TOTP durante el login',
  })
  @ApiResponse({
    status: 200,
    description: 'Código válido',
    schema: {
      example: {
        valid: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido',
  })
  async verifyMfa(
    @Request() req: { user: { id: string } },
    @Body() dto: VerifyMfaDto,
  ) {
    const { id: userId } = req.user;
    const { token, backupCode } = dto;

    this.logger.log(`🔍 Verificando código MFA para usuario: ${userId}`);

    // Caso 1: Verificar token TOTP
    if (token) {
      const secret = await this.mfaService.getMfaSecret(userId);

      if (!secret) {
        return { valid: false };
      }

      const isValid = this.mfaService.verifyToken(secret, token);

      return { valid: isValid };
    }

    // Caso 2: Verificar backup code
    if (backupCode) {
      const isValid = await this.mfaService.verifyBackupCode(
        userId,
        backupCode,
      );

      return { valid: isValid };
    }

    return { valid: false };
  }
}
