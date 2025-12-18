import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Ip,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthOrchestratorService } from './services/auth-orchestrator.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginEstudianteDto } from './dto/login-estudiante.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  RequestPasswordResetDto,
  VerifyResetTokenDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import { CompleteMfaLoginDto } from './mfa/dto/complete-mfa-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenService } from './services/token.service';
import { UserLookupService } from './services/user-lookup.service';
import { PasswordResetService } from './services/password-reset.service';
import { SessionService } from './services/session.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuthUser } from './interfaces';
import { RequireCsrf } from '../common/decorators';
import { Public } from './decorators/public.decorator';
import { parseUserRoles } from '../common/utils/role.utils';

/**
 * Controlador de autenticación
 * Expone endpoints públicos y protegidos para gestión de autenticación
 *
 * Endpoints públicos:
 * - POST /auth/register - Registro de nuevos tutores
 * - POST /auth/login - Autenticación de tutores
 *
 * Endpoints protegidos (requieren JWT):
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 * - POST /auth/logout - Cerrar sesión (invalidar token en el cliente)
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authOrchestrator: AuthOrchestratorService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly tokenService: TokenService,
    private readonly userLookupService: UserLookupService,
    private readonly passwordResetService: PasswordResetService,
    private readonly sessionService: SessionService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * POST /api/auth/register
   * Registra un nuevo tutor en la plataforma
   *
   * @param registerDto - Datos del tutor a registrar (email, password, nombre, apellido, etc.)
   * @returns 201 Created - Usuario creado exitosamente (sin password_hash)
   * @throws 409 Conflict - Email ya está registrado
   * @throws 400 Bad Request - Datos de entrada inválidos
   */
  @ApiOperation({
    summary: 'Registrar nuevo tutor',
    description:
      'Registra un nuevo tutor en la plataforma con validación de campos',
  })
  @ApiResponse({
    status: 201,
    description: 'Tutor registrado exitosamente',
    schema: {
      example: {
        id: 'uuid-del-tutor',
        email: 'juan.perez@example.com',
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        role: 'Tutor',
        createdAt: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  @ApiBody({ type: RegisterDto })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Autentica un tutor existente y genera un token JWT
   * El token se envía como httpOnly cookie en lugar de en el body
   *
   * @param loginDto - Credenciales del tutor (email, password)
   * @param res - Response object para configurar cookies
   * @returns 200 OK - { user } sin access_token (va en cookie)
   * @throws 401 Unauthorized - Credenciales inválidas
   * @throws 400 Bad Request - Datos de entrada inválidos
   */
  @ApiOperation({
    summary: 'Autenticación de tutor',
    description: 'Autentica un tutor y retorna un token JWT en httpOnly cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa (token en cookie)',
    schema: {
      example: {
        user: {
          id: 'uuid-del-tutor',
          email: 'juan.perez@example.com',
          nombre: 'Juan Carlos',
          apellido: 'Pérez García',
          role: 'Tutor',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @RequireCsrf() // ✅ Proteger login de CSRF (solo formularios web)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const result = await this.authOrchestrator.login(loginDto, ip);

    // Si requiere MFA, devolver respuesta sin cookie
    if (this.authOrchestrator.requiresMfa(result)) {
      return result;
    }

    // Login exitoso - configurar cookies httpOnly
    const loginResult = result as {
      access_token: string;
      user: {
        id: string;
        email: string;
        roles?: string[];
        [key: string]: unknown;
      };
    };

    // Generar refresh token y establecer cookies
    const { token: refreshToken, jti } = this.tokenService.generateRefreshToken(
      loginResult.user.id,
    );
    this.tokenService.setTokenCookies(
      res,
      loginResult.access_token,
      refreshToken,
    );

    // Crear sesión para tracking
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.sessionService.createSession(
      jti,
      loginResult.user.id,
      'tutor', // userType se puede inferir del orchestrator en el futuro
      expiresAt,
      ip,
      userAgent,
    );

    // Audit log del login exitoso
    await this.auditLogService.logLogin(
      loginResult.user.id,
      loginResult.user.email,
      'tutor',
      ip,
      userAgent,
    );

    return {
      user: loginResult.user,
      roles: loginResult.user.roles ?? [],
    };
  }

  /**
   * POST /api/auth/estudiante/login
   * Autentica un estudiante con sus credenciales propias y genera un token JWT
   * El token se envía como httpOnly cookie en lugar de en el body
   *
   * @param loginEstudianteDto - Credenciales del estudiante (username, password)
   * @param res - Response object para configurar cookies
   * @returns 200 OK - { user } sin access_token (va en cookie)
   * @throws 401 Unauthorized - Credenciales inválidas o estudiante sin credenciales configuradas
   * @throws 400 Bad Request - Datos de entrada inválidos
   */
  @ApiOperation({
    summary: 'Autenticación de estudiante',
    description:
      'Autentica un estudiante con username y password, retorna un token JWT en httpOnly cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa (token en cookie)',
  })
  @ApiResponse({
    status: 401,
    description:
      'Credenciales inválidas o estudiante sin credenciales configuradas',
  })
  @ApiBody({ type: LoginEstudianteDto })
  @Public()
  @Post('estudiante/login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async loginEstudiante(
    @Body() loginEstudianteDto: LoginEstudianteDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const result = await this.authOrchestrator.loginEstudiante(
      loginEstudianteDto,
      ip,
    );

    // Generar refresh token y establecer cookies
    const { token: refreshToken, jti } = this.tokenService.generateRefreshToken(
      result.user.id,
    );
    this.tokenService.setTokenCookies(res, result.access_token, refreshToken);

    // Crear sesión para tracking
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.sessionService.createSession(
      jti,
      result.user.id,
      'estudiante',
      expiresAt,
      ip,
      userAgent,
    );

    // Audit log del login exitoso
    await this.auditLogService.logLogin(
      result.user.id,
      result.user.email ?? `estudiante:${result.user.id}`,
      'estudiante',
      ip,
      userAgent,
    );

    return { user: result.user };
  }

  /**
   * GET /api/auth/profile
   * Obtiene el perfil del tutor autenticado
   * Requiere token JWT válido en el header Authorization
   *
   * @param userId - ID del usuario extraído del token JWT por JwtStrategy
   * @returns 200 OK - Datos completos del tutor (sin password_hash)
   * @throws 401 Unauthorized - Token JWT inválido o no proporcionado
   * @throws 404 Not Found - Tutor no encontrado en la base de datos
   */
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Retorna los datos del usuario (tutor/docente/estudiante) que está autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        id: 'uuid-del-usuario',
        email: 'juan.perez@example.com',
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        role: 'Tutor',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o no proporcionado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser() user: AuthUser) {
    // Usar roles[0] como fallback si role está undefined (multi-role scenario)
    const role = user.role ?? user.roles[0] ?? 'tutor';
    return this.authService.getProfile(user.id, role);
  }

  /**
   * POST /api/auth/logout
   * Cierra la sesión del usuario eliminando la cookie httpOnly
   * ✅ SECURITY FIX #6: Agrega el token a blacklist para invalidarlo inmediatamente
   *
   * @param req - Request object para extraer el token
   * @param res - Response object para limpiar cookies
   * @returns 200 OK - { message: 'Logout exitoso' }
   * @throws 401 Unauthorized - Token JWT inválido o no proporcionado
   */
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Cierra la sesión del usuario eliminando la cookie httpOnly y agregando el token a blacklist',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout exitoso',
    schema: {
      example: {
        message: 'Logout exitoso',
        description: 'La sesión ha sido cerrada y el token invalidado',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o no proporcionado',
  })
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @RequireCsrf() // ✅ Proteger logout de CSRF
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: AuthUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    // 1. Extraer el access token del header Authorization o cookie
    const authHeader = req.headers.authorization;
    const cookies = req.cookies as Record<string, string | undefined>;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookies['auth-token'];

    if (accessToken) {
      // 2. Agregar access token a blacklist para invalidarlo
      await this.tokenBlacklistService.addToBlacklist(
        accessToken,
        'user_logout',
      );
    }

    // 3. Blacklist del refresh token si existe y revocar sesión
    const refreshToken = cookies['refresh-token'];
    if (refreshToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        const ttl = this.tokenService.getRefreshTokenTtl(payload);
        await this.tokenBlacklistService.blacklistRefreshToken(
          payload.jti,
          ttl,
          'user_logout',
        );
        // Revocar sesión en DB
        await this.sessionService.revokeSession(
          payload.jti,
          user.id,
          'user_logout',
        );
      } catch {
        // Si el refresh token es inválido, ignorar (ya expiró o fue manipulado)
      }
    }

    // 4. Limpiar cookies de autenticación
    this.tokenService.clearAllTokenCookies(res);

    // 5. Audit log del logout
    await this.auditLogService.logLogout(
      user.id,
      user.email,
      user.role ?? 'unknown',
      ip,
      userAgent,
    );

    return {
      message: 'Logout exitoso',
      description: 'La sesión ha sido cerrada y los tokens invalidados',
    };
  }

  /**
   * POST /api/auth/complete-mfa-login
   * Completa el login de un admin verificando el código MFA (TOTP o backup code)
   * Este endpoint es PÚBLICO (no requiere JWT) ya que el usuario aún no está completamente autenticado
   *
   * @param dto - Token temporal MFA y código de verificación
   * @param res - Response object para configurar cookies
   * @returns 200 OK - { user } con token JWT final en cookie
   * @throws 401 Unauthorized - Token MFA inválido o código incorrecto
   */
  @ApiOperation({
    summary: 'Completar login con MFA',
    description:
      'Verifica el código TOTP o backup code y completa el login del admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Login MFA completado exitosamente (token final en cookie)',
    schema: {
      example: {
        user: {
          id: 'uuid-del-admin',
          email: 'admin@example.com',
          nombre: 'Admin',
          apellido: 'Principal',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Token MFA inválido/expirado o código de verificación incorrecto',
  })
  @ApiBody({ type: CompleteMfaLoginDto })
  @Public()
  @Post('complete-mfa-login')
  @HttpCode(HttpStatus.OK)
  async completeMfaLogin(
    @Body() dto: CompleteMfaLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const result = await this.authService.completeMfaLogin(
      dto.mfa_token,
      dto.totp_code,
      dto.backup_code,
    );

    // Generar refresh token y establecer cookies
    const { token: refreshToken, jti } = this.tokenService.generateRefreshToken(
      result.user.id,
    );
    this.tokenService.setTokenCookies(res, result.access_token, refreshToken);

    // Crear sesión para tracking
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.sessionService.createSession(
      jti,
      result.user.id,
      'admin',
      expiresAt,
      ip,
      userAgent,
    );

    // Audit log del login MFA exitoso
    await this.auditLogService.logLogin(
      result.user.id,
      result.user.email,
      'admin',
      ip,
      userAgent,
    );

    return { user: result.user };
  }

  /**
   * POST /api/auth/change-password
   * Permite al usuario autenticado actualizar su contraseña
   *
   * @param user - Usuario autenticado (extraído del token JWT)
   * @param changePasswordDto - Contraseñas actual y nueva
   * @returns 200 OK - Mensaje de éxito
   * @throws 401 Unauthorized - Contraseña actual incorrecta
   */
  @ApiOperation({
    summary: 'Cambiar contraseña del usuario autenticado',
    description:
      'Actualiza la contraseña del usuario autenticado y cierra todas las sesiones activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Contraseña actualizada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta',
  })
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  @RequireCsrf() // ✅ Proteger cambio de contraseña de CSRF (operación sensible)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser() user: AuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.authService.cambiarPassword(
      user.id,
      changePasswordDto.passwordActual,
      changePasswordDto.nuevaPassword,
    );

    await this.tokenBlacklistService.blacklistAllUserTokens(
      user.id,
      'password_change',
    );

    return result;
  }

  /**
   * POST /api/auth/refresh
   * Renueva los tokens de autenticación usando el refresh token
   *
   * Flujo:
   * 1. Lee el refresh token de la cookie
   * 2. Verifica que no esté blacklisted (detecta robo de token)
   * 3. Busca el usuario en la base de datos
   * 4. Blacklist el JTI anterior (rotación)
   * 5. Genera nuevo par de tokens (access + refresh)
   * 6. Establece ambas cookies
   *
   * @param req - Request con cookie refresh-token
   * @param res - Response para establecer nuevas cookies
   * @returns 200 OK - { success: true }
   * @throws 401 Unauthorized - Refresh token inválido/expirado/blacklisted
   */
  @ApiOperation({
    summary: 'Renovar tokens de autenticación',
    description:
      'Usa el refresh token (en cookie) para obtener nuevos access y refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Tokens renovados exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o comprometido',
  })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    // 1. Obtener refresh token de la cookie
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies['refresh-token'];

    if (!refreshToken) {
      throw new (await import('@nestjs/common')).UnauthorizedException(
        'Refresh token no proporcionado',
      );
    }

    // 2. Verificar y decodificar el refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    // 3. Verificar si el JTI está blacklisted (detecta reuso/robo)
    await this.tokenBlacklistService.detectTokenReuse(payload.jti, payload.sub);

    // 4. Buscar usuario en la base de datos
    const user = await this.userLookupService.findUserById(payload.sub);

    if (!user) {
      throw new (await import('@nestjs/common')).UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    // 5. Blacklist el JTI anterior (rotación de tokens) y revocar sesión anterior
    const ttl = this.tokenService.getRefreshTokenTtl(payload);
    await this.tokenBlacklistService.blacklistRefreshToken(
      payload.jti,
      ttl,
      'token_rotation',
    );

    // 6. Generar nuevo par de tokens y establecer cookies
    const roles = parseUserRoles(user.roles);
    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenJti,
    } = this.tokenService.generateTokenPair(user.id, user.email, roles);
    this.tokenService.setTokenCookies(res, accessToken, newRefreshToken);

    // 7. Crear nueva sesión para el nuevo refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.sessionService.createSession(
      refreshTokenJti,
      user.id,
      user.userType,
      expiresAt,
      ip,
      userAgent,
    );

    // 8. Actualizar última actividad de la sesión anterior (opcional: o marcarla como rotada)
    await this.sessionService.updateLastUsed(payload.jti);

    return {
      success: true,
      message: 'Tokens renovados exitosamente',
    };
  }

  // ============================================================================
  // PASSWORD RESET ENDPOINTS
  // ============================================================================

  /**
   * POST /api/auth/forgot-password
   * Solicita un email de recuperación de contraseña
   *
   * SECURITY: Siempre responde exitosamente para no revelar si el email existe
   *
   * @param dto - Email del usuario
   * @returns 200 OK - Mensaje genérico de éxito
   */
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un email con link de recuperación. Siempre responde exitosamente por seguridad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada (no revela si email existe)',
    schema: {
      example: {
        success: true,
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.',
      },
    },
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Más restrictivo: 3 por minuto
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: RequestPasswordResetDto) {
    await this.passwordResetService.requestPasswordReset(dto.email);

    // Siempre responder lo mismo por seguridad
    return {
      success: true,
      message:
        'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.',
    };
  }

  /**
   * POST /api/auth/verify-reset-token
   * Verifica si un token de reset es válido (sin consumirlo)
   *
   * @param dto - Token de reset a verificar
   * @returns 200 OK - { valid: true/false }
   */
  @ApiOperation({
    summary: 'Verificar token de recuperación',
    description: 'Verifica si el token de reset es válido sin consumirlo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del token',
    schema: {
      example: { valid: true },
    },
  })
  @ApiBody({ type: VerifyResetTokenDto })
  @Public()
  @Post('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Body() dto: VerifyResetTokenDto) {
    const isValid = await this.passwordResetService.verifyResetToken(
      dto.token,
      dto.email,
    );
    return { valid: isValid };
  }

  /**
   * POST /api/auth/reset-password
   * Establece una nueva contraseña usando el token de recuperación
   *
   * @param dto - Token y nueva contraseña
   * @returns 200 OK - Mensaje de éxito
   * @throws 400 Bad Request - Token inválido o expirado
   */
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description:
      'Establece una nueva contraseña usando el token de recuperación',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message:
          'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado o ya utilizado',
  })
  @ApiBody({ type: ResetPasswordDto })
  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      dto.token,
      dto.email,
      dto.newPassword,
    );

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    };
  }

  // ============================================================================
  // SESSION MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * GET /api/auth/sessions
   * Obtiene todas las sesiones activas del usuario autenticado
   *
   * @param user - Usuario autenticado
   * @param req - Request para obtener JTI actual
   * @returns Lista de sesiones activas con información del dispositivo
   */
  @ApiOperation({
    summary: 'Listar sesiones activas',
    description:
      'Obtiene todas las sesiones activas del usuario con información de dispositivo y ubicación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones activas',
    schema: {
      example: {
        sessions: [
          {
            id: 'jti-uuid',
            device: 'Windows',
            browser: 'Chrome',
            ipAddress: '192.168.1.1',
            createdAt: '2025-01-15T10:00:00.000Z',
            lastUsedAt: '2025-01-15T12:30:00.000Z',
            isCurrent: true,
          },
        ],
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSessions(@GetUser() user: AuthUser, @Req() req: Request) {
    // Obtener JTI del refresh token actual para marcar sesión actual
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies['refresh-token'];
    let currentJti: string | undefined;

    if (refreshToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        currentJti = payload.jti;
      } catch {
        // Ignorar si el refresh token es inválido
      }
    }

    const sessions = await this.sessionService.getActiveSessions(
      user.id,
      currentJti,
    );

    return { sessions };
  }

  /**
   * DELETE /api/auth/sessions/:sessionId
   * Revoca una sesión específica del usuario
   *
   * @param user - Usuario autenticado
   * @param sessionId - ID (JTI) de la sesión a revocar
   * @returns 200 OK - Mensaje de éxito
   * @throws 404 Not Found - Sesión no encontrada o no pertenece al usuario
   */
  @ApiOperation({
    summary: 'Revocar una sesión',
    description: 'Cierra una sesión específica del usuario (logout remoto)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión revocada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Sesión revocada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sesión no encontrada',
  })
  @ApiBearerAuth('JWT-auth')
  @Delete('sessions/:sessionId')
  @RequireCsrf()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @GetUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    await this.sessionService.revokeSession(sessionId, user.id, 'user_action');

    return {
      success: true,
      message: 'Sesión revocada exitosamente',
    };
  }

  /**
   * POST /api/auth/sessions/revoke-all
   * Revoca todas las sesiones excepto la actual
   *
   * @param user - Usuario autenticado
   * @param req - Request para obtener sesión actual
   * @returns 200 OK - Número de sesiones revocadas
   */
  @ApiOperation({
    summary: 'Revocar todas las demás sesiones',
    description:
      'Cierra todas las sesiones del usuario excepto la actual (logout de otros dispositivos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones revocadas exitosamente',
    schema: {
      example: {
        success: true,
        message: '3 sesiones revocadas exitosamente',
        revokedCount: 3,
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  @Post('sessions/revoke-all')
  @RequireCsrf()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@GetUser() user: AuthUser, @Req() req: Request) {
    // Obtener JTI del refresh token actual para preservar esta sesión
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies['refresh-token'];

    if (!refreshToken) {
      // Si no hay refresh token, revocar todas las sesiones
      const count = await this.sessionService.revokeAllSessions(
        user.id,
        'user_action',
      );
      return {
        success: true,
        message: `${count} sesiones revocadas exitosamente`,
        revokedCount: count,
      };
    }

    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const count = await this.sessionService.revokeAllSessionsExceptCurrent(
        user.id,
        payload.jti,
        'user_action',
      );

      return {
        success: true,
        message: `${count} sesiones revocadas exitosamente`,
        revokedCount: count,
      };
    } catch {
      // Si el refresh token es inválido, revocar todas
      const count = await this.sessionService.revokeAllSessions(
        user.id,
        'user_action',
      );
      return {
        success: true,
        message: `${count} sesiones revocadas exitosamente`,
        revokedCount: count,
      };
    }
  }
}
