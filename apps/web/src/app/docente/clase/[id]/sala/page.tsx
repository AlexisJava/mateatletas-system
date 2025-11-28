'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { LoadingSpinner } from '@/components/effects';
import { ArrowLeft, Users, Clock, Video, CheckCircle, Calendar } from 'lucide-react';

/**
 * Sala de Clase - Vista del Docente
 *
 * NOTA: Videollamadas deshabilitadas temporalmente.
 * Esta página permite al docente ver información de la clase y gestionar estudiantes.
 */

interface ClaseData {
  id: string;
  ruta_curricular?: {
    nombre: string;
    color: string;
  } | null;
  rutaCurricular?: {
    nombre: string;
    color: string;
  } | null;
  fecha_hora_inicio: string;
  duracion_minutos: number;
  cupos_ocupados: number;
  cupos_maximo: number;
}

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  avatar?: string;
}

export default function SalaClaseDocentePage() {
  const params = useParams();
  const router = useRouter();
  const [clase, setClase] = useState<ClaseData | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const claseId = params.id as string;

  // Cargar datos de la clase
  useEffect(() => {
    const fetchClase = async () => {
      try {
        // El interceptor ya retorna response.data directamente
        const claseData = await apiClient.get<ClaseData>(`/clases/${claseId}`);
        setClase(claseData);

        // Cargar estudiantes inscritos
        const estudiantesData = await apiClient.get<Estudiante[]>(`/clases/${claseId}/estudiantes`);
        setEstudiantes(estudiantesData);
      } catch {
        // Error loading class
      } finally {
        setIsLoading(false);
      }
    };

    if (claseId) {
      fetchClase();
    }
  }, [claseId]);

  const handleFinalizarClase = () => {
    router.push(`/docente/clases/${claseId}/asistencia`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!clase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Clase no encontrada</h2>
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const rutaCurricular = clase.ruta_curricular ?? clase.rutaCurricular;
  const rutaNombre = rutaCurricular?.nombre ?? 'Sin ruta';
  const cuposDisponibles = Math.max(clase.cupos_maximo - clase.cupos_ocupados, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/docente/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>{clase.duracion_minutos} min</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>
                  {clase.cupos_ocupados}/{clase.cupos_maximo} estudiantes
                  {` (${cuposDisponibles} disponibles)`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Container - Deshabilitado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Videollamadas temporalmente deshabilitadas
                </h2>
                <p className="text-gray-600 mb-6">
                  La funcionalidad de videollamadas está en mantenimiento.
                  <br />
                  Por favor, usa tu herramienta preferida para la clase virtual.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Información de la Clase</h3>
                  <div className="text-left space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Curso:</span> {rutaNombre}
                    </p>
                    <p>
                      <span className="font-medium">Duración:</span> {clase.duracion_minutos}{' '}
                      minutos
                    </p>
                    <p>
                      <span className="font-medium">Estudiantes:</span> {clase.cupos_ocupados}{' '}
                      inscritos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Estudiantes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Estudiantes Inscritos ({estudiantes.length})
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {estudiantes.length > 0 ? (
                  estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {estudiante.nombre.charAt(0)}
                        {estudiante.apellido.charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {estudiante.nombre} {estudiante.apellido}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay estudiantes inscritos</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleFinalizarClase}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Finalizar y Tomar Asistencia
                </button>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/docente/clases/${claseId}/asistencia`)}
                  className="w-full flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left"
                >
                  <Calendar className="w-5 h-5 mr-3 text-gray-600" />
                  <span className="text-sm">Ver Asistencia</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
