import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

/**
 * DTO para filtros de listado de audit logs
 */
export class FiltrosAuditLogsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario',
    example: 'clxxx123',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email de usuario (búsqueda parcial)',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por acción',
    example: 'login',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de entidad',
    example: 'Pago',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    example: 'auth',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por severidad',
    example: 'critical',
  })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

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
 * Item individual de audit log
 */
export class AuditLogItem {
  @ApiProperty({ example: 'clxxx123' })
  id: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ nullable: true })
  userId: string | null;

  @ApiProperty({ nullable: true })
  userType: string | null;

  @ApiProperty({ nullable: true })
  userEmail: string | null;

  @ApiProperty({ example: 'login' })
  action: string;

  @ApiProperty({ example: 'Auth' })
  entityType: string;

  @ApiProperty({ nullable: true })
  entityId: string | null;

  @ApiProperty({ example: 'Usuario inició sesión exitosamente' })
  description: string;

  @ApiProperty({
    nullable: true,
    description: 'Cambios realizados (before/after)',
  })
  changes: Prisma.JsonValue | null;

  @ApiProperty({ nullable: true, description: 'Metadata adicional' })
  metadata: Prisma.JsonValue | null;

  @ApiProperty({ example: 'info' })
  severity: string;

  @ApiProperty({ example: 'auth' })
  category: string;

  @ApiProperty({ nullable: true, example: '192.168.1.1' })
  ipAddress: string | null;

  @ApiProperty({ nullable: true })
  userAgent: string | null;

  @ApiProperty({ nullable: true })
  requestId: string | null;

  @ApiProperty()
  createdAt: Date;
}

/**
 * Respuesta de listado paginado de audit logs
 */
export class AuditLogsListResponse {
  @ApiProperty({ description: 'Lista de audit logs' })
  items: AuditLogItem[];

  @ApiProperty({ description: 'Total de registros', example: 1500 })
  total: number;

  @ApiProperty({ description: 'Límite usado', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Offset usado', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Si hay más resultados', example: true })
  hasMore: boolean;
}

/**
 * Estadísticas de audit logs
 */
export class AuditLogsStatsResponse {
  @ApiProperty({
    description: 'Conteo de logs por categoría',
    example: { auth: 500, payment: 300, userManagement: 200, security: 50 },
  })
  byCategory: Record<string, number>;

  @ApiProperty({
    description: 'Conteo de logs por severidad',
    example: { info: 800, warning: 150, error: 45, critical: 5 },
  })
  bySeverity: Record<string, number>;

  @ApiProperty({
    description: 'Conteo de logs por acción (top 10)',
    example: { login: 500, logout: 300, paymentCreated: 100 },
  })
  topActions: Record<string, number>;

  @ApiProperty({
    description: 'Total de logs',
    example: 1000,
  })
  total: number;

  @ApiProperty({
    description: 'Total de logs críticos',
    example: 5,
  })
  totalCritical: number;

  @ApiProperty({
    description: 'Log más reciente',
    nullable: true,
  })
  mostRecent: {
    id: string;
    timestamp: Date;
    action: string;
  } | null;
}
