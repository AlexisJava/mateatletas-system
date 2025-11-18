import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';
import {
  parseLegacyExternalReference,
  TipoExternalReference,
  PRECIOS,
  DEFAULT_ROLES,
  calcularFechaVencimiento,
} from '../domain/constants';
import { PricingCalculatorService } from '../domain/services/pricing-calculator.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';

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

@Injectable()
export class ColoniaService {
  private readonly logger = new Logger(ColoniaService.name);

  constructor(
    private prisma: PrismaClient,
    private mercadoPagoService: MercadoPagoService,
    private pricingCalculator: PricingCalculatorService,
  ) {}

  /**
   * Genera un PIN de 4 dígitos único
   *
   * @returns PIN único de 4 dígitos
   */
  private async generateUniquePin(): Promise<string> {
    const MAX_ATTEMPTS = 10;
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      // Verificar que no exista usando Prisma Client (type-safe)
      const count = await this.prisma.coloniaEstudiante.count({
        where: { pin },
      });

      if (count === 0) {
        return pin;
      }

      attempts++;
    }

    throw new ConflictException(
      `No se pudo generar un PIN único después de ${MAX_ATTEMPTS} intentos. Por favor intente nuevamente.`
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
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.prisma.coloniaPago.update({
          where: { id: pagoId },
          data: { mercadopagoPreferenceId: preferenceId },
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
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          // Calcular backoff exponencial: 100ms, 200ms, 400ms
          const delayMs = 100 * Math.pow(2, attempt);

          this.logger.warn('Fallo al actualizar preference ID, reintentando', {
            pagoId,
            preferenceId,
            attempt: attempt + 1,
            maxRetries,
            delayMs,
            error: error.message,
          });

          // Esperar antes del siguiente reintento
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // Si llegamos aquí, fallaron todos los reintentos
    this.logger.error('Fallo al actualizar preference ID después de todos los reintentos', {
      pagoId,
      preferenceId,
      maxRetries,
      error: lastError.message,
    });

    throw new BadRequestException(
      `No se pudo actualizar el preference ID después de ${maxRetries} reintentos. Por favor contacte a soporte.`
    );
  }

  /**
   * Valida que el email no esté registrado en el sistema
   *
   * @param email - Email a validar
   * @throws ConflictException si el email ya está registrado
   */
  private async validateUniqueEmail(email: string): Promise<void> {
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (existingTutor) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  /**
   * Valida que se haya seleccionado al menos un curso
   *
   * @param estudiantes - Lista de estudiantes con cursos seleccionados
   * @throws BadRequestException si no hay cursos seleccionados
   */
  private validateCourseSelection(estudiantes: CreateInscriptionDto['estudiantes']): void {
    const totalCursos = estudiantes.reduce((sum, est) => sum + est.cursosSeleccionados.length, 0);

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
    const totalCursos = dto.estudiantes.reduce((sum, est) => sum + est.cursosSeleccionados.length, 0);

    // Usar PricingCalculatorService para calcular descuentos y totales
    const descuentoPorcentaje = this.pricingCalculator.calcularDescuentoColonia(cantidadEstudiantes, totalCursos);
    const cursosPerStudent = dto.estudiantes.map(est => est.cursosSeleccionados.length);
    const totalMensual = this.pricingCalculator.calcularTotalColonia(cursosPerStudent, descuentoPorcentaje);

    this.logger.log(`Cálculo: ${totalCursos} cursos, ${cantidadEstudiantes} estudiantes, descuento ${descuentoPorcentaje}%, total mensual: $${totalMensual}`);

    return {
      cantidadEstudiantes,
      totalCursos,
      descuentoPorcentaje,
      totalMensual,
    };
  }

  /**
   * Genera un username único basado en el nombre del estudiante
   *
   * @param nombre - Nombre del estudiante
   * @returns Username único en formato {nombre}{random4digits}
   */
  private generateUsername(nombre: string): string {
    const baseUsername = nombre.toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${baseUsername}${randomNum}`;
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
    tx: any,
    dto: CreateInscriptionDto,
    tutorId: string
  ): Promise<{ estudiantesFromDB: any[]; estudiantesData: any[]; pins: string[] }> {
    // Preparar datos de estudiantes y generar usernames únicos
    const estudiantesData = dto.estudiantes.map((estudianteDto) => {
      const username = this.generateUsername(estudianteDto.nombre);

      return {
        username,
        nombre: estudianteDto.nombre,
        apellido: '',
        edad: estudianteDto.edad,
        nivelEscolar: estudianteDto.edad <= 7 ? 'Primaria' : estudianteDto.edad <= 12 ? 'Primaria' : 'Secundaria',
        tutor_id: tutorId,
      };
    });

    // Crear todos los estudiantes en paralelo
    const estudiantesFromDB = await Promise.all(
      estudiantesData.map(data => tx.estudiante.create({ data }))
    );

    // Generar todos los PINs en paralelo
    const pins = await Promise.all(
      estudiantesFromDB.map(() => this.generateUniquePin())
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
    tx: any,
    inscriptionId: string,
    estudiantesFromDB: any[],
    pins: string[]
  ): Promise<any[]> {
    return Promise.all(
      estudiantesFromDB.map(async (estudiante, idx) => {
        return await tx.coloniaEstudiante.create({
          data: {
            inscripcion_id: inscriptionId,
            estudiante_id: estudiante.id,
            nombre: estudiante.nombre,
            edad: estudiante.edad,
            pin: pins[idx],
          },
        });
      })
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
    coloniaEstudiantesCreados: any[],
    descuentoPorcentaje: number
  ): any[] {
    const cursosData: any[] = [];

    dto.estudiantes.forEach((estudianteDto, idx) => {
      const coloniaEstudianteId = coloniaEstudiantesCreados[idx].id;
      const precioConDescuento = this.pricingCalculator.aplicarDescuento(
        PRECIOS.COLONIA_CURSO_BASE,
        descuentoPorcentaje
      );

      estudianteDto.cursosSeleccionados.forEach((curso) => {
        cursosData.push({
          colonia_estudiante_id: coloniaEstudianteId,
          courseId: curso.id,
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
  private async createCursos(tx: any, cursosData: any[]): Promise<void> {
    const cursosPromises = cursosData.map((cursoData) =>
      tx.coloniaEstudianteCurso.create({ data: cursoData })
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
    pricing: PricingResult
  ): any {
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
      auto_return: 'approved' as any,
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
    preference: any,
    pricing: PricingResult
  ): any {
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
    const passwordHash = await bcrypt.hash(dto.password, 10);

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
          debe_cambiar_password: false,
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

      const { estudiantesFromDB, estudiantesData, pins } = await this.createEstudiantesConPins(tx, dto, tutor.id);
      const coloniaEstudiantesCreados = await this.createColoniaEstudiantes(
        tx,
        inscripcion.id,
        estudiantesFromDB,
        pins
      );

      const cursosData = this.prepareCursosData(dto, coloniaEstudiantesCreados, pricing.descuentoPorcentaje);
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
        estudiantes: estudiantesData.map((data, idx) => ({
          nombre: data.nombre,
          username: data.username,
          pin: pins[idx],
        })),
      };
    });

    // 4. MercadoPago
    const preference = await this.mercadoPagoService.createPreference(
      this.buildMercadoPagoPreference(result, pricing)
    );

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
        this.logger.warn('Pago no encontrado por ID, intentando fallback', { pagoId });

        // Extraer inscripcion_id de payment.additional_info.items[0].id
        // Formato esperado: "colonia-{inscriptionId}"
        const itemId = payment.additional_info?.items?.[0]?.id;
        if (itemId && typeof itemId === 'string' && itemId.startsWith('colonia-')) {
          const inscripcionId = itemId.replace('colonia-', '');
          this.logger.log('Buscando pago pendiente por inscripción', { inscripcionId });

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
        this.logger.error('No se encontró pago de Colonia', { pagoId, paymentId });
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
    } catch (error) {
      this.logger.error('Error procesando webhook de Colonia', {
        paymentId,
        error: error instanceof Error ? error.message : error,
      });
      throw new BadRequestException('Error processing webhook');
    }
  }

  /**
   * Actualiza el estado de un pago de Colonia según respuesta de MercadoPago
   */
  private async actualizarPagoColonia(pagoId: string, payment: any) {
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
