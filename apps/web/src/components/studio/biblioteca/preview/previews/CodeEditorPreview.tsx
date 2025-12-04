'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Check, X, Copy, CheckCheck } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para CodeEditor
 */
interface CodeEditorExampleData {
  instruccion: string;
  lenguaje: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json';
  codigoInicial: string;
  codigoSolucion?: string;
  mostrarNumeroLineas?: boolean;
  permitirEjecucion?: boolean;
  verificarSolucion?: boolean;
  tema?: 'vs-dark' | 'light';
  altura?: number;
  soloLectura?: boolean;
  pistas?: string[];
}

/**
 * Preview interactivo del componente CodeEditor
 * Editor de código basado en Monaco Editor
 */
function CodeEditorPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as CodeEditorExampleData;

  const [codigo, setCodigo] = useState(data.codigoInicial);
  const [output, setOutput] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [pistaActual, setPistaActual] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!interactive || data.soloLectura) return;
      setCodigo(value ?? '');
      setIsCorrect(null);
      setOutput(null);
    },
    [interactive, data.soloLectura],
  );

  const handleRun = useCallback(() => {
    if (!interactive || !data.permitirEjecucion) return;

    try {
      // Simulación de ejecución segura (solo para demo)
      if (data.lenguaje === 'javascript' || data.lenguaje === 'typescript') {
        // Capturar console.log
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        };

        // Ejecutar en sandbox limitado (solo para demo)
        const fn = new Function('console', codigo);
        fn(mockConsole);

        setOutput(logs.join('\n') || '(sin salida)');
      } else {
        setOutput(`Ejecución de ${data.lenguaje} no soportada en preview`);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [interactive, data.permitirEjecucion, data.lenguaje, codigo]);

  const handleVerify = useCallback(() => {
    if (!interactive || !data.verificarSolucion || !data.codigoSolucion) return;

    // Normalizar código para comparación
    const normalizar = (s: string) =>
      s
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};,()])\s*/g, '$1')
        .trim();

    const codigoNorm = normalizar(codigo);
    const solucionNorm = normalizar(data.codigoSolucion);

    setIsCorrect(codigoNorm === solucionNorm);
  }, [interactive, data.verificarSolucion, data.codigoSolucion, codigo]);

  const handleReset = useCallback(() => {
    if (!interactive) return;
    setCodigo(data.codigoInicial);
    setOutput(null);
    setIsCorrect(null);
    setMostrarPista(false);
  }, [interactive, data.codigoInicial]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codigo]);

  const handleNextPista = useCallback(() => {
    if (!data.pistas?.length) return;
    setMostrarPista(true);
    if (pistaActual < data.pistas.length - 1) {
      setPistaActual((prev) => prev + 1);
    }
  }, [data.pistas, pistaActual]);

  const lenguajeLabel: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-medium rounded">
            {lenguajeLabel[data.lenguaje] ?? data.lenguaje}
          </span>
          {data.soloLectura && (
            <span className="px-2 py-1 bg-slate-600/30 text-slate-400 text-xs rounded">
              Solo lectura
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
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

        <Editor
          height={data.altura ?? 200}
          language={data.lenguaje}
          value={codigo}
          onChange={handleEditorChange}
          theme={data.tema ?? 'vs-dark'}
          options={{
            readOnly: !interactive || data.soloLectura,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: data.mostrarNumeroLineas !== false ? 'on' : 'off',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Output */}
      {output !== null && (
        <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-500 mb-2 font-medium">Salida:</div>
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      {/* Verification Result */}
      {isCorrect !== null && (
        <div
          className={`
            mt-4 p-4 rounded-xl border flex items-center gap-3
            ${isCorrect ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}
          `}
        >
          {isCorrect ? (
            <>
              <Check className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">¡Correcto!</p>
                <p className="text-green-300 text-sm">
                  Tu código coincide con la solución esperada
                </p>
              </div>
            </>
          ) : (
            <>
              <X className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Revisa tu código</p>
                <p className="text-red-300 text-sm">La solución no coincide. ¡Sigue intentando!</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hints */}
      {data.pistas && data.pistas.length > 0 && mostrarPista && (
        <div className="mt-4 p-4 bg-amber-900/20 border border-amber-600/50 rounded-xl">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-lg">💡</span>
            <div>
              <p className="text-amber-400 font-medium text-sm">
                Pista {pistaActual + 1} de {data.pistas.length}
              </p>
              <p className="text-amber-200 text-sm mt-1">{data.pistas[pistaActual]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.permitirEjecucion && (
            <button
              type="button"
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Ejecutar
            </button>
          )}

          {data.verificarSolucion && data.codigoSolucion && (
            <button
              type="button"
              onClick={handleVerify}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Verificar
            </button>
          )}

          {data.pistas && data.pistas.length > 0 && (
            <button
              type="button"
              onClick={handleNextPista}
              disabled={mostrarPista && pistaActual >= data.pistas.length - 1}
              className="px-4 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 font-medium transition-colors disabled:opacity-50"
            >
              {mostrarPista ? 'Siguiente pista' : 'Ver pista'}
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para CodeEditor
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
    name: 'codigoInicial',
    type: 'string',
    description: 'Código inicial mostrado en el editor',
    required: true,
  },
  {
    name: 'codigoSolucion',
    type: 'string',
    description: 'Código de la solución esperada para verificación',
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
    name: 'permitirEjecucion',
    type: 'boolean',
    description: 'Si se permite ejecutar el código (solo JS/TS)',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'verificarSolucion',
    type: 'boolean',
    description: 'Si se permite verificar contra la solución',
    required: false,
    defaultValue: 'false',
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
    description: 'Altura del editor en píxeles',
    required: false,
    defaultValue: '200',
  },
  {
    name: 'soloLectura',
    type: 'boolean',
    description: 'Si el editor es de solo lectura',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'pistas',
    type: 'array',
    description: 'Lista de pistas para ayudar al estudiante',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: CodeEditorExampleData = {
  instruccion: 'Completa la función para que devuelva la suma de dos números',
  lenguaje: 'javascript',
  codigoInicial: `function suma(a, b) {
  // Tu código aquí

}

// Prueba tu función
console.log(suma(2, 3)); // Debe mostrar 5`,
  codigoSolucion: `function suma(a, b) {
  return a + b;
}

// Prueba tu función
console.log(suma(2, 3)); // Debe mostrar 5`,
  mostrarNumeroLineas: true,
  permitirEjecucion: true,
  verificarSolucion: true,
  tema: 'vs-dark',
  altura: 200,
  pistas: [
    'Usa la palabra clave "return" para devolver un valor',
    'Puedes sumar dos números usando el operador +',
    'La solución es: return a + b;',
  ],
};

/**
 * Definición del preview para el registry
 */
export const CodeEditorPreview: PreviewDefinition = {
  component: CodeEditorPreviewComponent,
  exampleData,
  propsDocumentation,
};
