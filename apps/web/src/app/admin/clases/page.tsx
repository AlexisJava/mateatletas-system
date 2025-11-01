'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown, ChevronUp, Calendar, Users, Clock, Edit, Trash2, BookOpen, Archive, RotateCcw } from 'lucide-react';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { CreateGrupoModal } from '@/components/admin/grupos/CreateGrupoModal';
import { CreateClaseGrupoModal } from '@/components/admin/grupos/CreateClaseGrupoModal';
import { EditClaseGrupoModal } from '@/components/admin/grupos/EditClaseGrupoModal';

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

interface ClaseGrupoLocal {
  id: string;
  codigo: string;
  nombre: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  anio_lectivo: number;
  docente?: {
    id?: string;
    nombre: string;
    apellido: string;
    email?: string;
  };
  cupo_maximo: number;
  total_inscriptos?: number;
  tipo: 'GRUPO_REGULAR' | 'CURSO_TEMPORAL';
}

interface GrupoWithClases extends Grupo {
  clases?: ClaseGrupoLocal[];
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
type FiltroEstado = 'activos' | 'archivados' | 'todos';

export default function AdminGruposClasesPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoWithClases[]>([]);
  const [expandedGrupos, setExpandedGrupos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGrupoModal, setShowCreateGrupoModal] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<Grupo | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('activos');
  const [grupoParaAgregarHorario, setGrupoParaAgregarHorario] = useState<Grupo | null>(null);
  const [horarioParaEditar, setHorarioParaEditar] = useState<ClaseGrupoLocal | null>(null);
  const [horarioParaEliminar, setHorarioParaEliminar] = useState<ClaseGrupoLocal | null>(null);

  useEffect(() => {
    fetchGrupos();
  }, [filtroEstado]);

  const extractEntity = <T,>(payload: T | { data?: T }): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      const data = (payload as { data?: T }).data;
      if (data !== undefined) {
        return data;
      }
    }
    return payload as T;
  };

  const extractList = <T,>(payload: T[] | { data?: T[] }): T[] => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  };

  const fetchGrupos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construir query params según el filtro
      const params: Record<string, string> = {};
      if (filtroEstado === 'activos') {
        params.activo = 'true';
      } else if (filtroEstado === 'archivados') {
        params.activo = 'false';
      }
      // Si es 'todos', no agregar el param (trae todos)

      // Obtener grupos filtrados (axios interceptor ya devuelve .data directamente)
      const grupos = await axios.get<Grupo[]>('/grupos', { params });
      console.log('📦 Grupos recibidos:', grupos);

      // Verificar que la respuesta sea un array
      if (!grupos || !Array.isArray(grupos)) {
        console.error('Respuesta inválida del servidor:', grupos);
        setGrupos([]);
        return;
      }

      // Para cada grupo, obtener sus clases
      const gruposConDatos = await Promise.all(
        grupos.map(async (grupo) => {
          try {
            console.log(`🔍 Buscando clases para grupo ${grupo.codigo} (${grupo.id})...`);

            // Obtener clases del grupo
            // El endpoint devuelve { success: true, data: [...], total: ... }
            // El interceptor de axios extrae el primer .data, pero necesitamos extraer .data nuevamente
            const response = await axios.get<ClaseGrupoLocal[] | { data?: ClaseGrupoLocal[] }>(`/admin/clase-grupos`, {
              params: { grupo_id: grupo.id },
            });

            console.log(`📋 Response RAW para ${grupo.codigo}:`, response);
            console.log(`   Tipo de respuesta:`, typeof response);
            console.log(`   Es array?:`, Array.isArray(response));

            // Extraer el array de clases
            const clases = extractList(response).map((clase) => ({
              ...clase,
              fecha_inicio: clase.fecha_inicio ?? '',
              fecha_fin: clase.fecha_fin ?? null,
              anio_lectivo: clase.anio_lectivo ?? new Date().getFullYear(),
            }));

            console.log(`✅ Clases finales para ${grupo.codigo}:`, clases.length, 'horarios');

            return {
              ...grupo,
              clases,
              planificacionActual: null, // TODO: cargar planificaciones después
            };
          } catch (err) {
            console.error(`Error al obtener clases del grupo ${grupo.codigo}:`, err);
            return {
              ...grupo,
              clases: [],
              planificacionActual: null,
            };
          }
        }),
      );

      console.log('✅ Grupos con datos completos:', gruposConDatos);
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

  const handleDeleteGrupo = async (grupo: Grupo) => {
    try {
      // Llamar al endpoint DELETE /api/grupos/:id (soft delete)
      await axios.delete(`/grupos/${grupo.id}`);

      // Refrescar la lista
      await fetchGrupos();

      // Cerrar modal de confirmación
      setGrupoToDelete(null);
    } catch (err) {
      console.error('Error al archivar grupo:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al archivar el grupo');
      } else {
        setError('Error al archivar el grupo');
      }
    }
  };

  const handleReactivarGrupo = async (grupo: Grupo) => {
    try {
      // Llamar al endpoint PUT /api/grupos/:id para reactivar
      await axios.put(`/grupos/${grupo.id}`, { activo: true });

      // Refrescar la lista
      await fetchGrupos();
    } catch (err) {
      console.error('Error al reactivar grupo:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al reactivar el grupo');
      } else {
        setError('Error al reactivar el grupo');
      }
    }
  };

  const handleEliminarHorario = async (horario: ClaseGrupoLocal) => {
    try {
      await axios.delete(`/admin/clase-grupos/${horario.id}`);

      // Refrescar la lista
      await fetchGrupos();

      // Cerrar modal
      setHorarioParaEliminar(null);
    } catch (err) {
      console.error('Error al eliminar horario:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al eliminar el horario');
      } else {
        setError('Error al eliminar el horario');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            📚 Clubes y Cursos
          </h1>
          <p className="text-white/60 mt-1">
            Gestiona clubes, cursos y sus horarios
          </p>
        </div>

        <button
          onClick={() => setShowCreateGrupoModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Club/Curso
        </button>
      </div>

      {/* Filtros de Estado */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltroEstado('activos')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            filtroEstado === 'activos'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Activos
        </button>
        <button
          onClick={() => setFiltroEstado('archivados')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            filtroEstado === 'archivados'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Archive className="w-4 h-4" />
          Archivados
        </button>
        <button
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            filtroEstado === 'todos'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Todos
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
            const clasesArray = Array.isArray(grupo.clases) ? grupo.clases : [];
            const totalClases = clasesArray.length;
            const totalInscriptos = clasesArray.reduce((sum, clase) => sum + (clase.total_inscriptos || 0), 0);

            return (
              <div
                key={grupo.id}
                className={`backdrop-blur-xl rounded-xl border shadow-lg overflow-hidden ${
                  grupo.activo
                    ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 shadow-purple-500/10'
                    : 'bg-gradient-to-br from-gray-900/40 to-slate-900/40 border-gray-500/30 shadow-gray-500/10 opacity-75'
                }`}
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
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          grupo.activo
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {grupo.codigo}
                        </span>
                        {!grupo.activo && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-bold uppercase">
                            Archivado
                          </span>
                        )}
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

                    {/* Right: Stats, Actions & Toggle */}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-white/50">Horarios</div>
                        <div className="text-2xl font-bold text-white">{totalClases}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/50">Inscriptos</div>
                        <div className="text-2xl font-bold text-purple-400">{totalInscriptos}</div>
                      </div>

                      {/* Botón Archivar / Reactivar */}
                      {grupo.activo ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGrupoToDelete(grupo);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          title="Archivar grupo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactivarGrupo(grupo);
                          }}
                          className="p-2 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Reactivar grupo"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}

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
                            setGrupoParaAgregarHorario(grupo);
                          }}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar horario
                        </button>
                      </div>

                      {clasesArray.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {clasesArray.map((clase) => (
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
                                👨‍🏫 {clase.docente
                                  ? `${clase.docente.nombre} ${clase.docente.apellido}`
                                  : 'Docente no asignado'}
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
                                    router.push(`/admin/clases/${clase.id}`);
                                  }}
                                  className="flex-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  Ver
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHorarioParaEditar(clase);
                                  }}
                                  className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHorarioParaEliminar(clase);
                                  }}
                                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                  title="Eliminar horario"
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
          <p className="text-white/40 text-lg">No hay clubes o cursos creados todavía</p>
          <p className="text-white/30 text-sm mt-2">
            Crea tu primer club o curso (ej: Básico 2, Roblox, Ajedrez, Colonia de Verano)
          </p>
        </div>
      )}

      {/* Modal Crear Grupo */}
      <CreateGrupoModal
        isOpen={showCreateGrupoModal}
        onClose={() => setShowCreateGrupoModal(false)}
        onSuccess={fetchGrupos}
      />

      {/* Modal de Confirmación de Eliminación */}
      {grupoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setGrupoToDelete(null)}
          />

          {/* Modal */}
          <div className="relative z-10 backdrop-blur-2xl bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8 max-w-md w-full mx-4">
            {/* Icono de advertencia */}
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-white text-center mb-2">
              ¿Archivar este grupo?
            </h3>

            {/* Descripción */}
            <p className="text-white/60 text-center mb-1">
              Estás por archivar el grupo:
            </p>
            <p className="text-lg font-bold text-white text-center mb-4">
              {grupoToDelete.codigo} - {grupoToDelete.nombre}
            </p>

            <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ El grupo será marcado como inactivo y dejará de aparecer en la lista.
                Podrás reactivarlo desde la base de datos si es necesario.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setGrupoToDelete(null)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteGrupo(grupoToDelete)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
              >
                Archivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Horario (ClaseGrupo) */}
      {grupoParaAgregarHorario && (
        <CreateClaseGrupoModal
          isOpen={true}
          onClose={() => setGrupoParaAgregarHorario(null)}
          onSuccess={fetchGrupos}
          grupoId={grupoParaAgregarHorario.id}
          grupoCodigo={grupoParaAgregarHorario.codigo}
        />
      )}

      {/* Modal Editar Horario (ClaseGrupo) */}
      {horarioParaEditar && (
        <EditClaseGrupoModal
          isOpen={true}
          onClose={() => setHorarioParaEditar(null)}
          onSuccess={fetchGrupos}
          claseGrupo={horarioParaEditar}
        />
      )}

      {/* Modal Eliminar Horario */}
      {horarioParaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setHorarioParaEliminar(null)}
          />

          {/* Modal */}
          <div className="relative z-10 backdrop-blur-2xl bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8 max-w-md w-full mx-4">
            {/* Icono de advertencia */}
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-white text-center mb-2">
              ¿Eliminar este horario?
            </h3>

            {/* Descripción */}
            <p className="text-white/60 text-center mb-1">
              Estás por eliminar el horario:
            </p>
            <p className="text-lg font-bold text-white text-center mb-4">
              {horarioParaEliminar.nombre}
            </p>

            <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ El horario será desactivado. {horarioParaEliminar.total_inscriptos || 0} estudiantes inscritos quedarán sin este horario.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setHorarioParaEliminar(null)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminarHorario(horarioParaEliminar)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
