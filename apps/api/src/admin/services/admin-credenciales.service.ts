import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  generateTutorPassword,
  generateEstudiantePin,
  generateDocentePassword,
} from '../../common/utils/credential-generator';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';

/**
 * Tipos de usuario válidos para operaciones de credenciales
 */
type TipoUsuario = 'tutor' | 'estudiante' | 'docente';

/**
 * Response unificado para reset de contraseña
 */
export interface ResetPasswordResponse {
  message: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string | null;
    username?: string | null;
  };
  password_temporal: string;
}

/**
 * Servicio especializado para gestión de credenciales de usuarios
 * Responsabilidad única: Generar, resetear y listar credenciales temporales
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - AdminService: Orquestación general
 * - AdminCredencialesService: Lógica de negocio de credenciales
 * - AdminEstudiantesService: CRUD de estudiantes
 * - AdminUsuariosService: CRUD de usuarios
 */
@Injectable()
export class AdminCredencialesService {
  private readonly logger = new Logger(AdminCredencialesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resetear contraseña de un usuario específico
   * Genera nueva contraseña temporal y marca debe_cambiar_password = true
   *
   * @param usuarioId - ID del usuario
   * @param tipoUsuario - Tipo de usuario (tutor, estudiante, docente)
   * @returns Información del usuario y nueva contraseña temporal
   *
   * @throws NotFoundException si el usuario no existe
   * @throws InternalServerErrorException si falla el hash de la contraseña
   */
  async resetearPassword(
    usuarioId: string,
    tipoUsuario: TipoUsuario,
  ): Promise<ResetPasswordResponse> {
    try {
      let nuevaPassword: string;
      let hashedPassword: string;

      // Generar contraseña según el tipo de usuario
      switch (tipoUsuario) {
        case 'tutor':
          nuevaPassword = generateTutorPassword();
          break;
        case 'estudiante':
          nuevaPassword = generateEstudiantePin();
          break;
        case 'docente':
          nuevaPassword = generateDocentePassword();
          break;
      }

      // Hash de la contraseña
      try {
        hashedPassword = await bcrypt.hash(nuevaPassword, BCRYPT_ROUNDS);
      } catch (error) {
        this.logger.error('Failed to hash password', {
          error: error instanceof Error ? error.message : 'Unknown error',
          tipoUsuario,
        });
        throw new InternalServerErrorException('Error al generar la contraseña');
      }

      // Actualizar según el tipo de usuario
      let usuario: ResetPasswordResponse['usuario'];

      try {
        switch (tipoUsuario) {
          case 'tutor':
            usuario = await this.prisma.tutor.update({
              where: { id: usuarioId },
              data: {
                password_hash: hashedPassword,
                password_temporal: nuevaPassword,
                debe_cambiar_password: true,
              },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            });
            break;

          case 'estudiante':
            usuario = await this.prisma.estudiante.update({
              where: { id: usuarioId },
              data: {
                password_hash: hashedPassword,
                password_temporal: nuevaPassword,
                debe_cambiar_password: true,
              },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                username: true,
              },
            });
            break;

          case 'docente':
            usuario = await this.prisma.docente.update({
              where: { id: usuarioId },
              data: {
                password_hash: hashedPassword,
                password_temporal: nuevaPassword,
                debe_cambiar_password: true,
              },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            });
            break;
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException(
              `${tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)} con ID ${usuarioId} no encontrado`,
            );
          }
        }

        this.logger.error('Failed to reset password', {
          error: error instanceof Error ? error.message : 'Unknown error',
          usuarioId,
          tipoUsuario,
        });
        throw new InternalServerErrorException('Error al resetear la contraseña');
      }

      this.logger.log(`Password reseteado exitosamente para ${tipoUsuario} ${usuario.nombre} ${usuario.apellido}`);

      return {
        message: 'Contraseña reseteada exitosamente',
        usuario,
        password_temporal: nuevaPassword,
      };
    } catch (error) {
      // Re-throw si ya es una excepción de NestJS
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Unexpected error in resetearPassword', {
        error: error instanceof Error ? error.message : 'Unknown error',
        usuarioId,
        tipoUsuario,
      });
      throw new InternalServerErrorException('Error inesperado al resetear contraseña');
    }
  }

  /**
   * Resetear contraseñas masivamente
   * Procesa múltiples usuarios en paralelo con manejo robusto de errores
   *
   * @param usuarios - Array de usuarios a resetear
   * @returns Resultado con exitosos y fallidos
   */
  async resetearPasswordsMasivo(
    usuarios: Array<{ id: string; tipoUsuario: TipoUsuario }>,
  ) {
    this.logger.log(`Iniciando reset masivo de ${usuarios.length} contraseñas`);

    const resultados = await Promise.all(
      usuarios.map(async (u) => {
        try {
          const resultado = await this.resetearPassword(u.id, u.tipoUsuario);
          return {
            success: true,
            usuarioId: u.id,
            tipoUsuario: u.tipoUsuario,
            usuario: resultado.usuario,
            password_temporal: resultado.password_temporal,
          };
        } catch (error) {
          this.logger.warn(`Failed to reset password for user ${u.id}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            tipoUsuario: u.tipoUsuario,
          });

          return {
            success: false,
            usuarioId: u.id,
            tipoUsuario: u.tipoUsuario,
            error: error instanceof Error ? error.message : 'Error desconocido',
          };
        }
      }),
    );

    const exitosos = resultados.filter((r) => r.success);
    const fallidos = resultados.filter((r) => !r.success);

    this.logger.log(`Reset masivo completado: ${exitosos.length} exitosos, ${fallidos.length} fallidos`);

    return {
      message: `${exitosos.length} contraseñas reseteadas, ${fallidos.length} fallidas`,
      exitosos,
      fallidos,
      total: usuarios.length,
    };
  }

  /**
   * Obtener todas las credenciales de usuarios con password temporal
   * Útil para generar planillas de acceso inicial
   *
   * @returns Credenciales de tutores, estudiantes y docentes
   */
  async obtenerTodasLasCredenciales() {
    try {
      const [tutores, estudiantes, docentes] = await Promise.all([
        this.prisma.tutor.findMany({
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            username: true,
            password_temporal: true,
            debe_cambiar_password: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.estudiante.findMany({
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            password_temporal: true,
            debe_cambiar_password: true,
            createdAt: true,
            tutor: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.docente.findMany({
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            password_temporal: true,
            debe_cambiar_password: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return {
        tutores: tutores.map((t) => ({
          id: t.id,
          rol: 'Tutor',
          nombre: t.nombre,
          apellido: t.apellido,
          usuario: t.username || `${t.nombre.toLowerCase()}.${t.apellido.toLowerCase()}`,
          password_temporal: t.password_temporal,
          estado: t.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
          fecha_creacion: t.createdAt,
        })),
        estudiantes: estudiantes.map((e) => ({
          id: e.id,
          rol: 'Estudiante',
          nombre: e.nombre,
          apellido: e.apellido,
          usuario: e.username,
          password_temporal: e.password_temporal,
          estado: e.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
          tutor: `${e.tutor.nombre} ${e.tutor.apellido}`,
          fecha_creacion: e.createdAt,
        })),
        docentes: docentes.map((d) => ({
          id: d.id,
          rol: 'Docente',
          nombre: d.nombre,
          apellido: d.apellido,
          usuario: `${d.nombre.toLowerCase()}.${d.apellido.toLowerCase()}`,
          password_temporal: d.password_temporal,
          estado: d.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
          fecha_creacion: d.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to fetch credentials', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new InternalServerErrorException('Error al obtener las credenciales');
    }
  }
}
