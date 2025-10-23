import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagosService } from '../services/pagos.service';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';

/**
 * PagosController - Presentation Layer
 *
 * Endpoints REST para el módulo de pagos
 *
 * Responsabilidades:
 * - Definir rutas HTTP
 * - Validar entrada con DTOs (class-validator automático)
 * - Delegar lógica al Service
 * - Manejar respuestas HTTP
 * - Documentación Swagger
 */
@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /**
   * POST /pagos/calcular-precio
   * Calcula el precio de actividades según reglas de negocio
   */
  @Post('calcular-precio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular precio de actividades',
    description: `
      Calcula el precio total considerando:
      - Cantidad de estudiantes (hermanos)
      - Cantidad de actividades por estudiante
      - Descuentos aplicables (múltiples actividades, hermanos, AACREA)
      - Prioridades de descuentos (hermanos múltiple > hermanos básico > múltiples actividades > AACREA)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo exitoso con desglose completo',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante, tutor o producto no encontrado',
  })
  async calcularPrecio(@Body() dto: CalcularPrecioRequestDto) {
    return await this.pagosService.calcularPrecio(dto);
  }

  /**
   * POST /pagos/configuracion/actualizar
   * Actualiza la configuración de precios (solo admins)
   */
  @Post('configuracion/actualizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de precios',
    description: `
      Actualiza los precios base y configuración del sistema.
      Automáticamente guarda historial de cambios para auditoría.

      IMPORTANTE: Solo administradores pueden ejecutar esta operación.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos (precios negativos, porcentajes fuera de rango, etc)',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol de administrador)',
  })
  async actualizarConfiguracion(
    @Body() dto: ActualizarConfiguracionPreciosRequestDto,
  ) {
    return await this.pagosService.actualizarConfiguracionPrecios(dto);
  }
}
