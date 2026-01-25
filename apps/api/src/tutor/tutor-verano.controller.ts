/**
 * ============================================================================
 * TUTOR VERANO CONTROLLER - Endpoints de verano para tutores
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md
 *
 * Endpoints:
 * - GET /tutor/verano/estado - Estado de verano para la familia
 * - POST /tutor/verano/decidir - Tomar decisión de verano
 * - POST /tutor/verano/solicitar-colonia - Cambio tardío a Colonia
 * - POST /tutor/verano/cancelar-colonia - Cancelar Colonia
 */

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

import { VeranoQueryService } from './services/verano-query.service';
import { VeranoCommandService } from './services/verano-command.service';
import {
  EstadoVeranoResponseDto,
  DecidirVeranoDto,
  DecidirVeranoResponseDto,
  SolicitarColoniaDto,
  SolicitarColoniaResponseDto,
  CancelarColoniaDto,
  CancelarColoniaResponseDto,
} from './dto/verano.dto';

@ApiTags('Tutor - Verano')
@Controller('tutor/verano')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR)
@ApiBearerAuth()
export class TutorVeranoController {
  constructor(
    private readonly veranoQuery: VeranoQueryService,
    private readonly veranoCommand: VeranoCommandService,
  ) {}

  /**
   * GET /tutor/verano/estado
   *
   * Obtiene el estado de verano para todos los hijos del tutor
   */
  @Get('estado')
  @ApiOperation({
    summary: 'Obtener estado de verano',
    description: `
      Retorna el estado de verano para todos los estudiantes del tutor.

      Incluye:
      - Si puede decidir (dentro del período 15 nov - 5 dic)
      - Fecha límite para decidir
      - Lista de estudiantes con su decisión actual
      - Cupos disponibles en grupos de Colonia
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de verano obtenido',
    type: EstadoVeranoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de tutor' })
  async getEstado(@GetUser() user: AuthUser): Promise<EstadoVeranoResponseDto> {
    return this.veranoQuery.getEstadoVerano(user.id);
  }

  /**
   * POST /tutor/verano/decidir
   *
   * Registra la decisión de verano para un estudiante
   */
  @Post('decidir')
  @ApiOperation({
    summary: 'Decidir opción de verano',
    description: `
      Registra la decisión de verano para un estudiante.

      Solo disponible entre el 15 de noviembre y el 5 de diciembre.

      Opciones:
      - COLONIA: Colonia de verano ($40k matrícula + $95k/mes)
      - CONTINUIDAD: Mantener cupo ($20k/mes)
      - BAJA: Cancelar suscripción (pierde cupo)
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Decisión registrada',
    type: DecidirVeranoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Fuera del período de decisión' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para este estudiante',
  })
  @ApiResponse({
    status: 404,
    description: 'No tiene suscripción familiar activa',
  })
  async decidir(
    @GetUser() user: AuthUser,
    @Body() dto: DecidirVeranoDto,
  ): Promise<DecidirVeranoResponseDto> {
    return this.veranoCommand.decidir(user.id, dto);
  }

  /**
   * POST /tutor/verano/solicitar-colonia
   *
   * Solicita cambio tardío de CONTINUIDAD a COLONIA
   */
  @Post('solicitar-colonia')
  @ApiOperation({
    summary: 'Solicitar cambio a Colonia',
    description: `
      Permite cambiar de CONTINUIDAD a COLONIA después del período de decisión.

      Condiciones:
      - Solo si hay cupo disponible en algún grupo
      - No se cobra matrícula ($40k) en cambio tardío
      - Empieza a pagar cuota de colonia ($95k/mes) desde el mes actual
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud procesada',
    type: SolicitarColoniaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para este estudiante',
  })
  @ApiResponse({
    status: 404,
    description: 'No tiene suscripción familiar activa',
  })
  async solicitarColonia(
    @GetUser() user: AuthUser,
    @Body() dto: SolicitarColoniaDto,
  ): Promise<SolicitarColoniaResponseDto> {
    return this.veranoCommand.solicitarColonia(user.id, dto);
  }

  /**
   * POST /tutor/verano/cancelar-colonia
   *
   * Cancela Colonia y pasa a CONTINUIDAD
   */
  @Post('cancelar-colonia')
  @ApiOperation({
    summary: 'Cancelar Colonia',
    description: `
      Cancela la inscripción a Colonia y pasa a modo CONTINUIDAD.

      Importante:
      - PIERDE la matrícula de $40k (no hay devolución)
      - Empieza a pagar cuota de continuidad ($20k/mes)
      - Mantiene el cupo para marzo
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Colonia cancelada',
    type: CancelarColoniaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No confirmó pérdida de matrícula',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para este estudiante',
  })
  @ApiResponse({
    status: 404,
    description: 'No tiene suscripción familiar activa',
  })
  async cancelarColonia(
    @GetUser() user: AuthUser,
    @Body() dto: CancelarColoniaDto,
  ): Promise<CancelarColoniaResponseDto> {
    return this.veranoCommand.cancelarColonia(user.id, dto);
  }
}
