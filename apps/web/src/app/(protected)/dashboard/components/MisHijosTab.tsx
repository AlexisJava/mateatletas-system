'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { Estudiante } from '@/types/estudiante';
import {
  estudianteDetalleSchema,
  type EstudianteDetalleFromSchema,
} from '@/lib/schemas/estudiante.schema';
import { Users, Calendar, CheckCircle, Award, TrendingUp } from 'lucide-react';

interface Props {
  estudiantes: Estudiante[];
}

export default function MisHijosTab({ estudiantes }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<EstudianteDetalleFromSchema | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-seleccionar el primer estudiante
  useEffect(() => {
    if (estudiantes.length > 0 && !selectedStudent && estudiantes[0]?.id) {
      setSelectedStudent(estudiantes[0].id);
    }
  }, [estudiantes, selectedStudent]);

  // Cargar detalle del estudiante cuando se selecciona
  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetail(selectedStudent);
    }
  }, [selectedStudent]);

  const loadStudentDetail = async (estudiante_id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get<EstudianteDetalleFromSchema>(
        `/estudiantes/${estudiante_id}/detalle-completo`,
      );
      const parsed = estudianteDetalleSchema.parse(response);
      setStudentDetail(parsed);
    } catch {
      // Error loading student detail
    } finally {
      setLoading(false);
    }
  };

  if (estudiantes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-xl font-bold text-white mb-2">No tienes estudiantes registrados</p>
          <p className="text-gray-400">Agrega tu primer hijo para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
      {/* Lista de Hijos - Sidebar */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-4">Mis Hijos ({estudiantes.length})</h2>
        <div className="space-y-2">
          {estudiantes.map((estudiante) => {
            const initials =
              `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
            const isSelected = selectedStudent === estudiante.id;

            return (
              <button
                key={estudiante.id}
                onClick={() => setSelectedStudent(estudiante.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500 shadow-lg'
                    : 'bg-gray-800 border-gray-700 hover:border-indigo-500 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {estudiante.nombre} {estudiante.apellido}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {estudiante.nivel_escolar || 'Sin nivel'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Hijo - Main Content */}
      <div className="md:col-span-2 bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-white">Cargando información...</p>
            </div>
          </div>
        ) : studentDetail ? (
          <div className="space-y-6">
            {/* Header del Estudiante */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-white/20">
                  {`${studentDetail.nombre.charAt(0)}${studentDetail.apellido.charAt(0)}`.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {studentDetail.nombre} {studentDetail.apellido}
                  </h2>
                  <p className="text-indigo-100">
                    {studentDetail.edad} años • {studentDetail.nivel_escolar || 'Sin nivel'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Estadísticas de Aprendizaje</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.nivel ?? 0}</p>
                  <p className="text-sm opacity-90">Nivel</p>
                </div>

                <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white shadow-lg">
                  <Award className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.puntos ?? 0}</p>
                  <p className="text-sm opacity-90">Puntos XP</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                  <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">
                    {studentDetail.estadisticas.tasa_asistencia}%
                  </p>
                  <p className="text-sm opacity-90">Asistencia</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                  <Award className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.insignias ?? 0}</p>
                  <p className="text-sm opacity-90">Insignias</p>
                </div>
              </div>
            </div>

            {/* Resumen de Clases */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Resumen de Clases</h3>
              <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-indigo-400">
                      {studentDetail.estadisticas.total_clases}
                    </p>
                    <p className="text-sm text-gray-400">Total Clases</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {studentDetail.estadisticas.clases_presente}
                    </p>
                    <p className="text-sm text-gray-400">Asistió</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-400">
                      {studentDetail.estadisticas.total_clases -
                        studentDetail.estadisticas.clases_presente}
                    </p>
                    <p className="text-sm text-gray-400">Faltó</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas Clases */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Últimas 10 Clases Inscritas</h3>
              <div className="space-y-2">
                {studentDetail.inscripciones_clase.length > 0 ? (
                  studentDetail.inscripciones_clase.slice(0, 10).map((inscripcion) => {
                    const clase = inscripcion.clase;
                    const fechaClase = new Date(clase.fecha_hora_inicio);

                    return (
                      <div
                        key={inscripcion.id}
                        className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-indigo-600 rounded-lg p-2">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">
                                {(clase.ruta_curricular ?? clase.rutaCurricular)?.nombre ?? 'Clase'}
                              </h4>
                              <p className="text-sm text-gray-300">
                                {fechaClase.toLocaleDateString('es-AR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}{' '}
                                •{' '}
                                {fechaClase.toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <p className="text-xs text-gray-400">
                                Prof. {clase.docente?.nombre} {clase.docente?.apellido}
                              </p>
                            </div>
                          </div>
                          <div>
                            {fechaClase > new Date() ? (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white">
                                Programada
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                                Finalizada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                    <p>No hay clases inscritas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl font-bold text-white mb-2">Selecciona un hijo</p>
              <p className="text-gray-400">
                Elige un estudiante de la lista para ver su información
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
