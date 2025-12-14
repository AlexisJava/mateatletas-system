import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../domain/constants/roles.constants';
import { SubirRecursoDto } from '../dto/subir-recurso.dto';
import { SubirRecursoService } from '../services/recursos/subir-recurso.service';
import { EliminarRecursoService } from '../services/recursos/eliminar-recurso.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Controlador de recursos de Studio
 * Endpoints para upload y gestión de recursos multimedia
 */
@ApiTags('Studio - Recursos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('studio/recursos')
export class RecursosController {
  constructor(
    private readonly subirRecursoService: SubirRecursoService,
    private readonly eliminarRecursoService: EliminarRecursoService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir recurso multimedia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        cursoId: {
          type: 'string',
        },
        tipo: {
          type: 'string',
          enum: ['IMAGEN', 'AUDIO', 'VIDEO', 'DOCUMENTO'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Recurso subido exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @UseInterceptors(FileInterceptor('file'))
  async subir(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirRecursoDto,
  ) {
    return this.subirRecursoService.ejecutar(dto, file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de un recurso' })
  @ApiResponse({ status: 200, description: 'Recurso encontrado' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async obtener(@Param('id', ParseUUIDPipe) id: string) {
    const recurso = await this.prisma.recursoStudio.findUnique({
      where: { id },
    });

    if (!recurso) {
      throw new Error(`Recurso con ID ${id} no encontrado`);
    }

    return recurso;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar recurso' })
  @ApiResponse({ status: 204, description: 'Recurso eliminado' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async eliminar(@Param('id', ParseUUIDPipe) id: string) {
    await this.eliminarRecursoService.ejecutar(id);
  }
}
