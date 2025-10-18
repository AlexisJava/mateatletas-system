'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  nivel_actual: number;
  puntos_totales: number;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  equipo?: {
    nombre: string;
    color_primario: string;
  };
  sector?: {
    id: string;
    nombre: string;
    color: string;
    icono: string;
  };
}

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorActivo, setSectorActivo] = useState<'Programación' | 'Matemática' | 'Preinscriptos'>('Matemática');

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Endpoint para admin que trae TODOS los estudiantes
      const response = await apiClient.get('/admin/estudiantes');
      setEstudiantes((response || []) as unknown as Estudiante[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar estudiantes'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-400 mb-4"></div>
        <p className="text-white/60 font-medium">Cargando estudiantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-300 mb-2">Error</h3>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  // Separar estudiantes por sector
  const estudiantesProgramacion = estudiantes.filter(est => est.sector?.nombre === 'Programación');
  const estudiantesMatematica = estudiantes.filter(est => est.sector?.nombre === 'Matemática');
  const estudiantesSinSector = estudiantes.filter(est => !est.sector);

  const renderTablaEstudiantes = (listaEstudiantes: Estudiante[], titulo: string, icono: string, color: string) => {
    if (listaEstudiantes.length === 0) {
      return (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 p-8 text-center">
          <span className="text-4xl mb-2 block">{icono}</span>
          <p className="text-white/60 text-sm">No hay estudiantes en {titulo}</p>
        </div>
      );
    }

    return (
      <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-500/20">
            <thead className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Nivel Escolar
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Nivel Actual
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Equipo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {listaEstudiantes.map((estudiante) => {
                const initials = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
                return (
                  <tr key={estudiante.id} className="hover:bg-emerald-500/[0.08] transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {estudiante.edad} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                        {estudiante.nivelEscolar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold">
                        Nivel {estudiante.nivel_actual}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-400">
                      {estudiante.puntos_totales} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {estudiante.equipo ? (
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-semibold border"
                          style={{
                            backgroundColor: `${estudiante.equipo.color_primario}20`,
                            borderColor: `${estudiante.equipo.color_primario}50`,
                            color: estudiante.equipo.color_primario,
                          }}
                        >
                          {estudiante.equipo.nombre}
                        </span>
                      ) : (
                        <span className="text-white/40 text-sm">Sin equipo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Obtener estudiantes del sector activo
  const estudiantesActivos =
    sectorActivo === 'Programación' ? estudiantesProgramacion :
    sectorActivo === 'Matemática' ? estudiantesMatematica :
    estudiantesSinSector;

  const iconoActivo =
    sectorActivo === 'Programación' ? '💻' :
    sectorActivo === 'Matemática' ? '🧮' : '📝';

  const colorActivo =
    sectorActivo === 'Programación' ? '#8b5cf6' :
    sectorActivo === 'Matemática' ? '#3b82f6' : '#10b981';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Todos los Estudiantes
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Gestión completa de estudiantes de la plataforma
          </p>
        </div>
        <div className="px-6 py-3 rounded-xl backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-100 font-bold shadow-lg shadow-emerald-500/10">
          {estudiantes.length} Estudiantes
        </div>
      </div>

      {/* Botones de Sectores */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setSectorActivo('Matemática')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
            sectorActivo === 'Matemática'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
          }`}
        >
          <span className="text-2xl">🧮</span>
          <div className="text-left">
            <div className="text-sm font-bold">Matemática</div>
            <div className="text-xs opacity-80">{estudiantesMatematica.length} estudiantes</div>
          </div>
        </button>

        <button
          onClick={() => setSectorActivo('Programación')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
            sectorActivo === 'Programación'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
              : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
          }`}
        >
          <span className="text-2xl">💻</span>
          <div className="text-left">
            <div className="text-sm font-bold">Programación</div>
            <div className="text-xs opacity-80">{estudiantesProgramacion.length} estudiantes</div>
          </div>
        </button>

        <button
          onClick={() => setSectorActivo('Preinscriptos')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
            sectorActivo === 'Preinscriptos'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
              : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
          }`}
        >
          <span className="text-2xl">📝</span>
          <div className="text-left">
            <div className="text-sm font-bold">Preinscriptos</div>
            <div className="text-xs opacity-80">{estudiantesSinSector.length} estudiantes</div>
          </div>
        </button>
      </div>

      {/* Tabla de estudiantes del sector activo */}
      <div>
        {renderTablaEstudiantes(estudiantesActivos, sectorActivo, iconoActivo, colorActivo)}
      </div>
    </div>
  );
}
