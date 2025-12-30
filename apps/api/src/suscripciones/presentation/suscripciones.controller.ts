import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ParseIdPipe } from '../../common/pipes';
import { EstadoSuscripcion } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthUser } from '../../auth/interfaces';
import { PrismaService } from '../../core/database/prisma.service';

import { SuscripcionQueryService } from '../services/suscripcion-query.service';
import { SuscripcionAdminService } from '../services/suscripcion-admin.service';
import { PreapprovalService } from '../services/preapproval.service';

import {
  CrearSuscripcionDto,
  PlanesResponseDto,
  MisSuscripcionesResponseDto,
  SuscripcionDetalleDto,
  CrearSuscripcionResponseDto,
  CancelarSuscripcionResponseDto,
  HistorialPagosResponseDto,
  AdminFiltrosSuscripcionDto,
  AdminSuscripcionesResponseDto,
  MorosasResponseDto,
  MetricasSuscripcionesDto,
} from './dtos';

/** Planes que requieren clase_grupo_id */
const PLANES_CON_CLASE = ['STEAM_ASINCRONICO', 'STEAM_SINCRONICO'];

/**
 * Controller de Suscripciones
 *
 * Endpoints públicos:
 * - GET /planes - Lista planes disponibles
 *
 * Endpoints de tutor:
 * - POST /suscripciones - Crear suscripción
 * - GET /suscripciones/mis-suscripciones - Listar mis suscripciones
 * - GET /suscripciones/:id - Detalle de suscripción
 * - POST /suscripciones/:id/cancelar - Cancelar suscripción
 * - GET /suscripciones/:id/pagos - Historial de pagos
 *
 * Endpoints de admin:
 * - GET /admin/suscripciones - Listar todas
 * - GET /admin/suscripciones/morosas - Listar morosas
 * - GET /admin/suscripciones/metricas - Dashboard
 */
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(
    private readonly queryService: SuscripcionQueryService,
    private readonly adminService: SuscripcionAdminService,
    private readonly preapprovalService: PreapprovalService,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================================
  // PÚBLICOS
  // ============================================================================

  /**
   * GET /suscripciones/planes
   * Lista todos los planes de suscripción disponibles
   */
  @Get('planes')
  @Public()
  async getPlanes(): Promise<PlanesResponseDto> {
    return this.queryService.getPlanes();
  }

  // ============================================================================
  // TUTOR
  // ============================================================================

  /**
   * POST /suscripciones
   * Crea una nueva suscripción e inicia checkout en MercadoPago
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  async crearSuscripcion(
    @Body() dto: CrearSuscripcionDto,
    @GetUser() user: AuthUser,
  ): Promise<CrearSuscripcionResponseDto> {
    const {
      plan_id,
      estudiante_ids,
      clase_grupo_id,
      card_token_id,
      payer_email,
    } = dto;

    // 1. Validar que estudiantes pertenezcan al tutor
    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        id: { in: estudiante_ids },
        tutor_id: user.id,
      },
    });

    if (estudiantes.length !== estudiante_ids.length) {
      throw new BadRequestException(
        'Algunos estudiantes no pertenecen a tu cuenta',
      );
    }

    // 2. Validar que el plan existe
    const plan = await this.prisma.planSuscripcion.findUnique({
      where: { id: plan_id },
    });

    if (!plan || !plan.activo) {
      throw new BadRequestException('El plan seleccionado no está disponible');
    }

    // 3. Validar clase_grupo si el plan lo requiere
    if (PLANES_CON_CLASE.includes(plan.nombre)) {
      if (!clase_grupo_id) {
        throw new BadRequestException(
          `El plan ${plan.nombre} requiere seleccionar una clase`,
        );
      }

      const claseGrupo = await this.prisma.claseGrupo.findUnique({
        where: { id: clase_grupo_id },
        include: {
          _count: { select: { inscripciones: true } },
        },
      });

      if (!claseGrupo || !claseGrupo.activo) {
        throw new BadRequestException(
          'La clase seleccionada no está disponible',
        );
      }

      // Validar cupo
      const cupoDisponible =
        claseGrupo.cupo_maximo - claseGrupo._count.inscripciones;
      if (cupoDisponible < estudiante_ids.length) {
        throw new BadRequestException(
          `La clase no tiene cupo suficiente. Disponible: ${cupoDisponible}`,
        );
      }
    }

    // 4. Crear suscripción
    const result = await this.preapprovalService.crear({
      tutorId: user.id,
      tutorEmail: user.email,
      tutorNombre: user.email?.split('@')[0] || 'Tutor',
      planId: plan_id,
      numeroHijo: estudiante_ids.length,
      // Campos opcionales para MercadoPago Bricks (cobro inmediato)
      cardTokenId: card_token_id,
      payerEmail: payer_email,
    });

    return {
      suscripcion_id: result.suscripcionId,
      init_point: result.checkoutUrl,
      monto_final: result.precioFinal,
      descuento_aplicado: result.descuentoPorcentaje,
      cobrado_inmediatamente: result.cobradoInmediatamente,
    };
  }

  /**
   * GET /suscripciones/mis-suscripciones
   * Lista todas las suscripciones del tutor autenticado
   */
  @Get('mis-suscripciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  async getMisSuscripciones(
    @GetUser() user: AuthUser,
  ): Promise<MisSuscripcionesResponseDto> {
    return this.queryService.getMisSuscripciones(user.id);
  }

  /**
   * GET /suscripciones/:id
   * Obtiene el detalle de una suscripción específica
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  async getSuscripcionDetalle(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ): Promise<SuscripcionDetalleDto> {
    return this.queryService.getSuscripcionDetalle(id, user.id);
  }

  /**
   * POST /suscripciones/:id/cancelar
   * Cancela una suscripción (efectivo al fin del período)
   */
  @Post(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  async cancelarSuscripcion(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ): Promise<CancelarSuscripcionResponseDto> {
    // Validar estado antes de cancelar
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id },
    });

    if (!suscripcion) {
      throw new BadRequestException('Suscripción no encontrada');
    }

    if (suscripcion.tutor_id !== user.id) {
      throw new BadRequestException(
        'No autorizado para cancelar esta suscripción',
      );
    }

    if (suscripcion.estado === EstadoSuscripcion.CANCELADA) {
      throw new BadRequestException('La suscripción ya está cancelada');
    }

    if (suscripcion.estado === EstadoSuscripcion.MOROSA) {
      throw new BadRequestException(
        'No se puede cancelar una suscripción morosa. Contacta a soporte.',
      );
    }

    await this.preapprovalService.cancelar({
      suscripcionId: id,
      tutorId: user.id,
      motivo: 'Cancelación solicitada por el tutor',
      canceladoPor: 'tutor',
    });

    // La fecha fin de acceso es el próximo cobro (ya pagado)
    const fechaFinAcceso = suscripcion.fecha_proximo_cobro || new Date();

    return {
      mensaje:
        'Suscripción cancelada exitosamente. Tendrás acceso hasta el fin del período pagado.',
      fecha_fin_acceso: fechaFinAcceso,
    };
  }

  /**
   * GET /suscripciones/:id/pagos
   * Historial de pagos de una suscripción
   */
  @Get(':id/pagos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  async getHistorialPagos(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ): Promise<HistorialPagosResponseDto> {
    return this.queryService.getHistorialPagos(id, user.id);
  }

  // ============================================================================
  // ADMIN
  // ============================================================================

  /**
   * GET /suscripciones/admin
   * Lista todas las suscripciones con filtros y paginación
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminListar(
    @Query() filtros: AdminFiltrosSuscripcionDto,
  ): Promise<AdminSuscripcionesResponseDto> {
    const { estado, plan_id, page = 1, limit = 20 } = filtros;
    return this.adminService.listarTodas({ estado, plan_id }, { page, limit });
  }

  /**
   * GET /suscripciones/admin/morosas
   * Lista suscripciones morosas y en período de gracia
   */
  @Get('admin/morosas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminListarMorosas(): Promise<MorosasResponseDto> {
    return this.adminService.listarMorosas();
  }

  /**
   * GET /suscripciones/admin/metricas
   * Dashboard de métricas de suscripciones
   */
  @Get('admin/metricas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminGetMetricas(): Promise<MetricasSuscripcionesDto> {
    return this.adminService.getMetricas();
  }
}
