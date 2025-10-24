/**
 * ============================================================================
 * PLANIFICACIÓN NOVIEMBRE 2025 - NIVEL 3 (10-12 AÑOS)
 * ============================================================================
 *
 * ⚠️ ARMAR AQUÍ TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA
 *
 * Esta es la planificación para el mes de Noviembre 2025, Nivel 3 (Grupos B4, L1, L2).
 *
 * INSTRUCCIONES:
 * 1. Editá el metadata.json con los datos de tu planificación
 * 2. Creá tu aplicación React completamente personalizada aquí
 * 3. Agregá tus juegos, actividades y narrativa
 * 4. Guardá assets (imágenes, sonidos, modelos 3D) en la carpeta assets/
 *
 * CARACTERÍSTICAS SUGERIDAS PARA NIVEL 3:
 * - Simulaciones interactivas complejas
 * - Visualizaciones de datos en tiempo real
 * - Programación visual (tipo Scratch)
 * - Desafíos de pensamiento crítico
 * - Narrativas multi-lineales
 * - Sistemas de decisiones complejas
 * - Análisis de rendimiento detallado
 *
 * TECNOLOGÍAS SUGERIDAS:
 * - Visualización: Chart.js, D3.js, Recharts
 * - 3D: Three.js, React Three Fiber
 * - Animaciones: Framer Motion, GSAP
 * - Física: Matter.js, Cannon.js
 * - Programación visual: Blockly
 *
 * LIBERTAD TOTAL:
 * - Podés usar cualquier librería de React
 * - Crear visualizaciones complejas
 * - Implementar simulaciones científicas
 * - Hacer juegos con física realista
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

export default function PlanificacionNoviembre2025Nivel3() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-3"
      titulo="COMPLETAR: Título de tu planificación"
      descripcion="COMPLETAR: Descripción breve"
    >
      {/* ========================================
          EMPEZÁ A CONSTRUIR TU APP AQUÍ
          ======================================== */}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-center mb-8 drop-shadow-2xl">
            🔬 Nivel 3 - Noviembre 2025
          </h1>

          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-purple-500">
            <h2 className="text-3xl font-bold text-white mb-4">
              ⚠️ Planificación por armar
            </h2>

            <p className="text-xl text-gray-300 mb-6">
              Esta es una plantilla base. Reemplazá todo este contenido con tu aplicación React personalizada de nivel avanzado.
            </p>

            <div className="bg-yellow-900 bg-opacity-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
              <p className="font-bold text-yellow-300">📝 Recordá:</p>
              <ul className="list-disc list-inside text-yellow-200 mt-2 space-y-1">
                <li>Completar metadata.json</li>
                <li>Crear narrativa compleja para 10-12 años</li>
                <li>Programar simulaciones interactivas</li>
                <li>Implementar visualizaciones de datos</li>
                <li>Agregar desafíos de pensamiento crítico</li>
                <li>Considerar usar librerías avanzadas (Three.js, D3.js, etc.)</li>
                <li>Agregar assets necesarios (incluyendo modelos 3D si usás)</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-xl border border-blue-500">
                <h4 className="font-bold text-blue-200 text-lg mb-2">📐 Semana 1</h4>
                <p className="text-blue-300 text-sm">Completar objetivo matemático avanzado</p>
              </div>

              <div className="bg-gradient-to-br from-green-900 to-green-700 p-6 rounded-xl border border-green-500">
                <h4 className="font-bold text-green-200 text-lg mb-2">🔢 Semana 2</h4>
                <p className="text-green-300 text-sm">Completar objetivo matemático avanzado</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-6 rounded-xl border border-purple-500">
                <h4 className="font-bold text-purple-200 text-lg mb-2">📊 Semana 3</h4>
                <p className="text-purple-300 text-sm">Completar objetivo matemático avanzado</p>
              </div>

              <div className="bg-gradient-to-br from-pink-900 to-pink-700 p-6 rounded-xl border border-pink-500">
                <h4 className="font-bold text-pink-200 text-lg mb-2">🧮 Semana 4</h4>
                <p className="text-pink-300 text-sm">Completar objetivo matemático avanzado</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Ejemplo básico:</h3>

              <button className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg">
                🚀 Iniciar Simulación
              </button>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg">
                📈 Dashboard de Análisis
              </button>

              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg">
                🏆 Logros y Rankings
              </button>

              <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg">
                🎯 Desafíos Avanzados
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">
                💡 <strong>Tip:</strong> Para este nivel, considerá usar visualizaciones interactivas, gráficos en tiempo real, o incluso elementos 3D para hacer la experiencia más inmersiva y desafiante.
              </p>
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
