import { PartialType } from '@nestjs/mapped-types';
import { CreateSlideDto } from './create-slide.dto';

/**
 * DTO para actualizar un slide existente
 * Todos los campos son opcionales
 */
export class UpdateSlideDto extends PartialType(CreateSlideDto) {}
