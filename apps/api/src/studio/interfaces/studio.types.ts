/**
 * Tipos e interfaces específicos del módulo Studio
 * Complementan los tipos de Prisma con interfaces de dominio
 */

import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  TipoExperienciaStudio,
  MateriaStudio,
  EstadoCursoStudio,
  EstadoSemanaStudio,
  TipoRecursoStudio,
} from '@prisma/client';

// Re-export de enums de Prisma para uso en el módulo
export {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  TipoExperienciaStudio,
  MateriaStudio,
  EstadoCursoStudio,
  EstadoSemanaStudio,
  TipoRecursoStudio,
};

/**
 * Respuesta al crear un curso
 */
export interface CrearCursoResponse {
  id: string;
  nombre: string;
  estado: EstadoCursoStudio;
  cantidadSemanas: number;
}

/**
 * Respuesta al listar cursos
 */
export interface CursoListItem {
  id: string;
  nombre: string;
  categoria: CategoriaStudio;
  mundo: MundoTipo;
  casa: CasaTipo;
  estado: EstadoCursoStudio;
  cantidadSemanas: number;
  semanasCompletas: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

/**
 * Curso completo con semanas
 */
export interface CursoCompleto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaStudio;
  mundo: MundoTipo;
  casa: CasaTipo;
  tierMinimo: TierNombre;
  tipoExperiencia: TipoExperienciaStudio | null;
  materia: MateriaStudio | null;
  esteticaBase: string;
  esteticaVariante: string | null;
  cantidadSemanas: number;
  actividadesPorSemana: number;
  estado: EstadoCursoStudio;
  landingMundo: boolean;
  landingHome: boolean;
  catalogoInterno: boolean;
  notificarUpgrade: boolean;
  fechaVenta: Date | null;
  fechaDisponible: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
  semanas: SemanaResumen[];
}

/**
 * Resumen de semana para listado
 */
export interface SemanaResumen {
  id: string;
  numero: number;
  nombre: string | null;
  estado: EstadoSemanaStudio;
}

/**
 * Semana completa con contenido
 */
export interface SemanaCompleta {
  id: string;
  cursoId: string;
  numero: number;
  nombre: string | null;
  descripcion: string | null;
  contenido: SemanaContenidoJson | null;
  estado: EstadoSemanaStudio;
  creadoEn: Date;
  actualizadoEn: Date;
}

/**
 * Estructura del JSON de contenido de semana
 * Según docs/MATEATLETAS_STUDIO.md Sección 6
 */
export interface SemanaContenidoJson {
  numero: number;
  nombre: string;
  descripcion: string;
  objetivosAprendizaje: string[];
  actividades: ActividadJson[];
  recursos: RecursoReferenciaJson[];
  resumenGamificacion: {
    xpTotalSemana: number;
    xpBonusPosible: number;
    badgesPosibles: string[];
  };
}

export interface ActividadJson {
  numero: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  objetivos: string[];
  prerrequisitos: PrerequisitoJson[] | null;
  bloques: BloqueJson[];
  gamificacion: {
    xpCompletar: number;
    xpBonusSinErrores: number;
    badge: string | null;
  };
  notasDocente: string | null;
}

export interface PrerequisitoJson {
  tipo: 'actividad';
  id: string;
}

export interface BloqueJson {
  orden: number;
  componente: string;
  titulo: string;
  contenido: Record<string, unknown>;
  minimoParaAprobar?: number;
  repasoSiFalla?: BloqueJson;
  desbloquea: number | null;
}

export interface RecursoReferenciaJson {
  id: string;
  tipo: 'imagen' | 'audio' | 'video' | 'documento';
  nombre: string;
  archivo: string;
  tamanioBytes: number;
  usadoEn: string[];
}

/**
 * Resultado de validación de semana
 */
export interface ValidacionSemanaResult {
  valido: boolean;
  errores: ValidacionError[];
  warnings: ValidacionWarning[];
  info: ValidacionInfo[];
}

export interface ValidacionError {
  tipo: 'error';
  ubicacion: string;
  mensaje: string;
  sugerencia?: string;
}

export interface ValidacionWarning {
  tipo: 'warning';
  ubicacion: string;
  mensaje: string;
  ignorable: boolean;
}

export interface ValidacionInfo {
  tipo: 'info';
  mensaje: string;
}

/**
 * Configuración de upload de recursos
 */
export interface UploadConfig {
  formatos: string[];
  maxSize: number;
}

export const UPLOAD_CONFIG: Record<TipoRecursoStudio, UploadConfig> = {
  IMAGEN: {
    formatos: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  AUDIO: {
    formatos: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
  VIDEO: {
    formatos: ['video/mp4', 'video/webm'],
    maxSize: 100 * 1024 * 1024, // 100 MB
  },
  DOCUMENTO: {
    formatos: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
};
