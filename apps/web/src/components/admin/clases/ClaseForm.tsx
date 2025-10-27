interface DocenteOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface SectorOption {
  id: string;
  nombre: string;
}

interface ClaseFormProps {
  formData: {
    nombre: string;
    docente_id: string;
    sector_id: string;
    fecha_hora_inicio: string;
    duracion_minutos: number;
    cupo_maximo: number;
    descripcion: string;
  };
  docentes: DocenteOption[];
  sectores: SectorOption[];
  onFieldChange: (_field: string, _value: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente de formulario para crear/editar clases
 */
export function ClaseForm({
  formData,
  docentes,
  sectores,
  onFieldChange,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClaseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">
          Nombre de la Clase *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => onFieldChange('nombre', e.target.value)}
          className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder:text-white/40"
          placeholder="Ej: Álgebra Avanzada - Lunes 18:30"
          required
          disabled={isLoading}
        />
      </div>

      {/* Docente y Sector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Docente */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">
            Docente *
          </label>
          <select
            value={formData.docente_id}
            onChange={(e) => onFieldChange('docente_id', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          >
            <option value="" className="bg-gray-900">Seleccionar docente...</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id} className="bg-gray-900">
                {docente.nombre} {docente.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">
            Sector (Opcional)
          </label>
          <select
            value={formData.sector_id}
            onChange={(e) => onFieldChange('sector_id', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            disabled={isLoading}
          >
            <option value="" className="bg-gray-900">Sin sector</option>
            {sectores.map((sector) => (
              <option key={sector.id} value={sector.id} className="bg-gray-900">
                {sector.nombre === 'Matemática' && '🧮'}
                {sector.nombre === 'Programación' && '💻'}
                {sector.nombre === 'Ciencias' && '🔬'}
                {' '}{sector.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fecha, Duración y Cupo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fecha y Hora */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            value={formData.fecha_hora_inicio}
            onChange={(e) => onFieldChange('fecha_hora_inicio', e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">
            Duración (min) *
          </label>
          <input
            type="number"
            value={formData.duracion_minutos}
            onChange={(e) => onFieldChange('duracion_minutos', parseInt(e.target.value))}
            min="15"
            step="15"
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Cupo */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">
            Cupo Máximo *
          </label>
          <input
            type="number"
            value={formData.cupo_maximo}
            onChange={(e) => onFieldChange('cupo_maximo', parseInt(e.target.value))}
            min="1"
            max="50"
            className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => onFieldChange('descripcion', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-black/30 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder:text-white/40 resize-none"
          placeholder="Agrega detalles adicionales sobre la clase..."
          disabled={isLoading}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? 'Guardando...' : 'Guardar Clase'}
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
