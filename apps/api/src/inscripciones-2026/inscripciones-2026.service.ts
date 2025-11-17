import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../core/database/prisma.service';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';
import { parseLegacyExternalReference, TipoExternalReference } from '../domain/constants';
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
    switch (tipo) {
      case TipoInscripcion2026.COLONIA:
        return 25000;
      case TipoInscripcion2026.CICLO_2026:
        return 50000; // Early Bird matrícula
      case TipoInscripcion2026.PACK_COMPLETO:
        return 60000; // $25k + $50k = $75k, pero con descuento = $60k
      default:
        throw new BadRequestException('Tipo de inscripción inválido');
    }
  }

  /**
   * Calcula el descuento por hermanos (solo aplica a cuota mensual)
   * 2 hermanos: 12%
   * 3+ hermanos: 24%
   */
  private calculateSiblingDiscount(numEstudiantes: number): number {
    if (numEstudiantes === 2) return 12;
    if (numEstudiantes >= 3) return 24;
    return 0;
  }

  /**
   * Calcula el descuento por múltiples cursos en Colonia
   * 2 cursos: 12% de descuento en el segundo curso
   */
  private calculateCourseDiscount(numCursos: number): number {
    if (numCursos === 2) return 12;
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
    const siblingDiscount = this.calculateSiblingDiscount(numEstudiantes);
    let total = 0;

    switch (tipo) {
      case TipoInscripcion2026.COLONIA:
        // Base: $55,000 por curso
        cursosPerStudent.forEach((numCursos) => {
          if (numCursos === 1) {
            total += 55000;
          } else if (numCursos === 2) {
            // Primer curso: $55,000
            // Segundo curso: $55,000 con 12% descuento = $48,400
            total += 55000 + 48400;
          }
        });
        break;

      case TipoInscripcion2026.CICLO_2026:
        // $60,000 por estudiante/mes
        total = numEstudiantes * 60000;
        break;

      case TipoInscripcion2026.PACK_COMPLETO:
        // Enero-Febrero: $55,000/mes por curso (con descuento de 2 cursos si aplica)
        // Marzo+: $60,000/mes por estudiante
        // Para cálculo inicial, usamos promedio o definimos lógica específica
        // Voy a calcular como si fuera suma de ambos
        cursosPerStudent.forEach((numCursos) => {
          if (numCursos === 1) {
            total += 55000; // Colonia
          } else if (numCursos === 2) {
            total += 55000 + 48400; // Colonia con descuento
          }
        });
        total += numEstudiantes * 60000; // Ciclo 2026
        break;
    }

    // Aplicar descuento por hermanos sobre el total mensual
    const descuentoAmount = Math.floor(total * (siblingDiscount / 100));
    const totalConDescuento = total - descuentoAmount;

    return {
      total: totalConDescuento,
      descuento: siblingDiscount,
    };
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
    const estudiantesCreados = [];

    for (const estudianteData of dto.estudiantes) {
      // 6.1 Crear o encontrar el estudiante
      const pin = await this.generateUniquePin();

      // Primero crear el Estudiante en la tabla principal
      // Generar username único basado en nombre y timestamp
      const username = `${estudianteData.nombre.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;

      const estudiante = await this.prisma.estudiante.create({
        data: {
          username: username,
          nombre: estudianteData.nombre,
          apellido: '', // Campo requerido, se puede actualizar después
          edad: estudianteData.edad,
          nivelEscolar: 'Primaria', // Default, se puede actualizar después
          tutor_id: tutor.id,
        },
      });

      // 6.2 Crear la relación EstudianteInscripcion2026
      const estudianteInscripcion = await this.prisma.estudianteInscripcion2026.create({
        data: {
          inscripcion_id: inscripcion.id,
          estudiante_id: estudiante.id,
          nombre: estudianteData.nombre,
          edad: estudianteData.edad,
          dni: estudianteData.dni,
          pin: pin,
        },
      });

      // 6.3 Si tiene cursos de colonia, crearlos
      if (estudianteData.cursos_seleccionados) {
        for (const curso of estudianteData.cursos_seleccionados) {
          const precioBase = 55000;
          const numCursos = estudianteData.cursos_seleccionados.length;
          const cursoIndex = estudianteData.cursos_seleccionados.indexOf(curso);

          // Si es el segundo curso, aplicar descuento
          const descuentoCurso = cursoIndex === 1 ? 12 : 0;
          const precioConDescuento = Math.floor(
            precioBase * (1 - descuentoCurso / 100)
          );

          await this.prisma.coloniaCursoSeleccionado2026.create({
            data: {
              estudiante_inscripcion_id: estudianteInscripcion.id,
              course_id: curso.course_id,
              course_name: curso.course_name,
              course_area: curso.course_area,
              instructor: curso.instructor,
              day_of_week: curso.day_of_week,
              time_slot: curso.time_slot,
              precio_base: precioBase,
              precio_con_descuento: precioConDescuento,
            },
          });
        }
      }

      // 6.4 Si tiene mundo STEAM, crearlo
      if (estudianteData.mundo_seleccionado) {
        await this.prisma.cicloMundoSeleccionado2026.create({
          data: {
            estudiante_inscripcion_id: estudianteInscripcion.id,
            mundo: estudianteData.mundo_seleccionado,
            // dia_semana y horario se asignarán después, antes del 20 de febrero
          },
        });
      }

      estudiantesCreados.push({
        id: estudiante.id,
        nombre: estudiante.nombre,
        pin: pin,
      });
    }

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
