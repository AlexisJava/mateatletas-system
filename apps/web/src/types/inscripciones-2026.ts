/**
 * Tipos TypeScript compartidos para el sistema de inscripciones 2026
 * Mirrors backend DTOs para consistencia
 */

/**
 * Tipo de inscripción disponible para 2026
 */
/* eslint-disable no-unused-vars */
export enum TipoInscripcion2026 {
  COLONIA = 'colonia',
  CICLO_2026 = 'ciclo2026',
  PACK_COMPLETO = 'pack-completo',
}

/**
 * Mundos STEAM disponibles para Ciclo 2026
 */
export enum MundoSTEAM {
  MATEMATICA = 'matematica',
  PROGRAMACION = 'programacion',
  CIENCIAS = 'ciencias',
}

/**
 * Estado de la inscripción
 */
export enum EstadoInscripcion {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}
/* eslint-enable no-unused-vars */

/**
 * Datos del padre/madre/tutor al crear inscripción
 */
export interface TutorData {
  nombre: string;
  email: string;
  telefono: string;
  dni?: string;
  cuil: string; // CUIL/CUIT para facturación (11 dígitos sin guiones)
  password: string;
  confirmPassword?: string; // Solo para validación en frontend
}

/**
 * Curso de colonia seleccionado
 */
export interface CourseSelection {
  course_id: string;
  course_name: string;
  course_area: string;
  instructor: string;
  day_of_week: string;
  time_slot: string;
}

/**
 * Datos de estudiante a inscribir
 */
export interface EstudianteInscripcion {
  nombre: string;
  edad: number;
  dni?: string;
  cursos_seleccionados?: CourseSelection[];
  mundo_seleccionado?: MundoSTEAM;
}

/**
 * Request para crear una inscripción 2026
 */
export interface CreateInscripcion2026Request {
  tipo_inscripcion: TipoInscripcion2026;
  tutor: TutorData;
  estudiantes: EstudianteInscripcion[];
  origen_inscripcion?: string;
  ciudad?: string;
}

/**
 * Estudiante creado en la respuesta
 */
export interface EstudianteCreado {
  id: string;
  nombre: string;
  pin: string;
}

/**
 * Información de pago en la respuesta
 */
export interface PagoInfo {
  monto_total: number;
  descuento_aplicado: number;
  mercadopago_preference_id: string;
  mercadopago_init_point: string;
}

/**
 * Response al crear una inscripción 2026
 */
export interface CreateInscripcion2026Response {
  success: boolean;
  inscripcion_id: string;
  tutor_id: string;
  estudiantes_creados: EstudianteCreado[];
  pago_info: PagoInfo;
}

/**
 * Curso de colonia guardado en la BD
 */
export interface ColoniaCursoSeleccionado {
  id: string;
  course_id: string;
  course_name: string;
  course_area: string;
  instructor: string;
  day_of_week: string;
  time_slot: string;
  precio_base: number;
  precio_con_descuento: number;
}

/**
 * Mundo STEAM seleccionado guardado en la BD
 */
export interface CicloMundoSeleccionado {
  id: string;
  mundo: MundoSTEAM;
  dia_semana?: string;
  horario?: string;
}

/**
 * Estudiante inscrito (desde BD)
 */
export interface EstudianteInscripcion2026 {
  id: string;
  inscripcion_id: string;
  estudiante_id: string;
  nombre: string;
  edad: number;
  dni?: string;
  pin: string;
  cursos_colonia?: ColoniaCursoSeleccionado[];
  mundos_ciclo?: CicloMundoSeleccionado[];
}

/**
 * Pago de inscripción (desde BD)
 */
export interface PagoInscripcion {
  id: string;
  inscripcion_id: string;
  tipo: 'inscripcion' | 'mensualidad';
  mes?: string;
  anio?: number;
  monto: number;
  estado: string;
  mercadopago_preference_id?: string;
  mercadopago_payment_id?: string;
  fecha_vencimiento?: string;
  fecha_pago?: string;
}

/**
 * Historial de cambio de estado (desde BD)
 */
export interface HistorialEstado {
  id: string;
  inscripcion_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  razon: string;
  realizado_por: string;
  fecha_cambio: string;
}

/**
 * Inscripción completa (desde BD)
 */
export interface Inscripcion2026 {
  id: string;
  tutor_id: string;
  tipo_inscripcion: TipoInscripcion2026;
  estado: EstadoInscripcion;
  inscripcion_pagada: number;
  descuento_aplicado: number;
  total_mensual_actual: number;
  fecha_inscripcion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  createdAt: string;
  updatedAt: string;
  estudiantes?: EstudianteInscripcion2026[];
  pagos?: PagoInscripcion[];
  historial_estado_cambios?: HistorialEstado[];
}

/**
 * Constantes de precios
 */
export const PRECIOS_2026 = {
  COLONIA: {
    INSCRIPCION: 25000,
    CURSO_BASE: 55000,
    DESCUENTO_SEGUNDO_CURSO: 12, // %
  },
  CICLO_2026: {
    INSCRIPCION_EARLY_BIRD: 50000,
    MENSUALIDAD: 60000,
  },
  PACK_COMPLETO: {
    INSCRIPCION_TOTAL: 60000, // Ahorro de $15,000
    MENSUALIDAD_COLONIA: 55000, // Enero-Febrero
    MENSUALIDAD_CICLO: 60000, // Marzo-Diciembre
  },
  DESCUENTOS_HERMANOS: {
    DOS_HERMANOS: 12, // %
    TRES_O_MAS: 24, // %
  },
} as const;

/**
 * Helper: Calcula el precio de inscripción según tipo
 */
export function calcularPrecioInscripcion(tipo: TipoInscripcion2026): number {
  switch (tipo) {
    case TipoInscripcion2026.COLONIA:
      return PRECIOS_2026.COLONIA.INSCRIPCION;
    case TipoInscripcion2026.CICLO_2026:
      return PRECIOS_2026.CICLO_2026.INSCRIPCION_EARLY_BIRD;
    case TipoInscripcion2026.PACK_COMPLETO:
      return PRECIOS_2026.PACK_COMPLETO.INSCRIPCION_TOTAL;
  }
}

/**
 * Helper: Calcula descuento por hermanos
 */
export function calcularDescuentoHermanos(numEstudiantes: number): number {
  if (numEstudiantes === 2) return PRECIOS_2026.DESCUENTOS_HERMANOS.DOS_HERMANOS;
  if (numEstudiantes >= 3) return PRECIOS_2026.DESCUENTOS_HERMANOS.TRES_O_MAS;
  return 0;
}

/**
 * Helper: Calcula total estimado de inscripción
 */
export function calcularTotalEstimado(
  tipo: TipoInscripcion2026,
  numEstudiantes: number,
  cursosPerEstudiante: number[] = [],
): { inscripcion: number; mensual: number; descuento: number } {
  const inscripcion = calcularPrecioInscripcion(tipo);
  const descuento = calcularDescuentoHermanos(numEstudiantes);

  let mensual = 0;

  switch (tipo) {
    case TipoInscripcion2026.COLONIA:
      // $55,000 por curso, con 12% descuento en segundo curso
      cursosPerEstudiante.forEach((numCursos) => {
        if (numCursos === 1) {
          mensual += PRECIOS_2026.COLONIA.CURSO_BASE;
        } else if (numCursos === 2) {
          const segundoCurso = Math.floor(
            PRECIOS_2026.COLONIA.CURSO_BASE *
              (1 - PRECIOS_2026.COLONIA.DESCUENTO_SEGUNDO_CURSO / 100),
          );
          mensual += PRECIOS_2026.COLONIA.CURSO_BASE + segundoCurso;
        }
      });
      break;

    case TipoInscripcion2026.CICLO_2026:
      mensual = numEstudiantes * PRECIOS_2026.CICLO_2026.MENSUALIDAD;
      break;

    case TipoInscripcion2026.PACK_COMPLETO:
      // Suma de ambos
      cursosPerEstudiante.forEach((numCursos) => {
        if (numCursos === 1) {
          mensual += PRECIOS_2026.PACK_COMPLETO.MENSUALIDAD_COLONIA;
        } else if (numCursos === 2) {
          const segundoCurso = Math.floor(
            PRECIOS_2026.PACK_COMPLETO.MENSUALIDAD_COLONIA *
              (1 - PRECIOS_2026.COLONIA.DESCUENTO_SEGUNDO_CURSO / 100),
          );
          mensual += PRECIOS_2026.PACK_COMPLETO.MENSUALIDAD_COLONIA + segundoCurso;
        }
      });
      mensual += numEstudiantes * PRECIOS_2026.PACK_COMPLETO.MENSUALIDAD_CICLO;
      break;
  }

  // Aplicar descuento por hermanos al total mensual
  const mensualConDescuento = Math.floor(mensual * (1 - descuento / 100));

  return {
    inscripcion,
    mensual: mensualConDescuento,
    descuento,
  };
}
