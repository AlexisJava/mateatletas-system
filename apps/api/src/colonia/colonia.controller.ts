import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ColoniaService } from './colonia.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';

@Controller('colonia')
export class ColoniaController {
  private readonly logger = new Logger(ColoniaController.name);

  constructor(private readonly coloniaService: ColoniaService) {}

  /**
   * POST /api/colonia/inscripcion
   *
   * Crea una inscripción completa a la Colonia de Verano 2026
   *
   * Body esperado:
   * {
   *   nombre: string,
   *   email: string,
   *   telefono: string,
   *   password: string,
   *   dni?: string,
   *   estudiantes: [
   *     {
   *       nombre: string,
   *       edad: number (6-12),
   *       cursosSeleccionados: [{ id, name, area, instructor, dayOfWeek, timeSlot, color, icon }]
   *     }
   *   ]
   * }
   *
   * Retorna:
   * {
   *   message: string,
   *   tutorId: string,
   *   inscriptionId: string,
   *   estudiantes: [{ nombre, username, pin }],
   *   pago: {
   *     mes: 'enero',
   *     monto: number,
   *     descuento: number,
   *     mercadoPagoUrl: string
   *   }
   * }
   */
  @Post('inscripcion')
  @HttpCode(HttpStatus.CREATED)
  async createInscription(@Body() createInscriptionDto: CreateInscriptionDto) {
    this.logger.log(`Nueva solicitud de inscripción - Email: ${createInscriptionDto.email}`);

    try {
      const result = await this.coloniaService.createInscription(createInscriptionDto);

      this.logger.log(`Inscripción exitosa - Inscription ID: ${result.inscriptionId}`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error en inscripción: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
