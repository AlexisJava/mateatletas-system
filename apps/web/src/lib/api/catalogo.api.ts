/**
 * API Client para Catálogo de Productos
 *
 * NOTA: No usamos validación Zod aquí porque el backend devuelve
 * Decimal como string y el schema espera number. El backend ya
 * valida los datos, así que confiamos en la respuesta.
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';
import { type CreateProductoDto, type UpdateProductoDto } from '@mateatletas/contracts';

// Re-export types for convenience
export type { Producto } from '@/types/catalogo.types';
export { TipoProducto } from '@/types/catalogo.types';
export type CrearProductoDto = CreateProductoDto;
export type ActualizarProductoDto = UpdateProductoDto;

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  try {
    return await axios.get<Producto[]>('/productos');
  } catch (error) {
    console.error('Error al obtener los productos del catálogo:', error);
    throw error;
  }
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
  try {
    return await axios.get<Producto>(`/productos/${id}`);
  } catch (error) {
    console.error('Error al obtener el producto del catálogo por ID:', error);
    throw error;
  }
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
  try {
    return await axios.get<Producto[]>('/productos/cursos');
  } catch (error) {
    console.error('Error al obtener los cursos del catálogo:', error);
    throw error;
  }
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
  try {
    return await axios.get<Producto[]>('/productos/suscripciones');
  } catch (error) {
    console.error('Error al obtener las suscripciones del catálogo:', error);
    throw error;
  }
};

/**
 * Filtrar productos por tipo
 */
export const getProductosPorTipo = async (tipo: TipoProducto): Promise<Producto[]> => {
  if (tipo === 'Curso') return getCursos();
  // Suscripciones ya no existen como tipo, retornar todos
  return getProductos();
};

// ============================================================================
// CLUBS 2026 - Sistema Casa/Mundo
// ============================================================================

/** Tipo de Casa pedagógica */
export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

/** Tipo de Mundo STEAM */
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

/** Información de un ClaseGrupo (horario) del backend */
export interface ClaseGrupoInfo {
  id: string;
  nombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  docente?: {
    nombre: string;
    apellido: string;
  };
}

/** Producto Club con ClaseGrupos */
export interface ClubConClaseGrupos extends Producto {
  casa: CasaTipo | null;
  mundo: MundoTipo | null;
  claseGrupos: ClaseGrupoInfo[];
}

/**
 * Obtener todos los Clubs disponibles para suscripciones
 * Incluye ClaseGrupos (horarios) de cada club
 */
export const getClubs = async (): Promise<ClubConClaseGrupos[]> => {
  try {
    return await axios.get<ClubConClaseGrupos[]>('/productos/clubs');
  } catch (error) {
    console.error('Error al obtener clubs:', error);
    throw error;
  }
};

/**
 * Obtener Clubs filtrados por Casa y Mundo
 * Usa el endpoint de catálogo con filtros
 *
 * Nota: La comparación es case-insensitive porque el backend devuelve
 * casa en MAYUSCULAS (QUANTUM) pero el dashboard del tutor puede
 * devolverlo en formato Title Case (Quantum).
 */
export const getClubsPorCasaMundo = async (
  casa?: CasaTipo | string,
  mundo?: MundoTipo,
): Promise<ClubConClaseGrupos[]> => {
  try {
    const clubs = await getClubs();
    return clubs.filter((club) => {
      const matchCasa = !casa || club.casa?.toUpperCase() === casa.toUpperCase();
      const matchMundo = !mundo || club.mundo === mundo;
      return matchCasa && matchMundo;
    });
  } catch (error) {
    console.error('Error al obtener clubs filtrados:', error);
    throw error;
  }
};
