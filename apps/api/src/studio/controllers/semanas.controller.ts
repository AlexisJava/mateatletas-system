import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../domain/constants/roles.constants';
import { GuardarSemanaDto, ValidarSemanaDto } from '../dto/guardar-semana.dto';
import { ObtenerSemanaService } from '../services/semanas/obtener-semana.service';
import { GuardarSemanaService } from '../services/semanas/guardar-semana.service';
import {
  ValidarSemanaService,
  ValidacionContexto,
} from '../services/semanas/validar-semana.service';
import { ObtenerCursoService } from '../services/cursos/obtener-curso.service';

/**
 * Controlador de semanas de Studio
 * Endpoints para gestión de semanas de cursos
 */
@ApiTags('Studio - Semanas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('studio/cursos/:cursoId/semanas')
export class SemanasController {
  constructor(
    private readonly obtenerSemanaService: ObtenerSemanaService,
    private readonly guardarSemanaService: GuardarSemanaService,
    private readonly validarSemanaService: ValidarSemanaService,
    private readonly obtenerCursoService: ObtenerCursoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar semanas de un curso' })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Lista de semanas' })
  async listar(@Param('cursoId', ParseUUIDPipe) cursoId: string) {
    return this.obtenerSemanaService.listarPorCurso(cursoId);
  }

  @Get(':numero')
  @ApiOperation({ summary: 'Obtener semana específica' })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @ApiParam({ name: 'numero', description: 'Número de semana (1-12)' })
  @ApiResponse({ status: 200, description: 'Semana encontrada' })
  @ApiResponse({ status: 404, description: 'Semana no encontrada' })
  async obtener(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('numero', ParseIntPipe) numero: number,
  ) {
    return this.obtenerSemanaService.ejecutar(cursoId, numero);
  }

  @Put(':numero')
  @ApiOperation({ summary: 'Guardar contenido de semana' })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @ApiParam({ name: 'numero', description: 'Número de semana (1-12)' })
  @ApiResponse({ status: 200, description: 'Semana guardada' })
  @ApiResponse({ status: 400, description: 'Validación fallida' })
  @ApiResponse({ status: 404, description: 'Semana no encontrada' })
  async guardar(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('numero', ParseIntPipe) numero: number,
    @Body() dto: GuardarSemanaDto,
  ) {
    return this.guardarSemanaService.ejecutar(cursoId, numero, dto);
  }

  @Post(':numero/validar')
  @ApiOperation({ summary: 'Validar JSON de semana sin guardar' })
  @ApiParam({ name: 'cursoId', description: 'ID del curso' })
  @ApiParam({ name: 'numero', description: 'Número de semana (1-12)' })
  @ApiResponse({ status: 200, description: 'Resultado de validación' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async validar(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('numero', ParseIntPipe) numero: number,
    @Body() dto: ValidarSemanaDto,
  ) {
    // Obtener contexto del curso
    const curso = await this.obtenerCursoService.ejecutar(cursoId);

    const contexto: ValidacionContexto = {
      casa: curso.casa,
      numeroSemanaEsperado: numero,
      actividadesEsperadas: curso.actividadesPorSemana,
    };

    return this.validarSemanaService.ejecutar(dto.contenido, contexto);
  }
}
