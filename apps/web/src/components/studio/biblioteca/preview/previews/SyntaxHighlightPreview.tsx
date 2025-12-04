'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, CheckCheck, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para SyntaxHighlight
 */
interface LineAnnotation {
  linea: number;
  texto: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
}

interface SyntaxHighlightExampleData {
  instruccion: string;
  lenguaje: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'sql' | 'bash';
  codigo: string;
  titulo?: string;
  mostrarNumeroLineas?: boolean;
  resaltarLineas?: number[];
  anotaciones?: LineAnnotation[];
  tema?: 'vs-dark' | 'light';
  altura?: number;
  expandible?: boolean;
  explicacion?: string;
}

/**
 * Preview interactivo del componente SyntaxHighlight
 * Visualizador de código con resaltado de sintaxis y anotaciones
 */
function SyntaxHighlightPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as SyntaxHighlightExampleData;

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!data.expandible);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(data.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data.codigo]);

  // Calcular decorations para resaltar líneas
  const decoraciones = useMemo(() => {
    if (!data.resaltarLineas?.length) return [];
    return data.resaltarLineas.map((linea) => ({
      range: { startLineNumber: linea, endLineNumber: linea, startColumn: 1, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: 'highlighted-line',
        linesDecorationsClassName: 'line-decoration',
      },
    }));
  }, [data.resaltarLineas]);

  const lenguajeLabel: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    sql: 'SQL',
    bash: 'Bash',
  };

  const lenguajeIcon: Record<string, string> = {
    javascript: '⚡',
    typescript: '🔷',
    python: '🐍',
    html: '🌐',
    css: '🎨',
    json: '📋',
    sql: '🗃️',
    bash: '💻',
  };

  const tipoColor: Record<string, string> = {
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
    warning: 'bg-amber-500/20 border-amber-500 text-amber-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    success: 'bg-green-500/20 border-green-500 text-green-400',
  };

  const tipoIcon: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  const lineasCodigo = data.codigo.split('\n').length;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Code Block */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        {/* Title Bar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>{lenguajeIcon[data.lenguaje]}</span>
              <span className="text-slate-400 font-medium">
                {data.titulo ?? lenguajeLabel[data.lenguaje] ?? data.lenguaje}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{lineasCodigo} líneas</span>

            {data.expandible && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title={expanded ? 'Colapsar' : 'Expandir'}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        {(expanded || !data.expandible) && (
          <div className="relative">
            <Editor
              height={data.altura ?? 200}
              language={data.lenguaje}
              value={data.codigo}
              theme={data.tema ?? 'vs-dark'}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: data.mostrarNumeroLineas !== false ? 'on' : 'off',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'none',
                selectionHighlight: false,
                occurrencesHighlight: 'off',
                folding: false,
                glyphMargin: !!data.anotaciones?.length,
              }}
              onMount={(editor, monaco) => {
                // Aplicar decoraciones para líneas resaltadas
                if (decoraciones.length > 0) {
                  const model = editor.getModel();
                  if (model) {
                    editor.deltaDecorations(
                      [],
                      decoraciones.map((d) => ({
                        range: new monaco.Range(
                          d.range.startLineNumber,
                          d.range.startColumn,
                          d.range.endLineNumber,
                          d.range.endColumn,
                        ),
                        options: {
                          isWholeLine: true,
                          className: 'bg-yellow-500/10',
                          glyphMarginClassName: 'text-yellow-400',
                        },
                      })),
                    );
                  }
                }
              }}
            />

            {/* Highlighted Lines Indicator */}
            {data.resaltarLineas && data.resaltarLineas.length > 0 && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/20 rounded text-xs text-yellow-400">
                📍 Líneas destacadas: {data.resaltarLineas.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Collapsed state */}
        {!expanded && data.expandible && (
          <div className="p-4 bg-slate-800/50 text-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Click para ver el código completo ({lineasCodigo} líneas)
            </button>
          </div>
        )}
      </div>

      {/* Annotations */}
      {data.anotaciones && data.anotaciones.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Anotaciones ({data.anotaciones.length})</span>
            {showAnnotations ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAnnotations && (
            <div className="space-y-2">
              {data.anotaciones.map((anotacion, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg border-l-4 flex items-start gap-3
                    ${tipoColor[anotacion.tipo]}
                  `}
                >
                  <span className="text-lg">{tipoIcon[anotacion.tipo]}</span>
                  <div>
                    <span className="text-xs font-medium opacity-80">Línea {anotacion.linea}</span>
                    <p className="text-sm mt-0.5">{anotacion.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {data.explicacion && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Explicación</h4>
              <p className="text-sm text-slate-400">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para SyntaxHighlight
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
    description: 'Lenguaje de programación para resaltado',
    required: true,
  },
  {
    name: 'codigo',
    type: 'string',
    description: 'Código a mostrar con resaltado de sintaxis',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Título personalizado del bloque de código',
    required: false,
  },
  {
    name: 'mostrarNumeroLineas',
    type: 'boolean',
    description: 'Si se muestran los números de línea',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'resaltarLineas',
    type: 'array',
    description: 'Números de líneas a resaltar',
    required: false,
  },
  {
    name: 'anotaciones',
    type: 'array',
    description: 'Lista de anotaciones con línea, texto y tipo',
    required: false,
  },
  {
    name: 'tema',
    type: 'string',
    description: 'Tema del editor: vs-dark o light',
    required: false,
    defaultValue: 'vs-dark',
  },
  {
    name: 'altura',
    type: 'number',
    description: 'Altura del bloque de código en píxeles',
    required: false,
    defaultValue: '200',
  },
  {
    name: 'expandible',
    type: 'boolean',
    description: 'Si el código puede colapsarse/expandirse',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Texto de explicación debajo del código',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: SyntaxHighlightExampleData = {
  instruccion: 'Observa cómo funciona una función de ordenamiento en JavaScript',
  lenguaje: 'javascript',
  titulo: 'bubbleSort.js',
  codigo: `// Algoritmo de ordenamiento burbuja
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparar elementos adyacentes
      if (arr[j] > arr[j + 1]) {
        // Intercambiar si están en orden incorrecto
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}

// Ejemplo de uso
const numeros = [64, 34, 25, 12, 22, 11, 90];
console.log(bubbleSort(numeros));
// Output: [11, 12, 22, 25, 34, 64, 90]`,
  mostrarNumeroLineas: true,
  resaltarLineas: [7, 8, 9, 10],
  anotaciones: [
    {
      linea: 7,
      texto:
        'Esta es la comparación clave del algoritmo. Compara cada par de elementos adyacentes.',
      tipo: 'info',
    },
    {
      linea: 9,
      texto: 'Usamos destructuración de arrays para intercambiar valores sin variable temporal.',
      tipo: 'success',
    },
    {
      linea: 5,
      texto: 'El bucle externo controla el número de pasadas necesarias.',
      tipo: 'info',
    },
  ],
  tema: 'vs-dark',
  altura: 320,
  expandible: false,
  explicacion:
    'El algoritmo burbuja compara elementos adyacentes y los intercambia si están en el orden incorrecto. Este proceso se repite hasta que la lista está ordenada. Tiene complejidad O(n²) lo que lo hace ineficiente para grandes conjuntos de datos.',
};

/**
 * Definición del preview para el registry
 */
export const SyntaxHighlightPreview: PreviewDefinition = {
  component: SyntaxHighlightPreviewComponent,
  exampleData,
  propsDocumentation,
};
