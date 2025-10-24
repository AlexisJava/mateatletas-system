/**
 * ============================================================================
 * PLANIFICACIÓN NOVIEMBRE 2025 - NIVEL 2 (8-9 AÑOS)
 * ============================================================================
 *
 * ⚠️ ARMAR AQUÍ TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA
 *
 * Esta es la planificación para el mes de Noviembre 2025, Nivel 2 (Grupos B2, B3).
 *
 * INSTRUCCIONES:
 * 1. Editá el metadata.json con los datos de tu planificación
 * 2. Creá tu aplicación React completamente personalizada aquí
 * 3. Agregá tus juegos, actividades y narrativa
 * 4. Guardá assets (imágenes, sonidos) en la carpeta assets/
 *
 * CARACTERÍSTICAS SUGERIDAS PARA NIVEL 2:
 * - Desafíos cronometrados
 * - Sistemas de niveles y progresión
 * - Competencias amistosas
 * - Narrativas más elaboradas
 * - Feedback detallado
 *
 * LIBERTAD TOTAL:
 * - Podés usar cualquier librería de React
 * - Crear animaciones complejas
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

export default function PlanificacionNoviembre2025Nivel2() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-2"
      titulo="COMPLETAR: Título de tu planificación"
      descripcion="COMPLETAR: Descripción breve"
    >
      {/* ========================================
          EMPEZÁ A CONSTRUIR TU APP AQUÍ
          ======================================== */}

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
            🚀 Nivel 2 - Noviembre 2025
          </h1>

          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ⚠️ Planificación por armar
            </h2>

            <p className="text-xl text-gray-600 mb-6">
              Esta es una plantilla base. Reemplazá todo este contenido con tu aplicación React personalizada.
            </p>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="font-bold text-yellow-800">📝 Recordá:</p>
              <ul className="list-disc list-inside text-yellow-700 mt-2">
                <li>Completar metadata.json</li>
                <li>Crear narrativa inmersiva para 8-9 años</li>
                <li>Programar juegos con desafíos cronometrados</li>
                <li>Implementar sistema de progresión</li>
                <li>Agregar assets necesarios</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                <h4 className="font-bold text-blue-800 text-lg mb-2">Semana 1</h4>
                <p className="text-blue-600">Completar objetivo</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300">
                <h4 className="font-bold text-green-800 text-lg mb-2">Semana 2</h4>
                <p className="text-green-600">Completar objetivo</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-300">
                <h4 className="font-bold text-purple-800 text-lg mb-2">Semana 3</h4>
                <p className="text-purple-600">Completar objetivo</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-300">
                <h4 className="font-bold text-orange-800 text-lg mb-2">Semana 4</h4>
                <p className="text-orange-600">Completar objetivo</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Ejemplo básico:</h3>

              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105">
                ▶️ Iniciar Misión
              </button>

              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105">
                📊 Ver Estadísticas
              </button>

              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105">
                🏆 Logros y Badges
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
