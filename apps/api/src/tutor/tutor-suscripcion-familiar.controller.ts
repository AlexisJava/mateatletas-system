/**
 * TutorSuscripcionFamiliarController - FASE 8.1 Cancelación con Arrepentimiento
 *
 * Endpoints para que el tutor gestione la cancelación de su suscripción familiar
 * con ventana de arrepentimiento de 24hs.
 *
 * Spec: docs/specs/SPEC_FASE_8_MERCADOPAGO.md
 *
 * Endpoints:
 * - POST /tutor/suscripcion-familiar/cancelar - Inicia cancelación (24hs arrepentimiento)
 * - POST /tutor/suscripcion-familiar/revertir-cancelacion - Revierte si < 24hs
 */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExactRoles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';

import { SuscripcionFamiliarCommandService } from '../suscripciones/services/suscripcion-familiar-command.service';
import {
  SuscripcionFamiliarError,
  SuscripcionFamiliarErrorCode,
} from '../suscripciones/types';
import { IniciarCancelacionDto } from '../suscripciones/dto/suscripcion-familiar.dto';

@ApiTags('Tutor - Suscripción Familiar')
@Controller('tutor/suscripcion-familiar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ExactRoles(Role.TUTOR)
@ApiBearerAuth()
export class TutorSuscripcionFamiliarController {
  constructor(
    private readonly commandService: SuscripcionFamiliarCommandService,
  ) {}

  @Post('cancelar')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar cancelación con ventana de arrepentimiento (24hs)',
    description:
      'FASE 8.1: Inicia el proceso de cancelación. El tutor tiene 24 horas para arrepentirse. ' +
      'Después de ese plazo, la cancelación se confirma automáticamente y se elimina TODO el progreso de los estudiantes.',
  })
  async cancelar(
    @Body() dto: IniciarCancelacionDto,
    @GetUser() user: AuthUser,
  ) {
    try {
      const result = await this.commandService.iniciarCancelacion({
        tutorId: user.id,
        motivo: dto.motivo,
      });

      // Retornar resultado directamente (sin wrapper)
      return result;
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        // NOT_FOUND → 404, resto → 400
        if (error.code === SuscripcionFamiliarErrorCode.NOT_FOUND) {
          throw new NotFoundException({
            message: error.message,
            code: error.code,
          });
        }
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }

  @Post('revertir-cancelacion')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Revertir cancelación pendiente (dentro de 24hs)',
    description:
      'FASE 8.1: Permite al tutor arrepentirse y revertir la cancelación antes de que pasen las 24 horas. ' +
      'Si se revierte, la suscripción vuelve a estado activo y el progreso de los estudiantes se conserva intacto.',
  })
  async revertirCancelacion(@GetUser() user: AuthUser) {
    try {
      const result = await this.commandService.revertirCancelacion({
        tutorId: user.id,
      });

      // Retornar resultado directamente (sin wrapper)
      return result;
    } catch (error) {
      if (error instanceof SuscripcionFamiliarError) {
        // NOT_FOUND → 404
        if (error.code === SuscripcionFamiliarErrorCode.NOT_FOUND) {
          throw new NotFoundException({
            message: error.message,
            code: error.code,
          });
        }
        // INVALID_STATE y otros → 400
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  }
}
