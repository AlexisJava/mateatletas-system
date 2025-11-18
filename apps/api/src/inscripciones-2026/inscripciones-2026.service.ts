import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../core/database/prisma.service';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';
import {
  parseLegacyExternalReference,
  TipoExternalReference,
  PRECIOS,
  DESCUENTOS,
  PricingHelpers,
} from '../domain/constants';
import { PricingCalculatorService } from '../domain/services/pricing-calculator.service';
import * as bcrypt from 'bcrypt';
import {
  CreateInscripcion2026Dto,
  CreateInscripcion2026Response,
  TipoInscripcion2026,
  MundoSTEAM,
} from './dto/create-inscripcion-2026.dto';

@Injectable()
export class Inscripciones2026Service {
  private readonly logger = new Logger(Inscripciones2026Service.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly pricingCalculator: PricingCalculatorService,
  ) {}

  /**
   * Genera un PIN único de 4 dígitos para el estudiante
   */
  private async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists = true;

    while (exists) {
      pin = Math.floor(1000 + Math.random() * 9000).toString();

      const existingPin = await this.prisma.estudianteInscripcion2026.findFirst({
        where: { pin },
      });

      exists = !!existingPin;
    }

    return pin!;
  }

  /**
   * Calcula el monto de inscripción según el tipo
   */
  private calculateInscriptionFee(tipo: TipoInscripcion2026): number {
    return this.pricingCalculator.calcularTarifaInscripcion(tipo);
  }

  /**
   * Calcula el descuento por hermanos (solo aplica a cuota mensual)
   * 2 hermanos: 12%
   * 3+ hermanos: 24%
   *
   * @deprecated Usar pricingCalculator.calcularDescuentoInscripcion2026()
   */
  private calculateSiblingDiscount(numEstudiantes: number): number {
    return this.pricingCalculator.calcularDescuentoInscripcion2026(numEstudiantes);
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
    return this.pricingCalculator.calcularTotalInscripcion2026(tipo, numEstudiantes, cursosPerStudent);
  }

  /**
   * Valida que los datos sean consistentes según el tipo de inscripción
   */
  private validateInscriptionData(dto: CreateInscripcion2026Dto): void {
    const { tipo_inscripcion, estudiantes } = dto;

    estudiantes.forEach((estudiante, index) => {
      const hasCursos = estudiante.cursos_seleccionados && estudiante.cursos_seleccionados.length > 0;
      const hasMundo = !!estudiante.mundo_seleccionado;

      switch (tipo_inscripcion) {
        case TipoInscripcion2026.COLONIA:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia`
            );
          }
          if (hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar mundo STEAM para Colonia`
            );
          }
          break;

        case TipoInscripcion2026.CICLO_2026:
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Ciclo 2026`
            );
          }
          if (hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar cursos de Colonia para Ciclo 2026`
            );
          }
          break;

        case TipoInscripcion2026.PACK_COMPLETO:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia para Pack Completo`
            );
          }
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Pack Completo`
            );
          }
          break;
      }
    });
  }

  /**
   * Crea una nueva inscripción 2026
   */
  async createInscripcion2026(
    dto: CreateInscripcion2026Dto,
  ): Promise<CreateInscripcion2026Response> {
    // 1. Validar datos
    this.validateInscriptionData(dto);

    // 2. Verificar si el tutor ya existe por email
    let tutor = await this.prisma.tutor.findUnique({
      where: { email: dto.tutor.email },
    });

    // 3. Si el tutor no existe, crearlo
    if (!tutor) {
      const hashedPassword = await bcrypt.hash(dto.tutor.password, 10);

      tutor = await this.prisma.tutor.create({
        data: {
          nombre: dto.tutor.nombre,
          apellido: '', // Campo requerido, se puede actualizar después
          email: dto.tutor.email,
          telefono: dto.tutor.telefono,
          dni: dto.tutor.dni,
          cuil: dto.tutor.cuil,
          password_hash: hashedPassword,
        },
      });
    }

    // 4. Calcular precios
    const inscripcionFee = this.calculateInscriptionFee(dto.tipo_inscripcion);
    const cursosPerStudent = dto.estudiantes.map(
      (e) => e.cursos_seleccionados?.length || 0
    );
    const { total: monthlyTotal, descuento: siblingDiscount } =
      this.calculateMonthlyTotal(
        dto.tipo_inscripcion,
        dto.estudiantes.length,
        cursosPerStudent,
      );

    // 5. Crear la inscripción principal
    const inscripcion = await this.prisma.inscripcion2026.create({
      data: {
        tutor_id: tutor.id,
        tipo_inscripcion: dto.tipo_inscripcion,
        estado: 'pending',
        inscripcion_pagada: inscripcionFee,
        descuento_aplicado: siblingDiscount,
        total_mensual_actual: monthlyTotal,
        origen_inscripcion: dto.origen_inscripcion,
        ciudad: dto.ciudad,
      },
    });

    // 6. Crear estudiantes y sus selecciones
    // OPTIMIZACIÓN N+1 QUERY:
    // - ANTES: N × (1 create estudiante + 1 PIN + 1 create inscripción + M creates cursos + 1 create mundo)
    // - AHORA: 1 createMany estudiantes + N PINs paralelos + 1 createMany inscripciones + 1 createMany cursos + 1 createMany mundos
    //
    // PERFORMANCE:
    // - Con 3 estudiantes, 2 cursos cada uno: ~18 queries → 5 queries (72% reducción)
    // - Con 10 estudiantes, 2 cursos cada uno: ~60 queries → 5 queries (92% reducción)

    // Paso 1: Preparar datos de estudiantes y generar usernames/PINs
    const estudiantesData = dto.estudiantes.map((estudianteData, idx) => {
      const baseUsername = estudianteData.nombre.toLowerCase().replace(/\s+/g, '');
      const randomNum = Date.now() + idx; // Asegurar unicidad
      const username = `${baseUsername}_${randomNum}`;

      return {
        username,
        nombre: estudianteData.nombre,
        apellido: '', // Campo requerido, se puede actualizar después
        edad: estudianteData.edad,
        nivelEscolar: 'Primaria', // Default, se puede actualizar después
        tutor_id: tutor.id,
      };
    });

    // Paso 2: Crear todos los estudiantes en paralelo (usando Promise.all para mejor performance)
    const estudiantesFromDB = await Promise.all(
      estudiantesData.map(data =>
        this.prisma.estudiante.create({ data })
      )
    );

    // Paso 4: Generar todos los PINs en paralelo
    const pins = await Promise.all(
      estudiantesFromDB.map(() => this.generateUniquePin())
    );

    // Paso 5: Preparar datos de estudianteInscripcion2026
    const inscripcionesData = estudiantesFromDB.map((estudiante, idx) => ({
      inscripcion_id: inscripcion.id,
      estudiante_id: estudiante.id,
      nombre: dto.estudiantes[idx].nombre,
      edad: dto.estudiantes[idx].edad,
      dni: dto.estudiantes[idx].dni,
      pin: pins[idx],
    }));

    // Paso 6: Crear todas las relaciones EstudianteInscripcion2026 en paralelo
    const inscripcionesFromDB = await Promise.all(
      inscripcionesData.map(data =>
        this.prisma.estudianteInscripcion2026.create({ data })
      )
    );

    // Paso 8: Preparar datos de cursos seleccionados
    const cursosData: any[] = [];
    dto.estudiantes.forEach((estudianteData, idx) => {
      const estudianteInscripcionId = inscripcionesFromDB[idx].id;

      if (estudianteData.cursos_seleccionados) {
        estudianteData.cursos_seleccionados.forEach((curso, cursoIdx) => {
          const precioBase = PRECIOS.COLONIA_CURSO_BASE;
          const descuentoCurso = cursoIdx === 1 ? DESCUENTOS.COLONIA.SEGUNDO_CURSO : 0;
          const precioConDescuento = this.pricingCalculator.aplicarDescuento(precioBase, descuentoCurso);

          cursosData.push({
            estudiante_inscripcion_id: estudianteInscripcionId,
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
    });

    // Paso 9: Crear todos los cursos en paralelo
    if (cursosData.length > 0) {
      await Promise.all(
        cursosData.map(data =>
          this.prisma.coloniaCursoSeleccionado2026.create({ data })
        )
      );
    }

    // Paso 10: Preparar datos de mundos STEAM seleccionados
    const mundosData: any[] = [];
    dto.estudiantes.forEach((estudianteData, idx) => {
      if (estudianteData.mundo_seleccionado) {
        const estudianteInscripcionId = inscripcionesFromDB[idx].id;
        mundosData.push({
          estudiante_inscripcion_id: estudianteInscripcionId,
          mundo: estudianteData.mundo_seleccionado,
          // dia_semana y horario se asignarán después, antes del 20 de febrero
        });
      }
    });

    // Paso 11: Crear todos los mundos en paralelo
    if (mundosData.length > 0) {
      await Promise.all(
        mundosData.map(data =>
          this.prisma.cicloMundoSeleccionado2026.create({ data })
        )
      );
    }

    // Preparar resultado para retornar
    const estudiantesCreados = estudiantesFromDB.map((estudiante, idx) => ({
      id: estudiante.id,
      nombre: estudiante.nombre,
      pin: pins[idx],
    }));

    // 7. Crear el pago de inscripción (pendiente)
    const pagoInscripcion = await this.prisma.pagoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion.id,
        tipo: 'inscripcion',
        monto: inscripcionFee,
        estado: 'pending',
      },
    });

    // 8. Crear historial de estado
    await this.prisma.historialEstadoInscripcion2026.create({
      data: {
        inscripcion_id: inscripcion.id,
        estado_anterior: 'none',
        estado_nuevo: 'pending',
        razon: 'Inscripción creada',
        realizado_por: 'system',
      },
    });

    // 9. Crear preferencia de MercadoPago
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    let mercadopagoPreferenceId = '';
    let mercadopagoInitPoint = '';

    // Verificar si MercadoPago está en modo mock
    if (this.mercadoPagoService.isMockMode()) {
      this.logger.warn('⚠️ MercadoPago en modo MOCK - Generando preferencia placeholder');
      mercadopagoPreferenceId = 'MP-MOCK-' + inscripcion.id;
      mercadopagoInitPoint = `${frontendUrl}/inscripcion-2026/mock-checkout?inscripcionId=${inscripcion.id}`;
    } else {
      // Generar preferencia real con MercadoPago
      const preferenceData = this.mercadoPagoService.buildInscripcion2026PreferenceData(
        dto.tipo_inscripcion,
        inscripcionFee,
        {
          email: tutor.email || dto.tutor.email, // Fallback to DTO email if tutor.email is null
          nombre: tutor.nombre || undefined,
          apellido: tutor.apellido || undefined,
        },
        inscripcion.id,
        tutor.id,
        dto.estudiantes.length,
        backendUrl,
        frontendUrl,
      );

      try {
        const preference = await this.mercadoPagoService.createPreference(preferenceData);
        mercadopagoPreferenceId = preference.id || '';
        mercadopagoInitPoint = preference.init_point || '';

        this.logger.log(`✅ Preferencia MercadoPago creada: ${mercadopagoPreferenceId}`);
      } catch (error) {
        this.logger.error('❌ Error al crear preferencia de MercadoPago:', error);
        throw new BadRequestException(
          'Error al generar el pago con MercadoPago. Por favor intente nuevamente.',
        );
      }
    }

    // Actualizar el pago con la info de MercadoPago
    await this.prisma.pagoInscripcion2026.update({
      where: { id: pagoInscripcion.id },
      data: {
        mercadopago_preference_id: mercadopagoPreferenceId,
      },
    });

    // 10. Retornar respuesta
    return {
      success: true,
      inscripcionId: inscripcion.id,
      tutorId: tutor.id,
      estudiantes_creados: estudiantesCreados,
      pago_info: {
        monto_total: inscripcionFee,
        descuento_aplicado: siblingDiscount,
        mercadopago_preference_id: mercadopagoPreferenceId,
        mercadopago_init_point: mercadopagoInitPoint,
      },
    };
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
   * Procesa webhook de MercadoPago para inscripciones 2026
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}`,
    );

    // Solo procesar notificaciones de tipo "payment"
    if (webhookData.type !== 'payment') {
      this.logger.log(`⏭️ Ignorando webhook de tipo: ${webhookData.type}`);
      return { message: 'Webhook type not handled' };
    }

    const paymentId = webhookData.data.id;
    this.logger.log(`💳 Procesando pago ID: ${paymentId}`);

    try {
      // Consultar detalles del pago a MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log(
        `💰 Pago consultado - Estado: ${payment.status} - Ref Externa: ${payment.external_reference}`,
      );

      // Parsear external_reference para identificar inscripción
      const externalRef = payment.external_reference;

      if (!externalRef) {
        this.logger.warn('⚠️ Pago sin external_reference - Ignorando');
        return { message: 'Payment without external_reference' };
      }

      // Usar parser de constantes para extraer IDs
      const parsed = parseLegacyExternalReference(externalRef);

      if (!parsed || parsed.tipo !== TipoExternalReference.INSCRIPCION_2026) {
        this.logger.warn('⚠️ External reference inválida o no es de tipo INSCRIPCION_2026');
        return { message: 'Invalid external_reference format' };
      }

      const { inscripcionId } = parsed.ids;

      // Buscar el pago en la base de datos
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
        this.logger.error(`❌ No se encontró el pago para inscripción ${inscripcionId}`);
        return { message: 'Payment record not found' };
      }

      // Actualizar estado del pago según respuesta de MercadoPago
      let nuevoEstadoPago = 'pending';
      let nuevoEstadoInscripcion = 'pending';

      switch (payment.status) {
        case 'approved':
          nuevoEstadoPago = 'paid';
          nuevoEstadoInscripcion = 'active';
          break;
        case 'rejected':
        case 'cancelled':
          nuevoEstadoPago = 'failed';
          nuevoEstadoInscripcion = 'payment_failed';
          break;
        case 'in_process':
        case 'pending':
          nuevoEstadoPago = 'pending';
          nuevoEstadoInscripcion = 'pending';
          break;
        default:
          this.logger.warn(`⚠️ Estado de pago desconocido: ${payment.status}`);
          nuevoEstadoPago = 'pending';
      }

      // Actualizar pago en DB
      await this.prisma.pagoInscripcion2026.update({
        where: { id: pago.id },
        data: {
          estado: nuevoEstadoPago,
          mercadopago_payment_id: payment.id?.toString(),
          fecha_pago: payment.status === 'approved' ? new Date() : undefined,
        },
      });

      // Actualizar estado de la inscripción
      if (nuevoEstadoInscripcion !== pago.inscripcion.estado) {
        await this.updateEstado(
          inscripcionId,
          nuevoEstadoInscripcion,
          `Pago ${nuevoEstadoPago} - MercadoPago Payment ID: ${payment.id}`,
          'mercadopago-webhook',
        );
      }

      this.logger.log(
        `✅ Pago procesado exitosamente - Inscripción ${inscripcionId} → Estado: ${nuevoEstadoInscripcion}`,
      );

      return {
        success: true,
        inscripcionId,
        paymentStatus: nuevoEstadoPago,
        inscripcionStatus: nuevoEstadoInscripcion,
      };
    } catch (error) {
      this.logger.error('❌ Error procesando webhook de MercadoPago:', error);
      throw new BadRequestException('Error processing webhook');
    }
  }
}
