import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DlqStatus, Prisma } from '@prisma/client';

/**
 * DTO para filtros de listado de webhooks en DLQ
 */
export class FiltrosDlqDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: DlqStatus,
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(DlqStatus)
  status?: DlqStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de pago de MercadoPago',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de webhook',
    example: 'payment',
  })
  @IsOptional()
  @IsString()
  webhookType?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados (default 50, max 100)',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset para paginación',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

/**
 * DTO para resolver/abandonar un webhook de DLQ
 */
export class ResolveDlqDto {
  @ApiProperty({
    description: 'Notas de resolución (motivo, acciones tomadas)',
    example: 'Pago procesado manualmente desde panel de MercadoPago',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}

/**
 * Respuesta de estadísticas de DLQ
 */
export class DlqStatsResponse {
  @ApiProperty({
    description: 'Conteo de webhooks por estado',
    example: { PENDING: 5, PROCESSING: 1, RESOLVED: 100, ABANDONED: 3 },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Total de webhooks pendientes',
    example: 5,
  })
  totalPending: number;

  @ApiProperty({
    description: 'Webhook pendiente más antiguo',
    example: {
      id: 'clxxx123',
      createdAt: '2026-01-15T10:30:00Z',
      paymentId: '12345678',
    },
    nullable: true,
  })
  oldestPending: {
    id: string;
    createdAt: Date;
    paymentId: string;
  } | null;
}

/**
 * Respuesta de listado paginado de DLQ
 */
export class DlqListResponse {
  @ApiProperty({ description: 'Lista de webhooks fallidos' })
  items: WebhookFailedItem[];

  @ApiProperty({ description: 'Total de registros', example: 150 })
  total: number;

  @ApiProperty({ description: 'Límite usado', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Offset usado', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Si hay más resultados', example: true })
  hasMore: boolean;
}

/**
 * Item individual de webhook fallido
 */
export class WebhookFailedItem {
  @ApiProperty({ example: 'clxxx123' })
  id: string;

  @ApiProperty({ example: '12345678' })
  paymentId: string;

  @ApiProperty({ example: 'payment' })
  webhookType: string;

  @ApiProperty({ description: 'Payload original del webhook' })
  payload: Prisma.JsonValue;

  @ApiProperty({ example: 'Connection timeout after 30s' })
  errorMessage: string;

  @ApiProperty({ nullable: true })
  errorStack: string | null;

  @ApiProperty({ example: 3 })
  retries: number;

  @ApiProperty({ enum: DlqStatus, example: 'PENDING' })
  status: DlqStatus;

  @ApiProperty({ nullable: true })
  lastRetryAt: Date | null;

  @ApiProperty({ nullable: true })
  resolvedAt: Date | null;

  @ApiProperty({ nullable: true })
  resolvedBy: string | null;

  @ApiProperty({ nullable: true })
  resolutionNotes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
