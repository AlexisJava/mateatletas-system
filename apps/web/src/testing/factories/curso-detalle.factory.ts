import type { ApiResponse, CursoDetalle } from '@mateatletas/shared';

/**
 * Factory para mocks de respuestas de detalle de curso en tests frontend
 */
export const buildCursoDetalleResponse = (
  data: Partial<CursoDetalle> = {},
): ApiResponse<CursoDetalle> => ({
  success: true,
  message: 'Detalle del curso cargado con éxito',
  data: {
    id: 'curso-frontend',
    nombre: 'Curso Avanzado de Geometría',
    descripcion: 'Geometría plana y espacial aplicada.',
    precio: 4200,
    tipo: 'Curso',
    activo: true,
    fecha_inicio: '2025-12-01T00:00:00.000Z',
    fecha_fin: '2026-01-12T00:00:00.000Z',
    cupo_maximo: 20,
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
        lecciones: [
          {
            id: 'lec-front-1',
            modulo_id: 'mod-front-1',
            titulo: 'Razones trigonométricas',
            descripcion: 'Seno, coseno y tangente.',
            tipo_contenido: 'Texto',
            contenido: { markdown: '# Razones trigonométricas' },
            orden: 1,
            duracion_estimada_minutos: 20,
            puntos_por_completar: 15,
            activo: true,
            leccion_prerequisito_id: null,
            logro_desbloqueable_id: null,
          },
        ],
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
      siguiente_leccion: null,
    },
    ...data,
  },
});
