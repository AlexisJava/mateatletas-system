import type { SystemStats, AdminUser } from './admin.types';
import type { ClaseListado } from './admin-clases.types';
import type { Producto } from './catalogo.types';

export interface ReporteAdmin {
  stats: SystemStats | null;
  usuarios: AdminUser[];
  clases: ClaseListado[];
  productos: Producto[];
  fechaInicio: string;
  fechaFin: string;
}
