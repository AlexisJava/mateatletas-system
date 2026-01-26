import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import { CreateDocenteDto } from '../dto/create-docente.dto';
import { UpdateDocenteDto } from '../dto/update-docente.dto';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';
import { generateSecurePassword } from '../../common/utils/password.utils';

/**
 * Command Service para operaciones de escritura del módulo Docentes
 *
 * Responsabilidades:
 * - Create, Update, Delete de docentes
 * - Solo operaciones WRITE (con side effects)
 * - Usa DocenteBusinessValidator para validaciones
 * - Excluye passwordHash de las respuestas
 *
 * Patrón: CQRS (Command Query Responsibility Segregation)
 */
@Injectable()
export class DocenteCommandService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Crea un nuevo docente en el sistema
   * - Auto-genera contraseña segura si no se provee
   * - Hashea la contraseña con bcrypt
   * @param createDto - Datos del docente a crear
   * @returns El docente creado (sin passwordHash) + generatedPassword si se auto-generó
   */
  async create(createDto: CreateDocenteDto) {
    // Validar que el email no esté en uso
    await this.validator.validarEmailUnico(createDto.email);

    // Generar o usar la contraseña proporcionada
    const { password, wasGenerated } = this.generarYValidarPassword(
      createDto.password,
    );

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear docente
    const docente = await this.prisma.docente.create({
      data: {
        email: createDto.email,
        passwordHash: hashedPassword,
        nombre: createDto.nombre,
        apellido: createDto.apellido,
        titulo: createDto.titulo,
        bio: createDto.bio || createDto.biografia,
        telefono: createDto.telefono,
        especialidades: createDto.especialidades || [],
        experienciaAnos: createDto.experienciaAnos,
        disponibilidadHoraria: createDto.disponibilidadHoraria || {},
        nivelEducativo: createDto.nivelEducativo || [],
        estado: createDto.estado || 'activo',
      },
    });

    const docenteSinPassword = this.excluirPasswordHash(docente);

    // Si se generó la contraseña, retornarla para que el admin pueda compartirla
    if (wasGenerated) {
      return {
        ...docenteSinPassword,
        generatedPassword: password,
      };
    }

    return docenteSinPassword;
  }

  /**
   * Actualiza un docente existente
   * - Valida existencia y email único
   * - Hashea nueva contraseña si se proporciona
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado sin passwordHash
   */
  async update(id: string, updateDto: UpdateDocenteDto) {
    // Verificar que el docente existe
    await this.validator.validarDocenteExiste(id);

    // Si se está actualizando el email, verificar que no exista
    if (updateDto.email) {
      await this.validator.validarEmailUnico(updateDto.email, id);
    }

    // Preparar datos para actualización
    const dataToUpdate: Prisma.DocenteUpdateInput = {
      nombre: updateDto.nombre,
      apellido: updateDto.apellido,
      email: updateDto.email,
      titulo: updateDto.titulo,
      bio: updateDto.bio || updateDto.biografia,
      telefono: updateDto.telefono,
      especialidades: updateDto.especialidades,
      experienciaAnos: updateDto.experienciaAnos,
      disponibilidadHoraria: updateDto.disponibilidadHoraria,
      nivelEducativo: updateDto.nivelEducativo,
      estado: updateDto.estado,
    };

    // Si se incluye password, hashearla
    if (updateDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(
        updateDto.password,
        BCRYPT_ROUNDS,
      );
    }

    // Actualizar docente
    const updatedDocente = await this.prisma.docente.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.excluirPasswordHash(updatedDocente);
  }

  /**
   * Elimina un docente del sistema
   * - Valida que no tenga clases asignadas
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  async remove(id: string) {
    // Validar que el docente existe y no tiene clases asignadas
    await this.validator.validarDocenteTieneClases(id);

    await this.prisma.docente.delete({
      where: { id },
    });

    return { message: 'Docente eliminado correctamente' };
  }

  /**
   * Reasigna todas las clases de un docente a otro
   * - Valida que ambos docentes existen
   * - Valida que no sean el mismo docente
   * @param fromDocenteId - ID del docente actual
   * @param toDocenteId - ID del nuevo docente
   * @returns Resultado de la reasignación
   */
  async reasignarClases(fromDocenteId: string, toDocenteId: string) {
    // Validar reasignación
    await this.validator.validarReasignacionValida(fromDocenteId, toDocenteId);

    // Obtener docentes para incluir en la respuesta
    const [fromDocente, toDocente] = await Promise.all([
      this.prisma.docente.findUnique({
        where: { id: fromDocenteId },
        include: {
          _count: {
            select: { clases: true },
          },
        },
      }),
      this.prisma.docente.findUnique({
        where: { id: toDocenteId },
      }),
    ]);

    // Defensive check: aunque el validator ya validó, protegemos contra race conditions
    if (!fromDocente || !toDocente) {
      throw new NotFoundException(
        'Uno de los docentes ya no existe en el sistema',
      );
    }

    // Reasignar todas las clases
    const result = await this.prisma.clase.updateMany({
      where: { docenteId: fromDocenteId },
      data: { docenteId: toDocenteId },
    });

    return {
      message: `${result.count} clase(s) reasignada(s) correctamente`,
      clasesReasignadas: result.count,
      desde: `${fromDocente.nombre} ${fromDocente.apellido}`,
      hacia: `${toDocente.nombre} ${toDocente.apellido}`,
    };
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Genera o valida una contraseña
   * @param password - Contraseña proporcionada (opcional)
   * @returns Objeto con la contraseña y si fue generada
   */
  private generarYValidarPassword(password?: string): {
    password: string;
    wasGenerated: boolean;
  } {
    if (!password) {
      // Auto-generar contraseña segura
      return {
        password: generateSecurePassword(),
        wasGenerated: true,
      };
    }

    // Usar la contraseña proporcionada (ya validada por DTO)
    return {
      password,
      wasGenerated: false,
    };
  }

  /**
   * Excluye passwordHash de un docente
   * @param docente - Docente con passwordHash
   * @returns Docente sin passwordHash
   */
  private excluirPasswordHash<T extends { passwordHash?: string }>(
    docente: T,
  ): Omit<T, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...docenteSinPassword } = docente;
    return docenteSinPassword;
  }
}
