import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstudianteBusinessValidator } from '../validators/estudiante-business.validator';

/**
 * Service para operaciones de COPIA de estudiantes entre sectores
 * Responsabilidad: Duplicación y migración de estudiantes
 */
@Injectable()
export class EstudianteCopyService {
  private readonly logger = new Logger(EstudianteCopyService.name);

  constructor(
    private prisma: PrismaService,
    private validator: EstudianteBusinessValidator,
  ) {}

  /**
   * Genera un username único basado en nombre y apellido
   * Formato: nombre.apellido (normalizado)
   * Si existe, agrega número: nombre.apellido1, nombre.apellido2
   */
  private async generarUsernameUnico(
    nombre: string,
    apellido: string,
    sufijo?: string,
  ): Promise<string> {
    const baseUsername = `${nombre}.${apellido}${sufijo ? `.${sufijo}` : ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9.]/g, ''); // Solo letras, números y puntos

    let username = baseUsername;
    let contador = 1;

    // Verificar si existe y agregar número si es necesario
    while (await this.prisma.estudiante.findUnique({ where: { username } })) {
      username = `${baseUsername}${contador}`;
      contador++;
    }

    return username;
  }

  /**
   * TDD: Copiar estudiante existente a otro sector
   * @param estudianteId - ID del estudiante
   * @param nuevoSectorId - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  async copiarEstudianteASector(estudianteId: string, nuevoSectorId: string) {
    // Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        tutor: true,
      },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar que el sector destino existe
    await this.validator.validateSectorExists(nuevoSectorId);

    // Verificar si ya existe un estudiante con el mismo tutor y nombre en ese sector
    const existeDuplicado = await this.prisma.estudiante.findFirst({
      where: {
        tutor_id: estudiante.tutor_id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        sector_id: nuevoSectorId,
      },
    });

    if (existeDuplicado) {
      throw new ConflictException(
        'Este estudiante ya está inscrito en el sector destino',
      );
    }

    // DUPLICAR estudiante en el nuevo sector (crear un nuevo registro)
    const estudianteDuplicado = await this.prisma.estudiante.create({
      data: {
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        username: await this.generarUsernameUnico(
          estudiante.nombre,
          estudiante.apellido,
          nuevoSectorId.slice(0, 4), // Sufijo con ID del sector
        ),
        edad: estudiante.edad,
        nivelEscolar: estudiante.nivelEscolar,
        email: estudiante.email,
        tutor_id: estudiante.tutor_id,
        sector_id: nuevoSectorId,
        // Copiar datos de gamificación
        nivel_actual: estudiante.nivel_actual,
        puntos_totales: estudiante.puntos_totales,
        avatar_gradient: estudiante.avatar_gradient,
        equipoId: estudiante.equipoId,
      },
      include: {
        sector: true,
        tutor: true,
      },
    });

    this.logger.log(
      `Estudiante ${estudianteId} copiado a sector ${nuevoSectorId}. Nuevo ID: ${estudianteDuplicado.id}`,
    );

    return estudianteDuplicado;
  }

  /**
   * TDD: Buscar estudiante por email y copiarlo a otro sector
   * @param email - Email del estudiante
   * @param nuevoSectorId - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  async copiarEstudiantePorDNIASector(email: string, nuevoSectorId: string) {
    // Buscar estudiante por email
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { email },
      include: {
        sector: true,
        tutor: true,
      },
    });

    if (!estudiante) {
      throw new BadRequestException(
        `No se encontró un estudiante con email ${email}`,
      );
    }

    // Usar el método de copiar por ID
    return await this.copiarEstudianteASector(estudiante.id, nuevoSectorId);
  }
}
