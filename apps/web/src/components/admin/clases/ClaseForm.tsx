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
  docentes: any[];
  sectores: any[];
  onFieldChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente de formulario para crear/editar clases
 * Responsabilidad: Solo renderizar formulario
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Clase *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => onFieldChange('nombre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      {/* Docente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Docente *
        </label>
        <select
          value={formData.docente_id}
          onChange={(e) => onFieldChange('docente_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        >
          <option value="">Seleccionar docente...</option>
          {docentes.map((docente) => (
            <option key={docente.id} value={docente.id}>
              {docente.nombre} {docente.apellido}
            </option>
          ))}
        </select>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sector (Opcional)
        </label>
        <select
          value={formData.sector_id}
          onChange={(e) => onFieldChange('sector_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Sin sector</option>
          {sectores.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha y Hora */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha y Hora de Inicio *
        </label>
        <input
          type="datetime-local"
          value={formData.fecha_hora_inicio}
          onChange={(e) => onFieldChange('fecha_hora_inicio', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      {/* Duración */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración (minutos) *
        </label>
        <input
          type="number"
          value={formData.duracion_minutos}
          onChange={(e) => onFieldChange('duracion_minutos', parseInt(e.target.value))}
          min="15"
          step="15"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      {/* Cupo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cupo Máximo *
        </label>
        <input
          type="number"
          value={formData.cupo_maximo}
          onChange={(e) => onFieldChange('cupo_maximo', parseInt(e.target.value))}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => onFieldChange('descripcion', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar Clase'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
