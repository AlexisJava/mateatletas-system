'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para DocumentViewer
 */
interface DocumentViewerExampleData {
  instruccion: string;
  titulo: string;
  descripcion?: string;
  tipoDocumento: 'pdf' | 'imagen' | 'texto';
  totalPaginas: number;
  contenidoSimulado: string[];
  permitirDescarga?: boolean;
  permitirZoom?: boolean;
}

/**
 * Preview interactivo del componente DocumentViewer
 * Simula la visualización de documentos PDF/imagen sin necesidad de archivos reales
 */
function DocumentViewerPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as DocumentViewerExampleData;

  const [paginaActual, setPaginaActual] = useState(1);
  const [zoom, setZoom] = useState(100);

  const handlePaginaAnterior = useCallback(() => {
    if (!interactive) return;
    setPaginaActual((prev) => Math.max(1, prev - 1));
  }, [interactive]);

  const handlePaginaSiguiente = useCallback(() => {
    if (!interactive) return;
    setPaginaActual((prev) => Math.min(data.totalPaginas, prev + 1));
  }, [interactive, data.totalPaginas]);

  const handleZoomIn = useCallback(() => {
    if (!interactive || !data.permitirZoom) return;
    setZoom((prev) => Math.min(200, prev + 25));
  }, [interactive, data.permitirZoom]);

  const handleZoomOut = useCallback(() => {
    if (!interactive || !data.permitirZoom) return;
    setZoom((prev) => Math.max(50, prev - 25));
  }, [interactive, data.permitirZoom]);

  const contenidoActual = data.contenidoSimulado[paginaActual - 1] || '';

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        {data.descripcion && <p className="text-sm text-slate-400 mt-1">{data.descripcion}</p>}
      </div>

      {/* Document Viewer Container */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white">{data.titulo}</span>
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
              {data.tipoDocumento.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {data.permitirZoom !== false && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={!interactive || zoom <= 50}
                  className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomOut className="w-4 h-4 text-slate-300" />
                </button>
                <span className="text-xs text-slate-400 w-12 text-center">{zoom}%</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={!interactive || zoom >= 200}
                  className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomIn className="w-4 h-4 text-slate-300" />
                </button>
              </>
            )}
            {data.permitirDescarga && (
              <button
                type="button"
                className="p-1.5 rounded hover:bg-slate-700 transition-colors ml-2"
                title="Descargar"
              >
                <Download className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        </div>

        {/* Document Content Area */}
        <div
          className="relative bg-slate-700/50 p-6 min-h-[300px] flex items-center justify-center overflow-auto"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-slate-800">
            {/* Simulated document content */}
            <div className="space-y-4">
              <div className="text-center border-b border-slate-200 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900">{data.titulo}</h3>
                <p className="text-xs text-slate-500">
                  Página {paginaActual} de {data.totalPaginas}
                </p>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-line">{contenidoActual}</div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {data.totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-4 px-4 py-3 bg-slate-900 border-t border-slate-700">
            <button
              type="button"
              onClick={handlePaginaAnterior}
              disabled={!interactive || paginaActual <= 1}
              className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: data.totalPaginas }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => interactive && setPaginaActual(i + 1)}
                  disabled={!interactive}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    paginaActual === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } disabled:cursor-not-allowed`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePaginaSiguiente}
              disabled={!interactive || paginaActual >= data.totalPaginas}
              className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para DocumentViewer
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Título del documento',
    required: true,
  },
  {
    name: 'descripcion',
    type: 'string',
    description: 'Descripción adicional del documento',
    required: false,
  },
  {
    name: 'tipoDocumento',
    type: 'string',
    description: 'Tipo de documento a mostrar: pdf, imagen, o texto',
    required: true,
  },
  {
    name: 'totalPaginas',
    type: 'number',
    description: 'Número total de páginas del documento',
    required: true,
  },
  {
    name: 'contenidoSimulado',
    type: 'array',
    description: 'Contenido de texto por página (para preview)',
    required: true,
  },
  {
    name: 'permitirDescarga',
    type: 'boolean',
    description: 'Si se permite descargar el documento',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'permitirZoom',
    type: 'boolean',
    description: 'Si se permite hacer zoom al documento',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: DocumentViewerExampleData = {
  instruccion: 'Lee el documento y responde las preguntas',
  titulo: 'Introducción a las Fracciones',
  descripcion: 'Material de apoyo para la unidad 3',
  tipoDocumento: 'pdf',
  totalPaginas: 3,
  contenidoSimulado: [
    '📘 CAPÍTULO 1: ¿Qué es una fracción?\n\nUna fracción representa una parte de un todo. Se escribe con dos números separados por una línea:\n\n• El numerador (arriba): indica cuántas partes tomamos\n• El denominador (abajo): indica en cuántas partes dividimos el todo\n\nEjemplo: 3/4 significa "tres cuartos"',
    '📗 CAPÍTULO 2: Fracciones equivalentes\n\nDos fracciones son equivalentes cuando representan la misma cantidad.\n\nPara encontrar fracciones equivalentes:\n• Multiplicamos numerador y denominador por el mismo número\n• O dividimos ambos por el mismo número\n\nEjemplo: 1/2 = 2/4 = 4/8',
    '📙 CAPÍTULO 3: Suma de fracciones\n\nPara sumar fracciones con el mismo denominador:\n1. Sumamos los numeradores\n2. Mantenemos el denominador\n\nEjemplo: 1/4 + 2/4 = 3/4\n\n¡Ahora practica con los ejercicios!',
  ],
  permitirDescarga: true,
  permitirZoom: true,
};

/**
 * Definición del preview para el registry
 */
export const DocumentViewerPreview: PreviewDefinition = {
  component: DocumentViewerPreviewComponent,
  exampleData,
  propsDocumentation,
};
