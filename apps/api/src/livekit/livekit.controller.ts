import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
import { TokenRequestDto, TokenResponseDto } from './dto/token-request.dto';

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
}
