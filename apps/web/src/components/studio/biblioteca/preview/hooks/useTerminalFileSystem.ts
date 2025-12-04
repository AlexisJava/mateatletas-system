/**
 * Sistema de archivos simulado para TerminalEmulator
 */

export interface FileSystemNode {
  nombre: string;
  tipo: 'archivo' | 'directorio';
  contenido?: string;
  hijos?: FileSystemNode[];
}

/**
 * Sistema de archivos por defecto
 */
export const sistemaArchivosPorDefecto: FileSystemNode = {
  nombre: '/',
  tipo: 'directorio',
  hijos: [
    {
      nombre: 'home',
      tipo: 'directorio',
      hijos: [
        {
          nombre: 'usuario',
          tipo: 'directorio',
          hijos: [
            {
              nombre: 'documentos',
              tipo: 'directorio',
              hijos: [
                { nombre: 'notas.txt', tipo: 'archivo', contenido: 'Mis notas importantes\n' },
                {
                  nombre: 'codigo.js',
                  tipo: 'archivo',
                  contenido: 'console.log("Hola mundo!");\n',
                },
              ],
            },
            {
              nombre: 'proyectos',
              tipo: 'directorio',
              hijos: [
                { nombre: 'web', tipo: 'directorio', hijos: [] },
                { nombre: 'app', tipo: 'directorio', hijos: [] },
              ],
            },
            {
              nombre: '.bashrc',
              tipo: 'archivo',
              contenido: '# Configuración de bash\nexport PATH=$PATH:/usr/local/bin\n',
            },
          ],
        },
      ],
    },
    {
      nombre: 'etc',
      tipo: 'directorio',
      hijos: [{ nombre: 'config.conf', tipo: 'archivo', contenido: '[settings]\ntheme=dark\n' }],
    },
    {
      nombre: 'tmp',
      tipo: 'directorio',
      hijos: [],
    },
  ],
};

/**
 * Navega a una ruta en el sistema de archivos
 */
export function navegarA(
  ruta: string,
  directorioActual: string,
  sistemaArchivos: FileSystemNode,
): FileSystemNode | null {
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
}

/**
 * Resuelve una ruta relativa o absoluta a una ruta normalizada
 */
export function resolverRuta(ruta: string, directorioActual: string): string {
  const nuevaRuta = ruta.startsWith('/')
    ? ruta
    : `${directorioActual}/${ruta}`.replace(/\/+/g, '/');

  const partes = nuevaRuta.split('/').filter(Boolean);
  const partesResueltas: string[] = [];
  for (const parte of partes) {
    if (parte === '..') {
      partesResueltas.pop();
    } else if (parte !== '.') {
      partesResueltas.push(parte);
    }
  }
  return '/' + partesResueltas.join('/');
}

export interface ComandosBasicosConfig {
  directorioActual: string;
  setDirectorioActual: (dir: string) => void;
  setLineas: React.Dispatch<React.SetStateAction<{ tipo: string; contenido: string }[]>>;
  historialComandos: string[];
  navegarFn: (ruta: string) => FileSystemNode | null;
}

/**
 * Crea los comandos básicos de la terminal
 */
export function crearComandosBasicos(
  config: ComandosBasicosConfig,
): Record<string, (args: string[]) => string> {
  const { directorioActual, setDirectorioActual, setLineas, historialComandos, navegarFn } = config;

  return {
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
      const nodo = navegarFn(ruta);
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
      const nodo = navegarFn(args[0]);
      if (!nodo) return `cd: ${args[0]}: No existe el directorio`;
      if (nodo.tipo !== 'directorio') return `cd: ${args[0]}: No es un directorio`;

      const nuevaRuta = resolverRuta(args[0], directorioActual);
      setDirectorioActual(nuevaRuta);
      return '';
    },
    cat: (args) => {
      if (!args[0]) return 'cat: falta el operando archivo';
      const nodo = navegarFn(args[0]);
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
}
