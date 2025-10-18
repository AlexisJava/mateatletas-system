import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClasesTableProps {
  clases: Record<string, unknown>[];
  onViewClase: (clase: Record<string, unknown>) => void;
  onCancelClase: (clase: Record<string, unknown>) => void;
  onEditClase: (clase: Record<string, unknown>) => void;
  onManageStudents: (clase: Record<string, unknown>) => void;
}

/**
 * Componente de tabla para mostrar clases
 * Responsabilidad: Solo renderizar la tabla
 */
export function ClasesTable({
  clases,
  onViewClase,
  onCancelClase,
  onEditClase,
  onManageStudents,
}: ClasesTableProps) {
  if (clases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay clases para mostrar
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha/Hora
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Docente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cupos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clases.map((clase) => (
            <tr key={clase.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {clase.nombre}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {format(new Date(clase.fecha_hora_inicio), 'PPP', { locale: es })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(clase.fecha_hora_inicio), 'p', { locale: es })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {clase.docente?.nombre} {clase.docente?.apellido}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {clase.duracion_minutos} min
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {clase._count?.inscripciones || 0} / {clase.cupo_maximo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    clase.estado === 'Programada'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {clase.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onViewClase(clase)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </button>
                <button
                  onClick={() => onManageStudents(clase)}
                  className="text-purple-600 hover:text-purple-900"
                >
                  Estudiantes
                </button>
                {clase.estado === 'Programada' && (
                  <>
                    <button
                      onClick={() => onEditClase(clase)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onCancelClase(clase)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
