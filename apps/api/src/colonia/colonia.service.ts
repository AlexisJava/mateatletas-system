import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';
import { MercadoPagoPayment } from '../pagos/types/mercadopago.types';
import {
  parseLegacyExternalReference,
  TipoExternalReference,
  PRECIOS,
  DEFAULT_ROLES,
  calcularFechaVencimiento,
} from '../domain/constants';
import { PricingCalculatorService } from '../domain/services/pricing-calculator.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { PinGeneratorService } from '../shared/services/pin-generator.service';
import { TutorCreationService } from '../shared/services/tutor-creation.service';

/**
 * Resultado del cálculo de precios para inscripción de colonia
 */
interface PricingResult {
  /** Cantidad total de estudiantes */
  cantidadEstudiantes: number;
  /** Cantidad total de cursos seleccionados */
  totalCursos: number;
  /** Porcentaje de descuento aplicado (0-100) */
  descuentoPorcentaje: number;
  /** Monto total mensual con descuento aplicado */
  totalMensual: number;
}

/**
 * Tipo de estudiante retornado por Prisma
 */
type EstudianteFromDB = Prisma.EstudianteGetPayload<Record<string, never>>;

/**
 * Tipo de ColoniaEstudiante retornado por Prisma
 */
type ColoniaEstudianteFromDB = Prisma.ColoniaEstudianteGetPayload<
  Record<string, never>
>;

/**
 * Datos preparados de un estudiante antes de crear
 */
interface EstudianteData {
  username: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  tutor_id: string;
}

/**
 * Datos de un curso para crear
 */
interface CursoData {
  colonia_estudiante_id: string;
  course_id: string;
  course_name: string;
  course_area: string;
  instructor: string;
  day_of_week: string;
  time_slot: string;
  precio_base: number;
  precio_con_descuento: number;
}

/**
 * Respuesta de inscripción a colonia
 */
export interface InscriptionResponse {
  message: string;
  tutorId: string;
  inscriptionId: string;
  estudiantes: Array<{ nombre: string; username: string; pin: string }>;
  pago: {
    mes: string;
    monto: number;
    descuento: number;
    mercadoPagoUrl: string | undefined;
    mercadoPagoSandboxUrl: string | undefined;
  };
}

@Injectable()
export class ColoniaService {
  private readonly logger = new Logger(ColoniaService.name);

  constructor(
    private prisma: PrismaClient,
    private mercadoPagoService: MercadoPagoService,
    private pricingCalculator: PricingCalculatorService,
    private pinGenerator: PinGeneratorService,
    private tutorCreation: TutorCreationService,
  ) {}

  /**
   * Genera un PIN de 4 dígitos único para ColoniaEstudiante
   *
   * Delega la generación de PIN al servicio compartido PinGeneratorService.
   *
   * @returns PIN único de 4 dígitos
   */
  private async generateUniquePin(): Promise<string> {
    return await this.pinGenerator.generateUniquePin(
      'coloniaEstudiante',
      async (pin) =>
        await this.prisma.coloniaEstudiante.findFirst({ where: { pin } }),
    );
  }

  /**
   * Actualiza el preference ID de MercadoPago en un pago con reintentos
   *
   * Implementa exponential backoff para manejar fallos transitorios
   * de conexión a la base de datos.
   *
   * @param pagoId - ID del pago a actualizar
   * @param preferenceId - ID de preferencia de MercadoPago
   * @param maxRetries - Número máximo de reintentos (default: 3)
   * @throws BadRequestException si falla después de todos los reintentos
   */
  private async updatePreferenceIdWithRetry(
    pagoId: string,
    preferenceId: string,
    maxRetries: number = 3,
  ): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.prisma.coloniaPago.update({
          where: { id: pagoId },
          data: { mercadopago_preference_id: preferenceId },
        });

        // Éxito - log y retornar
        if (attempt > 0) {
          this.logger.log('Preference ID actualizado con reintentos', {
            pagoId,
            preferenceId,
            attempt,
          });
        }

        return;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          // Calcular backoff exponencial: 100ms, 200ms, 400ms
          const delayMs = 100 * Math.pow(2, attempt);

          this.logger.warn('Fallo al actualizar preference ID, reintentando', {
            pagoId,
            preferenceId,
            attempt: attempt + 1,
            maxRetries,
            delayMs,
            error: message,
            stack,
          });

          // Esperar antes del siguiente reintento
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    // Si llegamos aquí, fallaron todos los reintentos
    const finalMessage = lastError?.message ?? 'Unknown error';
    const finalStack = lastError?.stack;
    this.logger.error(
      'Fallo al actualizar preference ID después de todos los reintentos',
      {
        pagoId,
        preferenceId,
        maxRetries,
        error: finalMessage,
        stack: finalStack,
      },
    );

    throw new BadRequestException(
      `No se pudo actualizar el preference ID después de ${maxRetries} reintentos. Por favor contacte a soporte.`,
    );
  }

  /**
   * Valida que el email no esté registrado en el sistema
   *
   * Delega la validación al servicio compartido TutorCreationService.
   *
   * @param email - Email a validar
   * @throws ConflictException si el email ya está registrado
   */
  private async validateUniqueEmail(email: string): Promise<void> {
    await this.tutorCreation.validateUniqueEmail(email);
  }

  /**
   * Valida que se haya seleccionado al menos un curso
   *
   * @param estudiantes - Lista de estudiantes con cursos seleccionados
   * @throws BadRequestException si no hay cursos seleccionados
   */
  private validateCourseSelection(
    estudiantes: CreateInscriptionDto['estudiantes'],
  ): void {
    const totalCursos = estudiantes.reduce(
      (sum, est) => sum + est.cursosSeleccionados.length,
      0,
    );

    if (totalCursos === 0) {
      throw new BadRequestException('Debe seleccionar al menos un curso');
    }
  }

  /**
   * Calcula precios, descuentos y totales para la inscripción
   *
   * @param dto - Datos de la inscripción
   * @returns Resultado con cantidades, descuento y total mensual
   */
  private calculatePricing(dto: CreateInscriptionDto): PricingResult {
    const cantidadEstudiantes = dto.estudiantes.length;
    const totalCursos = dto.estudiantes.reduce(
      (sum, est) => sum + est.cursosSeleccionados.length,
      0,
    );

    // Usar PricingCalculatorService para calcular descuentos y totales
    const descuentoPorcentaje = this.pricingCalculator.calcularDescuentoColonia(
      cantidadEstudiantes,
      totalCursos,
    );
    const cursosPerStudent = dto.estudiantes.map(
      (est) => est.cursosSeleccionados.length,
    );
    const totalMensual = this.pricingCalculator.calcularTotalColonia(
      cursosPerStudent,
      descuentoPorcentaje,
    );

    this.logger.log(
      `Cálculo: ${totalCursos} cursos, ${cantidadEstudiantes} estudiantes, descuento ${descuentoPorcentaje}%, total mensual: $${totalMensual}`,
    );

    return {
      cantidadEstudiantes,
      totalCursos,
      descuentoPorcentaje,
      totalMensual,
    };
  }

  /**
   * Genera un username único basado en el nombre del estudiante
   * Valida unicidad en la base de datos para prevenir colisiones
   *
   * @param nombre - Nombre del estudiante
   * @param tx - Cliente de transacción de Prisma
   * @returns Username único en formato {nombre}{random4digits}
   */
  private async generateUniqueUsername(
    nombre: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    let username: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const baseUsername = nombre.toLowerCase().replace(/\s+/g, '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      username = `${baseUsername}${randomNum}`;

      const exists = await tx.estudiante.findFirst({ where: { username } });
      if (!exists) return username;

      attempts++;
    } while (attempts < maxAttempts);

    // Fallback: timestamp para garantizar unicidad
    return `${nombre.toLowerCase().replace(/\s+/g, '')}${Date.now()}`;
  }

  /**
   * Crea estudiantes con sus respectivos PINs en una transacción
   *
   * @param tx - Cliente de transacción de Prisma
   * @param dto - Datos de la inscripción
   * @param tutorId - ID del tutor asociado
   * @returns Objeto con estudiantes creados, datos preparados y PINs generados
   */
  private async createEstudiantesConPins(
    tx: Prisma.TransactionClient,
    dto: CreateInscriptionDto,
    tutorId: string,
  ): Promise<{
    estudiantesFromDB: EstudianteFromDB[];
    estudiantesData: EstudianteData[];
    pins: string[];
  }> {
    // Preparar datos de estudiantes y generar usernames únicos
    const estudiantesData = await Promise.all(
      dto.estudiantes.map(async (estudianteDto) => {
        const username = await this.generateUniqueUsername(
          estudianteDto.nombre,
          tx,
        );

        return {
          username,
          nombre: estudianteDto.nombre,
          apellido: '',
          edad: estudianteDto.edad,
          nivelEscolar:
            estudianteDto.edad <= 7
              ? 'Primaria'
              : estudianteDto.edad <= 12
                ? 'Primaria'
                : 'Secundaria',
          tutor_id: tutorId,
        };
      }),
    );

    // Crear todos los estudiantes en paralelo
    const estudiantesFromDB = await Promise.all(
      estudiantesData.map((data) => tx.estudiante.create({ data })),
    );

    // Generar todos los PINs en paralelo
    const pins = await Promise.all(
      estudiantesFromDB.map(() => this.generateUniquePin()),
    );

    return { estudiantesFromDB, estudiantesData, pins };
  }

  /**
   * Crea registros de colonia_estudiante vinculando estudiantes a la inscripción
   *
   * @param tx - Cliente de transacción de Prisma
   * @param inscriptionId - ID de la inscripción de colonia
   * @param estudiantesFromDB - Lista de estudiantes creados
   * @param pins - Lista de PINs generados
   * @returns Lista de registros colonia_estudiante creados
   */
  private async createColoniaEstudiantes(
    tx: Prisma.TransactionClient,
    inscriptionId: string,
    estudiantesFromDB: EstudianteFromDB[],
    pins: string[],
  ): Promise<ColoniaEstudianteFromDB[]> {
    return Promise.all(
      estudiantesFromDB.map(async (estudiante, idx) => {
        const pin = pins[idx];
        if (!pin) {
          throw new Error(
            `PIN no generado para estudiante ${estudiante.nombre}`,
          );
        }
        return await tx.coloniaEstudiante.create({
          data: {
            inscripcion_id: inscriptionId,
            estudiante_id: estudiante.id,
            nombre: estudiante.nombre,
            edad: estudiante.edad,
            pin,
          },
        });
      }),
    );
  }

  /**
   * Prepara los datos de cursos para ser creados en batch
   *
   * @param dto - Datos de la inscripción
   * @param coloniaEstudiantesCreados - Lista de colonia_estudiante creados
   * @param descuentoPorcentaje - Porcentaje de descuento a aplicar
   * @returns Array de promesas de creación de cursos
   */
  private prepareCursosData(
    dto: CreateInscriptionDto,
    coloniaEstudiantesCreados: ColoniaEstudianteFromDB[],
    descuentoPorcentaje: number,
  ): CursoData[] {
    const cursosData: CursoData[] = [];

    dto.estudiantes.forEach((estudianteDto, idx) => {
      const coloniaEstudiante = coloniaEstudiantesCreados[idx];
      if (!coloniaEstudiante) {
        throw new Error(`ColoniaEstudiante no encontrado para índice ${idx}`);
      }
      const coloniaEstudianteId = coloniaEstudiante.id;
      const precioConDescuento = this.pricingCalculator.aplicarDescuento(
        PRECIOS.COLONIA_CURSO_BASE,
        descuentoPorcentaje,
      );

      estudianteDto.cursosSeleccionados.forEach((curso) => {
        cursosData.push({
          colonia_estudiante_id: coloniaEstudianteId,
          course_id: curso.id,
          course_name: curso.name,
          course_area: curso.area,
          instructor: curso.instructor,
          day_of_week: curso.dayOfWeek,
          time_slot: curso.timeSlot,
          precio_base: PRECIOS.COLONIA_CURSO_BASE,
          precio_con_descuento: precioConDescuento,
        });
      });
    });

    return cursosData;
  }

  /**
   * Crea todos los cursos en la base de datos en paralelo
   *
   * @param tx - Cliente de transacción de Prisma
   * @param cursosData - Array de datos de cursos a crear
   * @returns Promesa que se resuelve cuando todos los cursos están creados
   */
  private async createCursos(
    tx: Prisma.TransactionClient,
    cursosData: CursoData[],
  ): Promise<void> {
    const cursosPromises = cursosData.map((cursoData) =>
      tx.coloniaEstudianteCurso.create({ data: cursoData }),
    );

    await Promise.all(cursosPromises);
    this.logger.log(`Cursos creados: ${cursosData.length}`);
  }

  /**
   * Construye la preferencia de MercadoPago para el pago de la inscripción
   *
   * @param result - Resultado de la transacción con datos de inscripción
   * @param pricing - Información de precios calculados
   * @returns Objeto de preferencia de MercadoPago
   */
  private buildMercadoPagoPreference(
    result: {
      inscriptionId: string;
      pagoEneroId: string;
    },
    pricing: PricingResult,
  ): Parameters<typeof this.mercadoPagoService.createPreference>[0] {
    return {
      items: [
        {
          id: `colonia-${result.inscriptionId}`,
          title: `Colonia de Verano 2026 - Enero`,
          description: `${pricing.totalCursos} curso(s) - ${pricing.cantidadEstudiantes} estudiante(s)${pricing.descuentoPorcentaje > 0 ? ` - ${pricing.descuentoPorcentaje}% descuento` : ''}`,
          quantity: 1,
          unit_price: pricing.totalMensual,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/colonia/confirmacion?status=success&payment_id={{payment_id}}&inscription_id=${result.inscriptionId}`,
        failure: `${process.env.FRONTEND_URL}/colonia/confirmacion?status=failure&payment_id={{payment_id}}&inscription_id=${result.inscriptionId}`,
        pending: `${process.env.FRONTEND_URL}/colonia/confirmacion?status=pending&payment_id={{payment_id}}&inscription_id=${result.inscriptionId}`,
      },
      auto_return: 'approved',
      external_reference: result.pagoEneroId,
      notification_url: `${process.env.BACKEND_URL}/api/colonia/webhook`,
    };
  }

  /**
   * Construye la respuesta final de la inscripción
   *
   * @param result - Resultado de la transacción
   * @param preference - Preferencia de MercadoPago creada
   * @param pricing - Información de precios
   * @returns Objeto de respuesta con datos de inscripción y pago
   */
  private buildInscriptionResponse(
    result: {
      tutorId: string;
      inscriptionId: string;
      estudiantes: Array<{ nombre: string; username: string; pin: string }>;
    },
    preference: ReturnType<
      typeof this.mercadoPagoService.createPreference
    > extends Promise<infer T>
      ? T
      : never,
    pricing: PricingResult,
  ): InscriptionResponse {
    return {
      message: 'Inscripción creada exitosamente',
      tutorId: result.tutorId,
      inscriptionId: result.inscriptionId,
      estudiantes: result.estudiantes,
      pago: {
        mes: 'enero',
        monto: pricing.totalMensual,
        descuento: pricing.descuentoPorcentaje,
        mercadoPagoUrl: preference.init_point,
        mercadoPagoSandboxUrl: preference.sandbox_init_point,
      },
    };
  }

  /**
   * Crea una inscripción completa a la Colonia de Verano 2026
   *
   * Flujo:
   * 1. Verificar que el email no exista
   * 2. Crear usuario tutor con contraseña hasheada
   * 3. Crear estudiantes (usuarios con username único)
   * 4. Generar PINs de 4 dígitos
   * 5. Registrar inscripción con descuento
   * 6. Registrar cursos seleccionados
   * 7. Crear pago de Enero 2026
   * 8. Generar preferencia de MercadoPago
   * 9. Retornar link de pago
   */
  async createInscription(dto: CreateInscriptionDto) {
    this.logger.log(`Iniciando inscripción para ${dto.email}`);

    // 1. Validaciones
    await this.validateUniqueEmail(dto.email);
    this.validateCourseSelection(dto.estudiantes);

    // 2. Cálculos
    const pricing = this.calculatePricing(dto);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Transacción
    const result = await this.prisma.$transaction(async (tx) => {
      const tutor = await tx.tutor.create({
        data: {
          email: dto.email,
          nombre: dto.nombre,
          apellido: '',
          password_hash: passwordHash,
          dni: dto.dni || null,
          telefono: dto.telefono,
          debe_completar_perfil: false,
          ha_completado_onboarding: true,
          roles: DEFAULT_ROLES.TUTOR,
        },
      });

      this.logger.log(`Tutor creado: ${tutor.id}`);

      const inscripcion = await tx.coloniaInscripcion.create({
        data: {
          tutor_id: tutor.id,
          estado: 'active',
          descuento_aplicado: pricing.descuentoPorcentaje,
          total_mensual: pricing.totalMensual,
          fecha_inscripcion: new Date(),
        },
      });

      this.logger.log(`Inscripción creada: ${inscripcion.id}`);

      const { estudiantesFromDB, estudiantesData, pins } =
        await this.createEstudiantesConPins(tx, dto, tutor.id);
      const coloniaEstudiantesCreados = await this.createColoniaEstudiantes(
        tx,
        inscripcion.id,
        estudiantesFromDB,
        pins,
      );

      const cursosData = this.prepareCursosData(
        dto,
        coloniaEstudiantesCreados,
        pricing.descuentoPorcentaje,
      );
      await this.createCursos(tx, cursosData);

      const pagoEnero = await tx.coloniaPago.create({
        data: {
          inscripcion_id: inscripcion.id,
          mes: 'enero',
          anio: 2026,
          monto: pricing.totalMensual,
          estado: 'pending',
          fecha_vencimiento: calcularFechaVencimiento('Enero', 2026),
          fecha_creacion: new Date(),
        },
      });

      this.logger.log(`Pago Enero 2026 creado: ${pagoEnero.id}`);

      return {
        tutorId: tutor.id,
        inscriptionId: inscripcion.id,
        pagoEneroId: pagoEnero.id,
        estudiantes: estudiantesData.map((data, idx) => {
          const pin = pins[idx];
          if (!pin) {
            throw new Error(`PIN no generado para estudiante ${data.nombre}`);
          }
          return {
            nombre: data.nombre,
            username: data.username,
            pin,
          };
        }),
      };
    });

    // 4. MercadoPago
    const preference = await this.mercadoPagoService.createPreference(
      this.buildMercadoPagoPreference(result, pricing),
    );

    if (!preference.id) {
      throw new BadRequestException(
        'MercadoPago no retornó un ID de preferencia válido',
      );
    }

    await this.updatePreferenceIdWithRetry(result.pagoEneroId, preference.id);

    this.logger.log('Inscripción completada exitosamente', {
      preferenceId: preference.id,
      inscriptionId: result.inscriptionId,
    });

    // 5. Respuesta
    return this.buildInscriptionResponse(result, preference, pricing);
  }

  /**
   * Procesa webhook de MercadoPago para pagos de Colonia
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    this.logger.log('Webhook Colonia recibido', {
      type: webhookData.type,
      action: webhookData.action,
    });

    // Solo procesar notificaciones de tipo "payment"
    if (webhookData.type !== 'payment') {
      this.logger.log(`Webhook ignorado: tipo ${webhookData.type}`);
      return { message: 'Webhook type not handled' };
    }

    const paymentId = webhookData.data.id;
    this.logger.log('Procesando pago Colonia', { paymentId });

    try {
      // Consultar detalles del pago a MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log('Pago Colonia consultado', {
        status: payment.status,
        externalReference: payment.external_reference,
      });

      // Parsear external_reference para identificar pago
      const externalRef = payment.external_reference;

      if (!externalRef) {
        this.logger.warn('Pago sin external_reference', { paymentId });
        return { message: 'Payment without external_reference' };
      }

      // Parsear external_reference usando parser centralizado
      const parsed = parseLegacyExternalReference(externalRef);

      if (!parsed || parsed.tipo !== TipoExternalReference.PAGO_COLONIA) {
        this.logger.warn('External reference inválida', {
          externalRef,
          expectedType: TipoExternalReference.PAGO_COLONIA,
          actualType: parsed?.tipo,
        });
        return { message: 'Invalid external_reference format' };
      }

      const { pagoId } = parsed.ids;

      // Buscar el pago directamente por ID (el external_reference ES el pagoId)
      let pago = await this.prisma.coloniaPago.findUnique({
        where: { id: pagoId },
      });

      // Fallback: si no se encuentra por ID, intentar buscar por inscripcion_id
      if (!pago) {
        this.logger.warn('Pago no encontrado por ID, intentando fallback', {
          pagoId,
        });

        // Extraer inscripcion_id de payment.additional_info.items[0].id
        // Formato esperado: "colonia-{inscriptionId}"
        const itemId = payment.additional_info?.items?.[0]?.id;
        if (
          itemId &&
          typeof itemId === 'string' &&
          itemId.startsWith('colonia-')
        ) {
          const inscripcionId = itemId.replace('colonia-', '');
          this.logger.log('Buscando pago pendiente por inscripción', {
            inscripcionId,
          });

          // Buscar primer pago pendiente de esta inscripción
          pago = await this.prisma.coloniaPago.findFirst({
            where: {
              inscripcion_id: inscripcionId,
              estado: 'pending',
            },
            orderBy: {
              fecha_creacion: 'asc',
            },
          });

          if (pago) {
            this.logger.log('Pago pendiente encontrado', { pagoId: pago.id });
          }
        }
      }

      if (!pago) {
        this.logger.error('No se encontró pago de Colonia', {
          pagoId,
          paymentId,
        });
        return { message: 'No pending payments found' };
      }

      // Verificar idempotencia: si ya fue procesado, ignorar
      if (pago.processed_at) {
        this.logger.log('Webhook ya procesado previamente', {
          pagoId: pago.id,
          processedAt: pago.processed_at,
          paymentId,
        });
        return {
          message: 'Webhook already processed',
          processedAt: pago.processed_at,
        };
      }

      return this.actualizarPagoColonia(pago.id, payment);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error procesando webhook de Colonia', {
        paymentId,
        error: message,
        stack,
      });
      throw new BadRequestException('Error processing webhook');
    }
  }

  /**
   * Actualiza el estado de un pago de Colonia según respuesta de MercadoPago
   * FIX CRÍTICO: Valida que el monto pagado coincida con el esperado (anti-fraude)
   */
  private async actualizarPagoColonia(
    pagoId: string,
    payment: MercadoPagoPayment,
  ) {
    // Obtener el pago esperado de la BD
    const pagoEsperado = await this.prisma.coloniaPago.findUnique({
      where: { id: pagoId },
    });

    if (!pagoEsperado) {
      throw new BadRequestException('Pago no encontrado');
    }

    // VALIDAR MONTO - FIX CRÍTICO ANTI-FRAUDE
    if (payment.status === 'approved') {
      const montoEsperado = pagoEsperado.monto;
      const montoPagado = payment.transaction_amount;

      if (Math.abs(montoPagado - montoEsperado) > 1) {
        this.logger.error('🚨 INTENTO DE FRAUDE: Monto pagado no coincide', {
          pagoId,
          montoEsperado,
          montoPagado,
          paymentId: payment.id,
        });

        throw new BadRequestException(
          'El monto pagado no coincide con el monto esperado',
        );
      }
    }

    // Determinar nuevo estado según respuesta de MercadoPago
    let nuevoEstadoPago = 'pending';

    switch (payment.status) {
      case 'approved':
        nuevoEstadoPago = 'paid';
        break;
      case 'rejected':
      case 'cancelled':
        nuevoEstadoPago = 'failed';
        break;
      case 'in_process':
      case 'pending':
        nuevoEstadoPago = 'pending';
        break;
      default:
        this.logger.warn('Estado de pago desconocido', {
          status: payment.status,
          paymentId: payment.id,
        });
        nuevoEstadoPago = 'pending';
    }

    // Actualizar pago en DB
    const pagoActualizado = await this.prisma.coloniaPago.update({
      where: { id: pagoId },
      data: {
        estado: nuevoEstadoPago,
        mercadopago_payment_id: payment.id?.toString(),
        fecha_pago: payment.status === 'approved' ? new Date() : undefined,
        processed_at: new Date(), // Marcar como procesado para idempotencia
      },
    });

    this.logger.log('Pago Colonia procesado', {
      pagoId,
      nuevoEstado: nuevoEstadoPago,
      inscripcionId: pagoActualizado.inscripcion_id,
    });

    return {
      success: true,
      pagoId: pagoId,
      inscripcionId: pagoActualizado.inscripcion_id,
      paymentStatus: nuevoEstadoPago,
    };
  }
}
