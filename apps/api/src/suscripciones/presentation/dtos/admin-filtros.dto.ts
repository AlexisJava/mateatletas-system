import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoSuscripcion } from '@prisma/client';

/**
 * DTO para filtros de listado de suscripciones (Admin)
 */
export class AdminFiltrosSuscripcionDto {
  @IsOptional()
  @IsEnum(EstadoSuscripcion)
  estado?: EstadoSuscripcion;

  @IsOptional()
  @IsUUID()
  plan_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * Respuesta paginada de suscripciones para admin
 */
export interface AdminSuscripcionesResponseDto {
  data: AdminSuscripcionItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Item de suscripción para listado admin
 */
export interface AdminSuscripcionItemDto {
  id: string;
  estado: EstadoSuscripcion;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string | null;
  };
  plan: {
    id: string;
    nombre: string;
  };
  monto_final: number;
  fecha_inicio: Date | null;
  fecha_proximo_cobro: Date | null;
  dias_gracia_usados: number;
  estudiantes_count: number;
}

/**
 * Respuesta de suscripciones morosas
 */
export interface MorosasResponseDto {
  suscripciones: AdminSuscripcionItemDto[];
  total: number;
}

/**
 * Métricas de suscripciones para dashboard admin
 */
export interface MetricasSuscripcionesDto {
  total_activas: number;
  total_morosas: number;
  total_en_gracia: number;
  total_canceladas_mes: number;
  ingresos_mes: number;
  tasa_cancelacion: number;
}
