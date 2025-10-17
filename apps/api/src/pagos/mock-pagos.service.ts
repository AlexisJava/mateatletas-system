import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio para utilidades de testing en modo mock
 * Solo activo cuando MercadoPago no está configurado
 */
@Injectable()
export class MockPagosService {
  private readonly logger = new Logger(MockPagosService.name);
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Crea una preferencia mock para suscripción
   * Simula la respuesta de MercadoPago para desarrollo
   */
  createMockMembershipPreference(membresiaId: string) {
    const mockPreferenceId = `MOCK-PREF-${Date.now()}`;
    const mockInitPoint = `${this.frontendUrl}/mock-checkout?membresiaId=${membresiaId}&tipo=suscripcion`;

    this.logger.warn(
      `🧪 MOCK MODE: Simulando preferencia de pago para membresía ${membresiaId}`,
    );

    return {
      id: mockPreferenceId,
      init_point: mockInitPoint,
    };
  }

  /**
   * Crea una preferencia mock para curso
   * Simula la respuesta de MercadoPago para desarrollo
   */
  createMockCoursePreference(inscripcionId: string) {
    const mockPreferenceId = `MOCK-PREF-${Date.now()}`;
    const mockInitPoint = `${this.frontendUrl}/mock-checkout?inscripcionId=${inscripcionId}&tipo=curso`;

    this.logger.warn(
      `🧪 MOCK MODE: Simulando preferencia de pago para inscripción ${inscripcionId}`,
    );

    return {
      id: mockPreferenceId,
      init_point: mockInitPoint,
    };
  }

  /**
   * Activa una membresía manualmente (SOLO PARA TESTING EN MODO MOCK)
   * @param membresiaId - ID de la membresía a activar
   * @param mockMode - Si el sistema está en modo mock
   */
  async activarMembresiaMock(membresiaId: string, mockMode: boolean) {
    if (!mockMode) {
      throw new BadRequestException(
        'Este endpoint solo está disponible en modo mock',
      );
    }

    const membresia = await this.prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: { producto: true },
    });

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    const now = new Date();
    const duracionMeses = membresia.producto.duracion_meses || 1;
    const fechaFin = new Date(now);
    fechaFin.setMonth(fechaFin.getMonth() + duracionMeses);

    const membresiaActualizada = await this.prisma.membresia.update({
      where: { id: membresiaId },
      data: {
        estado: 'Activa',
        fecha_inicio: now,
        fecha_proximo_pago: fechaFin,
      },
    });

    this.logger.log(`🧪 MOCK: Membresía ${membresiaId} activada manualmente`);

    return {
      message: 'Membresía activada exitosamente (modo mock)',
      membresia: membresiaActualizada,
    };
  }

  /**
   * Verifica si los webhooks deben ser ignorados en modo mock
   */
  shouldIgnoreWebhook(mockMode: boolean): boolean {
    if (mockMode) {
      this.logger.warn(
        '🧪 MOCK MODE: Webhook ignorado (use endpoints manuales para testing)',
      );
      return true;
    }
    return false;
  }
}
