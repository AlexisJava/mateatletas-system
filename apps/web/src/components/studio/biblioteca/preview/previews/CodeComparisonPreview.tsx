'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { ArrowLeftRight, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para CodeComparison
 */
interface CodeComparisonExampleData {
  instruccion: string;
  lenguaje: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json';
  codigoOriginal: string;
  codigoModificado: string;
  tituloOriginal?: string;
  tituloModificado?: string;
  mostrarDiferencias?: boolean;
  permitirEdicion?: boolean;
  altura?: number;
  resaltarCambios?: boolean;
}

/**
 * Preview interactivo del componente CodeComparison
 * Comparador de código lado a lado o en modo diff
 */
function CodeComparisonPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as CodeComparisonExampleData;

  const [codigoIzq, setCodigoIzq] = useState(data.codigoOriginal);
  const [codigoDer, setCodigoDer] = useState(data.codigoModificado);
  const [vistaUnificada, setVistaUnificada] = useState(false);
  const [mostrarCambios, setMostrarCambios] = useState(data.mostrarDiferencias !== false);
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  const handleCopy = useCallback(
    async (side: 'left' | 'right') => {
      const codigo = side === 'left' ? codigoIzq : codigoDer;
      await navigator.clipboard.writeText(codigo);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2000);
    },
    [codigoIzq, codigoDer],
  );

  const handleSwap = useCallback(() => {
    if (!interactive) return;
    setCodigoIzq(codigoDer);
    setCodigoDer(codigoIzq);
  }, [interactive, codigoIzq, codigoDer]);

  const lenguajeLabel: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
  };

  // Calcular estadísticas de diferencias (simplificado)
  const lineasIzq = codigoIzq.split('\n').length;
  const lineasDer = codigoDer.split('\n').length;
  const diferencias = Math.abs(lineasIzq - lineasDer);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-medium rounded">
            {lenguajeLabel[data.lenguaje] ?? data.lenguaje}
          </span>
          <span className="text-xs text-slate-500">
            {lineasIzq} líneas → {lineasDer} líneas
            {diferencias > 0 &&
              ` (${diferencias} ${diferencias === 1 ? 'diferencia' : 'diferencias'})`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVistaUnificada(!vistaUnificada)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${vistaUnificada ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {vistaUnificada ? 'Vista unificada' : 'Vista lado a lado'}
          </button>
          <button
            type="button"
            onClick={() => setMostrarCambios(!mostrarCambios)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${mostrarCambios ? 'bg-green-600/30 text-green-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
          >
            {mostrarCambios ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Cambios
          </button>
        </div>

        {interactive && (
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-medium transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Intercambiar
          </button>
        )}
      </div>

      {/* Diff View */}
      {vistaUnificada ? (
        <div className="rounded-xl overflow-hidden border border-slate-700">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              Vista de diferencias unificada
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">- Eliminado</span>
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">+ Agregado</span>
            </div>
          </div>
          <DiffEditor
            height={data.altura ?? 300}
            language={data.lenguaje}
            original={codigoIzq}
            modified={codigoDer}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: false,
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Left Panel - Original */}
          <div className="rounded-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-medium text-slate-300">
                  {data.tituloOriginal ?? 'Original'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('left')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copiar código"
              >
                {copiedSide === 'left' ? (
                  <CheckCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <Editor
              height={data.altura ?? 250}
              language={data.lenguaje}
              value={codigoIzq}
              onChange={(value) => interactive && data.permitirEdicion && setCodigoIzq(value ?? '')}
              theme="vs-dark"
              options={{
                readOnly: !interactive || !data.permitirEdicion,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Right Panel - Modified */}
          <div className="rounded-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-slate-300">
                  {data.tituloModificado ?? 'Modificado'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('right')}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copiar código"
              >
                {copiedSide === 'right' ? (
                  <CheckCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <Editor
              height={data.altura ?? 250}
              language={data.lenguaje}
              value={codigoDer}
              onChange={(value) => interactive && data.permitirEdicion && setCodigoDer(value ?? '')}
              theme="vs-dark"
              options={{
                readOnly: !interactive || !data.permitirEdicion,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      )}

      {/* Legend */}
      {mostrarCambios && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500" />
              <span className="text-slate-400">Código eliminado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
              <span className="text-slate-400">Código agregado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500" />
              <span className="text-slate-400">Código modificado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para CodeComparison
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'lenguaje',
    type: 'string',
    description: 'Lenguaje de programación: javascript, typescript, python, html, css, json',
    required: true,
  },
  {
    name: 'codigoOriginal',
    type: 'string',
    description: 'Código de la versión original (izquierda)',
    required: true,
  },
  {
    name: 'codigoModificado',
    type: 'string',
    description: 'Código de la versión modificada (derecha)',
    required: true,
  },
  {
    name: 'tituloOriginal',
    type: 'string',
    description: 'Título del panel izquierdo',
    required: false,
    defaultValue: 'Original',
  },
  {
    name: 'tituloModificado',
    type: 'string',
    description: 'Título del panel derecho',
    required: false,
    defaultValue: 'Modificado',
  },
  {
    name: 'mostrarDiferencias',
    type: 'boolean',
    description: 'Si se resaltan las diferencias',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirEdicion',
    type: 'boolean',
    description: 'Si se permite editar el código',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'altura',
    type: 'number',
    description: 'Altura del editor en píxeles',
    required: false,
    defaultValue: '250',
  },
  {
    name: 'resaltarCambios',
    type: 'boolean',
    description: 'Si se resaltan los cambios con colores',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: CodeComparisonExampleData = {
  instruccion: 'Compara las dos versiones del código y encuentra las mejoras',
  lenguaje: 'javascript',
  codigoOriginal: `// Versión inicial
function calcularTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].precio;
  }
  return total;
}

var carrito = [
  { nombre: 'Manzana', precio: 1.5 },
  { nombre: 'Pan', precio: 2.0 }
];

console.log(calcularTotal(carrito));`,
  codigoModificado: `// Versión mejorada con ES6+
const calcularTotal = (items) => {
  return items.reduce(
    (total, item) => total + item.precio,
    0
  );
};

const carrito = [
  { nombre: 'Manzana', precio: 1.5 },
  { nombre: 'Pan', precio: 2.0 }
];

console.log(calcularTotal(carrito));`,
  tituloOriginal: 'Antes (ES5)',
  tituloModificado: 'Después (ES6+)',
  mostrarDiferencias: true,
  permitirEdicion: false,
  altura: 280,
};

/**
 * Definición del preview para el registry
 */
export const CodeComparisonPreview: PreviewDefinition = {
  component: CodeComparisonPreviewComponent,
  exampleData,
  propsDocumentation,
};
