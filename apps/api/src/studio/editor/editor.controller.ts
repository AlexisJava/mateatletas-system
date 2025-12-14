import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  ParseUUIDPipe,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EditorService } from './editor.service';
import { GuardarSemanaDto } from './dto/guardar-semana.dto';
import {
  SemanaEditorResponse,
  ValidacionResponse,
} from './dto/respuesta-editor.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../domain/constants/roles.constants';

@Controller('studio/editor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Get('cursos/:cursoId/semanas/:semanaNum')
  @Roles(Role.ADMIN)
  async cargarSemana(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('semanaNum', ParseIntPipe) semanaNum: number,
  ): Promise<SemanaEditorResponse> {
    return this.editorService.cargarSemana(cursoId, semanaNum);
  }

  @Put('cursos/:cursoId/semanas/:semanaNum')
  @Roles(Role.ADMIN)
  async guardarSemana(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('semanaNum', ParseIntPipe) semanaNum: number,
    @Body() data: GuardarSemanaDto,
  ): Promise<SemanaEditorResponse> {
    return this.editorService.guardarSemana(cursoId, semanaNum, data);
  }

  @Post('validar')
  @Roles(Role.ADMIN)
  async validarSinGuardar(
    @Body() data: GuardarSemanaDto,
  ): Promise<ValidacionResponse> {
    return this.editorService.validarSinGuardar(data);
  }
}
