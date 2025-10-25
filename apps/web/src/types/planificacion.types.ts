import {
  estadoPlanificacionEnum,
  type EstadoPlanificacion as SharedEstadoPlanificacion,
  type PlanificacionListItem as SharedPlanificacionListItem,
  type PlanificacionListResponse as SharedPlanificacionListResponse,
  type PlanificacionDetalle as SharedPlanificacionDetalle,
  type PlanificacionActividad as SharedPlanificacionActividad,
  type CreatePlanificacionInput,
  type UpdatePlanificacionInput,
  type CreateActividadInput,
} from '@mateatletas/shared';

export { estadoPlanificacionEnum };
export type EstadoPlanificacion = SharedEstadoPlanificacion;
export type PlanificacionActividad = SharedPlanificacionActividad;
export type Actividad = SharedPlanificacionActividad;
export type PlanificacionDetalle = SharedPlanificacionDetalle;
export type PlanificacionListItem = SharedPlanificacionListItem;
export type PlanificacionListResponse = SharedPlanificacionListResponse;
export type CreatePlanificacionRequest = CreatePlanificacionInput;
export type UpdatePlanificacionRequest = UpdatePlanificacionInput;
export type CreateActividadRequest = CreateActividadInput;

export type CodigoGrupo = 'B1' | 'B2' | 'B3';

export interface PlanificacionFilters {
  codigo_grupo?: CodigoGrupo;
  mes?: number;
  anio?: number;
  estado?: EstadoPlanificacion;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}
