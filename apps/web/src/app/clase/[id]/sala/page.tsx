'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { LoadingSpinner } from '@/components/effects';
import { ModalResumenClase, type ResumenClase } from '@/components/estudiantes/ModalResumenClase';
import { ArrowLeft, Users, Clock, Video } from 'lucide-react';

/**
 * Sala de Clase - Vista del Estudiante
 *
 * NOTA: Videollamadas deshabilitadas temporalmente.
 * Esta página muestra información de la clase y permite registrar asistencia.
 */

interface ClaseData {
  id: string;
  ruta_curricular: {
    nombre: string;
    color: string;
  };
  docente: {
    nombre: string;
    apellido: string;
  };
  fecha_hora_inicio: string;
  duracion_minutos: number;
}

export default function SalaClasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [clase, setClase] = useState<ClaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResumen, setShowResumen] = useState(false);
  const [resumenData, setResumenData] = useState<ResumenClase | null>(null);
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);

  const claseId = params.id as string;

  // Cargar datos de la clase
  useEffect(() => {
    const fetchClase = async () => {
      try {
        const response = await apiClient.get(`/clases/${claseId}`);
        setClase(response);
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

  // Registrar asistencia automáticamente
  useEffect(() => {
    const registrarAsistencia = async () => {
      if (clase && user && !asistenciaRegistrada) {
        try {
          await apiClient.post(`/asistencia/${claseId}/registrar-estudiante`, {
            estudianteId: user.id,
          });
          setAsistenciaRegistrada(true);
        } catch {
          // Error registering attendance
        }
      }
    };

    registrarAsistencia();
  }, [clase, user, claseId, asistenciaRegistrada]);

  const handleSalir = async () => {
    // Simular finalización de clase con datos de ejemplo
    const resumen: ResumenClase = {
      claseNombre: clase?.ruta_curricular.nombre || 'Clase',
      duracionMinutos: clase?.duracion_minutos || 60,
      puntosGanados: 10,
      insigniasDesbloqueadas: [],
      estadisticas: {
        participacion: 85,
        preguntasRespondidas: 8,
        preguntasCorrectas: 6,
        tiempoActivo: 55,
      },
    };

    setResumenData(resumen);
    setShowResumen(true);
  };

  const handleCerrarResumen = () => {
    setShowResumen(false);
    router.push('/estudiante/dashboard');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Clase no encontrada
          </h2>
          <button
            onClick={() => router.push('/estudiante/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/estudiante/dashboard')}
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
                <span>Sala activa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Videollamadas deshabilitadas */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
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
              Por favor, contacta a tu docente para recibir el enlace de la clase.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Información de la Clase
              </h3>
              <div className="text-left space-y-2 text-sm">
                <p>
                  <span className="font-medium">Curso:</span>{' '}
                  {clase.ruta_curricular.nombre}
                </p>
                <p>
                  <span className="font-medium">Docente:</span>{' '}
                  {clase.docente.nombre} {clase.docente.apellido}
                </p>
                <p>
                  <span className="font-medium">Duración:</span>{' '}
                  {clase.duracion_minutos} minutos
                </p>
                {asistenciaRegistrada && (
                  <p className="text-green-600 font-medium">
                    ✓ Tu asistencia ha sido registrada
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSalir}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Finalizar y Ver Resumen
            </button>
          </div>
        </div>
      </div>

      {/* Modal Resumen */}
      {showResumen && resumenData && (
        <ModalResumenClase
          resumen={resumenData}
          onClose={handleCerrarResumen}
        />
      )}
    </div>
  );
}
