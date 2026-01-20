/**
 * SuscripcionFamiliarController - Endpoints para Suscripciones Familiares 2026
 *
 * Modelo de negocio 2026:
 * - Una suscripción por familia (tutor)
 * - Múltiples inscripciones a actividades, CADA UNA CON SU PROPIO TIER
 * - Descuento 10% se aplica al producto de MENOR VALOR (no al 2do cronológicamente)
 *
 * Endpoints Tutor:
 * - POST /familiar - Crear suscripción familiar
 * - GET /familiar - Obtener mi suscripción
 * - POST /familiar/inscripciones - Agregar inscripciones
 * - DELETE /familiar/inscripciones - Dar de baja inscripciones
 * - PATCH /familiar/inscripciones/horario - Cambiar horario de inscripción
 * - PATCH /familiar/inscripciones/producto - Cambiar producto de inscripción
 * - PATCH /familiar/inscripciones/:id/tier - Cambiar tier de una inscripción (NUEVO 2026)
 * - PATCH /familiar/inscripciones/:id/pausar - Pausar inscripción individual (NUEVO)
 * - PATCH /familiar/inscripciones/:id/reactivar - Reactivar inscripción pausada (NUEVO)
 * - PATCH /familiar/tier - Cambiar tier de suscripción (deprecated)
 * - POST /familiar/cancelar - Cancelar suscripción
 * - POST /familiar/pausar - Pausar suscripción completa (NUEVO)
 * - POST /familiar/reactivar - Reactivar suscripción pausada (NUEVO)
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
  Patch,
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
  CambiarHorarioDto,
  CambiarProductoDto,
  CambiarTierDto,
  CambiarTierInscripcionDto,
  SimularMontoQueryDto,
  AdminFiltrosDto,
  AdminPausarSuscripcionDto,
  AdminCancelarSuscripcionDto,
  AdminReactivarSuscripcionDto,
  AdminCambiarTierInscripcionDto,
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
          tier: i.tier, // MODELO 2026: tier por inscripción
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
          tier: i.tier, // MODELO 2026: tier por inscripción
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

  @Patch('inscripciones/horario')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar horario de una inscripción' })
  async cambiarHorario(
    @Body() dto: CambiarHorarioDto,
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
      const result = await this.commandService.cambiarHorario({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        inscripcionId: dto.inscripcionId,
        nuevoClaseGrupoId: dto.nuevoClaseGrupoId,
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

  @Patch('inscripciones/producto')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar producto de una inscripción' })
  async cambiarProducto(
    @Body() dto: CambiarProductoDto,
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
      const result = await this.commandService.cambiarProducto({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        inscripcionId: dto.inscripcionId,
        nuevoProductoId: dto.nuevoProductoId,
        nuevoClaseGrupoId: dto.nuevoClaseGrupoId,
        nuevaComisionId: dto.nuevaComisionId,
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

  @Patch('inscripciones/:id/tier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar tier de una inscripción específica (MODELO 2026)',
    description:
      'Permite cambiar el tier de una inscripción individual. El monto mensual se recalcula aplicando el descuento del 10% al producto de MENOR valor.',
  })
  async cambiarTierInscripcion(
    @Param('id', ParseIdPipe) inscripcionId: string,
    @Body() dto: CambiarTierInscripcionDto,
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.cambiarTierInscripcion({
        inscripcionId,
        tutorId: user.id,
        nuevoTier: dto.nuevoTier,
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

  /**
   * @deprecated Usar PATCH /inscripciones/:id/tier para cambiar tier por inscripción
   */
  @Patch('tier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar tier de la suscripción (DEPRECATED)',
    description:
      'Deprecado: Usar PATCH /inscripciones/:id/tier para cambiar tier de inscripciones individuales',
    deprecated: true,
  })
  async cambiarTier(@Body() dto: CambiarTierDto, @GetUser() user: AuthUser) {
    const suscripcion = await this.queryService.obtenerPorTutorId(user.id);

    if (!suscripcion) {
      throw new BadRequestException({
        message: 'No tienes una suscripción familiar activa',
        code: SuscripcionFamiliarErrorCode.NOT_FOUND,
      });
    }

    try {
      const result = await this.commandService.cambiarTier({
        suscripcionFamiliarId: suscripcion.id,
        tutorId: user.id,
        nuevoTier: dto.nuevoTier,
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
  // TUTOR - PAUSAR/REACTIVAR INSCRIPCIONES
  // ============================================================================

  @Patch('inscripciones/:id/pausar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pausar una inscripción individual',
    description:
      'Permite pausar una inscripción específica sin afectar las demás. El monto mensual se recalcula automáticamente.',
  })
  async pausarInscripcion(
    @Param('id', ParseIdPipe) inscripcionId: string,
    @Body() dto: { motivo?: string },
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.pausarInscripcion({
        inscripcionId,
        tutorId: user.id,
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

  @Patch('inscripciones/:id/reactivar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivar una inscripción pausada',
    description:
      'Reactiva una inscripción que estaba pausada. El monto mensual se recalcula automáticamente.',
  })
  async reactivarInscripcion(
    @Param('id', ParseIdPipe) inscripcionId: string,
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.reactivarInscripcion({
        inscripcionId,
        tutorId: user.id,
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

  @Post('pausar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pausar suscripción completa',
    description:
      'Pausa la suscripción familiar y todas sus inscripciones activas. También pausa el cobro automático.',
  })
  async tutorPausarSuscripcion(
    @Body() dto: { motivo?: string },
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.tutorPausarSuscripcion({
        tutorId: user.id,
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

  @Post('reactivar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ExactRoles(Role.TUTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivar suscripción pausada',
    description:
      'Reactiva la suscripción familiar y todas sus inscripciones. También reactiva el cobro automático.',
  })
  async tutorReactivarSuscripcion(@GetUser() user: AuthUser) {
    try {
      const result = await this.commandService.tutorReactivarSuscripcion({
        tutorId: user.id,
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

  @Post('admin/:id/pausar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pausar una suscripción familiar (Admin)',
    description:
      'Cambia el estado a PAUSED y pausa el cobro automático en MercadoPago. Solo funciona con suscripciones AUTHORIZED.',
  })
  async adminPausar(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: AdminPausarSuscripcionDto,
  ) {
    try {
      const result = await this.commandService.pausar({
        suscripcionFamiliarId: id,
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

  @Post('admin/:id/reactivar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivar una suscripción pausada (Admin)',
    description:
      'Cambia el estado de PAUSED a AUTHORIZED y reactiva el cobro automático en MercadoPago.',
  })
  async adminReactivar(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: AdminReactivarSuscripcionDto,
  ) {
    try {
      const result = await this.commandService.reactivar({
        suscripcionFamiliarId: id,
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

  @Post('admin/:id/cancelar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancelar una suscripción familiar (Admin)',
    description:
      'Cancela la suscripción y el cobro automático en MercadoPago. Esta acción es irreversible.',
  })
  async adminCancelar(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: AdminCancelarSuscripcionDto,
  ) {
    try {
      // Obtener el tutor_id de la suscripción para reusar el método cancelar existente
      const suscripcion = await this.queryService.obtenerPorId(id);

      await this.commandService.cancelar({
        suscripcionFamiliarId: id,
        tutorId: suscripcion.tutorId,
        motivo: dto.motivo,
        canceladoPor: 'admin',
      });

      return {
        success: true,
        message: 'Suscripción cancelada exitosamente por admin',
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

  @Patch('admin/inscripciones/:inscripcionId/tier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar tier de una inscripción (Admin)',
    description:
      'Permite al admin cambiar el tier de cualquier inscripción sin validación de ownership. Recalcula el monto mensual.',
  })
  async adminCambiarTierInscripcion(
    @Param('inscripcionId', ParseIdPipe) inscripcionId: string,
    @Body() dto: AdminCambiarTierInscripcionDto,
  ) {
    try {
      const result = await this.commandService.adminCambiarTierInscripcion({
        inscripcionId,
        nuevoTier: dto.nuevoTier,
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
}
