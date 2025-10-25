/**
 * EJEMPLO MÍNIMO DE PLANIFICACIÓN
 *
 * Este es un ejemplo funcional completo de cómo crear una planificación.
 * Copia este archivo y modifícalo según tus necesidades.
 */

'use client';

import { PlanificacionWrapper, usePlanificacion } from '@/planificaciones/shared';
import type { PlanificacionConfig } from '@/planificaciones/shared';
import { useState } from 'react';

// ============================================================================
// CONFIGURACIÓN (solo estas 6 líneas)
// ============================================================================
export const PLANIFICACION_CONFIG: PlanificacionConfig = {
  codigo: 'ejemplo-minimo',
  titulo: 'Ejemplo Mínimo - Planificación de Prueba',
  grupo: 'B1',
  mes: 11,
  anio: 2025,
  semanas: 2, // Solo 2 semanas para el ejemplo
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EjemploMinimo() {
  return (
    <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
      <ContenidoPlanificacion />
    </PlanificacionWrapper>
  );
}

// ============================================================================
// CONTENIDO (aquí va tu lógica)
// ============================================================================
function ContenidoPlanificacion() {
  // Acceso a todos los datos y funciones de la planificación
  const {
    progreso,
    semanasInfo,
    guardarEstado,
    avanzarSemana,
    completarSemana,
  } = usePlanificacion();

  const [estadoLocal, setEstadoLocal] = useState({
    nivel: 1,
    vidas: 3,
    itemsDesbloqueados: [] as string[],
  });

  // Semana actual desde el progreso
  const semanaActual = progreso?.semanaActual || 1;

  // Handler para guardar estado
  const handleGuardar = async () => {
    try {
      await guardarEstado(estadoLocal);
      alert('¡Estado guardado!');
    } catch (err) {
      alert('Error al guardar');
    }
  };

  // Handler para completar semana
  const handleCompletar = async () => {
    try {
      await completarSemana(100); // 100 puntos
      alert('¡Semana completada!');
    } catch (err) {
      alert('Error al completar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            {PLANIFICACION_CONFIG.titulo}
          </h1>
          <p className="text-2xl text-white/80">
            Semana {semanaActual} de {PLANIFICACION_CONFIG.semanas}
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {/* Info del progreso */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600">Tiempo Total</p>
              <p className="text-3xl font-bold text-blue-600">
                {progreso?.tiempoTotalMinutos || 0} min
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600">Puntos</p>
              <p className="text-3xl font-bold text-purple-600">
                {progreso?.puntosTotales || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="text-3xl font-bold text-green-600">
                {estadoLocal.nivel}
              </p>
            </div>
          </div>

          {/* Contenido por semana */}
          {semanaActual === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Semana 1: Introducción
              </h2>
              <p className="text-gray-600 mb-6">
                Bienvenido a la planificación de ejemplo. Aquí puedes poner cualquier
                contenido React que quieras.
              </p>

              {/* Ejemplo de juego simple */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 text-white mb-6">
                <h3 className="text-2xl font-bold mb-4">🎮 Minijuego de Prueba</h3>
                <div className="flex items-center gap-4 mb-4">
                  <p>Nivel: {estadoLocal.nivel}</p>
                  <p>Vidas: {'❤️'.repeat(estadoLocal.vidas)}</p>
                </div>
                <button
                  onClick={() => {
                    setEstadoLocal((prev) => ({ ...prev, nivel: prev.nivel + 1 }));
                  }}
                  className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
                >
                  ⬆️ Subir Nivel
                </button>
              </div>

              <button
                onClick={handleCompletar}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-xl hover:shadow-lg transition-all"
              >
                ✅ Completar Semana 1
              </button>
            </div>
          )}

          {semanaActual === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Semana 2: Desafío Final
              </h2>
              <p className="text-gray-600 mb-6">
                ¡Llegaste a la segunda semana! Aquí pondría el contenido avanzado.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
                <p className="font-bold text-yellow-800">🎉 ¡Felicitaciones!</p>
                <p className="text-yellow-700">
                  Completaste la Semana 1 y desbloqueaste la Semana 2.
                </p>
              </div>

              <button
                onClick={handleCompletar}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-xl hover:shadow-lg transition-all"
              >
                ✅ Completar Semana 2
              </button>
            </div>
          )}
        </div>

        {/* Botones de control */}
        <div className="flex gap-4">
          <button
            onClick={handleGuardar}
            className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-lg text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
          >
            💾 Guardar Progreso
          </button>

          {semanaActual < PLANIFICACION_CONFIG.semanas && (
            <button
              onClick={avanzarSemana}
              className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-lg text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
            >
              ➡️ Siguiente Semana (sin completar)
            </button>
          )}
        </div>

        {/* Info de debug */}
        <div className="mt-8 p-4 bg-black/20 backdrop-blur-lg rounded-xl text-white text-sm font-mono">
          <p>Debug Info:</p>
          <p>• Semanas activas: {semanasInfo.semanasActivas.join(', ')}</p>
          <p>• Puede acceder a semana {semanaActual}: {semanasInfo.puedeAcceder(semanaActual) ? '✅' : '❌'}</p>
          <p>• Estado guardado: {progreso?.estadoGuardado ? JSON.stringify(progreso.estadoGuardado).substring(0, 50) + '...' : 'null'}</p>
        </div>
      </div>
    </div>
  );
}
