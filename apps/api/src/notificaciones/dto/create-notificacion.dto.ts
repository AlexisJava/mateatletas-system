import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsDate,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Tipo de destinatario de la notificación
 * Determina qué campo ID será requerido
 */
export type TipoDestinatario = 'tutor' | 'estudiante' | 'docente' | 'admin';

/**
 * DTO para crear una notificación
 * Soporta el modelo polimórfico: exactamente un destinatario debe estar presente
 */
export class CreateNotificacionDto {
  @ApiProperty({
    description: 'Tipo de notificación',
    enum: TipoNotificacion,
    example: 'TUTOR_PAGO_EXITOSO',
  })
  @IsEnum(TipoNotificacion)
  tipo!: TipoNotificacion;

  @ApiProperty({
    description: 'Título de la notificación (max 100 caracteres)',
    example: 'Pago procesado exitosamente',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  titulo!: string;

  @ApiProperty({
    description: 'Mensaje descriptivo (max 500 caracteres)',
    example: 'Tu pago de $5000 fue procesado correctamente.',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  mensaje!: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la notificación',
    enum: PrioridadNotificacion,
    default: 'MEDIA',
  })
  @IsOptional()
  @IsEnum(PrioridadNotificacion)
  prioridad?: PrioridadNotificacion;

  // ═══════════════════════════════════════════════════════════════
  // CAMPOS POLIMÓRFICOS (exactamente uno debe estar presente)
  // ═══════════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'ID del tutor destinatario',
    example: 'clxx123tutor...',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o: CreateNotificacionDto) => !o.estudianteId && !o.docenteId && !o.adminId,
  )
  tutorId?: string;

  @ApiPropertyOptional({
    description: 'ID del estudiante destinatario',
    example: 'clxx123estudiante...',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o: CreateNotificacionDto) => !o.tutorId && !o.docenteId && !o.adminId,
  )
  estudianteId?: string;

  @ApiPropertyOptional({
    description: 'ID del docente destinatario',
    example: 'clxx123docente...',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o: CreateNotificacionDto) => !o.tutorId && !o.estudianteId && !o.adminId,
  )
  docenteId?: string;

  @ApiPropertyOptional({
    description: 'ID del admin destinatario',
    example: 'clxx123admin...',
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o: CreateNotificacionDto) => !o.tutorId && !o.estudianteId && !o.docenteId,
  )
  adminId?: string;

  // ═══════════════════════════════════════════════════════════════
  // METADATA Y CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Metadata adicional (claseId, urls, etc)',
    example: { claseId: 'clxx123...', url: '/dashboard' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;

  @ApiPropertyOptional({
    description: 'Fecha de expiración (notificación se auto-elimina)',
    example: '2026-02-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiraEn?: Date;
}

/**
 * DTO simplificado para crear notificaciones internas
 * Usado por otros servicios al emitir notificaciones
 */
export class CreateNotificacionInternaDto {
  tipo!: TipoNotificacion;
  titulo!: string;
  mensaje!: string;
  prioridad?: PrioridadNotificacion;
  metadata?: Record<string, string | number | boolean | null>;
  expiraEn?: Date;
}
