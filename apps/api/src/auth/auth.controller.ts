import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginEstudianteDto } from './dto/login-estudiante.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { TokenBlacklistService } from './token-blacklist.service';
import { AuthUser } from './interfaces';

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
    private readonly tokenBlacklistService: TokenBlacklistService,
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
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Configurar cookie httpOnly
    res.cookie('auth-token', result.access_token, {
      httpOnly: true, // No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none en prod para cross-domain, lax en dev
      domain: process.env.NODE_ENV === 'production' ? '.mateatletasclub.com.ar' : undefined, // Dominio compartido en producción
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    // Retornar solo el user (el token va en la cookie)
    return { user: result.user };
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
  @Post('estudiante/login')
  @HttpCode(HttpStatus.OK)
  async loginEstudiante(
    @Body() loginEstudianteDto: LoginEstudianteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 🔍 LOGGING TEMPORAL: Diagnosticar error 400
    console.log('📥 [LOGIN ESTUDIANTE] Request recibido:', {
      username: loginEstudianteDto.username,
      password_length: loginEstudianteDto.password?.length || 0,
      dto_keys: Object.keys(loginEstudianteDto),
    });

    const result = await this.authService.loginEstudiante(loginEstudianteDto);

    // Configurar cookie httpOnly
    res.cookie('auth-token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none en prod para cross-domain, lax en dev
      domain: process.env.NODE_ENV === 'production' ? '.mateatletasclub.com.ar' : undefined, // Dominio compartido en producción
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    // Retornar solo el user (el token va en la cookie)
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
    const role = user.role || user.roles[0];
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // 1. Extraer el token del header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remover "Bearer "

      // 2. Agregar token a blacklist para invalidarlo
      await this.tokenBlacklistService.addToBlacklist(token, 'user_logout');
    }

    // 3. Limpiar cookie de autenticación (comportamiento original)
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.mateatletasclub.com.ar' : undefined,
      path: '/',
    });

    return {
      message: 'Logout exitoso',
      description: 'La sesión ha sido cerrada y el token invalidado',
    };
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
}
