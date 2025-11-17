import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { EstudiantesFacadeService } from './estudiantes-facade.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import { CrearEstudiantesConTutorDto } from './dto/crear-estudiantes-con-tutor.dto';
import {
  AsignarClasesDto,
  CopiarEstudianteDto,
  BuscarEstudiantePorEmailDto,
} from './dto/asignar-clases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { EstudianteOwnershipGuard } from './guards/estudiante-ownership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser, RequestWithAuthUser } from '../auth/interfaces';

/**
 * Controller para endpoints de estudiantes
 * Define las rutas HTTP para operaciones CRUD
 * Todas las rutas requieren autenticación JWT
 */
@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesFacadeService) {}

  /**
   * POST /estudiantes - Crear nuevo estudiante
   * @param createDto - Datos del estudiante
   * @param user - Usuario autenticado (del JWT)
   * @returns Estudiante creado
   */
  @Post()
  async create(
    @Body() createDto: CreateEstudianteDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.create(user.id, createDto);
  }

  /**
   * GET /estudiantes/admin/all - Listar TODOS los estudiantes (solo admin)
   * @returns Lista completa de estudiantes
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAllForAdmin() {
    return this.estudiantesService.findAll();
  }

  /**
   * GET /estudiantes - Listar estudiantes del tutor autenticado
   * @param query - Filtros y paginación
   * @param user - Usuario autenticado
   * @returns Lista de estudiantes con metadata
   */
  @Get()
  async findAll(
    @Query() query: QueryEstudiantesDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.findAllByTutor(user.id, query);
  }

  /**
   * GET /estudiantes/count - Contar estudiantes del tutor
   * @param user - Usuario autenticado
   * @returns Total de estudiantes
   */
  @Get('count')
  async count(@GetUser() user: AuthUser) {
    const count = await this.estudiantesService.countByTutor(user.id);
    return { count };
  }

  /**
   * GET /estudiantes/estadisticas - Estadísticas de estudiantes
   * @param user - Usuario autenticado
   * @returns Estadísticas agregadas
   */
  @Get('estadisticas')
  async getEstadisticas(@GetUser() user: AuthUser) {
    return this.estudiantesService.getEstadisticas(user.id);
  }

  /**
   * PATCH /estudiantes/avatar - Actualizar avatar 3D Ready Player Me del estudiante logueado
   * @param req - Request con usuario autenticado
   * @param body - { avatarUrl: string }
   * @returns Estudiante actualizado
   */
  @Patch('avatar')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async actualizarAvatar3D(
    @Request() req: RequestWithAuthUser,
    @Body() body: { avatarUrl: string },
  ) {
    const estudianteId = req.user.id;


    // Validar que sea URL válida de Ready Player Me
    if (!body.avatarUrl || !body.avatarUrl.includes('readyplayer.me')) {
      throw new BadRequestException('URL de avatar inválida');
    }

    // Actualizar avatar 3D sin validación de ownership (el estudiante actualiza su propio avatar)
    const resultado = await this.estudiantesService.updateAvatar3D(estudianteId, body.avatarUrl);


    return resultado;
  }

  /**
   * PATCH /estudiantes/animacion - Actualizar animación idle del estudiante logueado
   * @param req - Request con usuario autenticado
   * @param body - { animacion_idle_url: string }
   * @returns Estudiante actualizado
   */
  @Patch('animacion')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async actualizarAnimacion(
    @Request() req: RequestWithAuthUser,
    @Body() body: { animacion_idle_url: string },
  ) {
    const estudianteId = req.user.id;


    // Validar que sea URL válida
    if (!body.animacion_idle_url || !body.animacion_idle_url.includes('.glb')) {
      throw new BadRequestException('URL de animación inválida');
    }

    // Actualizar animación idle
    const resultado = await this.estudiantesService.updateAnimacionIdle(
      estudianteId,
      body.animacion_idle_url,
    );


    return resultado;
  }

  /**
   * GET /estudiantes/mi-avatar - Obtener avatar del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns { avatarUrl: string, tiene_avatar: boolean }
   */
  @Get('mi-avatar')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMiAvatar(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;


    // Buscar directamente sin ownership check (el estudiante accede a sus propios datos)
    const estudiante = await this.estudiantesService.findOneById(estudianteId);


    if (estudiante.avatarUrl) {
    }

    const resultado = {
      avatarUrl: estudiante.avatarUrl,
      tiene_avatar: !!estudiante.avatarUrl,
    };


    return resultado;
  }

  /**
   * GET /estudiantes/mi-proxima-clase - Obtener próxima clase del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns Información de la próxima clase o null si no hay ninguna
   */
  @Get('mi-proxima-clase')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMiProximaClase(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;

    const resultado = await this.estudiantesService.obtenerProximaClase(estudianteId);

    if (resultado) {
    }

    return resultado;
  }

  /**
   * GET /estudiantes/mis-companeros - Obtener compañeros de ClaseGrupo del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns Lista de compañeros con puntos ordenados descendente
   */
  @Get('mis-companeros')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisCompaneros(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerCompanerosDeClase(estudianteId);
  }

  /**
   * GET /estudiantes/mis-sectores - Obtener sectores en los que está inscrito el estudiante
   * Para el portal de estudiantes - sección "Tareas Asignadas"
   * Devuelve: Matemática, Programación, Ciencias (según inscripciones)
   * @param req - Request con usuario autenticado
   * @returns Array de sectores con grupos agrupados
   */
  @Get('mis-sectores')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisSectores(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerMisSectores(estudianteId);
  }

  /**
   * GET /estudiantes/:id/detalle-completo - Obtener detalle COMPLETO del estudiante
   * Para el portal de tutores - pestaña "Mis Hijos"
   * Incluye: gamificación, asistencias, inscripciones, estadísticas
   * @param id - ID del estudiante
   * @param user - Usuario autenticado (tutor)
   * @returns Detalle completo del estudiante con todas sus métricas
   */
  @Get(':id/detalle-completo')
  @UseGuards(EstudianteOwnershipGuard)
  async getDetalleCompleto(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.estudiantesService.getDetalleCompleto(id, user.id);
  }

  /**
   * GET /estudiantes/:id - Obtener un estudiante específico
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Estudiante con sus relaciones
   */
  @Get(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async findOne(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.estudiantesService.findOne(id, user.id);
  }

  /**
   * PATCH /estudiantes/:id - Actualizar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param updateDto - Datos a actualizar
   * @param user - Usuario autenticado
   * @returns Estudiante actualizado
   */
  @Patch(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstudianteDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.update(id, user.id, updateDto);
  }

  /**
   * PATCH /estudiantes/:id/avatar - Actualizar avatar del estudiante
   *
   * SECURITY FIX (2025-10-18):
   * - Agregado EstudianteOwnershipGuard para prevenir modificación no autorizada
   * - Solo el tutor dueño del estudiante puede actualizar el avatar
   * - Previene CVE-INTERNAL-001: Unauthorized avatar modification
   *
   * @param id - ID del estudiante
   * @param body - { avatarUrl: string }
   * @param user - Usuario autenticado (inyectado por JwtAuthGuard, usado por EstudianteOwnershipGuard)
   * @returns Estudiante actualizado con nuevo avatar
   * @throws {ForbiddenException} Si el tutor no es dueño del estudiante
   * @throws {NotFoundException} Si el estudiante no existe
   */
  @Patch(':id/avatar')
  @UseGuards(EstudianteOwnershipGuard)
  async updateAvatar(
    @Param('id') id: string,
    @Body() body: { avatar_gradient: number },
    @GetUser() _user: AuthUser,
  ) {
    // Nota: No necesitamos usar '_user' aquí porque el guard ya validó ownership
    // El guard se ejecuta ANTES de este método y rechaza requests no autorizados
    return this.estudiantesService.updateAvatarGradient(id, body.avatar_gradient);
  }

  /**
   * DELETE /estudiantes/:id - Eliminar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    await this.estudiantesService.remove(id, user.id);
    return {
      message: 'Estudiante eliminado exitosamente',
    };
  }

  /**
   * POST /estudiantes/crear-con-tutor - Crear estudiantes con tutor en un sector (Admin)
   * @param dto - Datos de estudiantes y tutor
   * @returns Estudiantes creados con credenciales generadas
   */
  @Post('crear-con-tutor')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async crearConTutor(@Body() dto: CrearEstudiantesConTutorDto) {
    return this.estudiantesService.crearEstudiantesConTutor(dto);
  }

  /**
   * PATCH /estudiantes/:id/copiar-a-sector - Copiar estudiante a otro sector (Admin)
   * @param id - ID del estudiante
   * @param dto - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  @Patch(':id/copiar-a-sector')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async copiarASector(
    @Param('id') id: string,
    @Body() dto: CopiarEstudianteDto,
  ) {
    return this.estudiantesService.copiarEstudianteASector(id, dto.sectorId);
  }

  /**
   * POST /estudiantes/copiar-por-email - Buscar estudiante por email y copiarlo a sector (Admin)
   * @param body - Email del estudiante y sector destino
   * @returns Estudiante con sector actualizado
   */
  @Post('copiar-por-email')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async copiarPorEmail(
    @Body() body: BuscarEstudiantePorEmailDto & { sectorId: string },
  ) {
    return this.estudiantesService.copiarEstudiantePorDNIASector(
      body.email,
      body.sectorId,
    );
  }

  /**
   * POST /estudiantes/:id/asignar-clases - Asignar clases a estudiante (Admin)
   * @param id - ID del estudiante
   * @param dto - IDs de las clases
   * @returns Inscripciones creadas
   */
  @Post(':id/asignar-clases')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async asignarClases(@Param('id') id: string, @Body() dto: AsignarClasesDto) {
    if (dto.clasesIds.length === 1) {
      return [
        await this.estudiantesService.asignarClaseAEstudiante(
          id,
          dto.clasesIds[0],
        ),
      ];
    }
    return this.estudiantesService.asignarClasesAEstudiante(id, dto.clasesIds);
  }

  /**
   * GET /estudiantes/:id/clases-disponibles - Obtener clases disponibles para estudiante (Admin)
   * @param id - ID del estudiante
   * @returns Clases del sector con cupos disponibles
   */
  @Get(':id/clases-disponibles')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async obtenerClasesDisponibles(@Param('id') id: string) {
    return this.estudiantesService.obtenerClasesDisponiblesParaEstudiante(id);
  }
}
