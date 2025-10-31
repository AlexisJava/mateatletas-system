'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';
import AgregarEstudianteModal from '@/components/admin/AgregarEstudianteModal';
import { UserPlus } from 'lucide-react';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  nivel_actual: number;
  puntos_totales: number;
  avatar_url?: string; // Avatar 3D de Ready Player Me
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
  inscripciones_grupos?: Array<{
    id: string;
    fecha_inscripcion: string;
    clase_grupo: {
      id: string;
      codigo: string;
      nombre: string;
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      activo: boolean;
    };
    grupo: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string;
    };
  }>;
}

interface Sector {
  id: string;
  nombre: string;
  color: string;
  icono: string;
}

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorActivo, setSectorActivo] = useState<'Programación' | 'Matemática' | 'Ciencias' | 'Preinscriptos'>('Matemática');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorIdParaModal, setSectorIdParaModal] = useState<string>('');

  useEffect(() => {
    loadEstudiantes();
    loadSectores();
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Endpoint para admin que trae TODOS los estudiantes SIN límite
      const response = await apiClient.get<{ data?: Estudiante[] } | Estudiante[]>('/admin/estudiantes');
      console.log('📊 Respuesta del servidor:', response);
      // El backend devuelve { data: [], metadata: {} }
      const estudiantes = (response as { data?: Estudiante[] })?.data
        ? (response as { data: Estudiante[] }).data
        : (Array.isArray(response) ? response : []);
      console.log('👥 Estudiantes procesados:', estudiantes.length);
      setEstudiantes(estudiantes as Estudiante[]);
    } catch (err) {
      console.error('❌ Error al cargar estudiantes:', err);
      setError(getErrorMessage(err as Error, 'Error al cargar estudiantes'));
    } finally {
      setIsLoading(false);
    }
  };

  const isSectoresPayload = (value: Sector[] | { data?: Sector[] }): value is { data?: Sector[] } =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const loadSectores = async () => {
    try {
      const response = await apiClient.get<Sector[] | { data?: Sector[] }>('/admin/sectores');

      let sectoresData: Sector[] = [];
      if (Array.isArray(response)) {
        sectoresData = response;
      } else if (isSectoresPayload(response) && Array.isArray(response.data)) {
        sectoresData = response.data;
      }

      setSectores(sectoresData);
    } catch (err) {
      console.error('Error al cargar sectores:', err);
    }
  };

  const handleAbrirModal = (nombreSector: string) => {
    // Mapear nombre de botón a nombre real del sector
    const nombreSectorReal = nombreSector === 'Ciencias' ? 'Divulgación Científica' : nombreSector;
    const sector = sectores.find(s => s.nombre === nombreSectorReal);
    if (sector) {
      console.log(`[DEBUG] Abriendo modal para sector: ${nombreSectorReal} con ID: ${sector.id}`);
      setSectorIdParaModal(sector.id);
      setIsModalOpen(true);
    } else {
      console.error(`[ERROR] No se encontró el sector: ${nombreSectorReal}. Sectores disponibles:`, sectores);
      setError(`No se pudo abrir el modal: sector "${nombreSectorReal}" no encontrado`);
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
  const estudiantesCiencias = estudiantes.filter(est => est.sector?.nombre === 'Divulgación Científica' || est.sector?.nombre === 'Ciencias');
  const estudiantesSinSector = estudiantes.filter(est => !est.sector);

  const renderTablaEstudiantes = (listaEstudiantes: Estudiante[], titulo: string, icono: string) => {
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
                  Avatar 3D
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Grupos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Tutor
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
                    <td className="px-6 py-4">
                      {estudiante.avatar_url ? (
                        <div className="relative group">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg overflow-hidden">
                            <iframe
                              src={`https://models.readyplayer.me/${estudiante.avatar_url.split('/').pop()}?scene=halfbody-portrait-v1&meshLod=1`}
                              className="w-full h-full border-none scale-125"
                              title={`Avatar de ${estudiante.nombre}`}
                              sandbox="allow-scripts allow-same-origin"
                              loading="lazy"
                            />
                          </div>
                          {/* Tooltip hover */}
                          <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block">
                            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl overflow-hidden border-2 border-white/20">
                              <iframe
                                src={`https://models.readyplayer.me/${estudiante.avatar_url.split('/').pop()}?scene=fullbody-portrait-v1-transparent&meshLod=1`}
                                className="w-full h-full border-none"
                                title={`Avatar de ${estudiante.nombre}`}
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                          <span className="text-white/30 text-xs">Sin avatar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {estudiante.edad} años
                    </td>
                    <td className="px-6 py-4">
                      {estudiante.inscripciones_grupos && estudiante.inscripciones_grupos.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {estudiante.inscripciones_grupos.map((insc) => (
                            <span
                              key={insc.id}
                              className="px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold"
                            >
                              {insc.grupo.codigo} - {insc.grupo.nombre}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">Sin grupo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {estudiante.inscripciones_grupos && estudiante.inscripciones_grupos.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {estudiante.inscripciones_grupos.map((insc) => (
                            <span key={insc.id} className="text-xs text-white/60">
                              {insc.clase_grupo.dia_semana} {insc.clase_grupo.hora_inicio}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-400">
                      {estudiante.puntos_totales} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {estudiante.tutor.nombre} {estudiante.tutor.apellido}
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
    sectorActivo === 'Ciencias' ? estudiantesCiencias :
    estudiantesSinSector;

  const iconoActivo =
    sectorActivo === 'Programación' ? '💻' :
    sectorActivo === 'Matemática' ? '🧮' :
    sectorActivo === 'Ciencias' ? '🔬' : '📝';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Todos los Estudiantes
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Gestión completa de estudiantes de la plataforma ({estudiantes.length} total)
          </p>
        </div>
        <div className="px-6 py-3 rounded-xl backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-100 font-bold shadow-lg shadow-emerald-500/10">
          {estudiantesActivos.length} Mostrando
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
          onClick={() => setSectorActivo('Ciencias')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
            sectorActivo === 'Ciencias'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
              : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
          }`}
        >
          <span className="text-2xl">🔬</span>
          <div className="text-left">
            <div className="text-sm font-bold">Ciencias</div>
            <div className="text-xs opacity-80">{estudiantesCiencias.length} estudiantes</div>
          </div>
        </button>

        <button
          onClick={() => setSectorActivo('Preinscriptos')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
            sectorActivo === 'Preinscriptos'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
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

      {/* Botón Añadir Estudiante */}
      {sectorActivo !== 'Preinscriptos' && (
        <div className="flex justify-end">
          <button
            onClick={() => handleAbrirModal(sectorActivo)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            <UserPlus className="w-5 h-5" />
            Añadir Estudiante
          </button>
        </div>
      )}

      {/* Tabla de estudiantes del sector activo */}
      <div>
        {renderTablaEstudiantes(estudiantesActivos, sectorActivo, iconoActivo)}
      </div>

      {/* Modal Agregar Estudiante */}
      <AgregarEstudianteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadEstudiantes();
          setIsModalOpen(false);
        }}
        sectorId={sectorIdParaModal}
        sectorNombre={sectorActivo}
      />
    </div>
  );
}
