'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Calendar, Users, Clock, Edit, Trash2, BookOpen } from 'lucide-react';
import axios from '@/lib/axios';

interface Grupo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClaseGrupo {
  id: string;
  codigo: string;
  nombre: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  docente: {
    nombre: string;
    apellido: string;
  };
  cupo_maximo: number;
  total_inscriptos?: number;
  tipo: 'GRUPO_REGULAR' | 'CURSO_TEMPORAL';
}

interface GrupoWithClases extends Grupo {
  clases?: ClaseGrupo[];
  planificacionActual?: {
    id: string;
    titulo: string;
    mes: number;
    anio: number;
  } | null;
}

const DIA_SEMANA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Página de Gestión de Grupos y Clases
 * Modelo: Un GRUPO pedagógico tiene múltiples CLASES (horarios)
 */
export default function AdminGruposClasesPage() {
  const [grupos, setGrupos] = useState<GrupoWithClases[]>([]);
  const [expandedGrupos, setExpandedGrupos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGrupoModal, setShowCreateGrupoModal] = useState(false);

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener todos los grupos
      const gruposRes = await axios.get<Grupo[]>('/grupos');

      // Para cada grupo, obtener sus clases y planificación actual
      const gruposConDatos = await Promise.all(
        gruposRes.data.map(async (grupo) => {
          try {
            // Obtener clases del grupo
            const clasesRes = await axios.get<ClaseGrupo[]>(`/admin/clase-grupos`, {
              params: { grupo_id: grupo.id }
            });

            // Obtener planificación actual (del mes actual)
            const mesActual = new Date().getMonth() + 1;
            const anioActual = new Date().getFullYear();

            let planificacionActual = null;
            try {
              const planifRes = await axios.get(`/planificaciones`, {
                params: {
                  grupo_id: grupo.id,
                  mes: mesActual,
                  anio: anioActual
                }
              });

              if (planifRes.data?.data && planifRes.data.data.length > 0) {
                planificacionActual = planifRes.data.data[0];
              }
            } catch (err) {
              // No hay planificación para este mes, es normal
              console.log(`No hay planificación para ${grupo.codigo} en ${MESES[mesActual - 1]}`);
            }

            return {
              ...grupo,
              clases: clasesRes.data || [],
              planificacionActual,
            };
          } catch (err) {
            console.error(`Error al obtener datos del grupo ${grupo.codigo}:`, err);
            return {
              ...grupo,
              clases: [],
              planificacionActual: null,
            };
          }
        })
      );

      setGrupos(gruposConDatos);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
      setError('Error al cargar los grupos');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGrupo = (grupoId: string) => {
    const newExpanded = new Set(expandedGrupos);
    if (newExpanded.has(grupoId)) {
      newExpanded.delete(grupoId);
    } else {
      newExpanded.add(grupoId);
    }
    setExpandedGrupos(newExpanded);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            📚 Grupos y Clases
          </h1>
          <p className="text-white/60 mt-1">
            Gestiona grupos pedagógicos y sus horarios
          </p>
        </div>

        <button
          onClick={() => setShowCreateGrupoModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Grupo
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-white/60">Cargando grupos...</p>
        </div>
      )}

      {/* Grupos List */}
      {!isLoading && grupos && grupos.length > 0 && (
        <div className="space-y-4">
          {grupos.map((grupo) => {
            const isExpanded = expandedGrupos.has(grupo.id);
            const totalClases = grupo.clases?.length || 0;
            const totalInscriptos = grupo.clases?.reduce((sum, clase) => sum + (clase.total_inscriptos || 0), 0) || 0;

            return (
              <div
                key={grupo.id}
                className="backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden"
              >
                {/* Grupo Header (Collapsible) */}
                <div
                  onClick={() => toggleGrupo(grupo.id)}
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Info del Grupo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-bold">
                          {grupo.codigo}
                        </span>
                        <h3 className="text-xl font-bold text-white">{grupo.nombre}</h3>
                        {grupo.edad_minima && grupo.edad_maxima && (
                          <span className="text-sm text-white/50">
                            ({grupo.edad_minima}-{grupo.edad_maxima} años)
                          </span>
                        )}
                      </div>

                      {grupo.descripcion && (
                        <p className="text-white/60 text-sm mb-3">{grupo.descripcion}</p>
                      )}

                      {/* Planificación Actual */}
                      {grupo.planificacionActual ? (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">
                            Planificación {MESES[grupo.planificacionActual.mes - 1]} {grupo.planificacionActual.anio}:
                          </span>
                          <span className="text-white/70">
                            {grupo.planificacionActual.titulo}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-white/40">
                          <BookOpen className="w-4 h-4" />
                          Sin planificación este mes
                        </div>
                      )}
                    </div>

                    {/* Right: Stats & Toggle */}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-white/50">Horarios</div>
                        <div className="text-2xl font-bold text-white">{totalClases}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/50">Inscriptos</div>
                        <div className="text-2xl font-bold text-purple-400">{totalInscriptos}</div>
                      </div>
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-white/50" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white/50" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clases Expandibles */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-purple-500/20 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                          Horarios de Clases
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Abrir modal para agregar clase
                          }}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar horario
                        </button>
                      </div>

                      {grupo.clases && grupo.clases.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {grupo.clases.map((clase) => (
                            <div
                              key={clase.id}
                              className="backdrop-blur-xl bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                            >
                              {/* Nombre de la clase */}
                              <div className="text-sm font-bold text-white mb-2 line-clamp-1">
                                {clase.nombre}
                              </div>

                              {/* Horario */}
                              <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                                <Calendar className="w-3 h-3 text-purple-400" />
                                <span>{DIA_SEMANA_LABELS[clase.dia_semana]}</span>
                                <Clock className="w-3 h-3 text-pink-400 ml-1" />
                                <span>
                                  {clase.hora_inicio} - {clase.hora_fin}
                                </span>
                              </div>

                              {/* Docente */}
                              <div className="text-xs text-white/60 mb-2">
                                👨‍🏫 {clase.docente.nombre} {clase.docente.apellido}
                              </div>

                              {/* Cupos */}
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <div className="flex items-center gap-1 text-xs">
                                  <Users className="w-3 h-3 text-purple-400" />
                                  <span className="text-white/80">
                                    {clase.total_inscriptos || 0} / {clase.cupo_maximo}
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    clase.tipo === 'GRUPO_REGULAR'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {clase.tipo === 'GRUPO_REGULAR' ? 'Regular' : 'Temporal'}
                                </span>
                              </div>

                              {/* Acciones */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Editar clase
                                  }}
                                  className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Eliminar clase
                                  }}
                                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/40 text-sm">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>No hay horarios configurados para este grupo</p>
                          <p className="text-xs mt-1">Agrega el primer horario de clase</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!grupos || grupos.length === 0) && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No hay grupos creados todavía</p>
          <p className="text-white/30 text-sm mt-2">
            Crea tu primer grupo pedagógico (ej: Básico 2, Roblox, Ajedrez)
          </p>
        </div>
      )}

      {/* Modal Crear Grupo - TODO */}
      {showCreateGrupoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 rounded-xl p-6 max-w-2xl w-full border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <h2 className="text-2xl font-bold mb-6 text-white">Crear Nuevo Grupo</h2>
            <p className="text-white/60 mb-4">TODO: Formulario de creación de grupo</p>
            <button
              onClick={() => setShowCreateGrupoModal(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
