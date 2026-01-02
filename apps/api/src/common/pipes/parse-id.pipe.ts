import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * ParseIdPipe - Validador de IDs para Prisma
 *
 * Acepta múltiples formatos de ID:
 * - UUID v4: 550e8400-e29b-41d4-a716-446655440000
 * - CUID: cmjpy6pcj000i8js3y8rz9lx4 (25 chars, empieza con 'c')
 * - CUID2: variable length, empieza con letra minúscula
 * - Slug: seed-producto-nombre (para datos de seed)
 *
 * Uso:
 * @Get(':id')
 * findOne(@Param('id', ParseIdPipe) id: string)
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('ID inválido');
    }

    // UUID v4 pattern
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    // CUID pattern (starts with 'c', 25 chars total)
    const cuidRegex = /^c[a-z0-9]{24}$/;

    // CUID2 pattern (starts with any letter, variable length)
    const cuid2Regex = /^[a-z][a-z0-9]{19,31}$/;

    // Slug pattern (lowercase letters, numbers, hyphens - for seed data)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (
      uuidRegex.test(value) ||
      cuidRegex.test(value) ||
      cuid2Regex.test(value) ||
      slugRegex.test(value)
    ) {
      return value;
    }

    throw new BadRequestException('Validation failed (invalid id format)');
  }
}
