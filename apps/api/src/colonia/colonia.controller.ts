import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ColoniaService } from './colonia.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { MercadoPagoWebhookGuard } from '../pagos/guards/mercadopago-webhook.guard';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';

@Controller('colonia')
export class ColoniaController {
  private readonly logger = new Logger(ColoniaController.name);

  constructor(private readonly coloniaService: ColoniaService) {}

  /**
   * POST /api/colonia/inscripcion
   *
   * Crea una inscripción completa a la Colonia de Verano 2026
   *
   * Body esperado:
   * {
   *   nombre: string,
   *   email: string,
   *   telefono: string,
   *   password: string,
   *   dni?: string,
   *   estudiantes: [
   *     {
   *       nombre: string,
   *       edad: number (6-12),
   *       cursosSeleccionados: [{ id, name, area, instructor, dayOfWeek, timeSlot, color, icon }]
   *     }
   *   ]
   * }
   *
   * Retorna:
   * {
   *   message: string,
   *   tutorId: string,
   *   inscriptionId: string,
   *   estudiantes: [{ nombre, username, pin }],
   *   pago: {
   *     mes: 'enero',
   *     monto: number,
   *     descuento: number,
   *     mercadoPagoUrl: string
   *   }
   * }
   */
  @Post('inscripcion')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.CREATED)
  async createInscription(@Body() createInscriptionDto: CreateInscriptionDto) {
    this.logger.log(
      `Nueva solicitud de inscripción - Email: ${createInscriptionDto.email}`,
    );

    try {
      const result =
        await this.coloniaService.createInscription(createInscriptionDto);

      this.logger.log(
        `Inscripción exitosa - Inscription ID: ${result.inscriptionId}`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error en inscripción: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * POST /api/colonia/webhook
   * Webhook de MercadoPago para notificaciones de pago de Colonia
   *
   * IMPORTANTE:
   * - NO requiere autenticación JWT (es un webhook externo)
   * - SÍ requiere validación de firma HMAC (MercadoPagoWebhookGuard)
   * - MercadoPago envía notificaciones cuando cambia el estado de un pago
   */
  @Post('webhook')
  @UseGuards(MercadoPagoWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: MercadoPagoWebhookDto) {
    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}`,
    );

    return await this.coloniaService.procesarWebhookMercadoPago(webhookData);
  }
}
