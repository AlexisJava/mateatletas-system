import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import * as bcrypt from 'bcrypt';

/**
 * Service para gestionar operaciones CRUD de docentes
 * Implementa la lógica de negocio y validaciones
 */
@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo docente en el sistema
   * @param createDto - Datos del docente a crear
   * @returns El docente creado (sin password)
   */
  async create(createDto: CreateDocenteDto) {
    // Verificar que el email no esté en uso
    const existingDocente = await this.prisma.docente.findUnique({
      where: { email: createDto.email },
    });

    if (existingDocente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    // Crear docente
    const docente = await this.prisma.docente.create({
      data: {
        email: createDto.email,
        password_hash: hashedPassword,
        nombre: createDto.nombre,
        apellido: createDto.apellido,
        titulo: createDto.titulo,
        bio: createDto.bio,
      },
    });

    // Excluir password_hash de la respuesta
    const { password_hash: _password_hash, ...docenteSinPassword } = docente;

    return docenteSinPassword;
  }

  /**
   * Obtiene todos los docentes del sistema con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin contraseñas
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [docentes, total] = await Promise.all([
      this.prisma.docente.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.docente.count(),
    ]);

    // Excluir passwords de todos los docentes
    const docentesSinPassword = docentes.map(
      ({ password_hash: _password_hash, ...docente }) => docente,
    );

    return {
      data: docentesSinPassword,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca un docente por email (usado para autenticación)
   * @param email - Email del docente
   * @returns Docente con password_hash incluido
   */
  async findByEmail(email: string) {
    return await this.prisma.docente.findUnique({
      where: { email },
    });
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password
   */
  async findById(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const { password_hash: _password_hash, ...docenteSinPassword } = docente;
    return docenteSinPassword;
  }

  /**
   * Actualiza un docente
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado sin password
   */
  async update(id: string, updateDto: UpdateDocenteDto) {
    // Verificar que el docente existe
    const existingDocente = await this.prisma.docente.findUnique({
      where: { id },
    });

    if (!existingDocente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateDto.email && updateDto.email !== existingDocente.email) {
      const emailExists = await this.prisma.docente.findUnique({
        where: { email: updateDto.email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Preparar datos para actualización
    const dataToUpdate: any = {
      nombre: updateDto.nombre,
      apellido: updateDto.apellido,
      email: updateDto.email,
      titulo: updateDto.titulo,
      bio: updateDto.bio,
    };

    // Si se incluye password, hashearla
    if (updateDto.password) {
      dataToUpdate.password_hash = await bcrypt.hash(updateDto.password, 10);
    }

    // Actualizar docente
    const updatedDocente = await this.prisma.docente.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password_hash: _password_hash, ...docenteSinPassword } = updatedDocente;
    return docenteSinPassword;
  }

  /**
   * Elimina un docente (soft delete o hard delete según necesidad)
   * @param id - ID del docente
   */
  async remove(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    await this.prisma.docente.delete({
      where: { id },
    });

    return { message: 'Docente eliminado correctamente' };
  }
}
