import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';

@Injectable()
export class ColoniaService {
  private readonly logger = new Logger(ColoniaService.name);
  private readonly PRECIO_BASE_CURSO = 55000;

  constructor(
    private prisma: PrismaClient,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  /**
   * Genera un PIN de 4 dígitos único
   */
  private async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists = true;

    while (exists) {
      pin = Math.floor(1000 + Math.random() * 9000).toString();

      // Verificar que no exista en la tabla colonia_estudiantes
      const existingStudent = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM colonia_estudiantes WHERE pin = ${pin} LIMIT 1
      `;

      exists = existingStudent.length > 0;
    }

    return pin;
  }

  /**
   * Calcula el descuento según la lógica de negocio:
   * - 2+ hermanos Y 2+ cursos total = 20%
   * - 2+ hermanos O 2+ cursos total = 12%
   * - Caso contrario = 0%
   */
  private calculateDiscount(cantidadEstudiantes: number, totalCursos: number): number {
    if (cantidadEstudiantes >= 2 && totalCursos >= 2) {
      return 20;
    } else if (cantidadEstudiantes >= 2 || totalCursos >= 2) {
      return 12;
    }
    return 0;
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

    // 1. Verificar email único
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email: dto.email },
    });

    if (existingTutor) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Calcular precios
    const cantidadEstudiantes = dto.estudiantes.length;
    const totalCursos = dto.estudiantes.reduce((sum, est) => sum + est.cursosSeleccionados.length, 0);

    if (totalCursos === 0) {
      throw new BadRequestException('Debe seleccionar al menos un curso');
    }

    const descuentoPorcentaje = this.calculateDiscount(cantidadEstudiantes, totalCursos);
    const precioBase = totalCursos * this.PRECIO_BASE_CURSO;
    const descuentoMonto = Math.round(precioBase * (descuentoPorcentaje / 100));
    const totalMensual = precioBase - descuentoMonto;

    this.logger.log(`Cálculo: ${totalCursos} cursos, ${cantidadEstudiantes} estudiantes, descuento ${descuentoPorcentaje}%, total mensual: $${totalMensual}`);

    // 3. Hash de contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Crear todo en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear tutor
      const tutor = await tx.tutor.create({
        data: {
          email: dto.email,
          nombre: dto.nombre,
          apellido: '', // No pedimos apellido en el form, usar email como apellido temporal
          password_hash: passwordHash,
          dni: dto.dni || null,
          telefono: dto.telefono,
          debe_cambiar_password: false, // El tutor ya eligió su propia contraseña
          debe_completar_perfil: false,
          ha_completado_onboarding: true,
          roles: JSON.parse('["tutor"]'),
        },
      });

      this.logger.log(`Tutor creado: ${tutor.id}`);

      // Crear inscripción de colonia
      const inscriptionId = crypto.randomUUID();
      await tx.$executeRaw`
        INSERT INTO colonia_inscripciones (
          id, tutor_id, estado, descuento_aplicado, total_mensual, fecha_inscripcion, "createdAt", "updatedAt"
        ) VALUES (
          ${inscriptionId}, ${tutor.id}, 'active', ${descuentoPorcentaje}, ${totalMensual}, NOW(), NOW(), NOW()
        )
      `;

      this.logger.log(`Inscripción creada: ${inscriptionId}`);

      // Crear estudiantes y cursos
      const estudiantesCreados = [];

      for (const estudianteDto of dto.estudiantes) {
        // Generar username único basado en nombre y número aleatorio
        const baseUsername = estudianteDto.nombre.toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const username = `${baseUsername}${randomNum}`;

        // Crear estudiante en tabla principal
        const estudiante = await tx.estudiante.create({
          data: {
            username,
            nombre: estudianteDto.nombre,
            apellido: '', // No pedimos apellido
            edad: estudianteDto.edad,
            nivel_escolar: estudianteDto.edad <= 7 ? 'Primaria' : estudianteDto.edad <= 12 ? 'Primaria' : 'Secundaria',
            tutor_id: tutor.id,
          },
        });

        // Generar PIN único
        const pin = await this.generateUniquePin();

        // Crear estudiante de colonia
        const coloniaEstudianteId = crypto.randomUUID();
        await tx.$executeRaw`
          INSERT INTO colonia_estudiantes (
            id, inscripcion_id, estudiante_id, nombre, edad, pin, "createdAt", "updatedAt"
          ) VALUES (
            ${coloniaEstudianteId}, ${inscriptionId}, ${estudiante.id}, ${estudianteDto.nombre}, ${estudianteDto.edad}, ${pin}, NOW(), NOW()
          )
        `;

        // Crear cursos del estudiante
        for (const curso of estudianteDto.cursosSeleccionados) {
          const precioConDescuento = Math.round(this.PRECIO_BASE_CURSO * (1 - descuentoPorcentaje / 100));

          const cursoId = crypto.randomUUID();
          await tx.$executeRaw`
            INSERT INTO colonia_estudiante_cursos (
              id, colonia_estudiante_id, course_id, course_name, course_area, instructor, day_of_week, time_slot, precio_base, precio_con_descuento, "createdAt", "updatedAt"
            ) VALUES (
              ${cursoId}, ${coloniaEstudianteId}, ${curso.id}, ${curso.name}, ${curso.area}, ${curso.instructor}, ${curso.dayOfWeek}, ${curso.timeSlot}, ${this.PRECIO_BASE_CURSO}, ${precioConDescuento}, NOW(), NOW()
            )
          `;
        }

        estudiantesCreados.push({
          nombre: estudianteDto.nombre,
          username,
          pin,
        });

        this.logger.log(`Estudiante creado: ${estudianteDto.nombre} (${username}) - PIN: ${pin}`);
      }

      // Crear pago de Enero 2026
      const pagoEneroId = crypto.randomUUID();
      const fechaVencimiento = new Date('2026-02-05'); // Vence el 5 de febrero

      await tx.$executeRaw`
        INSERT INTO colonia_pagos (
          id, inscripcion_id, mes, anio, monto, estado, fecha_vencimiento, fecha_creacion, "createdAt", "updatedAt"
        ) VALUES (
          ${pagoEneroId}, ${inscriptionId}, 'enero', 2026, ${totalMensual}, 'pending', ${fechaVencimiento}, NOW(), NOW(), NOW()
        )
      `;

      this.logger.log(`Pago Enero 2026 creado: ${pagoEneroId}`);

      return {
        tutorId: tutor.id,
        inscriptionId,
        pagoEneroId,
        estudiantes: estudiantesCreados,
        totalMensual,
        descuentoPorcentaje,
      };
    });

    // 5. Crear preferencia de MercadoPago
    const preference = await this.mercadoPagoService.createPreference({
      items: [
        {
          id: `colonia-${result.inscriptionId}`,
          title: `Colonia de Verano 2026 - Enero`,
          description: `${totalCursos} curso(s) - ${cantidadEstudiantes} estudiante(s)${descuentoPorcentaje > 0 ? ` - ${descuentoPorcentaje}% descuento` : ''}`,
          quantity: 1,
          unit_price: totalMensual,
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
    });

    // 6. Actualizar pago con preference ID
    await this.prisma.$executeRaw`
      UPDATE colonia_pagos
      SET mercadopago_preference_id = ${preference.id}
      WHERE id = ${result.pagoEneroId}
    `;

    this.logger.log(`✅ Inscripción completada exitosamente - Preference ID: ${preference.id}`);

    return {
      message: 'Inscripción creada exitosamente',
      tutorId: result.tutorId,
      inscriptionId: result.inscriptionId,
      estudiantes: result.estudiantes,
      pago: {
        mes: 'enero',
        monto: totalMensual,
        descuento: descuentoPorcentaje,
        mercadoPagoUrl: preference.init_point,
        mercadoPagoSandboxUrl: preference.sandbox_init_point,
      },
    };
  }
}
