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
  NodoService,
} from '../services';
import {
  CreateContenidoDto,
  UpdateContenidoDto,
  QueryContenidosDto,
  CreateNodoDto,
  UpdateNodoDto,
  MoverNodoDto,
  ReordenarNodosDto,
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
    private readonly nodoService: NodoService,
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
  @ApiOperation({ summary: 'Obtener contenido completo con nodos' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contenidoAdminService.findOne(id);
  }

  @Get(':id/arbol')
  @ApiOperation({ summary: 'Obtener árbol jerárquico de nodos del contenido' })
  getArbol(@Param('id', ParseUUIDPipe) contenidoId: string) {
    return this.nodoService.getArbol(contenidoId);
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

  // ==================== GESTIÓN DE NODOS ====================

  @Post(':id/nodos')
  @ApiOperation({ summary: 'Agregar nodo a un contenido' })
  addNodo(
    @Param('id', ParseUUIDPipe) contenidoId: string,
    @Body() dto: CreateNodoDto,
  ) {
    return this.nodoService.addNodo(contenidoId, dto);
  }

  @Patch('nodos/:nodoId')
  @ApiOperation({ summary: 'Actualizar un nodo' })
  updateNodo(
    @Param('nodoId', ParseUUIDPipe) nodoId: string,
    @Body() dto: UpdateNodoDto,
  ) {
    return this.nodoService.updateNodo(nodoId, dto);
  }

  @Delete('nodos/:nodoId')
  @ApiOperation({ summary: 'Eliminar un nodo (no aplica a nodos bloqueados)' })
  removeNodo(@Param('nodoId', ParseUUIDPipe) nodoId: string) {
    return this.nodoService.removeNodo(nodoId);
  }

  @Patch(':id/nodos/reordenar')
  @ApiOperation({ summary: 'Reordenar nodos de un contenido' })
  reordenarNodos(
    @Param('id', ParseUUIDPipe) contenidoId: string,
    @Body() dto: ReordenarNodosDto,
  ) {
    return this.nodoService.reordenar(contenidoId, dto);
  }

  @Patch('nodos/:nodoId/mover')
  @ApiOperation({ summary: 'Mover nodo a otro padre' })
  moverNodo(
    @Param('nodoId', ParseUUIDPipe) nodoId: string,
    @Body() dto: MoverNodoDto,
  ) {
    return this.nodoService.moverNodo(nodoId, dto.nuevoParentId ?? null);
  }
}
