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
import { EstudiantesService } from './estudiantes.service';
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
  constructor(private readonly estudiantesService: EstudiantesService) {}

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
  @Roles(Role.Admin)
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
   * @param body - { avatar_url: string }
   * @returns Estudiante actualizado
   */
  @Patch('avatar')
  @UseGuards(RolesGuard)
  @Roles(Role.Estudiante)
  async actualizarAvatar3D(
    @Request() req: RequestWithAuthUser,
    @Body() body: { avatar_url: string },
  ) {
    const estudianteId = req.user.id;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 [BACKEND] PATCH /estudiantes/avatar');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Estudiante ID:', estudianteId);
    console.log('🔗 Avatar URL recibida:', body.avatar_url);
    console.log('📏 Longitud URL:', body.avatar_url?.length);
    console.log('✅ Incluye readyplayer.me?', body.avatar_url?.includes('readyplayer.me'));
    console.log('✅ Incluye .glb?', body.avatar_url?.includes('.glb'));

    // Validar que sea URL válida de Ready Player Me
    if (!body.avatar_url || !body.avatar_url.includes('readyplayer.me')) {
      console.error('❌ URL de avatar inválida');
      throw new BadRequestException('URL de avatar inválida');
    }

    // Actualizar avatar 3D sin validación de ownership (el estudiante actualiza su propio avatar)
    const resultado = await this.estudiantesService.updateAvatar3D(estudianteId, body.avatar_url);

    console.log('✅ Avatar actualizado en BD:', resultado.avatar_url);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return resultado;
  }

  /**
   * GET /estudiantes/mi-avatar - Obtener avatar del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns { avatar_url: string, tiene_avatar: boolean }
   */
  @Get('mi-avatar')
  @UseGuards(RolesGuard)
  @Roles(Role.Estudiante)
  async obtenerMiAvatar(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [BACKEND] GET /estudiantes/mi-avatar');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Estudiante ID:', estudianteId);

    // Buscar directamente sin ownership check (el estudiante accede a sus propios datos)
    const estudiante = await this.estudiantesService.findOneById(estudianteId);

    console.log('📦 Estudiante encontrado:', estudiante.nombre, estudiante.apellido);
    console.log('🔗 Avatar URL en BD:', estudiante.avatar_url);
    console.log('✅ Tiene avatar?', !!estudiante.avatar_url);

    if (estudiante.avatar_url) {
      console.log('📏 Longitud URL:', estudiante.avatar_url.length);
      console.log('🔍 Formato:', estudiante.avatar_url.substring(0, 50) + '...');
    }

    const resultado = {
      avatar_url: estudiante.avatar_url,
      tiene_avatar: !!estudiante.avatar_url,
    };

    console.log('📤 Respuesta:', resultado);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return resultado;
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
   * @param body - { avatar_url: string }
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin)
  async obtenerClasesDisponibles(@Param('id') id: string) {
    return this.estudiantesService.obtenerClasesDisponiblesParaEstudiante(id);
  }
}
