import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MundoTipo } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/interfaces';
import { ContenidoEstudianteService, ProgresoService } from '../services';
import { UpdateProgresoDto } from '../dto';

/**
 * Controller para acceso de estudiantes a contenidos publicados
 * Solo accesible por usuarios con rol ESTUDIANTE
 */
@ApiTags('Contenidos - Estudiante')
@ApiBearerAuth()
@Controller('contenidos/estudiante')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ESTUDIANTE)
export class ContenidoEstudianteController {
  constructor(
    private readonly contenidoService: ContenidoEstudianteService,
    private readonly progresoService: ProgresoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar contenidos publicados para mi casa' })
  findPublicados(
    @GetUser() user: AuthUser,
    @Query('mundo') mundoTipo?: MundoTipo,
  ) {
    return this.contenidoService.findPublicados(user.id, mundoTipo);
  }

  @Get('progreso')
  @ApiOperation({ summary: 'Obtener todos mis progresos' })
  getAllProgresos(@GetUser() user: AuthUser) {
    return this.progresoService.getAllProgresos(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contenido completo para reproducir' })
  findOne(
    @GetUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contenidoId: string,
  ) {
    return this.contenidoService.findOnePublicado(user.id, contenidoId);
  }

  @Post(':id/progreso')
  @ApiOperation({ summary: 'Actualizar mi progreso en un contenido' })
  updateProgreso(
    @GetUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contenidoId: string,
    @Body() dto: UpdateProgresoDto,
  ) {
    return this.progresoService.updateProgreso(user.id, contenidoId, dto);
  }
}
