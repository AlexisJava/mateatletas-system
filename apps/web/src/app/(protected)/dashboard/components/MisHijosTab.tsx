'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { Estudiante } from '@/types/estudiante';
import { Users, Calendar, CheckCircle, Award, TrendingUp } from 'lucide-react';

interface InsigniaEstudiante {
  id: string;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
}

interface Asistencia {
  id: string;
  presente: boolean;
  fecha: string;
}

interface InscripcionClaseDetalle {
  id: string;
  estudiante_id: string;
  clase_id: string;
  estado: string;
  createdAt: string;
  clase: {
    id: string;
    fecha_hora_inicio: string;
    ruta_curricular?: {
      nombre: string;
      color: string;
    } | null;
    docente?: {
      id: string;
      user?: {
        nombre: string;
        apellido: string;
      };
    };
  };
}

interface EstudianteDetalle {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  nivel_escolar?: string;
  avatar_url?: string;
  edad: number;
  perfil_gamificacion: {
    nivel: number;
    puntos_totales: number;
    insignias_estudiante: InsigniaEstudiante[];
  } | null;
  inscripciones_clase: InscripcionClaseDetalle[];
  asistencias: Asistencia[];
  estadisticas: {
    total_clases: number;
    clases_presente: number;
    tasa_asistencia: number;
    nivel: number;
    puntos: number;
    insignias: number;
  };
}

interface Props {
  estudiantes: Estudiante[];
}

export default function MisHijosTab({ estudiantes }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<EstudianteDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-seleccionar el primer estudiante
  useEffect(() => {
    if (estudiantes.length > 0 && !selectedStudent) {
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
      const response = await apiClient.get(`/estudiantes/${estudiante_id}/detalle-completo`);
      console.log('📊 Detalle del estudiante:', response);
      setStudentDetail(response as unknown as EstudianteDetalle);
    } catch (error: unknown) {
      console.error('❌ Error cargando detalle del estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  if (estudiantes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-bold text-gray-900 mb-2">No tienes estudiantes registrados</p>
          <p className="text-gray-600">Agrega tu primer hijo para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
      {/* Lista de Hijos - Sidebar */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Hijos ({estudiantes.length})</h2>
        <div className="space-y-2">
          {estudiantes.map((estudiante) => {
            const initials = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
            const isSelected = selectedStudent === estudiante.id;

            return (
              <button
                key={estudiante.id}
                onClick={() => setSelectedStudent(estudiante.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:shadow-md'
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
                    <h3 className="font-bold text-gray-900 truncate">{estudiante.nombre} {estudiante.apellido}</h3>
                    <p className="text-sm text-gray-500">{estudiante.nivel_escolar || 'Sin nivel'}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Hijo - Main Content */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-lg border-2 border-gray-300 p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Cargando información...</p>
            </div>
          </div>
        ) : studentDetail ? (
          <div className="space-y-6">
            {/* Header del Estudiante */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-white/20"
                >
                  {`${studentDetail.nombre.charAt(0)}${studentDetail.apellido.charAt(0)}`.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{studentDetail.nombre} {studentDetail.apellido}</h2>
                  <p className="text-indigo-100">{studentDetail.edad} años • {studentDetail.nivel_escolar || 'Sin nivel'}</p>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Estadísticas de Aprendizaje</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.nivel}</p>
                  <p className="text-sm opacity-90">Nivel</p>
                </div>

                <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white shadow-lg">
                  <Award className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.puntos}</p>
                  <p className="text-sm opacity-90">Puntos XP</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                  <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.tasa_asistencia}%</p>
                  <p className="text-sm opacity-90">Asistencia</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                  <Award className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{studentDetail.estadisticas.insignias}</p>
                  <p className="text-sm opacity-90">Insignias</p>
                </div>
              </div>
            </div>

            {/* Resumen de Clases */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Resumen de Clases</h3>
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">{studentDetail.estadisticas.total_clases}</p>
                    <p className="text-sm text-gray-600">Total Clases</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{studentDetail.estadisticas.clases_presente}</p>
                    <p className="text-sm text-gray-600">Asistió</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      {studentDetail.estadisticas.total_clases - studentDetail.estadisticas.clases_presente}
                    </p>
                    <p className="text-sm text-gray-600">Faltó</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas Clases */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Últimas 10 Clases Inscritas</h3>
              <div className="space-y-2">
                {studentDetail.inscripciones_clase.length > 0 ? (
                  studentDetail.inscripciones_clase.slice(0, 10).map((inscripcion) => {
                    const clase = inscripcion.clase;
                    const fechaClase = new Date(clase.fecha_hora_inicio);

                    return (
                      <div
                        key={inscripcion.id}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-indigo-100 rounded-lg p-2">
                              <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{clase.ruta_curricular?.nombre || 'Clase'}</h4>
                              <p className="text-sm text-gray-600">
                                {fechaClase.toLocaleDateString('es-AR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}{' '}
                                • {fechaClase.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-500">
                                Prof. {clase.docente?.user?.nombre} {clase.docente?.user?.apellido}
                              </p>
                            </div>
                          </div>
                          <div>
                            {fechaClase > new Date() ? (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                Programada
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                                Finalizada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay clases inscritas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-bold text-gray-900 mb-2">Selecciona un hijo</p>
              <p className="text-gray-600">Elige un estudiante de la lista para ver su información</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
