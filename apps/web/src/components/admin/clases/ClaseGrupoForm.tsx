import { useState } from 'react';
import {
  TipoClaseGrupo,
  DiaSemana,
  DIA_SEMANA_LABELS,
  TIPO_CLASE_GRUPO_LABELS,
  type CrearClaseGrupoDto,
} from '@/types/clase-grupo';

interface DocenteOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface SectorOption {
  id: string;
  nombre: string;
}

interface RutaCurricularOption {
  id: string;
  nombre: string;
}

interface EstudianteOption {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
}

interface ClaseGrupoFormProps {
  formData: Omit<CrearClaseGrupoDto, 'estudiantesIds'> & {
    estudiantesIds: string[];
  };
  docentes: DocenteOption[];
  sectores: SectorOption[];
  rutasCurriculares: RutaCurricularOption[];
  estudiantes: EstudianteOption[];
  onFieldChange: (
    _field: keyof (Omit<CrearClaseGrupoDto, 'estudiantesIds'> & { estudiantesIds: string[] }),
    _value: string | number | string[] | TipoClaseGrupo | DiaSemana | undefined,
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Formulario para crear/editar ClaseGrupos (grupos recurrentes)
 */
export function ClaseGrupoForm({
  formData,
  docentes = [],
  sectores = [],
  rutasCurriculares = [],
  estudiantes = [],
  onFieldChange,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClaseGrupoFormProps) {
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<string[]>(
    formData.estudiantesIds || [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleEstudianteToggle = (estudianteId: string) => {
    const newSelection = selectedEstudiantes.includes(estudianteId)
      ? selectedEstudiantes.filter((id) => id !== estudianteId)
      : [...selectedEstudiantes, estudianteId];

    setSelectedEstudiantes(newSelection);
    onFieldChange('estudiantesIds', newSelection);
  };

  // Auto-calculate fecha_fin for GRUPO_REGULAR
  const shouldShowFechaFin = formData.tipo === TipoClaseGrupo.CURSO_TEMPORAL;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Tipo y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Tipo de Grupo *</label>
          <select
            value={formData.tipo}
            onChange={(e) => onFieldChange('tipo', e.target.value as TipoClaseGrupo)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          >
            {Object.entries(TIPO_CLASE_GRUPO_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-gray-900">
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/50 mt-1">
            {formData.tipo === TipoClaseGrupo.GRUPO_REGULAR
              ? 'Finaliza automáticamente el 15 de diciembre'
              : 'Deberás especificar una fecha de finalización'}
          </p>
        </div>

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Código del Grupo *</label>
          <input
            type="text"
            value={formData.codigo}
            onChange={(e) => onFieldChange('codigo', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder:text-white/40 uppercase"
            placeholder="Ej: B1, B2, A1"
            maxLength={10}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-white/50 mt-1">Código único para identificar el grupo</p>
        </div>
      </div>

      {/* Nombre del Grupo */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Nombre del Grupo *</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => onFieldChange('nombre', e.target.value)}
          className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder:text-white/40"
          placeholder="Ej: GRUPO B1 - MATEMÁTICA - PERFIL BASE PROGRESIVO (6 y 7 años)"
          required
          disabled={isLoading}
        />
      </div>

      {/* Día y Horario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Día de la Semana */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Día de la Semana *</label>
          <select
            value={formData.diaSemana}
            onChange={(e) => onFieldChange('diaSemana', e.target.value as DiaSemana)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          >
            {Object.entries(DIA_SEMANA_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-gray-900">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Hora Inicio */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Hora Inicio *</label>
          <input
            type="time"
            value={formData.horaInicio}
            onChange={(e) => onFieldChange('horaInicio', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Hora Fin */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Hora Fin *</label>
          <input
            type="time"
            value={formData.horaFin}
            onChange={(e) => onFieldChange('horaFin', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Fechas y Año Lectivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Fecha de Inicio *</label>
          <input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => onFieldChange('fechaInicio', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Fecha Fin (solo para CURSO_TEMPORAL) */}
        {shouldShowFechaFin && (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Fecha de Fin *</label>
            <input
              type="date"
              value={formData.fechaFin || ''}
              onChange={(e) => onFieldChange('fechaFin', e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
              required={shouldShowFechaFin}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Año Lectivo */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Año Lectivo *</label>
          <input
            type="number"
            value={formData.anioLectivo}
            onChange={(e) => onFieldChange('anioLectivo', parseInt(e.target.value))}
            min="2024"
            max="2100"
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Docente, Ruta Curricular y Sector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Docente */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Docente *</label>
          <select
            value={formData.docenteId}
            onChange={(e) => onFieldChange('docenteId', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          >
            <option value="" className="bg-gray-900">
              Seleccionar docente...
            </option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id} className="bg-gray-900">
                {docente.nombre} {docente.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Ruta Curricular */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Ruta Curricular</label>
          <select
            value={formData.rutaCurricularId || ''}
            onChange={(e) => onFieldChange('rutaCurricularId', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            disabled={isLoading}
          >
            <option value="" className="bg-gray-900">
              Sin ruta
            </option>
            {rutasCurriculares.map((ruta) => (
              <option key={ruta.id} value={ruta.id} className="bg-gray-900">
                {ruta.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Sector</label>
          <select
            value={formData.sectorId || ''}
            onChange={(e) => onFieldChange('sectorId', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            disabled={isLoading}
          >
            <option value="" className="bg-gray-900">
              Sin sector
            </option>
            {sectores.map((sector) => (
              <option key={sector.id} value={sector.id} className="bg-gray-900">
                {sector.nombre === 'Matemática' && '🧮'}
                {sector.nombre === 'Programación' && '💻'}
                {sector.nombre === 'Ciencias' && '🔬'} {sector.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cupo y Nivel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cupo Máximo */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Cupo Máximo *</label>
          <input
            type="number"
            value={formData.cupoMaximo}
            onChange={(e) => onFieldChange('cupoMaximo', parseInt(e.target.value))}
            min="1"
            max="50"
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Nivel Escolar</label>
          <input
            type="text"
            value={formData.nivel || ''}
            onChange={(e) => onFieldChange('nivel', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder:text-white/40"
            placeholder="Ej: 6 y 7 años, Secundaria"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Estudiantes */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Estudiantes Inscritos ({selectedEstudiantes.length})
        </label>
        <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-black/20 rounded-lg border border-emerald-500/20">
          {estudiantes.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-4">No hay estudiantes disponibles</p>
          ) : (
            estudiantes.map((estudiante) => (
              <label
                key={estudiante.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedEstudiantes.includes(estudiante.id)}
                  onChange={() => handleEstudianteToggle(estudiante.id)}
                  className="w-4 h-4 text-emerald-500 bg-black/30 border-emerald-500/30 rounded focus:ring-2 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <span className="text-white/90 text-sm">
                  {estudiante.nombre} {estudiante.apellido}
                  <span className="text-white/50 ml-2">({estudiante.edad} años)</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a] to-transparent pb-2">
        <button
          type="submit"
          disabled={isLoading || selectedEstudiantes.length === 0}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? 'Creando Grupo...' : 'Crear Grupo Recurrente'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 hover:bg-emerald-500/20 disabled:bg-black/20 text-white/90 py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
