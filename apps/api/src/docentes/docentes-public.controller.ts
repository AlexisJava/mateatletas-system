import { Controller, Post, Body } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';

/**
 * Controller temporal para testing - NO USAR EN PRODUCCIÓN
 * Permite crear docentes sin autenticación solo para pruebas
 */
@Controller('docentes-public')
export class DocentesPublicController {
  constructor(private readonly docentesService: DocentesService) {}

  /**
   * POST /docentes-public - Crear docente sin autenticación (SOLO TESTING)
   * @param createDto - Datos del docente
   * @returns Docente creado
   */
  @Post()
  async create(@Body() createDto: CreateDocenteDto) {
    return this.docentesService.create(createDto);
  }
}
