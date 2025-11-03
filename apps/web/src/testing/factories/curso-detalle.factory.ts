import type { ApiResponse, CursoDetalle, Leccion } from '@mateatletas/contracts';

/**
 * Factory para mocks de respuestas de detalle de curso en tests frontend
 */
export const buildCursoDetalleResponse = (
  overrides: Partial<CursoDetalle> = {},
): ApiResponse<CursoDetalle> => {
  const baseLeccion: Leccion = {
    id: 'lec-front-1',
    modulo_id: 'mod-front-1',
    titulo: 'Razones trigonométricas',
    descripcion: 'Seno, coseno y tangente.',
    tipo_contenido: 'Texto',
    contenido: { contenido: '# Razones trigonométricas' },
    orden: 1,
    duracion_estimada_minutos: 20,
    puntos: 15,
    publicado: true,
    leccion_prerequisito_id: null,
    logro_desbloqueado_id: null,
    createdAt: '2025-11-25T00:00:00.000Z',
    updatedAt: '2025-11-25T00:00:00.000Z',
  };

  const baseData: CursoDetalle = {
    producto: {
      id: 'curso-frontend',
      nombre: 'Curso Avanzado de Geometría',
      descripcion: 'Geometría plana y espacial aplicada.',
      precio: 4200,
      tipo: 'Curso',
      activo: true,
      createdAt: '2025-11-20T00:00:00.000Z',
      updatedAt: '2025-11-20T00:00:00.000Z',
      fecha_inicio: '2025-12-01T00:00:00.000Z',
      fecha_fin: '2026-01-12T00:00:00.000Z',
      cupo_maximo: 20,
    },
    modulos: [
      {
        id: 'mod-front-1',
        producto_id: 'curso-frontend',
        titulo: 'Trigonometría',
        descripcion: 'Identidades y aplicaciones',
        orden: 1,
        duracion_estimada_minutos: 90,
        puntos_totales: 45,
        publicado: true,
        createdAt: '2025-11-20T00:00:00.000Z',
        updatedAt: '2025-11-20T00:00:00.000Z',
        lecciones: [baseLeccion],
      },
    ],
    progreso: {
      producto_id: 'curso-frontend',
      total_modulos: 1,
      total_lecciones: 1,
      lecciones_completadas: 1,
      porcentaje_completado: 100,
      puntos_ganados: 15,
      tiempo_total_minutos: 20,
      siguiente_leccion: baseLeccion,
    },
  };

  const data: CursoDetalle = {
    ...baseData,
    ...overrides,
    producto: {
      ...baseData.producto,
      ...(overrides.producto ?? {}),
    },
    modulos: overrides.modulos ?? baseData.modulos,
    progreso: overrides.progreso ?? baseData.progreso,
  };

  return {
    success: true,
    message: 'Detalle del curso cargado con éxito',
    data,
  };
};
