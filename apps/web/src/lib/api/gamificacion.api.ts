import { isAxiosError } from 'axios';

import apiClient from '../axios';
import {
  dashboardGamificacionSchema,
  logrosListSchema,
  puntosObtenidosListSchema,
  puntosSchema,
  progresoRutaListSchema,
  rankingSchema,
  type AccionPuntuable as ContractsAccionPuntuable,
  type DashboardGamificacion,
  type Logro as ContractsLogro,
  type PuntoObtenido as ContractsPuntoObtenido,
  type Puntos as ContractsPuntos,
  type Ranking as ContractsRanking,
  type RankingGlobalItem,
  type RankingIntegrante,
  type ProgresoRuta,
} from '@mateatletas/contracts';
import type {
  ProgresoLogros,
  RachaEstudiante,
  RecursosEstudiante,
  TransaccionRecurso,
} from '@/types/gamificacion';
import { normalizarLogros, mapLogrosToEstudiante } from '@/types/gamificacion';

export type DashboardData = DashboardGamificacion;
export type ProximaClase = DashboardData['proximasClases'][number];
export type Logro = ContractsLogro;
export type Puntos = ContractsPuntos;
export type Ranking = ContractsRanking;
export type Progreso = ProgresoRuta;
export type AccionPuntuable = ContractsAccionPuntuable & { codigo?: string };

/**
 * Tipo de acción que retorna el backend actualmente
 * Backend usa: { tipo: 'PARTICIPACION', puntos: 5 }
 * Contracts espera: { id, nombre, descripcion, puntos, activo }
 */
interface AccionBackend {
  tipo: string;
  puntos: number;
}

/**
 * Datos para otorgar puntos - adaptado al backend actual
 * Backend espera: { estudianteId, tipoAccion, contexto? }
 * El tipoAccion es el código de la acción (ej: 'PARTICIPACION')
 */
export interface OtorgarPuntosData {
  estudianteId: string;
  /** ID de la acción (que en realidad es el tipoAccion string) */
  accionId: string;
  claseId?: string;
  contexto?: string;
}

export type PuntoObtenido = ContractsPuntoObtenido;
export type RankingEquipoEntry = RankingIntegrante;
export type RankingGlobalEntry = RankingGlobalItem;

// Tipos para endpoints V2 (sin schemas definidos aún en contracts)
export interface ProgresoLogroV2 {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  categorias: Record<
    string,
    {
      total: number;
      desbloqueados: number;
      logros?: Array<
        Logro & { desbloqueado: boolean; fechaDesbloqueo: string | null; secreto?: boolean }
      >;
    }
  >;
}

export interface RecursosResponse {
  xp: number;
  monedas: number;
  nivel: number;
  xpSiguienteNivel: number;
}

export interface RachaResponse {
  diasConsecutivos: number;
  ultimaActividad: string;
  recordPersonal: number;
}

export interface DesbloquearLogroResponse {
  success: boolean;
  logro: string;
  estudiante: string;
}

export const gamificacionApi = {
  /**
   * Obtener dashboard completo del estudiante
   * NOTA: Este endpoint aún no está implementado en el backend
   * Retorna datos mock por ahora
   */
  getDashboard: async (estudianteId: string): Promise<DashboardData> => {
    try {
      const response = await apiClient.get(`/gamificacion/dashboard/${estudianteId}`);
      return dashboardGamificacionSchema.parse(response);
    } catch (error) {
      // Si es 404, retornar mock data en lugar de error
      if (isAxiosError(error) && error.response?.status === 404) {
        console.warn('⚠️ Dashboard endpoint no implementado, usando datos mock');
        return {
          estudiante: {
            id: estudianteId,
            nombre: 'Estudiante',
            apellido: 'Test',
            avatarGradient: 0,
            equipo: { id: '', nombre: 'Sin equipo', color: '#cccccc' },
          },
          stats: { puntosTotales: 0, clasesAsistidas: 0, clasesTotales: 0, racha: 0 },
          nivel: {
            nivelActual: 1,
            nombre: 'Iniciante',
            descripcion: 'Comenzando tu aventura',
            puntosActuales: 0,
            puntosMinimos: 0,
            puntosMaximos: 100,
            puntosParaSiguienteNivel: 100,
            porcentajeProgreso: 0,
            color: '#888888',
            icono: '🌱',
            siguienteNivel: null,
          },
          proximasClases: [],
          equipoRanking: [],
          ultimasAsistencias: [],
        } as DashboardData;
      }
      console.error('Error al obtener el dashboard de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener logros del estudiante
   */
  getLogros: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get<Logro[]>(
        `/gamificacion/logros/estudiante/${estudianteId}`,
      );
      const validados = logrosListSchema.parse(response);
      return normalizarLogros(validados);
    } catch (error) {
      console.error('Error al obtener los logros de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener puntos del estudiante
   */
  getPuntos: async (estudianteId: string): Promise<Puntos> => {
    try {
      const response = await apiClient.get(`/gamificacion/puntos/${estudianteId}`);
      return puntosSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener los puntos del estudiante:', error);
      throw error;
    }
  },

  /**
   * Obtener ranking del estudiante
   */
  getRanking: async (estudianteId: string): Promise<Ranking> => {
    try {
      const response = await apiClient.get(`/gamificacion/ranking/${estudianteId}`);
      return rankingSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el ranking de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener progreso por rutas
   */
  getProgreso: async (estudianteId: string): Promise<Progreso[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/progreso/${estudianteId}`);
      return progresoRutaListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el progreso de gamificación:', error);
      throw error;
    }
  },

  /**
   * Desbloquear logro
   */
  desbloquearLogro: async (logroId: string): Promise<DesbloquearLogroResponse> => {
    try {
      return await apiClient.post<DesbloquearLogroResponse>(
        `/gamificacion/logros/${logroId}/desbloquear`,
      );
    } catch (error) {
      console.error('Error al desbloquear el logro:', error);
      throw error;
    }
  },

  /**
   * Obtener acciones puntuables disponibles (docentes)
   *
   * NOTA: El backend retorna { tipo, puntos } pero el frontend espera
   * el formato de contracts { id, nombre, descripcion, puntos, activo }.
   * Transformamos aquí para mantener compatibilidad.
   */
  getAcciones: async (): Promise<AccionPuntuable[]> => {
    try {
      const response = await apiClient.get<AccionBackend[]>('/gamificacion/acciones');

      // Mapeo de tipos a nombres legibles para UI
      const NOMBRES_ACCIONES: Record<string, { nombre: string; descripcion: string }> = {
        PARTICIPACION: {
          nombre: 'Participación',
          descripcion: 'Por participar activamente en clase',
        },
        TAREA_COMPLETADA: {
          nombre: 'Tarea Completada',
          descripcion: 'Por entregar una tarea correctamente',
        },
        QUIZ_APROBADO: {
          nombre: 'Quiz Aprobado',
          descripcion: 'Por aprobar un quiz o evaluación',
        },
        AYUDA_COMPANERO: {
          nombre: 'Ayuda a Compañero',
          descripcion: 'Por ayudar a un compañero',
        },
        BONUS: {
          nombre: 'Bonus',
          descripcion: 'Puntos bonus especiales',
        },
        LOGRO: {
          nombre: 'Logro',
          descripcion: 'Por desbloquear un logro',
        },
        ASISTENCIA: {
          nombre: 'Asistencia',
          descripcion: 'Por asistir a clase',
        },
      };

      // Transformar formato backend → formato frontend
      return response.map((accion) => ({
        id: accion.tipo, // Usamos el tipo como ID
        nombre: NOMBRES_ACCIONES[accion.tipo]?.nombre ?? accion.tipo,
        descripcion: NOMBRES_ACCIONES[accion.tipo]?.descripcion ?? '',
        puntos: accion.puntos,
        activo: true,
        codigo: accion.tipo, // Campo extra para mapear al backend
      }));
    } catch (error) {
      console.error('Error al obtener las acciones puntuables:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de puntos de un estudiante
   */
  getHistorial: async (estudianteId: string): Promise<PuntoObtenido[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/historial/${estudianteId}`);
      return puntosObtenidosListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el historial de puntos:', error);
      throw error;
    }
  },

  /**
   * Otorgar puntos a un estudiante (docentes)
   *
   * NOTA: El frontend usa accionId (que es el código de acción como 'PARTICIPACION')
   * El backend espera tipoAccion. Transformamos aquí.
   */
  otorgarPuntos: async (data: OtorgarPuntosData): Promise<void> => {
    try {
      // Transformar formato frontend → formato backend
      const payload = {
        estudianteId: data.estudianteId,
        tipoAccion: data.accionId, // accionId es realmente el tipoAccion (ej: 'PARTICIPACION')
        claseId: data.claseId,
        contexto: data.contexto,
      };
      await apiClient.post('/gamificacion/puntos', payload);
    } catch (error) {
      console.error('Error al otorgar puntos de gamificación:', error);
      throw error;
    }
  },

  // ==========================================
  // GAMIFICACIÓN V2 - NUEVOS ENDPOINTS
  // ==========================================

  /**
   * Obtener todos los logros disponibles
   */
  obtenerTodosLogrosV2: async (): Promise<Logro[]> => {
    try {
      const response = await apiClient.get<Logro[]>('/gamificacion/logros');
      const validados = logrosListSchema.parse(response);
      return normalizarLogros(validados);
    } catch (error) {
      console.error('Error al obtener logros V2:', error);
      throw error;
    }
  },

  /**
   * Obtener logros del estudiante actual (con autenticación)
   */
  obtenerMisLogrosV2: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get<Logro[]>(
        `/gamificacion/logros/estudiante/${estudianteId}`,
      );
      const validados = logrosListSchema.parse(response);
      return normalizarLogros(validados);
    } catch (error) {
      console.error('Error al obtener mis logros V2:', error);
      throw error;
    }
  },

  /**
   * Obtener logros no vistos (para notificaciones)
   */
  obtenerLogrosNoVistos: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get<Logro[]>(
        `/gamificacion/logros/estudiante/${estudianteId}/no-vistos`,
      );
      const validados = logrosListSchema.parse(response);
      return normalizarLogros(validados);
    } catch (error) {
      console.error('Error al obtener logros no vistos:', error);
      throw error;
    }
  },

  /**
   * Marcar logro como visto
   */
  marcarLogroVisto: async (estudianteId: string, logroId: string): Promise<void> => {
    try {
      await apiClient.patch(`/gamificacion/logros/estudiante/${estudianteId}/${logroId}/visto`);
    } catch (error) {
      console.error('Error al marcar logro como visto:', error);
      throw error;
    }
  },

  /**
   * Obtener progreso de logros V2
   */
  obtenerProgresoV2: async (estudianteId: string): Promise<ProgresoLogros> => {
    try {
      const response = await apiClient.get<ProgresoLogros | ProgresoLogroV2>(
        `/gamificacion/logros/estudiante/${estudianteId}/progreso`,
      );

      const isProgresoLogros = (value: unknown): value is ProgresoLogros =>
        typeof value === 'object' &&
        value !== null &&
        'totalLogros' in value &&
        'logrosDesbloqueados' in value &&
        'porCategoria' in value;

      if (isProgresoLogros(response)) {
        return response;
      }

      const data = response as ProgresoLogroV2;

      const porCategoria = Object.entries(data.categorias ?? {}).reduce<
        ProgresoLogros['porCategoria']
      >((acc, [categoria, valores]) => {
        const logrosNormalizados = normalizarLogros(valores.logros ?? []);
        acc[categoria] = {
          total: valores.total ?? 0,
          desbloqueados: valores.desbloqueados ?? 0,
          logros: mapLogrosToEstudiante(estudianteId, logrosNormalizados),
        };
        return acc;
      }, {});

      const total = data.total ?? 0;
      const desbloqueados = data.desbloqueados ?? 0;

      return {
        total,
        desbloqueados,
        porcentaje: data.porcentaje ?? 0,
        totalLogros: total,
        logrosDesbloqueados: desbloqueados,
        porCategoria: porCategoria,
      };
    } catch (error) {
      console.error('Error al obtener progreso V2:', error);
      throw error;
    }
  },

  /**
   * Obtener recursos del estudiante (XP + Monedas + Nivel)
   */
  obtenerRecursos: async (
    estudianteId: string,
  ): Promise<RecursosEstudiante & { racha: RachaEstudiante }> => {
    try {
      const response = await apiClient.get<RecursosEstudiante & { racha: RachaEstudiante }>(
        `/gamificacion/recursos/${estudianteId}`,
      );
      // TODO: Crear schema Zod en contracts para validar esta respuesta
      return response;
    } catch (error) {
      console.error('Error al obtener recursos:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de transacciones V2
   */
  obtenerHistorialRecursos: async (estudianteId: string): Promise<TransaccionRecurso[]> => {
    try {
      const response = await apiClient.get<TransaccionRecurso[]>(
        `/gamificacion/recursos/${estudianteId}/historial`,
      );
      // TODO: Crear schema Zod en contracts para validar esta respuesta
      return response;
    } catch (error) {
      console.error('Error al obtener historial de recursos:', error);
      throw error;
    }
  },

  /**
   * Obtener racha del estudiante
   */
  obtenerRacha: async (estudianteId: string): Promise<RachaEstudiante> => {
    try {
      const response = await apiClient.get<RachaEstudiante>(
        `/gamificacion/recursos/${estudianteId}/racha`,
      );
      // TODO: Crear schema Zod en contracts para validar esta respuesta
      return response;
    } catch (error) {
      console.error('Error al obtener racha:', error);
      throw error;
    }
  },

  /**
   * Registrar actividad del día (actualiza racha)
   */
  registrarActividad: async (estudianteId: string): Promise<RachaEstudiante> => {
    try {
      const response = await apiClient.post<RachaEstudiante>(
        `/gamificacion/recursos/${estudianteId}/racha`,
      );
      // TODO: Crear schema Zod en contracts para validar esta respuesta
      return response;
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      throw error;
    }
  },
};
