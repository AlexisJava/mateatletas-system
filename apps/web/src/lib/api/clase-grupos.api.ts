/**
 * API client para ClaseGrupos (grupos de clases recurrentes)
 */

import axios from '@/lib/axios';
import type {
  ClaseGrupo,
  CrearClaseGrupoDto,
  ListarClaseGruposParams,
} from '@/types/clase-grupo';

/**
 * Crear un nuevo ClaseGrupo
 */
export async function crearClaseGrupo(data: CrearClaseGrupoDto): Promise<ClaseGrupo> {
  const payload = await axios.post<ClaseGrupo>('/admin/clase-grupos', data);
  return payload;
}

/**
 * Listar ClaseGrupos con filtros opcionales
 */
export async function listarClaseGrupos(
  params?: ListarClaseGruposParams
): Promise<{
  success: boolean;
  data: ClaseGrupo[];
  total: number;
}> {
  const queryParams = new URLSearchParams();

  if (params?.anio_lectivo) {
    queryParams.append('anio_lectivo', params.anio_lectivo.toString());
  }
  if (params?.activo !== undefined) {
    queryParams.append('activo', params.activo.toString());
  }
  if (params?.docente_id) {
    queryParams.append('docente_id', params.docente_id);
  }
  if (params?.tipo) {
    queryParams.append('tipo', params.tipo);
  }

  const queryString = queryParams.toString();
  const url = `/admin/clase-grupos${queryString ? `?${queryString}` : ''}`;

  const payload = await axios.get<{
    success: boolean;
    data: ClaseGrupo[];
    total: number;
  }>(url);

  return payload;
}

/**
 * Obtener un ClaseGrupo por ID con todos sus detalles
 */
export async function obtenerClaseGrupo(id: string): Promise<{
  success: boolean;
  data: ClaseGrupo;
}> {
  const payload = await axios.get<{
    success: boolean;
    data: ClaseGrupo;
  }>(`/admin/clase-grupos/${id}`);

  return payload;
}
