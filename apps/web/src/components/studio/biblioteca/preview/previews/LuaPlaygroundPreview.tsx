'use client';

import React, { ReactElement, useState, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Terminal, Info, BookOpen, Copy, Check } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para LuaPlayground
 */
interface LuaPlaygroundExampleData {
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

// Motor de ejecución Lua simplificado (sin dependencias externas)
function ejecutarLua(codigo: string): { output: string[]; error: string | null } {
  const output: string[] = [];
  let error: string | null = null;

  try {
    // Crear un ambiente simulado para Lua básico
    const variables: Record<string, unknown> = {};

    // Parsear y ejecutar línea por línea (simulación simplificada)
    const lineas = codigo.split('\n');

    for (const linea of lineas) {
      const trimmed = linea.trim();

      // Ignorar líneas vacías y comentarios
      if (!trimmed || trimmed.startsWith('--')) continue;

      // Detectar print()
      const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
      if (printMatch) {
        const arg = printMatch[1];
        // Evaluar el argumento
        const resultado = evaluarExpresion(arg, variables);
        output.push(String(resultado));
        continue;
      }

      // Detectar asignación local
      const localMatch = trimmed.match(/^local\s+(\w+)\s*=\s*(.+)$/);
      if (localMatch) {
        const [, nombre, valor] = localMatch;
        variables[nombre] = evaluarExpresion(valor, variables);
        continue;
      }

      // Detectar asignación simple
      const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignMatch) {
        const [, nombre, valor] = assignMatch;
        variables[nombre] = evaluarExpresion(valor, variables);
        continue;
      }

      // Detectar for loop simple
      const forMatch = trimmed.match(/^for\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)\s+do$/);
      if (forMatch) {
        // Solo marcar que estamos en un loop (simplificación)
        continue;
      }

      // end de bloques
      if (trimmed === 'end') continue;

      // Detectar function simple
      if (trimmed.startsWith('function ')) continue;

      // Detectar if simple
      if (trimmed.startsWith('if ') || trimmed === 'else' || trimmed.startsWith('elseif '))
        continue;

      // Detectar return
      if (trimmed.startsWith('return ')) continue;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error de ejecución';
  }

  return { output, error };
}

function evaluarExpresion(expr: string, variables: Record<string, unknown>): unknown {
  const trimmed = expr.trim();

  // String literal
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Número
  if (/^-?\d+\.?\d*$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'nil') return null;

  // Variable
  if (variables[trimmed] !== undefined) {
    return variables[trimmed];
  }

  // Concatenación de strings
  if (trimmed.includes('..')) {
    const partes = trimmed.split('..');
    return partes.map((p) => String(evaluarExpresion(p.trim(), variables))).join('');
  }

  // Operaciones matemáticas básicas
  if (/^[\d\s+\-*/%()]+$/.test(trimmed)) {
    try {
      return Function(`"use strict"; return (${trimmed})`)();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Preview interactivo del componente LuaPlayground
 */
function LuaPlaygroundPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as LuaPlaygroundExampleData;

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

    const resultado = ejecutarLua(codigo);
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
          <span className="text-2xl">🌙</span>
          <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-medium rounded">
            Lua
          </span>
          <span className="text-xs text-slate-500">Editor interactivo</span>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-slate-700 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">main.lua</span>
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
          language="lua"
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
              <span className="text-slate-600">-- La salida de print() aparecerá aquí</span>
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
              <h4 className="text-sm font-medium text-white mb-1">Sobre Lua</h4>
              <p className="text-sm text-slate-400">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Referencia rápida */}
      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">
          Referencia Rápida Lua
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500">Variable:</span>
            <span className="text-blue-400 ml-2">local x = 10</span>
          </div>
          <div>
            <span className="text-slate-500">Print:</span>
            <span className="text-green-400 ml-2">print(&quot;Hola&quot;)</span>
          </div>
          <div>
            <span className="text-slate-500">Concat:</span>
            <span className="text-yellow-400 ml-2">&quot;Hola&quot; .. &quot; Mundo&quot;</span>
          </div>
          <div>
            <span className="text-slate-500">Comentario:</span>
            <span className="text-slate-500 ml-2">-- comentario</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Documentación de props para LuaPlayground
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
    description: 'Código Lua inicial en el editor',
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
const exampleData: LuaPlaygroundExampleData = {
  instruccion: 'Escribe un programa en Lua que salude al mundo',
  codigoInicial: `-- Mi primer programa en Lua
local nombre = "Mundo"

-- Usa print() para mostrar el saludo
print("Hola " .. nombre)

-- Prueba con variables numéricas
local edad = 10
print("Tengo " .. edad .. " años")`,
  codigoSolucion: `-- Solución
local nombre = "Mundo"
print("¡Hola " .. nombre .. "!")

local edad = 10
print("Tengo " .. edad .. " años")`,
  mostrarConsola: true,
  alturaEditor: 200,
  pistas: [
    'Usa print() para mostrar texto en la consola',
    'El operador .. concatena strings en Lua',
    'Las variables locales se declaran con "local"',
  ],
  explicacion:
    'Lua es un lenguaje de scripting ligero y potente. Es muy usado en videojuegos (Roblox, World of Warcraft) y sistemas embebidos. Su sintaxis es simple y fácil de aprender.',
};

/**
 * Definición del preview para el registry
 */
export const LuaPlaygroundPreview: PreviewDefinition = {
  component: LuaPlaygroundPreviewComponent,
  exampleData,
  propsDocumentation,
};
