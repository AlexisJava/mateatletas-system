import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';
import { LivekitTokenService } from './services/livekit-token.service';
import {
  TokenRequestDto,
  TokenResponseDto,
  ControlPalabraDto,
  ControlPalabraResponseDto,
} from './dto/token-request.dto';

/**
 * Controller para generación de tokens LiveKit
 * Permite a docentes y estudiantes obtener tokens para conectarse a clases en vivo
 */
@ApiTags('LiveKit')
@ApiBearerAuth()
@Controller('livekit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LivekitController {
  constructor(private readonly livekitTokenService: LivekitTokenService) {}

  /**
   * POST /livekit/token/docente - Obtener token para docente (puede transmitir)
   * @param user - Usuario autenticado (docente)
   * @param dto - { claseGrupoId } o { comisionId }
   * @returns Token, wsUrl y roomName
   */
  @Post('token/docente')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Obtener token LiveKit para docente',
    description:
      'Genera un token con permisos de publicación (canPublish: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Token generado exitosamente',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Debe proporcionar exactamente un ID (claseGrupoId o comisionId)',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para esta clase/comisión',
  })
  async getTokenDocente(
    @GetUser() user: AuthUser,
    @Body() dto: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    return this.livekitTokenService.generarTokenDocente(user.id, dto);
  }

  /**
   * POST /livekit/token/estudiante - Obtener token para estudiante (solo puede ver)
   * @param user - Usuario autenticado (estudiante)
   * @param dto - { claseGrupoId } o { comisionId }
   * @returns Token, wsUrl y roomName
   */
  @Post('token/estudiante')
  @Roles(Role.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener token LiveKit para estudiante',
    description:
      'Genera un token sin permisos de publicación (canPublish: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Token generado exitosamente',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Debe proporcionar exactamente un ID (claseGrupoId o comisionId)',
  })
  @ApiResponse({
    status: 403,
    description: 'No estás inscrito en esta clase/comisión',
  })
  async getTokenEstudiante(
    @GetUser() user: AuthUser,
    @Body() dto: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    return this.livekitTokenService.generarTokenEstudiante(user.id, dto);
  }

  // ============================================================================
  // CONTROL DE PALABRA (DAR/QUITAR MICRÓFONO)
  // ============================================================================

  private readonly logger = new Logger(LivekitController.name);

  /**
   * POST /livekit/dar-palabra - Habilitar micrófono de un estudiante
   * @param user - Usuario autenticado (docente)
   * @param dto - { claseGrupoId o comisionId, estudianteId }
   */
  @Post('dar-palabra')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Dar palabra a un estudiante',
    description: 'Habilita el micrófono de un estudiante en la clase en vivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Palabra concedida exitosamente',
    type: ControlPalabraResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para esta clase/comisión',
  })
  async darPalabra(
    @GetUser() user: AuthUser,
    @Body() dto: ControlPalabraDto,
  ): Promise<ControlPalabraResponseDto> {
    const roomName = this.livekitTokenService.buildRoomName(dto);

    try {
      await this.livekitTokenService.darPalabra(roomName, dto.estudianteId);
      this.logger.log(
        `Docente ${user.id} dio palabra a estudiante ${dto.estudianteId} en sala ${roomName}`,
      );
      return {
        exito: true,
        mensaje: 'Palabra concedida. El estudiante puede hablar.',
      };
    } catch (error) {
      this.logger.error(
        `Error al dar palabra: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return {
        exito: false,
        mensaje:
          'No se pudo dar palabra. El estudiante puede no estar conectado.',
      };
    }
  }

  /**
   * POST /livekit/quitar-palabra - Deshabilitar micrófono de un estudiante
   * @param user - Usuario autenticado (docente)
   * @param dto - { claseGrupoId o comisionId, estudianteId }
   */
  @Post('quitar-palabra')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Quitar palabra a un estudiante',
    description:
      'Deshabilita el micrófono de un estudiante en la clase en vivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Palabra quitada exitosamente',
    type: ControlPalabraResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para esta clase/comisión',
  })
  async quitarPalabra(
    @GetUser() user: AuthUser,
    @Body() dto: ControlPalabraDto,
  ): Promise<ControlPalabraResponseDto> {
    const roomName = this.livekitTokenService.buildRoomName(dto);

    try {
      await this.livekitTokenService.quitarPalabra(roomName, dto.estudianteId);
      this.logger.log(
        `Docente ${user.id} quitó palabra a estudiante ${dto.estudianteId} en sala ${roomName}`,
      );
      return {
        exito: true,
        mensaje: 'Palabra quitada. El estudiante ya no puede hablar.',
      };
    } catch (error) {
      this.logger.error(
        `Error al quitar palabra: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return {
        exito: false,
        mensaje:
          'No se pudo quitar palabra. El estudiante puede no estar conectado.',
      };
    }
  }
}
