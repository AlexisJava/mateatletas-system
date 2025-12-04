'use client';

import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Terminal, Layout, Maximize2 } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para CodePlayground
 */
interface PlaygroundFile {
  nombre: string;
  lenguaje: 'javascript' | 'html' | 'css';
  contenido: string;
}

interface CodePlaygroundExampleData {
  instruccion: string;
  archivos: PlaygroundFile[];
  archivoActivo?: string;
  mostrarPreview?: boolean;
  ejecutarAutomatico?: boolean;
  alturaEditor?: number;
  alturaPreview?: number;
  layout?: 'horizontal' | 'vertical' | 'tabs';
}

/**
 * Preview interactivo del componente CodePlayground
 * Entorno de desarrollo con múltiples archivos y preview en vivo
 */
function CodePlaygroundPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as CodePlaygroundExampleData;

  const [archivos, setArchivos] = useState<PlaygroundFile[]>(data.archivos);
  const [archivoActivo, setArchivoActivo] = useState(
    data.archivoActivo ?? data.archivos[0]?.nombre ?? '',
  );
  const [output, setOutput] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const archivoActual = archivos.find((a) => a.nombre === archivoActivo);

  // Generar preview HTML combinando archivos
  const generarPreview = useCallback(() => {
    const htmlFile = archivos.find((a) => a.lenguaje === 'html');
    const cssFile = archivos.find((a) => a.lenguaje === 'css');
    const jsFile = archivos.find((a) => a.lenguaje === 'javascript');

    let html = htmlFile?.contenido ?? '<div id="app"></div>';

    // Inyectar CSS
    if (cssFile) {
      html = `<style>${cssFile.contenido}</style>\n${html}`;
    }

    // Inyectar JS con sandbox
    if (jsFile) {
      const jsCode = `
        <script>
          (function() {
            const logs = [];
            const originalLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({ type: 'console', data: args.map(String).join(' ') }, '*');
              originalLog.apply(console, args);
            };
            try {
              ${jsFile.contenido}
            } catch(e) {
              window.parent.postMessage({ type: 'error', data: e.message }, '*');
            }
          })();
        </script>
      `;
      html = html + jsCode;
    }

    return html;
  }, [archivos]);

  // Actualizar preview automáticamente
  useEffect(() => {
    if (data.mostrarPreview !== false) {
      const html = generarPreview();
      setPreviewHtml(html);
    }
  }, [archivos, data.mostrarPreview, generarPreview]);

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setOutput((prev) => [...prev.slice(-20), `> ${event.data.data}`]);
      } else if (event.data.type === 'error') {
        setOutput((prev) => [...prev.slice(-20), `❌ Error: ${event.data.data}`]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!interactive || !archivoActual) return;

      setArchivos((prev) =>
        prev.map((a) => (a.nombre === archivoActivo ? { ...a, contenido: value ?? '' } : a)),
      );
    },
    [interactive, archivoActivo, archivoActual],
  );

  const handleRun = useCallback(() => {
    if (!interactive) return;
    setOutput([]);
    const html = generarPreview();
    setPreviewHtml(html);
  }, [interactive, generarPreview]);

  const handleReset = useCallback(() => {
    if (!interactive) return;
    setArchivos(data.archivos);
    setOutput([]);
  }, [interactive, data.archivos]);

  const handleClearConsole = useCallback(() => {
    setOutput([]);
  }, []);

  const getFileIcon = (lenguaje: string) => {
    switch (lenguaje) {
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'javascript':
        return '⚡';
      default:
        return '📄';
    }
  };

  const getFileColor = (lenguaje: string) => {
    switch (lenguaje) {
      case 'html':
        return 'text-orange-400';
      case 'css':
        return 'text-blue-400';
      case 'javascript':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} • Preview en vivo
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`
          grid gap-4
          ${data.layout === 'vertical' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}
        `}
      >
        {/* Editor Section */}
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
          {/* File Tabs */}
          <div className="flex items-center border-b border-slate-700 bg-slate-800">
            {archivos.map((archivo) => (
              <button
                key={archivo.nombre}
                type="button"
                onClick={() => interactive && setArchivoActivo(archivo.nombre)}
                disabled={!interactive}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2
                  ${
                    archivoActivo === archivo.nombre
                      ? 'bg-slate-900 text-white border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }
                  disabled:cursor-default
                `}
              >
                <span>{getFileIcon(archivo.lenguaje)}</span>
                <span className={getFileColor(archivo.lenguaje)}>{archivo.nombre}</span>
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          {archivoActual && (
            <Editor
              height={data.alturaEditor ?? 250}
              language={archivoActual.lenguaje}
              value={archivoActual.contenido}
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
            />
          )}

          {/* Action Bar */}
          {interactive && (
            <div className="p-2 border-t border-slate-700 bg-slate-800 flex items-center gap-2">
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
            </div>
          )}
        </div>

        {/* Preview Section */}
        {data.mostrarPreview !== false && (
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-300">Preview</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500">En vivo</span>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-white" style={{ height: data.alturaPreview ?? 200 }}>
              <iframe
                srcDoc={previewHtml}
                title="Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>

            {/* Console */}
            <div className="border-t border-slate-700">
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">Consola</span>
                </div>
                {output.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearConsole}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="h-20 overflow-auto p-2 font-mono text-xs bg-slate-950">
                {output.length === 0 ? (
                  <span className="text-slate-600">// La salida de console.log aparecerá aquí</span>
                ) : (
                  output.map((line, i) => (
                    <div
                      key={i}
                      className={line.startsWith('❌') ? 'text-red-400' : 'text-green-400'}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para CodePlayground
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'archivos',
    type: 'array',
    description: 'Lista de archivos con nombre, lenguaje y contenido',
    required: true,
  },
  {
    name: 'archivoActivo',
    type: 'string',
    description: 'Nombre del archivo activo por defecto',
    required: false,
  },
  {
    name: 'mostrarPreview',
    type: 'boolean',
    description: 'Si se muestra el panel de preview',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'ejecutarAutomatico',
    type: 'boolean',
    description: 'Si se ejecuta el código automáticamente al cambiar',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'alturaEditor',
    type: 'number',
    description: 'Altura del editor en píxeles',
    required: false,
    defaultValue: '250',
  },
  {
    name: 'alturaPreview',
    type: 'number',
    description: 'Altura del preview en píxeles',
    required: false,
    defaultValue: '200',
  },
  {
    name: 'layout',
    type: 'string',
    description: 'Distribución: horizontal, vertical, o tabs',
    required: false,
    defaultValue: 'horizontal',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: CodePlaygroundExampleData = {
  instruccion: 'Crea una página web interactiva con HTML, CSS y JavaScript',
  archivos: [
    {
      nombre: 'index.html',
      lenguaje: 'html',
      contenido: `<div class="container">
  <h1>¡Hola Mundo!</h1>
  <p id="mensaje">Haz click en el botón</p>
  <button onclick="saludar()">
    Saludar
  </button>
</div>`,
    },
    {
      nombre: 'styles.css',
      lenguaje: 'css',
      contenido: `.container {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}

h1 {
  color: #3B82F6;
}

button {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #2563EB;
}`,
    },
    {
      nombre: 'script.js',
      lenguaje: 'javascript',
      contenido: `function saludar() {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = '¡Hola desde JavaScript! 🎉';
  mensaje.style.color = '#10B981';
  console.log('Botón clickeado!');
}

console.log('Script cargado correctamente');`,
    },
  ],
  archivoActivo: 'index.html',
  mostrarPreview: true,
  alturaEditor: 220,
  alturaPreview: 180,
  layout: 'horizontal',
};

/**
 * Definición del preview para el registry
 */
export const CodePlaygroundPreview: PreviewDefinition = {
  component: CodePlaygroundPreviewComponent,
  exampleData,
  propsDocumentation,
};
