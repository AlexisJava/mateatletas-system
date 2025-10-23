import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TutorService } from './tutor.service';
import { GetMisInscripcionesDto } from './dto/get-mis-inscripciones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

/**
 * TutorController
 *
 * Endpoints específicos para tutores autenticados
 * Todos los endpoints:
 * - Requieren autenticación JWT
 * - Requieren rol de tutor
 * - Obtienen tutorId del token (NO del cliente)
 */
@ApiTags('Tutor')
@Controller('tutor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Tutor)
@ApiBearerAuth()
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  /**
   * GET /tutor/mis-inscripciones
   *
   * Obtiene las inscripciones mensuales del tutor autenticado
   * El tutorId viene del JWT token, NO del cliente (seguro)
   */
  @Get('mis-inscripciones')
  @ApiOperation({
    summary: 'Obtener mis inscripciones mensuales',
    description: `
      Retorna las inscripciones mensuales del tutor autenticado con resumen financiero.

      El tutorId se obtiene automáticamente del token JWT (seguro).

      Filtros opcionales:
      - periodo: YYYY-MM (ej: 2025-01)
      - estadoPago: Pendiente | Pagado | Vencido

      Respuesta incluye:
      - Lista de inscripciones
      - Resumen: total pendiente, pagado, cantidad, estudiantes únicos
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Inscripciones obtenidas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene rol de tutor',
  })
  async getMisInscripciones(
    @GetUser() user: AuthUser,
    @Query() query: GetMisInscripcionesDto,
  ) {
    // user.id viene del JWT - SEGURO
    // NO confiamos en ningún dato del cliente para el tutorId
    return this.tutorService.getMisInscripciones(
      user.id,
      query.periodo,
      query.estadoPago,
    );
  }
}
