import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { TutorAuthService, TutorLoginResult } from './tutor-auth.service';
import { DocenteAuthService, DocenteLoginResult } from './docente-auth.service';
import {
  AdminAuthService,
  AdminLoginResponse,
  isMfaRequired,
} from './admin-auth.service';
import {
  EstudianteAuthService,
  EstudianteLoginResult,
} from './estudiante-auth.service';
import { PrismaService } from '../../core/database/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { LoginEstudianteDto } from '../dto/login-estudiante.dto';

// ============================================================================
// TIPOS
// ============================================================================

export type UserType = 'tutor' | 'docente' | 'admin';

export type LoginByEmailResult =
  | TutorLoginResult
  | DocenteLoginResult
  | AdminLoginResponse;

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * AuthOrchestratorService - Orquestador de autenticación
 *
 * Responsabilidades:
 * - Detectar tipo de usuario por email
 * - Delegar login al servicio específico
 * - Proveer interfaz unificada para AuthController
 *
 * Este servicio reemplaza el método login() monolítico de AuthService,
 * delegando a servicios especializados por tipo de usuario.
 */
@Injectable()
export class AuthOrchestratorService {
  private readonly logger = new Logger(AuthOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tutorAuth: TutorAuthService,
    private readonly docenteAuth: DocenteAuthService,
    private readonly adminAuth: AdminAuthService,
    private readonly estudianteAuth: EstudianteAuthService,
  ) {}

  /**
   * Autentica un usuario (tutor, docente o admin) por email
   *
   * Detecta automáticamente el tipo de usuario y delega al servicio apropiado.
   *
   * @param loginDto - Credenciales (email, password)
   * @param ip - IP del cliente para rate limiting
   * @returns Resultado de login específico del tipo de usuario
   * @throws UnauthorizedException si el usuario no existe o credenciales inválidas
   */
  async login(
    loginDto: LoginDto,
    ip: string = 'unknown',
  ): Promise<LoginByEmailResult> {
    const { email, password } = loginDto;

    // 1. Detectar tipo de usuario
    const userType = await this.detectUserType(email);

    if (!userType) {
      this.logger.warn(`Login fallido: email no encontrado: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Delegar al servicio específico
    switch (userType) {
      case 'tutor':
        return this.tutorAuth.login(email, password, ip);

      case 'docente':
        return this.docenteAuth.login(email, password, ip);

      case 'admin':
        return this.adminAuth.login(email, password, ip);

      default: {
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = userType;
        throw new UnauthorizedException('Tipo de usuario no soportado');
      }
    }
  }

  /**
   * Autentica un estudiante por username
   *
   * @param loginEstudianteDto - Credenciales (username, password)
   * @param ip - IP del cliente para rate limiting
   * @returns Resultado de login de estudiante
   */
  async loginEstudiante(
    loginEstudianteDto: LoginEstudianteDto,
    ip: string = 'unknown',
  ): Promise<EstudianteLoginResult> {
    const { username, password } = loginEstudianteDto;
    return this.estudianteAuth.login(username, password, ip);
  }

  /**
   * Detecta el tipo de usuario por email
   *
   * Búsqueda en orden: tutor → docente → admin
   * Retorna null si no se encuentra en ninguna tabla.
   */
  private async detectUserType(email: string): Promise<UserType | null> {
    // 1. Buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
      select: { id: true },
    });

    if (tutor) {
      return 'tutor';
    }

    // 2. Buscar como docente
    const docente = await this.prisma.docente.findUnique({
      where: { email },
      select: { id: true },
    });

    if (docente) {
      return 'docente';
    }

    // 3. Buscar como admin
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });

    if (admin) {
      return 'admin';
    }

    return null;
  }

  /**
   * Helper para verificar si el resultado requiere MFA
   * Útil para el controller
   */
  requiresMfa(result: LoginByEmailResult): boolean {
    return isMfaRequired(result as AdminLoginResponse);
  }
}
