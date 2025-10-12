import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de autenticación para tutores
 * Maneja registro, login, validación y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo tutor en la plataforma
   * @param registerDto - Datos del tutor a registrar
   * @returns Datos del tutor registrado (sin password_hash)
   * @throws ConflictException si el email ya existe
   */
  async register(registerDto: RegisterDto) {
    const { email, password, nombre, apellido, dni, telefono } = registerDto;

    // 1. Verificar que el email no exista
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (existingTutor) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Hashear la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // 3. Crear el tutor en la base de datos
    const tutor = await this.prisma.tutor.create({
      data: {
        email,
        password_hash: passwordHash,
        nombre,
        apellido,
        dni: dni || null,
        telefono: telefono || null,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
      },
      // IMPORTANTE: NO seleccionar password_hash por seguridad
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

    return {
      message: 'Tutor registrado exitosamente',
      user: tutor,
    };
  }

  /**
   * Autentica un tutor existente
   * @param loginDto - Credenciales del tutor
   * @returns Token JWT y datos del tutor
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar tutor por email (incluir password_hash para validación)
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    // 2. Verificar que el tutor exista
    if (!tutor) {
      // Log genérico por seguridad - no revelar si el email existe
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Comparar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, tutor.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar token JWT
    const accessToken = this.generateJwtToken(tutor.id, tutor.email);

    // 5. Retornar token y datos del tutor (sin password_hash)
    return {
      access_token: accessToken,
      user: {
        id: tutor.id,
        email: tutor.email,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        dni: tutor.dni,
        telefono: tutor.telefono,
        fecha_registro: tutor.fecha_registro,
        ha_completado_onboarding: tutor.ha_completado_onboarding,
      },
    };
  }

  /**
   * Valida un usuario por email y password
   * Método auxiliar usado por estrategias de autenticación
   * @param email - Email del tutor
   * @param password - Contraseña en texto plano
   * @returns Tutor si es válido, null si no
   */
  async validateUser(email: string, password: string) {
    try {
      const tutor = await this.prisma.tutor.findUnique({
        where: { email },
      });

      if (!tutor) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        tutor.password_hash,
      );

      if (!isPasswordValid) {
        return null;
      }

      // Retornar tutor sin password_hash
      const { password_hash, ...result } = tutor;
      return result;
    } catch (error) {
      // Log del error sin exponer detalles al cliente
      console.error('Error en validateUser:', error);
      return null;
    }
  }

  /**
   * Obtiene el perfil de un tutor por su ID
   * @param userId - ID del tutor
   * @returns Datos del tutor (sin password_hash)
   * @throws NotFoundException si el tutor no existe
   */
  async getProfile(userId: string) {
    const tutor = await this.prisma.tutor.findUnique({
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
        // IMPORTANTE: NO seleccionar password_hash
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    return tutor;
  }

  /**
   * Genera un token JWT para un tutor
   * @param tutorId - ID del tutor
   * @param email - Email del tutor
   * @returns Token JWT firmado
   * @private
   */
  private generateJwtToken(tutorId: string, email: string): string {
    const payload = {
      sub: tutorId, // Subject (ID del usuario)
      email: email,
      role: 'tutor', // Rol del usuario
    };

    return this.jwtService.sign(payload);
  }
}
