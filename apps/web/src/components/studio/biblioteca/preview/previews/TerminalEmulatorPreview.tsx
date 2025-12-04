'use client';

import React, { ReactElement, useState, useCallback, useRef, useEffect } from 'react';
import { Terminal, RotateCcw, Maximize2, Minimize2, Info, CheckCircle2 } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';
import {
  navegarA,
  crearComandosBasicos,
  sistemaArchivosPorDefecto,
  type FileSystemNode,
} from '../hooks/useTerminalFileSystem';

/**
 * Tipos para TerminalEmulator
 */
interface CommandDefinition {
  nombre: string;
  descripcion: string;
  respuesta: string | ((args: string[]) => string);
  aliases?: string[];
}

interface TerminalLine {
  tipo: 'input' | 'output' | 'error' | 'success' | 'system';
  contenido: string;
  timestamp?: number;
}

interface TerminalEmulatorExampleData {
  instruccion: string;
  prompt?: string;
  comandosPersonalizados?: CommandDefinition[];
  sistemaArchivos?: FileSystemNode;
  directorioInicial?: string;
  historialInicial?: TerminalLine[];
  objetivoComando?: string;
  explicacion?: string;
}

/**
 * Preview interactivo del componente TerminalEmulator
 */
function TerminalEmulatorPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as TerminalEmulatorExampleData;

  const [lineas, setLineas] = useState<TerminalLine[]>(data.historialInicial ?? []);
  const [inputActual, setInputActual] = useState('');
  const [historialComandos, setHistorialComandos] = useState<string[]>([]);
  const [indiceHistorial, setIndiceHistorial] = useState(-1);
  const [directorioActual, setDirectorioActual] = useState(
    data.directorioInicial ?? '/home/usuario',
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [objetivoCumplido, setObjetivoCumplido] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompt = data.prompt ?? 'usuario@linux';
  const sistemaArchivos = data.sistemaArchivos ?? sistemaArchivosPorDefecto;

  // Scroll al final cuando hay nuevas líneas
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lineas]);

  // Navegar por el sistema de archivos
  const navegarA = useCallback(
    (ruta: string): FileSystemNode | null => {
      const partes = ruta.startsWith('/')
        ? ruta.split('/').filter(Boolean)
        : [...directorioActual.split('/').filter(Boolean), ...ruta.split('/').filter(Boolean)];

      // Procesar .. y .
      const partesResueltas: string[] = [];
      for (const parte of partes) {
        if (parte === '..') {
          partesResueltas.pop();
        } else if (parte !== '.') {
          partesResueltas.push(parte);
        }
      }

      let nodoActual: FileSystemNode | null = sistemaArchivos;
      for (const parte of partesResueltas) {
        if (nodoActual?.tipo === 'directorio' && nodoActual.hijos) {
          nodoActual = nodoActual.hijos.find((h) => h.nombre === parte) ?? null;
        } else {
          return null;
        }
      }
      return nodoActual;
    },
    [directorioActual, sistemaArchivos],
  );

  // Comandos básicos integrados
  const comandosBasicos: Record<string, (args: string[]) => string> = {
    help: () => {
      const comandosDisponibles = [
        'help     - Muestra esta ayuda',
        'clear    - Limpia la terminal',
        'pwd      - Muestra el directorio actual',
        'ls       - Lista archivos y directorios',
        'cd       - Cambia de directorio',
        'cat      - Muestra contenido de archivo',
        'echo     - Imprime texto',
        'mkdir    - Crea un directorio',
        'touch    - Crea un archivo vacío',
        'whoami   - Muestra el usuario actual',
        'date     - Muestra fecha y hora',
        'history  - Muestra historial de comandos',
      ];
      return comandosDisponibles.join('\n');
    },
    clear: () => {
      setLineas([]);
      return '';
    },
    pwd: () => directorioActual,
    ls: (args) => {
      const ruta = args[0] ?? directorioActual;
      const nodo = navegarA(ruta);
      if (!nodo) return `ls: no se puede acceder a '${ruta}': No existe`;
      if (nodo.tipo === 'archivo') return nodo.nombre;
      if (!nodo.hijos || nodo.hijos.length === 0) return '';
      return nodo.hijos
        .map((h) => (h.tipo === 'directorio' ? `\x1b[34m${h.nombre}/\x1b[0m` : h.nombre))
        .join('  ');
    },
    cd: (args) => {
      if (!args[0] || args[0] === '~') {
        setDirectorioActual('/home/usuario');
        return '';
      }
      const nuevaRuta = args[0].startsWith('/')
        ? args[0]
        : `${directorioActual}/${args[0]}`.replace(/\/+/g, '/');
      const nodo = navegarA(args[0]);
      if (!nodo) return `cd: ${args[0]}: No existe el directorio`;
      if (nodo.tipo !== 'directorio') return `cd: ${args[0]}: No es un directorio`;

      // Normalizar ruta
      const partes = nuevaRuta.split('/').filter(Boolean);
      const partesResueltas: string[] = [];
      for (const parte of partes) {
        if (parte === '..') {
          partesResueltas.pop();
        } else if (parte !== '.') {
          partesResueltas.push(parte);
        }
      }
      setDirectorioActual('/' + partesResueltas.join('/'));
      return '';
    },
    cat: (args) => {
      if (!args[0]) return 'cat: falta el operando archivo';
      const nodo = navegarA(args[0]);
      if (!nodo) return `cat: ${args[0]}: No existe`;
      if (nodo.tipo === 'directorio') return `cat: ${args[0]}: Es un directorio`;
      return nodo.contenido ?? '';
    },
    echo: (args) => args.join(' '),
    mkdir: (args) => {
      if (!args[0]) return 'mkdir: falta el operando';
      return `mkdir: directorio '${args[0]}' creado (simulado)`;
    },
    touch: (args) => {
      if (!args[0]) return 'touch: falta el operando archivo';
      return `touch: archivo '${args[0]}' creado (simulado)`;
    },
    whoami: () => 'usuario',
    date: () => new Date().toLocaleString('es-ES'),
    history: () => historialComandos.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n'),
  };

  // Ejecutar comando
  const ejecutarComando = useCallback(
    (comandoCompleto: string) => {
      const partes = comandoCompleto.trim().split(/\s+/);
      const comando = partes[0] ?? '';
      const args = partes.slice(1);
      const cmdLower = comando.toLowerCase();

      // Agregar al historial
      if (comandoCompleto.trim()) {
        setHistorialComandos((prev) => [...prev, comandoCompleto]);
      }

      // Buscar comando personalizado
      const cmdPersonalizado = data.comandosPersonalizados?.find(
        (c) => c.nombre === cmdLower || c.aliases?.includes(cmdLower),
      );

      let resultado: string;
      let tipo: TerminalLine['tipo'] = 'output';

      if (cmdPersonalizado) {
        resultado =
          typeof cmdPersonalizado.respuesta === 'function'
            ? cmdPersonalizado.respuesta(args)
            : cmdPersonalizado.respuesta;
      } else if (comandosBasicos[cmdLower]) {
        resultado = comandosBasicos[cmdLower](args);
      } else if (comando) {
        resultado = `${comando}: comando no encontrado`;
        tipo = 'error';
      } else {
        resultado = '';
      }

      // Verificar si se cumplió el objetivo
      if (data.objetivoComando && comandoCompleto.trim() === data.objetivoComando) {
        setObjetivoCumplido(true);
      }

      // Agregar líneas
      const nuevasLineas: TerminalLine[] = [
        { tipo: 'input', contenido: `${prompt}:${directorioActual}$ ${comandoCompleto}` },
      ];

      if (resultado) {
        nuevasLineas.push({ tipo, contenido: resultado });
      }

      setLineas((prev) => [...prev, ...nuevasLineas]);
    },
    [
      comandosBasicos,
      data.comandosPersonalizados,
      data.objetivoComando,
      directorioActual,
      historialComandos,
      prompt,
    ],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      ejecutarComando(inputActual);
      setInputActual('');
      setIndiceHistorial(-1);
    },
    [ejecutarComando, inputActual],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nuevoIndice = Math.min(indiceHistorial + 1, historialComandos.length - 1);
        setIndiceHistorial(nuevoIndice);
        if (nuevoIndice >= 0) {
          const comandoHistorial = historialComandos[historialComandos.length - 1 - nuevoIndice];
          if (comandoHistorial !== undefined) {
            setInputActual(comandoHistorial);
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nuevoIndice = Math.max(indiceHistorial - 1, -1);
        setIndiceHistorial(nuevoIndice);
        if (nuevoIndice >= 0) {
          const comandoHistorial = historialComandos[historialComandos.length - 1 - nuevoIndice];
          if (comandoHistorial !== undefined) {
            setInputActual(comandoHistorial);
          }
        } else {
          setInputActual('');
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Autocompletado básico
        const nodo = navegarA(directorioActual);
        if (nodo?.tipo === 'directorio' && nodo.hijos && inputActual) {
          const partes = inputActual.split(' ');
          const ultima = partes[partes.length - 1] ?? '';
          const coincidencia = nodo.hijos.find((h) => h.nombre.startsWith(ultima));
          if (coincidencia) {
            partes[partes.length - 1] =
              coincidencia.nombre + (coincidencia.tipo === 'directorio' ? '/' : '');
            setInputActual(partes.join(' '));
          }
        }
      }
    },
    [indiceHistorial, historialComandos, navegarA, directorioActual, inputActual],
  );

  const reiniciar = useCallback(() => {
    setLineas(data.historialInicial ?? []);
    setInputActual('');
    setHistorialComandos([]);
    setIndiceHistorial(-1);
    setDirectorioActual(data.directorioInicial ?? '/home/usuario');
    setObjetivoCumplido(false);
  }, [data.historialInicial, data.directorioInicial]);

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Renderizar línea con colores ANSI básicos
  const renderLinea = (linea: TerminalLine): ReactElement => {
    let contenido = linea.contenido;
    const colores: Record<string, string> = {
      '\x1b[34m': 'text-blue-400',
      '\x1b[0m': 'text-slate-300',
    };

    // Procesar códigos de escape ANSI
    const segmentos: ReactElement[] = [];
    let claseActual = 'text-slate-300';
    let textoActual = '';
    let i = 0;
    let keyIndex = 0;

    while (i < contenido.length) {
      if (contenido.startsWith('\x1b[', i)) {
        if (textoActual) {
          segmentos.push(
            <span key={keyIndex++} className={claseActual}>
              {textoActual}
            </span>,
          );
          textoActual = '';
        }
        const fin = contenido.indexOf('m', i);
        if (fin !== -1) {
          const codigo = contenido.slice(i, fin + 1);
          claseActual = colores[codigo] ?? 'text-slate-300';
          i = fin + 1;
          continue;
        }
      }
      textoActual += contenido[i];
      i++;
    }

    if (textoActual) {
      segmentos.push(
        <span key={keyIndex++} className={claseActual}>
          {textoActual}
        </span>,
      );
    }

    const colorBase =
      linea.tipo === 'error'
        ? 'text-red-400'
        : linea.tipo === 'success'
          ? 'text-green-400'
          : linea.tipo === 'system'
            ? 'text-yellow-400'
            : linea.tipo === 'input'
              ? 'text-slate-300'
              : '';

    return <div className={`font-mono text-sm whitespace-pre-wrap ${colorBase}`}>{segmentos}</div>;
  };

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-900' : ''}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
          {data.objetivoComando && (
            <p className="text-sm text-slate-400 mt-1">
              Objetivo: ejecuta{' '}
              <code className="px-1 bg-slate-700 rounded">{data.objetivoComando}</code>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reiniciar}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div
        className={`rounded-xl border border-slate-700 overflow-hidden ${fullscreen ? 'h-[calc(100%-120px)]' : ''}`}
      >
        {/* Title bar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {prompt} - {directorioActual}
          </span>
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          onClick={handleTerminalClick}
          className={`bg-slate-950 p-4 overflow-y-auto cursor-text ${fullscreen ? 'h-[calc(100%-44px)]' : 'h-64'}`}
        >
          {/* Líneas de salida */}
          {lineas.map((linea, i) => (
            <div key={i}>{renderLinea(linea)}</div>
          ))}

          {/* Línea de entrada */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="font-mono text-sm text-green-400">
              {prompt}:<span className="text-blue-400">{directorioActual}</span>$&nbsp;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputActual}
              onChange={(e) => setInputActual(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      </div>

      {/* Objetivo cumplido */}
      {objetivoCumplido && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">
            ¡Objetivo cumplido! Has ejecutado el comando correctamente.
          </span>
        </div>
      )}

      {/* Explicación */}
      {data.explicacion && !fullscreen && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Ayuda</h4>
              <p className="text-sm text-slate-400 whitespace-pre-line">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para TerminalEmulator
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'prompt',
    type: 'string',
    description: 'Texto del prompt de la terminal',
    required: false,
    defaultValue: 'usuario@linux',
  },
  {
    name: 'comandosPersonalizados',
    type: 'array',
    description: 'Lista de comandos personalizados con nombre, descripción y respuesta',
    required: false,
  },
  {
    name: 'sistemaArchivos',
    type: 'object',
    description: 'Estructura del sistema de archivos simulado',
    required: false,
  },
  {
    name: 'directorioInicial',
    type: 'string',
    description: 'Directorio inicial de la terminal',
    required: false,
    defaultValue: '/home/usuario',
  },
  {
    name: 'historialInicial',
    type: 'array',
    description: 'Líneas iniciales mostradas en la terminal',
    required: false,
  },
  {
    name: 'objetivoComando',
    type: 'string',
    description: 'Comando que el estudiante debe ejecutar',
    required: false,
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Texto de ayuda con comandos disponibles',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: TerminalEmulatorExampleData = {
  instruccion: 'Practica comandos básicos de Linux en esta terminal simulada',
  prompt: 'estudiante@linux',
  directorioInicial: '/home/usuario',
  historialInicial: [
    {
      tipo: 'system',
      contenido:
        'Bienvenido a la terminal de práctica. Escribe "help" para ver los comandos disponibles.',
    },
  ],
  objetivoComando: 'ls documentos',
  explicacion: `Comandos básicos disponibles:
• help - Muestra la ayuda
• ls [dir] - Lista archivos
• cd [dir] - Cambia directorio
• pwd - Directorio actual
• cat [archivo] - Ver contenido
• clear - Limpia pantalla

Tip: Usa las flechas ↑↓ para navegar el historial`,
};

/**
 * Definición del preview para el registry
 */
export const TerminalEmulatorPreview: PreviewDefinition = {
  component: TerminalEmulatorPreviewComponent,
  exampleData,
  propsDocumentation,
};
