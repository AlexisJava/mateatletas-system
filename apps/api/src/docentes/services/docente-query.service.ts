import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Query Service para operaciones de lectura del módulo Docentes
 *
 * Responsabilidades:
 * - Búsquedas y listados de docentes
 * - Solo operaciones READ (sin side effects)
 * - Excluye password_hash de las respuestas (excepto findByEmail para auth)
 *
 * Patrón: CQRS (Command Query Responsibility Segregation)
 */
@Injectable()
export class DocenteQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos los docentes con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin password_hash
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

    // Excluir password_hash de todos los docentes
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
   * IMPORTANTE: Este método SÍ retorna password_hash para verificación
   * @param email - Email del docente
   * @returns Docente con password_hash incluido, o null si no existe
   */
  async findByEmail(email: string) {
    return await this.prisma.docente.findUnique({
      where: { email },
    });
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password_hash, incluye sectores únicos
   * @throws NotFoundException si el docente no existe
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

    // Extraer sectores únicos de las rutas de especialidad
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
   * Busca múltiples docentes por sus IDs
   * Helper interno para operaciones que necesitan múltiples docentes
   * @param ids - Array de IDs de docentes
   * @returns Array de docentes sin password_hash
   */
  async findByIds(ids: string[]) {
    const docentes = await this.prisma.docente.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // Excluir password_hash
    return docentes.map(
      ({ password_hash: _password_hash, ...docente }) => docente,
    );
  }
}
