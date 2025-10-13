import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { IniciarSuscripcionDto } from './dto/iniciar-suscripcion.dto';
import { IniciarCompraCursoDto } from './dto/iniciar-compra-curso.dto';

/**
 * Controller para gestionar pagos y membresías
 * Maneja la integración con MercadoPago y webhooks
 */
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /**
   * POST /pagos/suscripcion
   * Inicia el proceso de compra de una suscripción
   * Requiere autenticación como Tutor
   */
  @Post('suscripcion')
  @UseGuards(JwtAuthGuard)
  async iniciarSuscripcion(
    @GetUser() user: any,
    @Body() dto: IniciarSuscripcionDto,
  ) {
    return this.pagosService.generarPreferenciaSuscripcion(
      user.id,
      dto.productoId,
    );
  }

  /**
   * POST /pagos/curso
   * Inicia el proceso de compra de un curso para un estudiante
   * Requiere autenticación como Tutor
   */
  @Post('curso')
  @UseGuards(JwtAuthGuard)
  async iniciarCompraCurso(
    @GetUser() user: any,
    @Body() dto: IniciarCompraCursoDto,
  ) {
    return this.pagosService.generarPreferenciaCurso(
      user.id,
      dto.estudianteId,
      dto.productoId,
    );
  }

  /**
   * POST /pagos/webhook
   * Recibe notificaciones de MercadoPago sobre pagos
   * Endpoint público (no requiere autenticación)
   */
  @Post('webhook')
  async procesarWebhook(@Body() body: any) {
    return this.pagosService.procesarWebhookMercadoPago(body);
  }

  /**
   * GET /pagos/membresia
   * Obtiene la membresía actual del tutor autenticado
   * Retorna la membresía activa o null si no tiene
   */
  @Get('membresia')
  @UseGuards(JwtAuthGuard)
  async obtenerMembresia(@GetUser() user: any) {
    const membresia = await this.pagosService.obtenerMembresiaTutor(user.id);

    if (!membresia) {
      return { estado: 'SinMembresia', membresia: null };
    }

    return {
      estado: membresia.estado,
      membresia,
    };
  }

  /**
   * GET /pagos/membresia/:id/estado
   * Obtiene el estado de una membresía específica (para polling)
   * Útil para verificar cuando el webhook haya actualizado el estado
   */
  @Get('membresia/:id/estado')
  @UseGuards(JwtAuthGuard)
  async obtenerEstadoMembresia(
    @Param('id') membresiaId: string,
    @GetUser() user: any,
  ) {
    return this.pagosService.obtenerEstadoMembresia(membresiaId, user.id);
  }

  /**
   * GET /pagos/inscripciones
   * Obtiene las inscripciones a cursos de un estudiante
   */
  @Get('inscripciones')
  @UseGuards(JwtAuthGuard)
  async obtenerInscripciones(
    @Query('estudianteId') estudianteId: string,
    @GetUser() user: any,
  ) {
    if (!estudianteId) {
      return { error: 'estudianteId is required' };
    }

    return this.pagosService.obtenerInscripcionesEstudiante(
      estudianteId,
      user.id,
    );
  }

  /**
   * POST /pagos/mock/activar-membresia/:id
   * Activa una membresía manualmente (solo para testing en modo mock)
   * Endpoint público para facilitar testing
   */
  @Post('mock/activar-membresia/:id')
  async activarMembresiaMock(@Param('id') membresiaId: string) {
    return this.pagosService.activarMembresiaMock(membresiaId);
  }
}
