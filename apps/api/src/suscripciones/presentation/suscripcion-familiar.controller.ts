/**
 * SuscripcionFamiliarController - Endpoints para Suscripciones Familiares 2026
 *
 * Modelo de negocio:
 * - Una suscripción por familia (tutor)
 * - Múltiples inscripciones a actividades
 * - Descuento 10% desde la 2da actividad
 *
 * Endpoints:
 * - POST /familiar - Crear suscripción familiar
 * - GET /familiar - Obtener mi suscripción
 * - POST /familiar/inscripciones - Agregar inscripciones
 * - DELETE /familiar/inscripciones - Dar de baja inscripciones
 * - POST /familiar/cancelar - Cancelar suscripción
 * - GET /familiar/simular - Simular monto con nuevos productos
 *
 * Endpoints Admin:
 * - GET /familiar/admin - Listar todas las suscripciones familiares
 * - GET /familiar/admin/:id - Detalle de una suscripción
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, ExactRoles, Role } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/interfaces';
import { ParseIdPipe } from '../../common/pipes';

import { SuscripcionFamiliarCommandService } from '../services/suscripcion-familiar-command.service';
import { SuscripcionFamiliarQueryService } from '../services/suscripcion-familiar-query.service';
import {
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../types';
import {
  CrearSuscripcionFamiliarDto,
  AgregarInscripcionesDto,
  BajaInscripcionesDto,
  SimularMontoQueryDto,
  AdminFiltrosDto,
} from '../dto/suscripcion-familiar.dto';

@ApiTags('Suscripciones Familiares 2026')
@Controller('suscripciones/familiar')
export class SuscripcionFamiliarController {
  constructor(
    private readonly commandService: SuscripcionFamiliarCommandService,
    private readonly queryService: SuscripcionFamiliarQueryService,
  ) {}

  // ============================================================================
  // TUTOR ENDPOINTS
  // ============================================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear suscripción familiar' })
  async crear(
    @Body() dto: CrearSuscripcionFamiliarDto,
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.crear({
        tutorId: user.id,
        tier: dto.tier,
        tutorEmail: user.email,
        tutorNombre: user.email?.split('@')[0] ?? 'Tutor',
        inscripciones: dto.inscripciones?.map((i) => ({
          estudianteId: i.estudianteId,
          productoId: i.productoId,
          claseGrupoId: i.claseGrupoId,
          comisionId: i.comisionId,
        })),
        cardTokenId: dto.cardTokenId,
        payerEmail: dto.payerEmail,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
          details: error.details,
        });
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi suscripción familiar' })
  async obtenerMiSuscripcion(@GetUser() user: AuthUser) {
    const suscripcion = await this.queryService.obtenerPorTutorId(user.id);

    if (!suscripcion) {
      return {
        success: true,
        data: null,
        message: 'No tienes una suscripción familiar activa',
      };
    }

    return {
      success: true,
      data: suscripcion,
    };
  }

  @Post('inscripciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar inscripciones a la suscripción' })
  async agregarInscripciones(
    @Body() dto: AgregarInscripcionesDto,
    @GetUser() user: AuthUser,
  ) {
    // Obtener suscripción del tutor
    const suscripcion = await this.queryService.obtenerPorTutorId(user.id);

    if (!suscripcion) {
      throw new BadRequestException({
        message: 'No tienes una suscripción familiar activa',
        code: SuscripcionFamiliarErrorCode.NOT_FOUND,
      });
    }

    try {
      const result = await this.commandService.agregarInscripciones({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        inscripciones: dto.inscripciones.map((i) => ({
          estudianteId: i.estudianteId,
          productoId: i.productoId,
          claseGrupoId: i.claseGrupoId,
          comisionId: i.comisionId,
        })),
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }

  @Delete('inscripciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar de baja inscripciones' })
  async bajaInscripciones(
    @Body() dto: BajaInscripcionesDto,
    @GetUser() user: AuthUser,
  ) {
    const suscripcion = await this.queryService.obtenerPorTutorId(user.id);

    if (!suscripcion) {
      throw new BadRequestException({
        message: 'No tienes una suscripción familiar activa',
        code: SuscripcionFamiliarErrorCode.NOT_FOUND,
      });
    }

    try {
      const result = await this.commandService.bajaInscripciones({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        inscripcionIds: dto.inscripcionIds,
        motivo: dto.motivo,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }

  @Post('cancelar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar suscripción familiar' })
  async cancelar(@GetUser() user: AuthUser) {
    const suscripcion = await this.queryService.obtenerPorTutorId(user.id);

    if (!suscripcion) {
      throw new BadRequestException({
        message: 'No tienes una suscripción familiar activa',
        code: SuscripcionFamiliarErrorCode.NOT_FOUND,
      });
    }

    try {
      await this.commandService.cancelar({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        motivo: 'Cancelación solicitada por el tutor',
        canceladoPor: 'tutor',
      });

      return {
        success: true,
        message: 'Suscripción cancelada exitosamente',
      };
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }

  @Get('simular')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simular monto mensual con nuevos productos' })
  async simularMonto(
    @Query() query: SimularMontoQueryDto,
    @GetUser() user: AuthUser,
  ) {
    const productoIds = query.productoIds.split(',').filter(Boolean);

    const resultado = await this.queryService.simularMonto(
      user.id,
      productoIds,
    );

    return {
      success: true,
      data: resultado,
    };
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las suscripciones familiares' })
  async adminListar(@Query() filtros: AdminFiltrosDto) {
    const resultado = await this.queryService.listarTodas({
      estado: filtros.estado,
      page: filtros.page ?? 1,
      limit: filtros.limit ?? 20,
    });

    return {
      success: true,
      data: resultado.data,
      metadata: {
        total: resultado.total,
        page: resultado.page,
        limit: resultado.limit,
        totalPages: resultado.totalPages,
      },
    };
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalle de una suscripción familiar' })
  async adminDetalle(@Param('id', ParseIdPipe) id: string) {
    try {
      const suscripcion = await this.queryService.obtenerPorId(id);

      return {
        success: true,
        data: suscripcion,
      };
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }
}
