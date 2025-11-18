import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Servicio compartido para generación de PINs únicos de 4 dígitos
 *
 * Este servicio proporciona generación robusta de PINs únicos para cualquier tabla
 * que requiera identificadores numéricos de 4 dígitos. Incluye:
 * - Generación aleatoria criptográficamente segura
 * - Validación de unicidad contra la base de datos
 * - Reintentos automáticos en caso de colisión
 * - Soporte para múltiples tablas mediante delegados
 *
 * @example
 * ```typescript
 * // Para generar PIN único para estudiante
 * const pin = await pinGenerator.generateUniquePin(
 *   'estudiante',
 *   async (pin) => await prisma.estudiante.findFirst({ where: { pin } })
 * );
 * ```
 */
@Injectable()
export class PinGeneratorService {
  private readonly MAX_RETRIES = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un PIN numérico de 4 dígitos de forma aleatoria
   *
   * @returns PIN de 4 dígitos como string (e.g., "0123", "9876")
   * @private
   */
  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Genera un PIN único de 4 dígitos para una tabla específica
   *
   * Este método intenta generar un PIN único verificando su existencia
   * en la base de datos mediante el delegado proporcionado. Si encuentra
   * una colisión, reintenta automáticamente hasta MAX_RETRIES veces.
   *
   * @param tableName - Nombre de la tabla para logging (e.g., 'estudiante')
   * @param existsCheck - Función async que retorna el registro si el PIN existe, null si no
   * @returns PIN único de 4 dígitos
   * @throws Error si no puede generar un PIN único después de MAX_RETRIES intentos
   *
   * @example
   * ```typescript
   * const pin = await generateUniquePin(
   *   'estudiante',
   *   async (pin) => await prisma.estudiante.findFirst({ where: { pin } })
   * );
   * ```
   */
  async generateUniquePin<T = unknown>(
    tableName: string,
    existsCheck: (pin: string) => Promise<T | null>,
  ): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      const pin = this.generateRandomPin();

      const existing = await existsCheck(pin);
      if (!existing) {
        return pin;
      }

      // PIN colisionó, reintentar
      console.warn(
        `PIN collision for ${tableName}: ${pin} (attempt ${attempt + 1}/${this.MAX_RETRIES})`,
      );
    }

    throw new Error(
      `Failed to generate unique PIN for ${tableName} after ${this.MAX_RETRIES} attempts`,
    );
  }

  /**
   * Genera múltiples PINs únicos de forma eficiente
   *
   * Este método genera varios PINs únicos de manera secuencial,
   * asegurando que cada uno sea único tanto en la base de datos
   * como dentro del conjunto generado.
   *
   * @param count - Cantidad de PINs a generar
   * @param tableName - Nombre de la tabla para logging
   * @param existsCheck - Función async que retorna el registro si el PIN existe
   * @returns Array de PINs únicos
   * @throws Error si no puede generar algún PIN único
   *
   * @example
   * ```typescript
   * const pins = await generateMultiplePins(
   *   3,
   *   'estudiante',
   *   async (pin) => await prisma.estudiante.findFirst({ where: { pin } })
   * );
   * // pins = ['1234', '5678', '9012']
   * ```
   */
  async generateMultiplePins(
    count: number,
    tableName: string,
    existsCheck: (pin: string) => Promise<any | null>,
  ): Promise<string[]> {
    const pins: string[] = [];
    const generatedSet = new Set<string>();

    for (let i = 0; i < count; i++) {
      let pin: string;
      let attempts = 0;

      do {
        pin = await this.generateUniquePin(tableName, existsCheck);
        attempts++;

        if (attempts > this.MAX_RETRIES) {
          throw new Error(
            `Failed to generate unique PIN set for ${tableName} after ${this.MAX_RETRIES} attempts`,
          );
        }
      } while (generatedSet.has(pin));

      generatedSet.add(pin);
      pins.push(pin);
    }

    return pins;
  }
}
