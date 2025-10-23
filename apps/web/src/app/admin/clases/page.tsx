'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Clock } from 'lucide-react';
import { ClaseGrupoForm } from '@/components/admin/clases';
import { listarClaseGrupos, crearClaseGrupo } from '@/lib/api/clase-grupos.api';
import axios from '@/lib/axios';
import type {
  ClaseGrupo,
  CrearClaseGrupoDto,
  TipoClaseGrupo,
  DiaSemana,
  DIA_SEMANA_LABELS,
} from '@/types/clase-grupo';

interface DocenteOption {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface SectorOption {
  id: string;
  nombre: string;
  color: string;
}

interface RutaCurricularOption {
  id: string;
  nombre: string;
  color: string;
}

interface EstudianteOption {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  email: string;
}

/**
 * Página de Gestión de Grupos de Clases Recurrentes
 */
export default function AdminClaseGruposPage() {
  const [grupos, setGrupos] = useState<ClaseGrupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Options para el formulario
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [sectores, setSectores] = useState<SectorOption[]>([]);
  const [rutasCurriculares, setRutasCurriculares] = useState<RutaCurricularOption[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteOption[]>([]);

  // Form data
  const [formData, setFormData] = useState<Omit<CrearClaseGrupoDto, 'estudiantes_ids'> & { estudiantes_ids: string[] }>({
    codigo: '',
    nombre: '',
    tipo: 'GRUPO_REGULAR' as TipoClaseGrupo,
    dia_semana: 'LUNES' as DiaSemana,
    hora_inicio: '19:30',
    hora_fin: '21:00',
    fecha_inicio: new Date().toISOString().split('T')[0],
    anio_lectivo: new Date().getFullYear(),
    cupo_maximo: 15,
    docente_id: '',
    estudiantes_ids: [],
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchGrupos();
    fetchFormOptions();
  }, []);

  const fetchGrupos = async () => {
    try {
      setIsLoading(true);
      const response = await listarClaseGrupos({ anio_lectivo: new Date().getFullYear() });
      setGrupos(response.data);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
      setError('Error al cargar los grupos de clases');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [docentesRes, sectoresRes, rutasRes, estudiantesRes] = await Promise.all([
        axios.get<DocenteOption[]>('/docentes'),
        axios.get<SectorOption[]>('/admin/sectores'),
        axios.get<RutaCurricularOption[]>('/admin/rutas-curriculares'),
        axios.get<EstudianteOption[]>('/admin/estudiantes'),
      ]);

      setDocentes(docentesRes.data);
      setSectores(sectoresRes.data);
      setRutasCurriculares(rutasRes.data);
      setEstudiantes(estudiantesRes.data);
    } catch (err) {
      console.error('Error al cargar opciones del formulario:', err);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await crearClaseGrupo(formData as CrearClaseGrupoDto);
      await fetchGrupos();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error al crear grupo:', err);
      setError('Error al crear el grupo de clases');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'GRUPO_REGULAR' as TipoClaseGrupo,
      dia_semana: 'LUNES' as DiaSemana,
      hora_inicio: '19:30',
      hora_fin: '21:00',
      fecha_inicio: new Date().toISOString().split('T')[0],
      anio_lectivo: new Date().getFullYear(),
      cupo_maximo: 15,
      docente_id: '',
      estudiantes_ids: [],
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Clases
          </h1>
          <p className="text-white/60 mt-1">Administra grupos de clases recurrentes</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Clase
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && !showCreateModal && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-white/60">Cargando grupos...</p>
        </div>
      )}

      {/* Grupos Grid */}
      {!isLoading && grupos && grupos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-xl p-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-emerald-400 mb-1">
                    {grupo.codigo}
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-2">{grupo.nombre}</h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    grupo.tipo === 'GRUPO_REGULAR'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {grupo.tipo === 'GRUPO_REGULAR' ? 'Regular' : 'Temporal'}
                </span>
              </div>

              {/* Horario */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{DIA_SEMANA_LABELS[grupo.dia_semana]}</span>
                <Clock className="w-4 h-4 text-teal-400 ml-2" />
                <span>
                  {grupo.hora_inicio} - {grupo.hora_fin}
                </span>
              </div>

              {/* Docente */}
              {grupo.docente && (
                <div className="text-sm text-white/60 mb-3">
                  👨‍🏫 {grupo.docente.nombre} {grupo.docente.apellido}
                </div>
              )}

              {/* Cupos */}
              <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80">
                    {grupo.total_inscriptos || 0} / {grupo.cupo_maximo}
                  </span>
                </div>
                <div className="text-xs text-white/50">
                  {grupo.cupos_disponibles || grupo.cupo_maximo} disponibles
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!grupos || grupos.length === 0) && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No hay grupos creados todavía</p>
          <p className="text-white/30 text-sm mt-2">
            Crea tu primer grupo de clases recurrente
          </p>
        </div>
      )}

      {/* Modal Crear Grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            <h2 className="text-2xl font-bold mb-6 text-white">Crear Grupo Recurrente</h2>
            <ClaseGrupoForm
              formData={formData}
              docentes={docentes}
              sectores={sectores}
              rutasCurriculares={rutasCurriculares}
              estudiantes={estudiantes}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
