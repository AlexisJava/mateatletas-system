import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OnboardingService, AvatarConfig } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingOwnershipGuard } from './guards/onboarding-ownership.guard';

/**
 * DTO para selección de mundos
 */
class SeleccionarMundosDto {
  mundosAsync: string[];
  mundosSync?: string[];
}

/**
 * DTO para registrar resultado de test
 */
class RegistrarTestDto {
  mundoId: string;
  puntaje: number;
  preguntasTotal: number;
  respuestasCorrectas: number;
}

/**
 * DTO para guardar avatar
 */
class GuardarAvatarDto {
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  accessories: string[];
}

/**
 * Controller para el flujo de Onboarding de estudiantes 2026
 *
 * Endpoints:
 * - GET /onboarding/:estudianteId/estado - Estado actual
 * - POST /onboarding/:estudianteId/iniciar - Iniciar onboarding
 * - POST /onboarding/:estudianteId/mundos - Seleccionar mundos
 * - POST /onboarding/:estudianteId/test - Registrar resultado test
 * - POST /onboarding/:estudianteId/confirmar-casa - Confirmar casa
 * - POST /onboarding/:estudianteId/avatar - Guardar avatar
 * - GET /onboarding/:estudianteId/progreso - Ver progreso
 *
 * SEGURIDAD:
 * - Requiere autenticación (JwtAuthGuard)
 * - Requiere ownership (OnboardingOwnershipGuard)
 * - Solo el tutor del estudiante, el estudiante mismo, o admin/docente pueden acceder
 *
 * OWASP A01:2021 - Broken Access Control (IDOR Prevention)
 */
@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OnboardingOwnershipGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Obtiene el estado actual del onboarding
   */
  @Get(':estudianteId/estado')
  @ApiOperation({ summary: 'Obtener estado del onboarding' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Estado del onboarding' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async getEstado(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    const estado =
      await this.onboardingService.getEstadoOnboarding(estudianteId);
    return { estado };
  }

  /**
   * Inicia el proceso de onboarding
   */
  @Post(':estudianteId/iniciar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar onboarding' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Onboarding iniciado' })
  @ApiResponse({ status: 400, description: 'Ya fue iniciado' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async iniciar(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    const estado = await this.onboardingService.iniciarOnboarding(estudianteId);
    return { estado, mensaje: 'Onboarding iniciado correctamente' };
  }

  /**
   * Registra la selección de mundos
   */
  @Post(':estudianteId/mundos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seleccionar mundos' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Mundos seleccionados' })
  @ApiResponse({ status: 400, description: 'Selección inválida' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async seleccionarMundos(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
    @Body() dto: SeleccionarMundosDto,
  ) {
    const estado = await this.onboardingService.seleccionarMundos(
      estudianteId,
      dto.mundosAsync,
      dto.mundosSync ?? [],
    );
    return { estado, mensaje: 'Mundos seleccionados correctamente' };
  }

  /**
   * Registra el resultado de un test de ubicación
   */
  @Post(':estudianteId/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar resultado de test de ubicación' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Test registrado' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async registrarTest(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
    @Body() dto: RegistrarTestDto,
  ) {
    const resultado = await this.onboardingService.registrarResultadoTest(
      estudianteId,
      dto.mundoId,
      dto.puntaje,
      dto.preguntasTotal,
      dto.respuestasCorrectas,
    );
    return {
      resultado,
      mensaje: resultado.bajo_de_casa
        ? 'Test completado. Se ha sugerido un cambio de casa.'
        : 'Test completado exitosamente',
    };
  }

  /**
   * Confirma la casa asignada
   */
  @Post(':estudianteId/confirmar-casa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar casa asignada' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Casa confirmada' })
  @ApiResponse({ status: 400, description: 'Estado incorrecto' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async confirmarCasa(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    const estado = await this.onboardingService.confirmarCasa(estudianteId);
    return { estado, mensaje: 'Casa confirmada correctamente' };
  }

  /**
   * Guarda la configuración del avatar
   */
  @Post(':estudianteId/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar configuración del avatar' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Avatar guardado' })
  @ApiResponse({ status: 400, description: 'Estado incorrecto' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async guardarAvatar(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
    @Body() dto: GuardarAvatarDto,
  ) {
    const avatarConfig: AvatarConfig = {
      skin: dto.skin,
      hair: dto.hair,
      eyes: dto.eyes,
      outfit: dto.outfit,
      accessories: dto.accessories,
    };
    const estado = await this.onboardingService.guardarAvatar(
      estudianteId,
      avatarConfig,
    );
    return {
      estado,
      mensaje: '¡Onboarding completado! Bienvenido a Mateatletas 2026',
    };
  }

  /**
   * Obtiene el progreso del onboarding
   */
  @Get(':estudianteId/progreso')
  @ApiOperation({ summary: 'Ver progreso del onboarding' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Progreso del onboarding' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  async getProgreso(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    const progreso =
      await this.onboardingService.getProgresoOnboarding(estudianteId);
    return { progreso };
  }
}
