// ═══════════════════════════════════════════════════════════════════════════════
// API CLIENT PARA ENVIAR QUIZ AL BACKEND NESTJS
// Solo se llama cuando el usuario completa el quiz
// ═══════════════════════════════════════════════════════════════════════════════

import { QuizResponses, ResultadoRecomendacion, QuizBackendResponse } from '@/types/courses';

// TODO: Reemplazar con la URL real de tu backend en Railway
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface QuizSubmissionPayload {
  // Datos del estudiante
  nombre_estudiante: string;
  edad: number;

  // Respuestas del quiz
  interes_principal: string[];
  nivel_actual: string;
  objetivo: string[];
  tiempo_disponible: string;

  // Resultado de la recomendación
  ruta_recomendada_id: string;
  ruta_recomendada_nombre: string;
  score_match: number;
  alternativas_ids: string[];

  // Contacto del padre (opcional)
  parent_email?: string;
  parent_name?: string;

  // Metadata
  timestamp: string;
}

/**
 * Envía las respuestas del quiz y el resultado al backend NestJS
 */
export async function enviarQuizAlBackend(
  respuestas: QuizResponses,
  resultado: ResultadoRecomendacion,
): Promise<QuizBackendResponse> {
  try {
    const payload: QuizSubmissionPayload = {
      nombre_estudiante: respuestas.nombre_estudiante,
      edad: respuestas.edad,
      interes_principal: respuestas.interes_principal,
      nivel_actual: respuestas.nivel_actual,
      objetivo: respuestas.objetivo,
      tiempo_disponible: respuestas.tiempo_disponible,
      ruta_recomendada_id: resultado.ruta_principal.id,
      ruta_recomendada_nombre: resultado.ruta_principal.nombre,
      score_match: resultado.score_match,
      alternativas_ids: resultado.alternativas.map((r) => r.id),
      parent_email: respuestas.parent_email,
      parent_name: respuestas.parent_name,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${BACKEND_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      quiz_id: data.id || data.quiz_id,
      message: data.message || 'Quiz enviado correctamente',
    };
  } catch (error) {
    console.error('Error enviando quiz al backend:', error);

    // No fallar silenciosamente, pero tampoco bloquear la UX
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al enviar el quiz',
    };
  }
}

/**
 * Opcional: Obtener estadísticas del quiz (para dashboard admin)
 */
export async function obtenerEstadisticasQuiz(): Promise<{
  total_quizzes: number;
  conversion_rate: number;
  ruta_mas_popular: string;
  edad_promedio: number;
} | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/quiz/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return null;
  }
}

/**
 * Opcional: Verificar si el backend está disponible
 */
export async function verificarBackendDisponible(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      timeout: 5000, // 5 segundos timeout
    } as RequestInit);

    return response.ok;
  } catch (error) {
    console.error('Backend no disponible:', error);
    return false;
  }
}
