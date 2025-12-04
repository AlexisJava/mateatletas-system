'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import {
  Folder,
  FileText,
  Image,
  Video,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Star,
  X,
  Upload,
} from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

interface TrabajoPortfolio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'documento' | 'imagen' | 'video' | 'proyecto';
  fecha: string;
  etiquetas: string[];
  destacado?: boolean;
  miniatura?: string;
}

interface PortfolioExampleData {
  instruccion: string;
  titulo: string;
  trabajos: TrabajoPortfolio[];
  maxTrabajos?: number;
  permitirAgregar?: boolean;
  permitirEliminar?: boolean;
  mostrarFiltros?: boolean;
}

const iconosPorTipo: Record<string, React.ComponentType<{ className?: string }>> = {
  documento: FileText,
  imagen: Image,
  video: Video,
  proyecto: Folder,
};

const coloresPorTipo: Record<string, string> = {
  documento: 'bg-blue-500/20 text-blue-400',
  imagen: 'bg-green-500/20 text-green-400',
  video: 'bg-purple-500/20 text-purple-400',
  proyecto: 'bg-orange-500/20 text-orange-400',
};

/**
 * Preview interactivo del componente Portfolio
 */
function PortfolioPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as PortfolioExampleData;

  const [trabajos, setTrabajos] = useState<TrabajoPortfolio[]>(data.trabajos);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | null>(null);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<TrabajoPortfolio | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Obtener todas las etiquetas unicas
  const todasEtiquetas = Array.from(new Set(trabajos.flatMap((t) => t.etiquetas)));

  // Filtrar trabajos
  const trabajosFiltrados = trabajos.filter((t) => {
    if (filtroTipo && t.tipo !== filtroTipo) return false;
    if (filtroEtiqueta && !t.etiquetas.includes(filtroEtiqueta)) return false;
    return true;
  });

  const toggleDestacado = useCallback((id: string) => {
    setTrabajos((prev) => prev.map((t) => (t.id === id ? { ...t, destacado: !t.destacado } : t)));
  }, []);

  const eliminarTrabajo = useCallback(
    (id: string) => {
      setTrabajos((prev) => prev.filter((t) => t.id !== id));
      if (trabajoSeleccionado?.id === id) {
        setTrabajoSeleccionado(null);
      }
    },
    [trabajoSeleccionado],
  );

  const agregarTrabajo = useCallback(() => {
    const nuevoTrabajo: TrabajoPortfolio = {
      id: `trabajo-${Date.now()}`,
      titulo: 'Nuevo trabajo',
      descripcion: 'Descripcion del trabajo',
      tipo: 'documento',
      fecha: new Date().toISOString().split('T')[0] ?? '',
      etiquetas: ['nuevo'],
      destacado: false,
    };
    setTrabajos((prev) => [nuevoTrabajo, ...prev]);
    setMostrarFormulario(false);
  }, []);

  const maxTrabajos = data.maxTrabajos ?? 10;
  const puedeAgregar = data.permitirAgregar !== false && trabajos.length < maxTrabajos;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.titulo}</h2>
          <p className="text-sm text-slate-400 mt-1">{data.instruccion}</p>
        </div>
        <div className="text-sm text-slate-500">
          {trabajos.length}/{maxTrabajos} trabajos
        </div>
      </div>

      {/* Filtros */}
      {data.mostrarFiltros !== false && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Filtrar:</span>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-1">
            {['documento', 'imagen', 'video', 'proyecto'].map((tipo) => {
              const Icono = iconosPorTipo[tipo]!;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? null : tipo)}
                  className={`
                    p-1.5 rounded transition-colors
                    ${filtroTipo === tipo ? coloresPorTipo[tipo] : 'text-slate-500 hover:text-slate-300'}
                  `}
                  title={tipo}
                >
                  <Icono className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Filtro por etiqueta */}
          {todasEtiquetas.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Tag className="w-3 h-3 text-slate-500" />
              {todasEtiquetas.slice(0, 5).map((etiqueta) => (
                <button
                  key={etiqueta}
                  type="button"
                  onClick={() => setFiltroEtiqueta(filtroEtiqueta === etiqueta ? null : etiqueta)}
                  className={`
                    px-2 py-0.5 rounded text-xs transition-colors
                    ${filtroEtiqueta === etiqueta ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
                  `}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          )}

          {(filtroTipo || filtroEtiqueta) && (
            <button
              type="button"
              onClick={() => {
                setFiltroTipo(null);
                setFiltroEtiqueta(null);
              }}
              className="text-xs text-slate-500 hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid de trabajos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {/* Boton agregar */}
        {puedeAgregar && (
          <button
            type="button"
            onClick={agregarTrabajo}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400 transition-colors"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm">Agregar trabajo</span>
          </button>
        )}

        {/* Trabajos */}
        {trabajosFiltrados.map((trabajo) => {
          const Icono = iconosPorTipo[trabajo.tipo] ?? FileText;
          return (
            <div
              key={trabajo.id}
              className="relative group rounded-xl border border-slate-700 overflow-hidden bg-slate-800/50 hover:border-slate-600 transition-colors"
            >
              {/* Miniatura o placeholder */}
              <div
                className={`aspect-video flex items-center justify-center ${coloresPorTipo[trabajo.tipo]}`}
              >
                {trabajo.miniatura ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${trabajo.miniatura})` }}
                  />
                ) : (
                  <Icono className="w-12 h-12 opacity-50" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-white truncate">{trabajo.titulo}</h3>
                  {trabajo.destacado && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{trabajo.fecha}</span>
                </div>
              </div>

              {/* Overlay de acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrabajoSeleccionado(trabajo)}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleDestacado(trabajo.id)}
                  className={`p-2 rounded-lg ${trabajo.destacado ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
                  title={trabajo.destacado ? 'Quitar destacado' : 'Destacar'}
                >
                  <Star className="w-4 h-4" />
                </button>
                {data.permitirEliminar !== false && (
                  <button
                    type="button"
                    onClick={() => eliminarTrabajo(trabajo.id)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadisticas */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
        <span>{trabajos.filter((t) => t.destacado).length} destacados</span>
        <span>{trabajos.filter((t) => t.tipo === 'documento').length} documentos</span>
        <span>{trabajos.filter((t) => t.tipo === 'imagen').length} imagenes</span>
        <span>{trabajos.filter((t) => t.tipo === 'proyecto').length} proyectos</span>
      </div>

      {/* Modal de detalles */}
      {trabajoSeleccionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{trabajoSeleccionado.titulo}</h3>
              <button
                type="button"
                onClick={() => setTrabajoSeleccionado(null)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div
                className={`aspect-video rounded-lg flex items-center justify-center mb-4 ${coloresPorTipo[trabajoSeleccionado.tipo]}`}
              >
                {(() => {
                  const Icono = iconosPorTipo[trabajoSeleccionado.tipo] ?? FileText;
                  return <Icono className="w-16 h-16 opacity-50" />;
                })()}
              </div>
              <p className="text-slate-300 mb-4">{trabajoSeleccionado.descripcion}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{trabajoSeleccionado.fecha}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {trabajoSeleccionado.etiquetas.map((etiqueta) => (
                  <span
                    key={etiqueta}
                    className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                  >
                    {etiqueta}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentacion de props
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instruccion para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Titulo del portafolio',
    required: true,
  },
  {
    name: 'trabajos',
    type: 'array',
    description: 'Lista de trabajos en el portafolio',
    required: true,
  },
  {
    name: 'maxTrabajos',
    type: 'number',
    description: 'Numero maximo de trabajos permitidos',
    required: false,
    defaultValue: '10',
  },
  {
    name: 'permitirAgregar',
    type: 'boolean',
    description: 'Si se permite agregar nuevos trabajos',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirEliminar',
    type: 'boolean',
    description: 'Si se permite eliminar trabajos',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarFiltros',
    type: 'boolean',
    description: 'Si se muestran los filtros',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo
 */
const exampleData: PortfolioExampleData = {
  instruccion: 'Organiza y muestra tus mejores trabajos',
  titulo: 'Mi Portafolio',
  maxTrabajos: 10,
  permitirAgregar: true,
  permitirEliminar: true,
  mostrarFiltros: true,
  trabajos: [
    {
      id: 't1',
      titulo: 'Ensayo sobre el cambio climatico',
      descripcion: 'Analisis de las causas y efectos del cambio climatico global.',
      tipo: 'documento',
      fecha: '2024-03-15',
      etiquetas: ['ciencias', 'medio ambiente'],
      destacado: true,
    },
    {
      id: 't2',
      titulo: 'Maqueta del sistema solar',
      descripcion: 'Proyecto de ciencias representando los planetas del sistema solar.',
      tipo: 'proyecto',
      fecha: '2024-03-10',
      etiquetas: ['ciencias', 'astronomia'],
      destacado: true,
    },
    {
      id: 't3',
      titulo: 'Dibujo de celula vegetal',
      descripcion: 'Ilustracion detallada de una celula vegetal y sus organelos.',
      tipo: 'imagen',
      fecha: '2024-02-28',
      etiquetas: ['biologia', 'arte'],
      destacado: false,
    },
    {
      id: 't4',
      titulo: 'Presentacion de historia',
      descripcion: 'Video explicando la Revolucion Industrial.',
      tipo: 'video',
      fecha: '2024-02-20',
      etiquetas: ['historia', 'presentacion'],
      destacado: false,
    },
    {
      id: 't5',
      titulo: 'Resolucion de ecuaciones',
      descripcion: 'Ejercicios resueltos de ecuaciones cuadraticas.',
      tipo: 'documento',
      fecha: '2024-02-15',
      etiquetas: ['matematicas'],
      destacado: false,
    },
  ],
};

/**
 * Definicion del preview para el registry
 */
export const PortfolioPreview: PreviewDefinition = {
  component: PortfolioPreviewComponent,
  exampleData,
  propsDocumentation,
};
