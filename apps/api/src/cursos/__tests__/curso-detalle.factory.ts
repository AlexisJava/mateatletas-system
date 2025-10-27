import type { ApiResponse, CursoDetalle, Leccion } from '@mateatletas/shared';

/**
 * Factory helper para crear respuestas de curso detallado en tests
 */
export function createCursoDetalleResponse(
  overrides: Partial<CursoDetalle> = {},
): ApiResponse<CursoDetalle> {
  const baseLeccion: Leccion = {
    id: 'lec-1',
    modulo_id: 'mod-1',
    titulo: 'Introducción a variables',
    descripcion: 'Comprender variables y constantes',
    tipo_contenido: 'Video',
    contenido: { url: 'https://videos.matea/variables' },
    orden: 1,
    duracion_estimada_minutos: 15,
    puntos: 10,
    publicado: true,
    leccion_prerequisito_id: null,
    logro_desbloqueado_id: null,
    createdAt: '2025-11-01T00:00:00.000Z',
    updatedAt: '2025-11-01T00:00:00.000Z',
  };

  const baseCurso: CursoDetalle = {
    producto: {
      id: 'curso-1',
      nombre: 'Curso Intensivo de Álgebra',
      descripcion: 'Domina las bases del álgebra en 4 semanas.',
      precio: 3500,
      tipo: 'Curso',
      activo: true,
      createdAt: '2025-11-01T00:00:00.000Z',
      updatedAt: '2025-11-01T00:00:00.000Z',
      fecha_inicio: '2025-11-15T00:00:00.000Z',
      fecha_fin: '2025-12-13T00:00:00.000Z',
      cupo_maximo: 25,
    },
    modulos: [
      {
        id: 'mod-1',
        producto_id: 'curso-1',
        titulo: 'Fundamentos',
        descripcion: 'Conceptos esenciales para comenzar',
        orden: 1,
        duracion_estimada_minutos: 120,
        puntos_totales: 60,
        publicado: true,
        createdAt: '2025-11-01T00:00:00.000Z',
        updatedAt: '2025-11-01T00:00:00.000Z',
        lecciones: [baseLeccion],
      },
    ],
    progreso: {
      producto_id: 'curso-1',
      total_modulos: 1,
      total_lecciones: 1,
      lecciones_completadas: 0,
      porcentaje_completado: 0,
      puntos_ganados: 0,
      tiempo_total_minutos: 0,
      siguiente_leccion: baseLeccion,
    },
  };

  const data: CursoDetalle = {
    ...baseCurso,
    ...overrides,
    producto: {
      ...baseCurso.producto,
      ...(overrides.producto ?? {}),
    },
    modulos: overrides.modulos ?? baseCurso.modulos,
    progreso: overrides.progreso ?? baseCurso.progreso,
  };

  return {
    success: true,
    data,
    message: 'Curso detallado obtenido correctamente',
  };
}
