'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users } from 'lucide-react';
import axios from '@/lib/axios';

interface CreateClaseGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grupoId: string;
  grupoCodigo: string;
}

interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
}

const DIAS_SEMANA = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

const TIPOS_CLASE = [
  { value: 'GRUPO_REGULAR', label: 'Grupo Regular' },
  { value: 'CURSO_TEMPORAL', label: 'Curso Temporal' },
];

export function CreateClaseGrupoModal({
  isOpen,
  onClose,
  onSuccess,
  grupoId,
  grupoCodigo,
}: CreateClaseGrupoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'GRUPO_REGULAR',
    dia_semana: 'LUNES',
    hora_inicio: '',
    hora_fin: '',
    fecha_inicio: '',
    fecha_fin: '',
    anio_lectivo: new Date().getFullYear(),
    cupo_maximo: 15,
    docente_id: '',
    nivel: '',
  });

  const [docentesDisponibles, setDocentesDisponibles] = useState<Docente[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Estudiante[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDocentes();
      fetchEstudiantes();
    }
  }, [isOpen]);

  const fetchDocentes = async () => {
    try {
      const response = await axios.get<Docente[] | { data: Docente[] }>('/docentes');
      const docentes = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setDocentesDisponibles(docentes);
    } catch (err) {
      console.error('❌ Error al cargar docentes:', err);
      setDocentesDisponibles([]);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const response = await axios.get<Estudiante[] | { data: Estudiante[] }>('/estudiantes');
      const estudiantes = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setEstudiantesDisponibles(estudiantes);
    } catch (err) {
      console.error('❌ Error al cargar estudiantes:', err);
      setEstudiantesDisponibles([]);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  const toggleEstudiante = (estudianteId: string) => {
    if (estudiantesSeleccionados.includes(estudianteId)) {
      setEstudiantesSeleccionados(estudiantesSeleccionados.filter((id) => id !== estudianteId));
    } else {
      setEstudiantesSeleccionados([...estudiantesSeleccionados, estudianteId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!formData.hora_inicio || !formData.hora_fin) {
      setError('Debes especificar hora de inicio y fin');
      return;
    }
    if (!formData.fecha_inicio) {
      setError('Debes especificar la fecha de inicio');
      return;
    }
    if (!formData.docente_id) {
      setError('Debes seleccionar un docente');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        grupo_id: grupoId,
        codigo: grupoCodigo, // Usamos el mismo código del grupo
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || undefined,
        anio_lectivo: formData.anio_lectivo,
        cupo_maximo: formData.cupo_maximo,
        docente_id: formData.docente_id,
        nivel: formData.nivel || undefined,
        estudiantes_ids: estudiantesSeleccionados,
      };

      const response = await axios.post('/admin/clase-grupos', payload);
      console.log('✅ Horario creado exitosamente:', response);

      // Limpiar formulario y cerrar modal
      handleClose();

      // Refrescar la lista de grupos
      console.log('🔄 Refrescando lista de grupos...');
      await onSuccess();
      console.log('✅ Lista refrescada');
    } catch (err) {
      console.error('❌ Error al crear horario:', err);
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
      ) {
        const mensaje = (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
        setError(mensaje ?? 'Error al crear el horario');
      } else {
        setError('Error al crear el horario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      tipo: 'GRUPO_REGULAR',
      dia_semana: 'LUNES',
      hora_inicio: '',
      hora_fin: '',
      fecha_inicio: '',
      fecha_fin: '',
      anio_lectivo: new Date().getFullYear(),
      cupo_maximo: 15,
      docente_id: '',
      nivel: '',
    });
    setEstudiantesSeleccionados([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 backdrop-blur-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-xl bg-purple-900/60 border-b border-purple-500/30 p-6 flex items-center justify-between z-20">
          <div>
            <h2 className="text-2xl font-black text-white">Agregar Horario</h2>
            <p className="text-white/60 text-sm mt-1">
              Nuevo horario para el grupo{' '}
              <span className="text-purple-300 font-bold">{grupoCodigo}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Nombre del Horario */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Nombre del Horario *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder={`${grupoCodigo} - Martes 19:30`}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
            />
          </div>

          {/* Tipo y Día */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              >
                {TIPOS_CLASE.map((tipo) => (
                  <option key={tipo.value} value={tipo.value} className="bg-gray-900">
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Día de la Semana *
              </label>
              <select
                value={formData.dia_semana}
                onChange={(e) => handleChange('dia_semana', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              >
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia.value} value={dia.value} className="bg-gray-900">
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora Inicio *
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => handleChange('hora_inicio', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora Fin *
              </label>
              <input
                type="time"
                value={formData.hora_fin}
                onChange={(e) => handleChange('hora_fin', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Fin (opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => handleChange('fecha_fin', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>
          </div>

          {/* Cupo y Año Lectivo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Cupo Máximo *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.cupo_maximo}
                onChange={(e) => handleChange('cupo_maximo', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Año Lectivo *
              </label>
              <input
                type="number"
                min="2024"
                max="2100"
                value={formData.anio_lectivo}
                onChange={(e) =>
                  handleChange('anio_lectivo', parseInt(e.target.value) || new Date().getFullYear())
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>
          </div>

          {/* Docente */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Docente Asignado *
            </label>
            {docentesDisponibles.length === 0 ? (
              <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  ⚠️ No se pudieron cargar los docentes. Verifica que estés autenticado como admin.
                </p>
                <button
                  type="button"
                  onClick={fetchDocentes}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <select
                value={formData.docente_id}
                onChange={(e) => handleChange('docente_id', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              >
                <option value="" className="bg-gray-900">
                  Selecciona un docente...
                </option>
                {docentesDisponibles.map((docente) => (
                  <option key={docente.id} value={docente.id} className="bg-gray-900">
                    {docente.nombre} {docente.apellido} ({docente.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Nivel (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Nivel / Descripción (opcional)
            </label>
            <input
              type="text"
              value={formData.nivel}
              onChange={(e) => handleChange('nivel', e.target.value)}
              placeholder="ej: 6 y 7 años, Nivel Inicial, etc."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
            />
          </div>

          {/* Estudiantes */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Estudiantes Inscritos (opcional)
            </label>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto">
              {estudiantesDisponibles.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">
                  No hay estudiantes disponibles
                </p>
              ) : (
                <div className="space-y-2">
                  {estudiantesDisponibles.map((estudiante) => (
                    <label
                      key={estudiante.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={estudiantesSeleccionados.includes(estudiante.id)}
                        onChange={() => toggleEstudiante(estudiante.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">
                        {estudiante.nombre} {estudiante.apellido}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-white/40 text-xs mt-2">
              {estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Horario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
