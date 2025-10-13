import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Controller para endpoints de docentes
 * Define las rutas HTTP para operaciones CRUD
 * Incluye endpoints para Admin y para Docentes (self-service)
 */
@Controller('docentes')
@UseGuards(JwtAuthGuard)
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  /**
   * POST /docentes - Crear nuevo docente (Admin only)
   * @param createDto - Datos del docente
   * @returns Docente creado
   */
  @Post()
  // TODO: Agregar @Roles('Admin') cuando el guard esté implementado
  async create(@Body() createDto: CreateDocenteDto) {
    return this.docentesService.create(createDto);
  }

  /**
   * GET /docentes - Listar todos los docentes (Admin only)
   * @returns Lista de docentes
   */
  @Get()
  // TODO: Agregar @Roles('Admin') cuando el guard esté implementado
  async findAll() {
    return this.docentesService.findAll();
  }

  /**
   * GET /docentes/me - Obtener perfil del docente autenticado
   * @param user - Usuario autenticado (del JWT)
   * @returns Perfil del docente
   */
  @Get('me')
  // TODO: Agregar @Roles('Docente') cuando el guard esté implementado
  async getProfile(@GetUser() user: any) {
    return this.docentesService.findById(user.id);
  }

  /**
   * PATCH /docentes/me - Actualizar perfil del docente autenticado
   * @param user - Usuario autenticado
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch('me')
  // TODO: Agregar @Roles('Docente') cuando el guard esté implementado
  async updateProfile(
    @GetUser() user: any,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docentesService.update(user.id, updateDto);
  }

  /**
   * GET /docentes/:id - Obtener un docente específico (Admin only)
   * @param id - ID del docente
   * @returns Docente encontrado
   */
  @Get(':id')
  // TODO: Agregar @Roles('Admin') cuando el guard esté implementado
  async findOne(@Param('id') id: string) {
    return this.docentesService.findById(id);
  }

  /**
   * PATCH /docentes/:id - Actualizar un docente (Admin only)
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch(':id')
  // TODO: Agregar @Roles('Admin') cuando el guard esté implementado
  async update(@Param('id') id: string, @Body() updateDto: UpdateDocenteDto) {
    return this.docentesService.update(id, updateDto);
  }

  /**
   * DELETE /docentes/:id - Eliminar un docente (Admin only)
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  // TODO: Agregar @Roles('Admin') cuando el guard esté implementado
  async remove(@Param('id') id: string) {
    return this.docentesService.remove(id);
  }
}
