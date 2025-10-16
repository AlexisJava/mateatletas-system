'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nivel_escolar: string;
  nivel_actual: number;
  puntos_totales: number;
  tutor: {
    nombre: string;
    apellido: string;
    email: string;
  };
  equipo?: {
    nombre: string;
    color_primario: string;
  };
}

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Endpoint para admin que trae TODOS los estudiantes
      const response = await apiClient.get('/estudiantes/admin/all');
      setEstudiantes((response || []) as unknown as Estudiante[]);
    } catch (err: unknown) {
      console.error('Error cargando estudiantes:', err);
      setError(getErrorMessage(err, 'Error al cargar estudiantes'));
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Cargando estudiantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)]">
            Todos los Estudiantes
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión completa de estudiantes de la plataforma
          </p>
        </div>
        <div className="px-6 py-3 rounded-xl bg-indigo-100 text-indigo-700 font-bold">
          {estudiantes.length} Estudiantes
        </div>
      </div>

      {/* Nota temporal */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
        <p className="text-amber-800 text-sm">
          <strong>Nota:</strong> Actualmente el backend no tiene un endpoint para listar TODOS los estudiantes.
          Necesitas crear <code className="bg-amber-200 px-2 py-1 rounded">/admin/estudiantes</code> en el backend
          para ver todos los estudiantes de todos los tutores.
        </p>
      </div>

      {/* Lista de estudiantes */}
      {estudiantes.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">🎓</span>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay estudiantes</h3>
          <p className="text-gray-600">
            No se encontraron estudiantes en el sistema
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <table className="min-w-full divide-y-2 divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nivel Escolar
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nivel Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Equipo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estudiantes.map((estudiante) => {
                const initials = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
                return (
                  <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                          style={{
                            background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {calcularEdad(estudiante.fecha_nacimiento)} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-semibold">
                        {estudiante.nivel_escolar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold">
                        Nivel {estudiante.nivel_actual}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">
                      {estudiante.puntos_totales} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {estudiante.equipo ? (
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-semibold"
                          style={{
                            backgroundColor: `${estudiante.equipo.color_primario}20`,
                            color: estudiante.equipo.color_primario,
                          }}
                        >
                          {estudiante.equipo.nombre}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin equipo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
