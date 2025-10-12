import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Registra un nuevo tutor en la plataforma
   *
   * @param registerDto - Datos del tutor a registrar (email, password, nombre, apellido, etc.)
   * @returns 201 Created - Usuario creado exitosamente (sin password_hash)
   * @throws 409 Conflict - Email ya está registrado
   * @throws 400 Bad Request - Datos de entrada inválidos
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Autentica un tutor existente y genera un token JWT
   *
   * @param loginDto - Credenciales del tutor (email, password)
   * @returns 200 OK - { access_token, user } con token JWT válido
   * @throws 401 Unauthorized - Credenciales inválidas
   * @throws 400 Bad Request - Datos de entrada inválidos
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  /**
   * POST /api/auth/logout
   * Cierra la sesión del usuario (lado del cliente)
   * Requiere token JWT válido en el header Authorization
   *
   * NOTA: Por ahora, el logout es manejado en el cliente eliminando el token.
   * En el futuro, se puede implementar una blacklist de tokens en Redis
   * para invalidar tokens antes de su expiración natural.
   *
   * @returns 200 OK - { message: 'Logout exitoso' }
   * @throws 401 Unauthorized - Token JWT inválido o no proporcionado
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Logout exitoso',
      description:
        'El token debe ser eliminado del almacenamiento del cliente (localStorage/sessionStorage)',
    };
  }
}
