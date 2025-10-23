import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../common/constants/security.constants';
import { generateSecurePassword } from '../common/utils/password.utils';

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
   * @returns El docente creado (sin password) + generatedPassword si se auto-generó
   */
  async create(createDto: CreateDocenteDto) {
    // Verificar que el email no esté en uso
    const existingDocente = await this.prisma.docente.findUnique({
      where: { email: createDto.email },
    });

    if (existingDocente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Determinar si se debe generar contraseña
    let passwordToUse: string;
    let wasPasswordGenerated = false;

    if (!createDto.password) {
      // Auto-generar contraseña segura
      passwordToUse = generateSecurePassword();
      wasPasswordGenerated = true;
    } else {
      // Usar la contraseña proporcionada
      passwordToUse = createDto.password;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(passwordToUse, BCRYPT_ROUNDS);

    // Crear docente
    const docente = await this.prisma.docente.create({
      data: {
        email: createDto.email,
        password_hash: hashedPassword,
        // Guardar contraseña temporal solo si se auto-generó
        password_temporal: wasPasswordGenerated ? passwordToUse : null,
        nombre: createDto.nombre,
        apellido: createDto.apellido,
        titulo: createDto.titulo,
        bio: createDto.bio || createDto.biografia,
        telefono: createDto.telefono,
        especialidades: createDto.especialidades || [],
        experiencia_anos: createDto.experiencia_anos,
        disponibilidad_horaria: createDto.disponibilidad_horaria || {},
        nivel_educativo: createDto.nivel_educativo || [],
        estado: createDto.estado || 'activo',
        // Si se generó la contraseña = debe cambiarla
        // Si el admin la proporcionó = no necesita cambiarla
        debe_cambiar_password: wasPasswordGenerated,
      },
    });

    // Excluir password_hash de la respuesta
    const { password_hash: _password_hash, ...docenteSinPassword } = docente;

    // Si se generó la contraseña, retornarla para que el admin pueda compartirla
    if (wasPasswordGenerated) {
      return {
        ...docenteSinPassword,
        generatedPassword: passwordToUse,
      };
    }

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
   * @returns Docente sin password, incluye sectores
   */
  async findById(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        rutasEspecialidad: {
          include: {
            sector: {
              select: {
                nombre: true,
                icono: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const { password_hash: _password_hash, ...docenteSinPassword } = docente;

    // Extraer sectores únicos
    const sectoresMap = new Map();
    docente.rutasEspecialidad?.forEach((dr) => {
      const sector = dr.sector;
      if (sector) {
        sectoresMap.set(sector.nombre, sector);
      }
    });
    const sectores = Array.from(sectoresMap.values());

    return {
      ...docenteSinPassword,
      sectores,
    };
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
      bio: updateDto.bio || updateDto.biografia,
      telefono: updateDto.telefono,
      especialidades: updateDto.especialidades,
      experiencia_anos: updateDto.experiencia_anos,
      disponibilidad_horaria: updateDto.disponibilidad_horaria,
      nivel_educativo: updateDto.nivel_educativo,
      estado: updateDto.estado,
    };

    // Si se incluye password, hashearla
    if (updateDto.password) {
      dataToUpdate.password_hash = await bcrypt.hash(updateDto.password, BCRYPT_ROUNDS);
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
   * Elimina un docente
   * @param id - ID del docente
   * @throws ConflictException si el docente tiene clases asignadas
   */
  async remove(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Validar que no tenga clases asignadas
    if (docente._count.clases > 0) {
      throw new ConflictException(
        `No se puede eliminar el docente porque tiene ${docente._count.clases} clase(s) asignada(s). ` +
        `Debe reasignar las clases a otro docente antes de eliminar.`,
      );
    }

    await this.prisma.docente.delete({
      where: { id },
    });

    return { message: 'Docente eliminado correctamente' };
  }

  /**
   * Reasigna todas las clases de un docente a otro
   * @param fromDocenteId - ID del docente actual
   * @param toDocenteId - ID del nuevo docente
   * @returns Cantidad de clases reasignadas
   */
  async reasignarClases(fromDocenteId: string, toDocenteId: string) {
    // Verificar que ambos docentes existen
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

    if (!fromDocente) {
      throw new NotFoundException('Docente origen no encontrado');
    }

    if (!toDocente) {
      throw new NotFoundException('Docente destino no encontrado');
    }

    if (fromDocenteId === toDocenteId) {
      throw new ConflictException('No se puede reasignar clases al mismo docente');
    }

    // Reasignar todas las clases
    const result = await this.prisma.clase.updateMany({
      where: { docente_id: fromDocenteId },
      data: { docente_id: toDocenteId },
    });

    return {
      message: `${result.count} clase(s) reasignada(s) correctamente`,
      clasesReasignadas: result.count,
      desde: `${fromDocente.nombre} ${fromDocente.apellido}`,
      hacia: `${toDocente.nombre} ${toDocente.apellido}`,
    };
  }
}
