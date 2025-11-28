import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  Prisma,
  Tutor,
  Estudiante,
  Inscripcion2026,
  PagoInscripcion2026,
  EstudianteInscripcion2026,
} from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';
import { PRECIOS, DESCUENTOS, DEFAULT_ROLES } from '../domain/constants';
import { PricingCalculatorService } from '../domain/services/pricing-calculator.service';
import { PinGeneratorService } from '../shared/services/pin-generator.service';
import { TutorCreationService } from '../shared/services/tutor-creation.service';
import {
  CreateInscripcion2026Dto,
  CreateInscripcion2026Response,
  TipoInscripcion2026,
  MundoSTEAM,
  CourseSelectionDto,
  TutorDataDto,
  EstudianteInscripcionDto,
} from './dto/create-inscripcion-2026.dto';
import {
  ValidarInscripcionUseCase,
  ProcesarWebhookInscripcionUseCase,
} from './use-cases';

/**
 * Representa un estudiante creado en la transacción con sus datos relacionados
 */
interface EstudianteCreado {
  estudiante: Estudiante;
  estudianteInscripcion: EstudianteInscripcion2026;
  pin: string;
  cursosSeleccionados: CourseSelectionDto[];
  mundoSeleccionado?: MundoSTEAM;
}

/**
 * Resultado completo de la transacción de inscripción
 */
interface TransactionResult {
  inscripcion: Inscripcion2026;
  tutor: Tutor;
  estudiantes: EstudianteCreado[];
  pago: PagoInscripcion2026;
  cursosCount: number;
  mundosCount: number;
}

/**
 * Inscripciones2026Service
 *
 * Facade que orquesta la lógica de inscripciones 2026.
 * Delega responsabilidades a use-cases especializados:
 * - ValidarInscripcionUseCase: Validación y cálculo de precios
 * - ProcesarWebhookInscripcionUseCase: Procesamiento de webhooks MercadoPago
 *
 * Refactorizado desde 1063 líneas para reducir complejidad.
 */
@Injectable()
export class Inscripciones2026Service {
  private readonly logger = new Logger(Inscripciones2026Service.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly pricingCalculator: PricingCalculatorService,
    private readonly pinGenerator: PinGeneratorService,
    private readonly tutorCreation: TutorCreationService,
    // Use-cases
    private readonly validarInscripcionUseCase: ValidarInscripcionUseCase,
    private readonly procesarWebhookUseCase: ProcesarWebhookInscripcionUseCase,
  ) {}

  /**
   * Genera un PIN único de 4 dígitos para el estudiante
   *
   * Delega la generación al servicio compartido PinGeneratorService.
   *
   * @returns PIN único de 4 dígitos
   * @throws Error si no se puede generar PIN único después de MAX_RETRIES
   */
  private async generateUniquePin(): Promise<string> {
    return await this.pinGenerator.generateUniquePin(
      'estudianteInscripcion2026',
      async (pin) =>
        await this.prisma.estudianteInscripcion2026.findFirst({
          where: { pin },
        }),
    );
  }

  /**
   * Genera username único para estudiante
   *
   * Formato: nombre.apellido o nombre sin espacios
   * Normaliza y elimina acentos para garantizar compatibilidad
   *
   * @param nombreCompleto - Nombre completo del estudiante
   * @returns Username normalizado
   */
  private generateUsername(nombreCompleto: string): string {
    const baseUsername = nombreCompleto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, '') // Eliminar espacios
      .replace(/[^a-z0-9]/g, ''); // Solo letras y números

    // Agregar sufijo aleatorio de 4 dígitos para garantizar unicidad
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${baseUsername}${randomSuffix}`;
  }

  /**
   * Construye los datos de preferencia de MercadoPago para la inscripción
   * @private
   */
  private buildMercadoPagoPreferenceData(
    dto: CreateInscripcion2026Dto,
    inscripcionFee: number,
    backendUrl: string,
    frontendUrl: string,
  ): ReturnType<
    typeof this.mercadoPagoService.buildInscripcion2026PreferenceData
  > {
    return this.mercadoPagoService.buildInscripcion2026PreferenceData(
      dto.tipo_inscripcion,
      inscripcionFee,
      {
        email: dto.tutor.email,
        nombre: dto.tutor.nombre,
        apellido: undefined,
      },
      'TEMP_INSCRIPCION_ID',
      'TEMP_TUTOR_ID',
      dto.estudiantes.length,
      backendUrl,
      frontendUrl,
    );
  }

  /**
   * Crea preferencia de MercadoPago con manejo de modo mock y errores
   * @private
   */
  private async createMercadoPagoPreference(
    dto: CreateInscripcion2026Dto,
    inscripcionFee: number,
    backendUrl: string,
    frontendUrl: string,
  ): Promise<{
    mercadopagoPreferenceId: string;
    mercadopagoInitPoint: string;
  }> {
    // Verificar si MercadoPago está en modo mock
    if (this.mercadoPagoService.isMockMode()) {
      this.logger.warn(
        'MercadoPago en modo MOCK - Generando preferencia placeholder',
      );
      return {
        mercadopagoPreferenceId: 'MP-MOCK-TEMP',
        mercadopagoInitPoint: `${frontendUrl}/inscripcion-2026/mock-checkout`,
      };
    }

    // Generar preferencia real con MercadoPago
    const preferenceData = this.buildMercadoPagoPreferenceData(
      dto,
      inscripcionFee,
      backendUrl,
      frontendUrl,
    );

    try {
      const preference =
        await this.mercadoPagoService.createPreference(preferenceData);
      const mercadopagoPreferenceId = preference.id || '';
      const mercadopagoInitPoint = preference.init_point || '';

      this.logger.log('MercadoPago preference created successfully', {
        preferenceId: mercadopagoPreferenceId,
        initPoint: mercadopagoInitPoint,
        amount: inscripcionFee,
      });

      return { mercadopagoPreferenceId, mercadopagoInitPoint };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('Failed to create MercadoPago preference', {
        error: errorMessage,
        stack: errorStack,
        dto: {
          tipo: dto.tipo_inscripcion,
          numEstudiantes: dto.estudiantes.length,
        },
      });

      throw new BadRequestException(
        'No se pudo crear la preferencia de pago. Intente nuevamente.',
      );
    }
  }

  /**
   * Busca o crea un tutor en la base de datos
   *
   * Usa TutorCreationService.hashPassword() para el hash de contraseña.
   *
   * @private
   */
  private async findOrCreateTutor(
    tx: Prisma.TransactionClient,
    tutorDto: TutorDataDto,
  ): Promise<Tutor> {
    let tutor = await tx.tutor.findUnique({
      where: { email: tutorDto.email },
    });

    if (!tutor) {
      const hashedPassword = await this.tutorCreation.hashPassword(
        tutorDto.password,
      );
      tutor = await tx.tutor.create({
        data: {
          nombre: tutorDto.nombre,
          apellido: '',
          email: tutorDto.email,
          telefono: tutorDto.telefono,
          dni: tutorDto.dni,
          cuil: tutorDto.cuil,
          password_hash: hashedPassword,
          debe_cambiar_password: false,
          debe_completar_perfil: false,
          ha_completado_onboarding: true,
          roles: DEFAULT_ROLES.TUTOR,
        },
      });
    }

    return tutor;
  }

  /**
   * Crea el registro de inscripción en la base de datos
   * @private
   */
  private async createInscripcion(
    tx: Prisma.TransactionClient,
    tutorId: string,
    dto: CreateInscripcion2026Dto,
    inscripcionFee: number,
    siblingDiscount: number,
    monthlyTotal: number,
  ): Promise<Inscripcion2026> {
    return tx.inscripcion2026.create({
      data: {
        tutor_id: tutorId,
        tipo_inscripcion: dto.tipo_inscripcion,
        estado: 'pending',
        inscripcion_pagada: inscripcionFee,
        descuento_aplicado: siblingDiscount,
        total_mensual_actual: monthlyTotal,
        origen_inscripcion: dto.origen_inscripcion,
        ciudad: dto.ciudad,
      },
    });
  }

  /**
   * Crea estudiantes y sus registros de inscripción con PINs únicos
   * @private
   */
  private async createEstudiantesConInscripciones(
    tx: Prisma.TransactionClient,
    inscripcionId: string,
    estudiantesDto: EstudianteInscripcionDto[],
    tutorId: string,
  ): Promise<EstudianteCreado[]> {
    const estudiantesCreados: EstudianteCreado[] = [];

    for (const estudianteDto of estudiantesDto) {
      // Generar PIN único
      const pin = await this.generateUniquePin();

      // Generar username
      const username = this.generateUsername(estudianteDto.nombre);

      // Crear estudiante en tabla principal
      const estudiante = await tx.estudiante.create({
        data: {
          tutor_id: tutorId,
          nombre: estudianteDto.nombre,
          apellido: '',
          edad: estudianteDto.edad,
          nivelEscolar: 'Primaria',
          username,
          password_hash: await bcrypt.hash(pin, 12),
          debe_cambiar_password: true,
          roles: DEFAULT_ROLES.ESTUDIANTE,
        },
      });

      // Crear registro de inscripción de estudiante
      const estudianteInscripcion = await tx.estudianteInscripcion2026.create({
        data: {
          inscripcion_id: inscripcionId,
          estudiante_id: estudiante.id,
          nombre: estudianteDto.nombre,
          edad: estudianteDto.edad,
          dni: estudianteDto.dni,
          pin,
        },
      });

      estudiantesCreados.push({
        estudiante,
        estudianteInscripcion,
        pin,
        cursosSeleccionados: estudianteDto.cursos_seleccionados || [],
        mundoSeleccionado: estudianteDto.mundo_seleccionado,
      });
    }

    return estudiantesCreados;
  }

  /**
   * Prepara datos de cursos de Colonia para creación en batch
   * @private
   */
  private prepareCursosData(
    estudiantesCreados: EstudianteCreado[],
  ): Prisma.ColoniaCursoSeleccionado2026CreateManyInput[] {
    const cursosData: Prisma.ColoniaCursoSeleccionado2026CreateManyInput[] = [];

    estudiantesCreados.forEach(
      ({ estudianteInscripcion, cursosSeleccionados }) => {
        if (cursosSeleccionados && cursosSeleccionados.length > 0) {
          cursosSeleccionados.forEach((curso, cursoIdx) => {
            const precioBase = PRECIOS.COLONIA_CURSO_BASE;
            const descuentoCurso =
              cursoIdx === 1 ? DESCUENTOS.COLONIA.SEGUNDO_CURSO : 0;
            const precioConDescuento = this.pricingCalculator.aplicarDescuento(
              precioBase,
              descuentoCurso,
            );

            cursosData.push({
              estudiante_inscripcion_id: estudianteInscripcion.id,
              course_id: curso.course_id,
              course_name: curso.course_name,
              course_area: curso.course_area,
              instructor: curso.instructor,
              day_of_week: curso.day_of_week,
              time_slot: curso.time_slot,
              precio_base: precioBase,
              precio_con_descuento: precioConDescuento,
            });
          });
        }
      },
    );

    return cursosData;
  }

  /**
   * Prepara datos de mundos STEAM para creación en batch
   * @private
   */
  private prepareMundosData(
    estudiantesCreados: EstudianteCreado[],
  ): Prisma.CicloMundoSeleccionado2026CreateManyInput[] {
    const mundosData: Prisma.CicloMundoSeleccionado2026CreateManyInput[] = [];

    estudiantesCreados.forEach(
      ({ estudianteInscripcion, mundoSeleccionado }) => {
        if (mundoSeleccionado) {
          mundosData.push({
            estudiante_inscripcion_id: estudianteInscripcion.id,
            mundo: mundoSeleccionado,
          });
        }
      },
    );

    return mundosData;
  }

  /**
   * Crea cursos y mundos en batch usando Promise.all
   * @private
   */
  private async createCursosAndMundos(
    tx: Prisma.TransactionClient,
    cursosData: Prisma.ColoniaCursoSeleccionado2026CreateManyInput[],
    mundosData: Prisma.CicloMundoSeleccionado2026CreateManyInput[],
  ): Promise<void> {
    const cursosPromises = cursosData.map((data) =>
      tx.coloniaCursoSeleccionado2026.create({ data }),
    );

    const mundosPromises = mundosData.map((data) =>
      tx.cicloMundoSeleccionado2026.create({ data }),
    );

    const allPromises = [...cursosPromises, ...mundosPromises];

    if (allPromises.length > 0) {
      await Promise.all(allPromises);
    }
  }

  /**
   * Crea el registro de pago de inscripción
   * @private
   */
  private async createPago(
    tx: Prisma.TransactionClient,
    inscripcionId: string,
    inscripcionFee: number,
    mercadopagoPreferenceId: string,
  ): Promise<PagoInscripcion2026> {
    return tx.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcionId,
        tipo: 'inscripcion',
        monto: inscripcionFee,
        estado: 'pending',
        mercadopago_preference_id: mercadopagoPreferenceId,
      },
    });
  }

  /**
   * Crea el historial inicial de estado de inscripción
   * @private
   */
  private async createHistorial(
    tx: Prisma.TransactionClient,
    inscripcionId: string,
  ): Promise<void> {
    await tx.historialEstadoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcionId,
        estado_anterior: 'none',
        estado_nuevo: 'pending',
        razon: 'Inscripción creada',
        realizado_por: 'system',
      },
    });
  }

  /**
   * Construye la respuesta de la API para createInscripcion2026
   * @private
   */
  private buildInscripcionResponse(
    result: TransactionResult,
    inscripcionFee: number,
    siblingDiscount: number,
    mercadopagoPreferenceId: string,
    mercadopagoInitPoint: string,
  ): CreateInscripcion2026Response {
    return {
      success: true,
      inscripcionId: result.inscripcion.id,
      tutorId: result.tutor.id,
      estudiantes_creados: result.estudiantes.map((e) => ({
        id: e.estudiante.id,
        nombre: e.estudiante.nombre,
        pin: e.pin,
      })),
      pago_info: {
        monto_total: inscripcionFee,
        descuento_aplicado: siblingDiscount,
        mercadopago_preference_id: mercadopagoPreferenceId,
        mercadopago_init_point: mercadopagoInitPoint,
      },
    };
  }

  /**
   * Crea una nueva inscripción 2026 con transacción atómica completa
   *
   * Flujo:
   * 1. Validaciones y cálculos (delega a ValidarInscripcionUseCase)
   * 2. MercadoPago.createPreference() ← PRIMERO (fail-fast)
   * 3. $transaction con timeout y isolation level
   * 4. Retornar respuesta
   */
  async createInscripcion2026(
    dto: CreateInscripcion2026Dto,
  ): Promise<CreateInscripcion2026Response> {
    // 1️⃣ Validaciones y cálculos (delega a use-case)
    const validacion = this.validarInscripcionUseCase.execute(dto);
    const { inscripcionFee, monthlyTotal, siblingDiscount } = validacion;

    // 3️⃣ CRÍTICO: Crear preferencia MercadoPago PRIMERO (fail-fast)
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const { mercadopagoPreferenceId, mercadopagoInitPoint } =
      await this.createMercadoPagoPreference(
        dto,
        inscripcionFee,
        backendUrl,
        frontendUrl,
      );

    // 4️⃣ TODO lo demás en transacción atómica
    const startTime = Date.now();
    let result: TransactionResult;

    try {
      result = await this.prisma.$transaction(
        async (tx) => {
          const tutor = await this.findOrCreateTutor(tx, dto.tutor);
          const inscripcion = await this.createInscripcion(
            tx,
            tutor.id,
            dto,
            inscripcionFee,
            siblingDiscount,
            monthlyTotal,
          );
          const estudiantesCreados =
            await this.createEstudiantesConInscripciones(
              tx,
              inscripcion.id,
              dto.estudiantes,
              tutor.id,
            );

          const cursosData = this.prepareCursosData(estudiantesCreados);
          const mundosData = this.prepareMundosData(estudiantesCreados);
          await this.createCursosAndMundos(tx, cursosData, mundosData);

          const pago = await this.createPago(
            tx,
            inscripcion.id,
            inscripcionFee,
            mercadopagoPreferenceId,
          );
          await this.createHistorial(tx, inscripcion.id);

          return {
            inscripcion,
            tutor,
            estudiantes: estudiantesCreados,
            pago,
            cursosCount: cursosData.length,
            mundosCount: mundosData.length,
          };
        },
        {
          timeout: 30000,
          isolationLevel: 'ReadCommitted',
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('Transaction failed, all changes rolled back', {
        error: errorMessage,
        stack: errorStack,
        preferenceId: mercadopagoPreferenceId,
      });

      throw new InternalServerErrorException(
        'Error al crear la inscripción. No se realizaron cambios en la base de datos.',
      );
    }

    // Log de performance
    const duration = Date.now() - startTime;
    this.logger.log('Transaction completed successfully', {
      durationMs: duration,
      inscripcionId: result.inscripcion.id,
      tutorId: result.tutor.id,
      numEstudiantes: dto.estudiantes.length,
      numCursos: result.cursosCount,
      numMundos: result.mundosCount,
    });

    // 5️⃣ Construir respuesta
    return this.buildInscripcionResponse(
      result,
      inscripcionFee,
      siblingDiscount,
      mercadopagoPreferenceId,
      mercadopagoInitPoint,
    );
  }

  /**
   * Obtiene una inscripción por ID
   */
  async getInscripcionById(id: string) {
    return this.prisma.inscripcion2026.findUnique({
      where: { id },
      include: {
        tutor: true,
        estudiantes: {
          include: {
            cursos_colonia: true,
            mundos_ciclo: true,
          },
        },
        pagos: true,
        historial_estado_cambios: true,
      },
    });
  }

  /**
   * Lista todas las inscripciones de un tutor
   */
  async getInscripcionesByTutor(tutorId: string) {
    return this.prisma.inscripcion2026.findMany({
      where: { tutor_id: tutorId },
      include: {
        estudiantes: {
          include: {
            cursos_colonia: true,
            mundos_ciclo: true,
          },
        },
        pagos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualiza el estado de una inscripción
   */
  async updateEstado(
    id: string,
    nuevoEstado: string,
    razon: string,
    realizadoPor: string = 'system',
  ) {
    const inscripcion = await this.prisma.inscripcion2026.findUnique({
      where: { id },
    });

    if (!inscripcion) {
      throw new BadRequestException('Inscripción no encontrada');
    }

    // Actualizar estado
    const updated = await this.prisma.inscripcion2026.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    // Crear historial
    await this.prisma.historialEstadoInscripcion2026.create({
      data: {
        inscripcion_id: id,
        estado_anterior: inscripcion.estado,
        estado_nuevo: nuevoEstado,
        razon,
        realizado_por: realizadoPor,
      },
    });

    return updated;
  }

  /**
   * Procesa webhook de MercadoPago para pagos de Inscripción 2026
   *
   * Delega al ProcesarWebhookInscripcionUseCase que maneja:
   * - Validación de idempotencia
   * - Validación de montos (anti-fraude)
   * - Actualización atómica de estados
   * - Historial de cambios
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    return this.procesarWebhookUseCase.execute(webhookData);
  }
}
