'use client';

import React, { ReactElement, useState, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Terminal, Info, BookOpen, Copy, Check } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para JavaScriptPlayground
 */
interface JavaScriptPlaygroundExampleData {
  instruccion: string;
  codigoInicial: string;
  codigoSolucion?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    descripcion?: string;
  }>;
  mostrarConsola?: boolean;
  alturaEditor?: number;
  pistas?: string[];
  explicacion?: string;
}

/**
 * Ejecutor seguro de JavaScript usando Function constructor
 * con console.log interceptado
 */
function ejecutarJavaScript(codigo: string): { output: string[]; error: string | null } {
  const output: string[] = [];
  let error: string | null = null;

  try {
    // Crear un console mock que capture los logs
    const consoleMock = {
      log: (...args: unknown[]) => {
        output.push(args.map((arg) => formatValue(arg)).join(' '));
      },
      error: (...args: unknown[]) => {
        output.push(`[ERROR] ${args.map((arg) => formatValue(arg)).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        output.push(`[WARN] ${args.map((arg) => formatValue(arg)).join(' ')}`);
      },
      info: (...args: unknown[]) => {
        output.push(`[INFO] ${args.map((arg) => formatValue(arg)).join(' ')}`);
      },
    };

    // Crear función segura con console inyectado
    const ejecutar = new Function(
      'console',
      `
      "use strict";
      ${codigo}
    `,
    );

    ejecutar(consoleMock);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error de ejecución';
  }

  return { output, error };
}

/**
 * Formatea valores para mostrar en consola
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

/**
 * Preview interactivo del componente JavaScriptPlayground
 */
function JavaScriptPlaygroundPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as JavaScriptPlaygroundExampleData;

  const [codigo, setCodigo] = useState(data.codigoInicial);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pistaActual, setPistaActual] = useState(-1);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const editorRef = useRef<unknown>(null);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!interactive) return;
      setCodigo(value ?? '');
    },
    [interactive],
  );

  const handleRun = useCallback(() => {
    if (!interactive) return;

    setOutput([]);
    setError(null);

    const resultado = ejecutarJavaScript(codigo);
    setOutput(resultado.output);
    setError(resultado.error);
  }, [interactive, codigo]);

  const handleReset = useCallback(() => {
    if (!interactive) return;
    setCodigo(data.codigoInicial);
    setOutput([]);
    setError(null);
    setPistaActual(-1);
    setMostrarSolucion(false);
  }, [interactive, data.codigoInicial]);

  const handleMostrarPista = useCallback(() => {
    if (data.pistas && pistaActual < data.pistas.length - 1) {
      setPistaActual((p) => p + 1);
    }
  }, [data.pistas, pistaActual]);

  const handleCopiarCodigo = useCallback(async () => {
    await navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [codigo]);

  const handleVerSolucion = useCallback(() => {
    if (data.codigoSolucion) {
      setMostrarSolucion(true);
      setCodigo(data.codigoSolucion);
    }
  }, [data.codigoSolucion]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚡</span>
          <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-yellow-600/30 text-yellow-400 text-xs font-medium rounded">
            JavaScript
          </span>
          <span className="text-xs text-slate-500">Editor interactivo</span>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-slate-700 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">script.js</span>
          </div>
          <button
            type="button"
            onClick={handleCopiarCodigo}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-300 transition-colors"
            title="Copiar código"
          >
            {copiado ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <Editor
          height={data.alturaEditor ?? 200}
          language="javascript"
          value={codigo}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: !interactive,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />

        {/* Action Bar */}
        {interactive && (
          <div className="p-2 border-t border-slate-700 bg-slate-800 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRun}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Ejecutar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
            {data.pistas && data.pistas.length > 0 && (
              <button
                type="button"
                onClick={handleMostrarPista}
                disabled={pistaActual >= data.pistas.length - 1}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-4 h-4" />
                Pista ({pistaActual + 1}/{data.pistas.length})
              </button>
            )}
            {data.codigoSolucion && !mostrarSolucion && (
              <button
                type="button"
                onClick={handleVerSolucion}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
              >
                Ver solución
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pistas */}
      {pistaActual >= 0 && data.pistas && (
        <div className="mb-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-1">Pista {pistaActual + 1}</h4>
              <p className="text-sm text-slate-300">{data.pistas[pistaActual]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consola */}
      {data.mostrarConsola !== false && (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-700">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-300">Consola</span>
          </div>
          <div className="h-32 overflow-auto p-4 font-mono text-sm bg-slate-950">
            {output.length === 0 && !error ? (
              <span className="text-slate-600">// La salida de console.log() aparecerá aquí</span>
            ) : (
              <>
                {output.map((line, i) => (
                  <div key={i} className="text-green-400">
                    {line}
                  </div>
                ))}
                {error && <div className="text-red-400">Error: {error}</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Explicación */}
      {data.explicacion && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Sobre JavaScript</h4>
              <p className="text-sm text-slate-400">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Referencia rápida */}
      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">
          Referencia Rápida JavaScript
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500">Variable:</span>
            <span className="text-blue-400 ml-2">let x = 10</span>
          </div>
          <div>
            <span className="text-slate-500">Constante:</span>
            <span className="text-purple-400 ml-2">const PI = 3.14</span>
          </div>
          <div>
            <span className="text-slate-500">Print:</span>
            <span className="text-green-400 ml-2">console.log(&quot;Hola&quot;)</span>
          </div>
          <div>
            <span className="text-slate-500">Template:</span>
            <span className="text-yellow-400 ml-2">{'`Hola ${nombre}`'}</span>
          </div>
          <div>
            <span className="text-slate-500">Función:</span>
            <span className="text-cyan-400 ml-2">const fn = () =&gt; {'{}'}</span>
          </div>
          <div>
            <span className="text-slate-500">Array:</span>
            <span className="text-orange-400 ml-2">[1, 2, 3].map(x =&gt; x*2)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Documentación de props para JavaScriptPlayground
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'codigoInicial',
    type: 'string',
    description: 'Código JavaScript inicial en el editor',
    required: true,
  },
  {
    name: 'codigoSolucion',
    type: 'string',
    description: 'Código de la solución esperada',
    required: false,
  },
  {
    name: 'testCases',
    type: 'array',
    description: 'Casos de prueba para validar la solución',
    required: false,
  },
  {
    name: 'mostrarConsola',
    type: 'boolean',
    description: 'Si se muestra la consola de salida',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'alturaEditor',
    type: 'number',
    description: 'Altura del editor en píxeles',
    required: false,
    defaultValue: '200',
  },
  {
    name: 'pistas',
    type: 'array',
    description: 'Lista de pistas para ayudar al estudiante',
    required: false,
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Explicación sobre el ejercicio o concepto',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: JavaScriptPlaygroundExampleData = {
  instruccion: 'Escribe un programa en JavaScript que calcule el factorial',
  codigoInicial: `// Mi primer programa en JavaScript
const nombre = "Mundo";

// Usa console.log() para mostrar mensajes
console.log("¡Hola " + nombre + "!");

// Prueba con template literals (ES6)
const edad = 10;
console.log(\`Tengo \${edad} años\`);

// Prueba con arrays
const numeros = [1, 2, 3, 4, 5];
const dobles = numeros.map(n => n * 2);
console.log("Dobles:", dobles);`,
  codigoSolucion: `// Solución: Factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial de 5:", factorial(5));
console.log("Factorial de 10:", factorial(10));`,
  mostrarConsola: true,
  alturaEditor: 220,
  pistas: [
    'Usa console.log() para mostrar resultados en la consola',
    'Los template literals usan backticks (`) y ${} para variables',
    'Las arrow functions se escriben: (param) => resultado',
  ],
  explicacion:
    'JavaScript es el lenguaje de la web. Permite crear sitios interactivos, aplicaciones móviles y servidores. Es uno de los lenguajes más populares y versátiles del mundo.',
};

/**
 * Definición del preview para el registry
 */
export const JavaScriptPlaygroundPreview: PreviewDefinition = {
  component: JavaScriptPlaygroundPreviewComponent,
  exampleData,
  propsDocumentation,
};
