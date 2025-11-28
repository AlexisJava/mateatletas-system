import {
  Injectable,
  BadRequestException,
  ConflictException,
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
import { WebhookIdempotencyService } from '../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../pagos/services/payment-amount-validator.service';
import {
  parseLegacyExternalReference,
  TipoExternalReference,
  PRECIOS,
  DESCUENTOS,
  PricingHelpers,
  DEFAULT_ROLES,
} from '../domain/constants';
import { PricingCalculatorService } from '../domain/services/pricing-calculator.service';
import { PinGeneratorService } from '../shared/services/pin-generator.service';
import { TutorCreationService } from '../shared/services/tutor-creation.service';
import { MercadoPagoWebhookProcessorService } from '../shared/services/mercadopago-webhook-processor.service';
import {
  CreateInscripcion2026Dto,
  CreateInscripcion2026Response,
  TipoInscripcion2026,
  MundoSTEAM,
  CourseSelectionDto,
  TutorDataDto,
  EstudianteInscripcionDto,
} from './dto/create-inscripcion-2026.dto';

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
    private readonly webhookProcessor: MercadoPagoWebhookProcessorService,
    private readonly webhookIdempotency: WebhookIdempotencyService,
    private readonly amountValidator: PaymentAmountValidatorService,
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
   * Convierte TipoInscripcion2026 a tipo esperado por PricingCalculator
   */
  private mapTipoToPricing(
    tipo: TipoInscripcion2026,
  ): 'COLONIA' | 'CICLO_2026' | 'PACK_COMPLETO' {
    switch (tipo) {
      case TipoInscripcion2026.COLONIA:
        return 'COLONIA';
      case TipoInscripcion2026.CICLO_2026:
        return 'CICLO_2026';
      case TipoInscripcion2026.PACK_COMPLETO:
        return 'PACK_COMPLETO';
      default:
        throw new BadRequestException(`Tipo de inscripción inválido: ${tipo}`);
    }
  }

  /**
   * Calcula el monto de inscripción según el tipo
   */
  private calculateInscriptionFee(tipo: TipoInscripcion2026): number {
    return this.pricingCalculator.calcularTarifaInscripcion(
      this.mapTipoToPricing(tipo),
    );
  }

  /**
   * Calcula el descuento por hermanos (solo aplica a cuota mensual)
   * 2 hermanos: 12%
   * 3+ hermanos: 24%
   *
   * @deprecated Usar pricingCalculator.calcularDescuentoInscripcion2026()
   */
  private calculateSiblingDiscount(numEstudiantes: number): number {
    return this.pricingCalculator.calcularDescuentoInscripcion2026(
      numEstudiantes,
    );
  }

  /**
   * Calcula el descuento por múltiples cursos en Colonia
   * 2 cursos: 12% de descuento en el segundo curso
   *
   * @deprecated Usar DESCUENTOS.COLONIA.SEGUNDO_CURSO desde domain/constants
   */
  private calculateCourseDiscount(numCursos: number): number {
    if (numCursos === 2) return DESCUENTOS.COLONIA.SEGUNDO_CURSO;
    return 0;
  }

  /**
   * Calcula el total mensual según tipo de inscripción y descuentos
   */
  private calculateMonthlyTotal(
    tipo: TipoInscripcion2026,
    numEstudiantes: number,
    cursosPerStudent: number[], // array con cantidad de cursos por estudiante
  ): { total: number; descuento: number } {
    return this.pricingCalculator.calcularTotalInscripcion2026(
      this.mapTipoToPricing(tipo),
      numEstudiantes,
      cursosPerStudent,
    );
  }

  /**
   * Valida que los datos sean consistentes según el tipo de inscripción
   */
  private validateInscriptionData(dto: CreateInscripcion2026Dto): void {
    const { tipo_inscripcion, estudiantes } = dto;

    estudiantes.forEach((estudiante, index) => {
      const hasCursos =
        estudiante.cursos_seleccionados &&
        estudiante.cursos_seleccionados.length > 0;
      const hasMundo = !!estudiante.mundo_seleccionado;

      switch (tipo_inscripcion) {
        case TipoInscripcion2026.COLONIA:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia`,
            );
          }
          if (hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar mundo STEAM para Colonia`,
            );
          }
          break;

        case TipoInscripcion2026.CICLO_2026:
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Ciclo 2026`,
            );
          }
          if (hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar cursos de Colonia para Ciclo 2026`,
            );
          }
          break;

        case TipoInscripcion2026.PACK_COMPLETO:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia para Pack Completo`,
            );
          }
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Pack Completo`,
            );
          }
          break;
      }
    });
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
   * 1. Validaciones (sin DB)
   * 2. Cálculos (sin DB)
   * 3. MercadoPago.createPreference() ← PRIMERO (fail-fast)
   * 4. $transaction con timeout y isolation level
   * 5. Retornar respuesta
   */
  async createInscripcion2026(
    dto: CreateInscripcion2026Dto,
  ): Promise<CreateInscripcion2026Response> {
    // 1️⃣ Validaciones (sin DB)
    this.validateInscriptionData(dto);

    // 2️⃣ Cálculos (sin DB)
    const inscripcionFee = this.calculateInscriptionFee(dto.tipo_inscripcion);
    const cursosPerStudent = dto.estudiantes.map(
      (e) => e.cursos_seleccionados?.length || 0,
    );
    const { total: monthlyTotal, descuento: siblingDiscount } =
      this.calculateMonthlyTotal(
        dto.tipo_inscripcion,
        dto.estudiantes.length,
        cursosPerStudent,
      );

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
   * Utiliza el servicio compartido MercadoPagoWebhookProcessorService
   * y proporciona callbacks específicos para la lógica de Inscripciones2026.
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    const paymentId: string = webhookData.data.id;

    // ✅ VALIDACIÓN: Verificar que payment_id existe
    if (!paymentId) {
      this.logger.error('❌ Webhook rechazado: payment_id faltante');
      throw new BadRequestException('payment_id is required');
    }

    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}, payment_id=${paymentId}`,
    );

    // ✅ SEGURIDAD: Verificar idempotencia (prevenir procesamiento duplicado)
    // OWASP A04:2021 - Insecure Design
    const alreadyProcessed: boolean =
      await this.webhookIdempotency.wasProcessed(paymentId);

    if (alreadyProcessed) {
      this.logger.warn(
        `⏭️ Webhook duplicado ignorado (idempotencia): payment_id=${paymentId}`,
      );
      return {
        success: true,
        message: 'Already processed (idempotent)',
        paymentId,
      };
    }

    // Procesar webhook normalmente
    const result = await this.webhookProcessor.processWebhook(
      webhookData,
      TipoExternalReference.INSCRIPCION_2026,
      // Callback: Buscar pago en DB
      async (parsed) => {
        if (!parsed) {
          throw new Error('Failed to parse external reference');
        }
        const { inscripcionId } = parsed.ids;

        const pago = await this.prisma.pagoInscripcion2026.findFirst({
          where: {
            inscripcion_id: inscripcionId,
            tipo: 'inscripcion',
          },
          include: {
            inscripcion: true,
          },
        });

        if (!pago) {
          this.logger.error(
            `❌ No se encontró el pago para inscripción ${inscripcionId}`,
          );
        }

        return pago;
      },
      // Callback: Actualizar pago e inscripción
      async (pago, context) => {
        if (!context.parsedReference) {
          throw new Error('Invalid parsed reference');
        }
        const inscripcionId = context.parsedReference.ids.inscripcionId;
        if (!inscripcionId) {
          throw new Error('inscripcionId no encontrado en parsed reference');
        }

        // Mapear estado de MercadoPago a estado interno
        const nuevoEstadoPago = this.webhookProcessor.mapPaymentStatus(
          context.paymentStatus,
        );

        // ✅ SEGURIDAD: Validar monto del pago ANTES de aprobar
        // OWASP A04:2021 - Insecure Design
        // PCI DSS Req 6.5.10 - Broken Authentication
        if (
          context.paymentStatus === 'approved' &&
          context.payment.transaction_amount !== undefined
        ) {
          const receivedAmount: number = Number(
            context.payment.transaction_amount,
          );

          const validation =
            await this.amountValidator.validatePagoInscripcion2026(
              pago.id,
              receivedAmount,
            );

          if (!validation.isValid) {
            this.logger.error(
              `🚨 FRAUDE DETECTADO - Monto inválido en pago ${pago.id}\n` +
                `  Esperado: $${validation.expectedAmount.toFixed(2)}\n` +
                `  Recibido: $${validation.receivedAmount.toFixed(2)}\n` +
                `  Diferencia: $${validation.difference?.toFixed(2)}\n` +
                `  Razón: ${validation.reason}`,
            );

            throw new BadRequestException(
              `Payment amount validation failed: ${validation.reason}`,
            );
          }

          this.logger.log(
            `✅ Validación de monto exitosa: pago_id=${pago.id}, ` +
              `esperado=$${validation.expectedAmount.toFixed(2)}, ` +
              `recibido=$${validation.receivedAmount.toFixed(2)}`,
          );
        }

        // Determinar estado de inscripción según estado del pago
        let nuevoEstadoInscripcion = 'pending';
        switch (nuevoEstadoPago) {
          case 'paid':
            nuevoEstadoInscripcion = 'active';
            break;
          case 'failed':
            nuevoEstadoInscripcion = 'payment_failed';
            break;
          case 'pending':
            nuevoEstadoInscripcion = 'pending';
            break;
        }

        // ✅ TRANSACCIÓN ATÓMICA: Todas las operaciones de DB en un solo commit
        // OWASP A04:2021 - Insecure Design
        // ISO 27001 A.12.6.1 - Management of technical vulnerabilities
        // Si alguna operación falla, TODAS se revierten automáticamente (ACID compliance)
        await this.prisma.$transaction(async (tx) => {
          // 1. Actualizar pago en DB
          await tx.pagoInscripcion2026.update({
            where: { id: pago.id },
            data: {
              estado: nuevoEstadoPago,
              mercadopago_payment_id: context.payment.id?.toString(),
              fecha_pago:
                context.paymentStatus === 'approved' ? new Date() : undefined,
            },
          });

          // 2. Actualizar estado de la inscripción si cambió
          if (nuevoEstadoInscripcion !== pago.inscripcion.estado) {
            // Buscar inscripción actual
            const inscripcion = await tx.inscripcion2026.findUnique({
              where: { id: inscripcionId },
            });

            if (!inscripcion) {
              throw new BadRequestException('Inscripción no encontrada');
            }

            // Actualizar estado de inscripción
            await tx.inscripcion2026.update({
              where: { id: inscripcionId },
              data: { estado: nuevoEstadoInscripcion },
            });

            // Crear registro de historial
            await tx.historialEstadoInscripcion2026.create({
              data: {
                inscripcion_id: inscripcionId,
                estado_anterior: inscripcion.estado,
                estado_nuevo: nuevoEstadoInscripcion,
                razon: `Pago ${nuevoEstadoPago} - MercadoPago Payment ID: ${context.payment.id}`,
                realizado_por: 'mercadopago-webhook',
              },
            });
          }
        });

        this.logger.log(
          `✅ Pago procesado exitosamente - Inscripción ${inscripcionId} → Estado: ${nuevoEstadoInscripcion}`,
        );

        return {
          success: true,
          inscripcionId,
          paymentStatus: nuevoEstadoPago,
          inscripcionStatus: nuevoEstadoInscripcion,
        };
      },
    );

    // ✅ SEGURIDAD: Marcar webhook como procesado (solo si fue exitoso)
    // OWASP A04:2021 - Insecure Design
    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success !== false
    ) {
      // Extraer externalReference del resultado si está disponible
      const externalRef: string =
        'externalReference' in result &&
        typeof result.externalReference === 'string'
          ? result.externalReference
          : paymentId;

      try {
        await this.webhookIdempotency.markAsProcessed({
          paymentId,
          webhookType: 'inscripcion2026',
          status: webhookData.action || 'unknown',
          externalReference: externalRef,
        });

        this.logger.log(
          `✅ Webhook marcado como procesado: payment_id=${paymentId}`,
        );
      } catch (error: unknown) {
        // Si falla por unique constraint (P2002), significa que otro proceso ya lo marcó (race condition)
        // Esto es OK, simplemente logueamos y continuamos
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          this.logger.warn(
            `⚠️ Race condition al marcar webhook: payment_id=${paymentId}. Otro proceso ya lo procesó.`,
          );
        } else {
          // Otros errores sí son problemáticos, pero no detenemos el flujo
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `❌ Error al marcar webhook como procesado: ${message}, payment_id=${paymentId}`,
          );
        }
      }
    }

    return result;
  }
}
