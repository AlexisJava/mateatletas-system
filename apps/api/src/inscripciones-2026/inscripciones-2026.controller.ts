import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Inscripciones2026Service } from './inscripciones-2026.service';
import {
  CreateInscripcion2026Dto,
  CreateInscripcion2026Response,
} from './dto/create-inscripcion-2026.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { InscripcionOwnershipGuard } from './guards/inscripcion-ownership.guard';
import { WebhookRateLimitGuard } from './guards/webhook-rate-limit.guard';
import { MercadoPagoWebhookGuard } from '../pagos/guards/mercadopago-webhook.guard';
import { MercadoPagoWebhookDto } from '../pagos/dto/mercadopago-webhook.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('inscripciones-2026')
export class Inscripciones2026Controller {
  private readonly logger = new Logger(Inscripciones2026Controller.name);

  constructor(
    private readonly inscripciones2026Service: Inscripciones2026Service,
  ) {}

  /**
   * POST /inscripciones-2026
   * Crea una nueva inscripción 2026 (público)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateInscripcion2026Dto,
  ): Promise<CreateInscripcion2026Response> {
    return this.inscripciones2026Service.createInscripcion2026(createDto);
  }

  /**
   * GET /inscripciones-2026/:id
   * Obtiene una inscripción por ID
   *
   * SEGURIDAD:
   * - Requiere autenticación (JwtAuthGuard)
   * - Requiere ownership (InscripcionOwnershipGuard)
   * - Solo el tutor dueño o admin pueden ver la inscripción
   * - Previene enumeración de IDs y acceso a datos de otras familias
   *
   * PROTECCIÓN DE DATOS:
   * - Cumple GDPR Art. 32 (Security of processing)
   * - Previene violación de privacidad
   * - Datos personales solo accesibles por el dueño
   *
   * OWASP A01:2021 - Broken Access Control
   * ISO 27001 A.9.4.1 - Information access restriction
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, InscripcionOwnershipGuard)
  async getById(@Param('id') id: string) {
    return this.inscripciones2026Service.getInscripcionById(id);
  }

  /**
   * GET /inscripciones-2026/tutor/:tutorId
   * Lista todas las inscripciones de un tutor (requiere autenticación)
   */
  @Get('tutor/:tutorId')
  @UseGuards(JwtAuthGuard)
  async getByTutor(@Param('tutorId') tutorId: string) {
    return this.inscripciones2026Service.getInscripcionesByTutor(tutorId);
  }

  /**
   * GET /inscripciones-2026/mis-inscripciones
   * Lista inscripciones del tutor autenticado
   */
  @Get('mis-inscripciones')
  @UseGuards(JwtAuthGuard)
  async getMisInscripciones(@Request() req: RequestWithUser) {
    const tutorId = req.user.id; // Asume que el JWT contiene el user ID
    return this.inscripciones2026Service.getInscripcionesByTutor(tutorId);
  }

  /**
   * PATCH /inscripciones-2026/:id/estado
   * Actualiza el estado de una inscripción (admin only)
   *
   * SEGURIDAD:
   * - Requiere autenticación (JwtAuthGuard)
   * - Requiere rol ADMIN o superior (RolesGuard)
   * - Solo administradores pueden modificar estados de inscripciones
   * - Previene que tutores/docentes/estudiantes modifiquen estados
   *
   * OWASP A01:2021 - Broken Access Control
   * ISO 27001 A.9.2.3 - Management of privileged access rights
   */
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateEstado(
    @Param('id') id: string,
    @Body() body: { estado: string; razon: string },
    @Request() req: RequestWithUser,
  ) {
    return this.inscripciones2026Service.updateEstado(
      id,
      body.estado,
      body.razon,
      req.user.id,
    );
  }

  /**
   * POST /inscripciones-2026/webhook
   * Webhook de MercadoPago para notificaciones de pago
   *
   * IMPORTANTE:
   * - NO requiere autenticación JWT (es un webhook externo)
   * - SÍ requiere validación de firma HMAC (MercadoPagoWebhookGuard)
   * - SÍ requiere rate limiting (WebhookRateLimitGuard) - 100 req/min por IP
   * - MercadoPago envía notificaciones cuando cambia el estado de un pago
   *
   * SEGURIDAD (PASO 2.1):
   * - Rate Limiting: Previene ataques DoS en endpoint público
   * - Límite: 100 requests/minuto por IP
   * - Retorna HTTP 429 si se excede el límite
   *
   * ESTÁNDARES:
   * - OWASP A05:2021 - Security Misconfiguration
   * - ISO 27001 A.14.2.8 - System security testing
   * - NIST 800-53 SC-5 - Denial of Service Protection
   *
   * Flujo:
   * 1. WebhookRateLimitGuard valida rate limit por IP
   * 2. MercadoPagoWebhookGuard valida firma HMAC
   * 3. Consultamos detalles del pago a MercadoPago
   * 4. Actualizamos estado de inscripción en DB
   */
  @Post('webhook')
  @UseGuards(WebhookRateLimitGuard, MercadoPagoWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: MercadoPagoWebhookDto) {
    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}`,
    );

    return await this.inscripciones2026Service.procesarWebhookMercadoPago(
      webhookData,
    );
  }
}
