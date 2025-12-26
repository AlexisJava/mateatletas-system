import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/interfaces';
import {
  ContenidoAdminService,
  ContenidoPublicacionService,
  SlideService,
} from '../services';
import {
  CreateContenidoDto,
  UpdateContenidoDto,
  QueryContenidosDto,
  CreateSlideDto,
  UpdateSlideDto,
  ReordenarSlidesDto,
} from '../dto';

/**
 * Controller para administración de contenidos educativos
 * Solo accesible por usuarios con rol ADMIN
 */
@ApiTags('Contenidos - Admin')
@ApiBearerAuth()
@Controller('contenidos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContenidoAdminController {
  constructor(
    private readonly contenidoAdminService: ContenidoAdminService,
    private readonly publicacionService: ContenidoPublicacionService,
    private readonly slideService: SlideService,
  ) {}

  // ==================== CRUD DE CONTENIDOS ====================

  @Post()
  @ApiOperation({ summary: 'Crear nuevo contenido como BORRADOR' })
  create(@GetUser() user: AuthUser, @Body() dto: CreateContenidoDto) {
    return this.contenidoAdminService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contenidos con filtros y paginación' })
  findAll(@Query() query: QueryContenidosDto) {
    return this.contenidoAdminService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contenido completo con slides' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contenidoAdminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar contenido (solo en BORRADOR)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContenidoDto,
  ) {
    return this.contenidoAdminService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar contenido (solo en BORRADOR)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contenidoAdminService.remove(id);
  }

  // ==================== PUBLICACIÓN ====================

  @Post(':id/publicar')
  @ApiOperation({ summary: 'Publicar contenido (BORRADOR → PUBLICADO)' })
  publicar(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionService.publicar(id);
  }

  @Post(':id/archivar')
  @ApiOperation({ summary: 'Archivar contenido (PUBLICADO → ARCHIVADO)' })
  archivar(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicacionService.archivar(id);
  }

  // ==================== GESTIÓN DE SLIDES ====================

  @Post(':id/slides')
  @ApiOperation({ summary: 'Agregar slide a un contenido' })
  addSlide(
    @Param('id', ParseUUIDPipe) contenidoId: string,
    @Body() dto: CreateSlideDto,
  ) {
    return this.slideService.addSlide(contenidoId, dto);
  }

  @Patch(':id/slides/:slideId')
  @ApiOperation({ summary: 'Actualizar un slide' })
  updateSlide(
    @Param('id', ParseUUIDPipe) _contenidoId: string,
    @Param('slideId', ParseUUIDPipe) slideId: string,
    @Body() dto: UpdateSlideDto,
  ) {
    // contenidoId validado en servicio (slide pertenece al contenido)
    return this.slideService.updateSlide(slideId, dto);
  }

  @Delete(':id/slides/:slideId')
  @ApiOperation({ summary: 'Eliminar un slide' })
  removeSlide(
    @Param('id', ParseUUIDPipe) _contenidoId: string,
    @Param('slideId', ParseUUIDPipe) slideId: string,
  ) {
    return this.slideService.removeSlide(slideId);
  }

  @Patch(':id/slides/reordenar')
  @ApiOperation({ summary: 'Reordenar slides de un contenido' })
  reordenarSlides(
    @Param('id', ParseUUIDPipe) contenidoId: string,
    @Body() dto: ReordenarSlidesDto,
  ) {
    return this.slideService.reordenar(contenidoId, dto);
  }
}
