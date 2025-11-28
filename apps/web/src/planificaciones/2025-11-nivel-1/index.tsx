/**
 * ============================================================================
 * PLANIFICACIÓN NOVIEMBRE 2025 - NIVEL 1 (6-7 AÑOS)
 * ============================================================================
 *
 * ⚠️ ARMAR AQUÍ TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA
 *
 * Esta es la planificación para el mes de Noviembre 2025, Nivel 1 (Grupo B1).
 *
 * INSTRUCCIONES:
 * 1. Editá el metadata.json con los datos de tu planificación
 * 2. Creá tu aplicación React completamente personalizada aquí
 * 3. Agregá tus juegos, actividades y narrativa
 * 4. Guardá assets (imágenes, sonidos) en la carpeta assets/
 *
 * LIBERTAD TOTAL:
 * - Podés usar cualquier librería de React
 * - Crear animaciones con CSS, Framer Motion, etc.
 * - Usar Canvas, SVG, WebGL
 * - Integrar videos y audios
 * - ¡Lo que se te ocurra!
 *
 * El wrapper <PlanificacionApp> maneja automáticamente:
 * - Autenticación del estudiante
 * - Tracking de progreso
 * - Guardado de estado
 * - Puntos de gamificación
 *
 * ============================================================================
 */

'use client';

import { PlanificacionApp } from '@/planificaciones/shared';

export default function PlanificacionNoviembre2025Nivel1() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="COMPLETAR: Título de tu planificación"
      descripcion="COMPLETAR: Descripción breve"
    >
      {/* ========================================
          EMPEZÁ A CONSTRUIR TU APP AQUÍ
          ======================================== */}

      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white text-center mb-8">
            🎮 Nivel 1 - Noviembre 2025
          </h1>

          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">⚠️ Planificación por armar</h2>

            <p className="text-xl text-gray-600 mb-6">
              Esta es una plantilla base. Reemplazá todo este contenido con tu aplicación React
              personalizada.
            </p>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="font-bold text-yellow-800">📝 Recordá:</p>
              <ul className="list-disc list-inside text-yellow-700 mt-2">
                <li>Completar metadata.json</li>
                <li>Crear tu narrativa inmersiva</li>
                <li>Programar los juegos y actividades</li>
                <li>Agregar assets necesarios</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Ejemplo básico:</h3>

              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors">
                ▶️ Iniciar Aventura
              </button>

              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors">
                📚 Ver Instrucciones
              </button>

              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors">
                🏆 Ver Progreso
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          FIN DEL TEMPLATE - REEMPLAZAR TODO
          ======================================== */}
    </PlanificacionApp>
  );
}
