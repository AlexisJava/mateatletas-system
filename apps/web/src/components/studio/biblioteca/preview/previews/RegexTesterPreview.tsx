'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Info,
  Flag,
  Copy,
  CheckCheck,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para RegexTester
 */
interface RegexMatch {
  texto: string;
  inicio: number;
  fin: number;
  grupos?: string[];
}

interface RegexTesterExampleData {
  instruccion: string;
  patronInicial?: string;
  textosPrueba: string[];
  patronEsperado?: string;
  flags?: string;
  mostrarFlags?: boolean;
  mostrarGrupos?: boolean;
  explicacion?: string;
  pistas?: string[];
}

/**
 * Componente para visualizar matches con resaltado
 */
function TextoConMatches({
  texto,
  matches,
}: {
  texto: string;
  matches: RegexMatch[];
}): ReactElement {
  if (matches.length === 0) {
    return <span className="text-slate-400">{texto}</span>;
  }

  const elementos: ReactElement[] = [];
  let ultimoIndice = 0;

  matches.forEach((match, i) => {
    // Texto antes del match
    if (match.inicio > ultimoIndice) {
      elementos.push(
        <span key={`pre-${i}`} className="text-slate-400">
          {texto.slice(ultimoIndice, match.inicio)}
        </span>,
      );
    }

    // El match resaltado
    elementos.push(
      <span
        key={`match-${i}`}
        className="bg-green-500/30 text-green-300 px-0.5 rounded border-b-2 border-green-500"
        title={`Match ${i + 1}: "${match.texto}"`}
      >
        {match.texto}
      </span>,
    );

    ultimoIndice = match.fin;
  });

  // Texto después del último match
  if (ultimoIndice < texto.length) {
    elementos.push(
      <span key="post" className="text-slate-400">
        {texto.slice(ultimoIndice)}
      </span>,
    );
  }

  return <>{elementos}</>;
}

/**
 * Preview interactivo del componente RegexTester
 */
function RegexTesterPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as RegexTesterExampleData;

  const [patron, setPatron] = useState(data.patronInicial ?? '');
  const [flags, setFlags] = useState(data.flags ?? 'g');
  const [textoPersonalizado, setTextoPersonalizado] = useState('');
  const [copied, setCopied] = useState(false);
  const [verificado, setVerificado] = useState<boolean | null>(null);
  const [pistaActual, setPistaActual] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);

  // Flags disponibles
  const flagsDisponibles = [
    { valor: 'g', nombre: 'Global', descripcion: 'Encuentra todas las coincidencias' },
    { valor: 'i', nombre: 'Insensible', descripcion: 'Ignora mayúsculas/minúsculas' },
    { valor: 'm', nombre: 'Multilínea', descripcion: '^ y $ coinciden con líneas' },
    { valor: 's', nombre: 'DotAll', descripcion: '. coincide con saltos de línea' },
  ];

  // Ejecutar regex y obtener matches
  const resultados = useMemo(() => {
    if (!patron) return { matches: new Map<string, RegexMatch[]>(), error: null };

    try {
      const regex = new RegExp(patron, flags);
      const matches = new Map<string, RegexMatch[]>();

      const textos = textoPersonalizado
        ? [...data.textosPrueba, textoPersonalizado]
        : data.textosPrueba;

      textos.forEach((texto) => {
        const textMatches: RegexMatch[] = [];
        let match;

        if (flags.includes('g')) {
          while ((match = regex.exec(texto)) !== null) {
            textMatches.push({
              texto: match[0],
              inicio: match.index,
              fin: match.index + match[0].length,
              grupos: match.slice(1),
            });
            // Evitar loop infinito con patrones que coinciden string vacío
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
        } else {
          match = regex.exec(texto);
          if (match) {
            textMatches.push({
              texto: match[0],
              inicio: match.index,
              fin: match.index + match[0].length,
              grupos: match.slice(1),
            });
          }
        }

        matches.set(texto, textMatches);
      });

      return { matches, error: null };
    } catch (e) {
      return { matches: new Map<string, RegexMatch[]>(), error: (e as Error).message };
    }
  }, [patron, flags, data.textosPrueba, textoPersonalizado]);

  // Estadísticas
  const stats = useMemo(() => {
    let totalMatches = 0;
    let textosConMatch = 0;

    resultados.matches.forEach((matches) => {
      totalMatches += matches.length;
      if (matches.length > 0) textosConMatch++;
    });

    return { totalMatches, textosConMatch, totalTextos: resultados.matches.size };
  }, [resultados.matches]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(`/${patron}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [patron, flags]);

  const handleVerificar = useCallback(() => {
    if (!data.patronEsperado) return;

    try {
      const regexUsuario = new RegExp(patron, flags);
      const regexEsperado = new RegExp(data.patronEsperado, flags);

      // Verificar que coinciden en todos los textos de prueba
      const coincide = data.textosPrueba.every((texto) => {
        const matchesUsuario = texto.match(regexUsuario) ?? [];
        const matchesEsperado = texto.match(regexEsperado) ?? [];
        return JSON.stringify(matchesUsuario) === JSON.stringify(matchesEsperado);
      });

      setVerificado(coincide);
    } catch {
      setVerificado(false);
    }
  }, [patron, flags, data.patronEsperado, data.textosPrueba]);

  const handleReiniciar = useCallback(() => {
    setPatron(data.patronInicial ?? '');
    setFlags(data.flags ?? 'g');
    setTextoPersonalizado('');
    setVerificado(null);
    setMostrarPista(false);
    setPistaActual(0);
  }, [data.patronInicial, data.flags]);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Editor de patrón */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
              /
            </div>
            <input
              type="text"
              value={patron}
              onChange={(e) => setPatron(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-6 pr-12 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu expresión regular..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
              /{flags}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title="Copiar regex"
          >
            {copied ? (
              <CheckCheck className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReiniciar}
            className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Error de sintaxis */}
        {resultados.error && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{resultados.error}</span>
          </div>
        )}
      </div>

      {/* Flags */}
      {data.mostrarFlags !== false && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Modificadores</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {flagsDisponibles.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => toggleFlag(f.valor)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    flags.includes(f.valor)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }
                `}
                title={f.descripcion}
              >
                {f.nombre} ({f.valor})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400">
            <span className="text-white font-medium">{stats.totalMatches}</span> coincidencias
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-slate-400">
            <span className="text-white font-medium">{stats.textosConMatch}</span>/
            {stats.totalTextos} textos
          </span>
        </div>
      </div>

      {/* Textos de prueba con matches */}
      <div className="space-y-3 mb-4">
        {data.textosPrueba.map((texto, i) => {
          const matches = resultados.matches.get(texto) ?? [];
          return (
            <div key={i} className="rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500">Texto {i + 1}</span>
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded
                  ${matches.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}
                `}
                >
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div className="p-4 bg-slate-800/50 font-mono text-sm whitespace-pre-wrap break-all">
                <TextoConMatches texto={texto} matches={matches} />
              </div>

              {/* Grupos capturados */}
              {data.mostrarGrupos && matches.some((m) => m.grupos && m.grupos.length > 0) && (
                <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">Grupos capturados:</span>
                  <div className="flex flex-wrap gap-2">
                    {matches.map(
                      (m, mi) =>
                        m.grupos &&
                        m.grupos.map((grupo, gi) => (
                          <span
                            key={`${mi}-${gi}`}
                            className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-mono"
                          >
                            ${gi + 1}: {grupo}
                          </span>
                        )),
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Campo para texto personalizado */}
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
            <span className="text-xs text-slate-500">Prueba tu propio texto</span>
          </div>
          <textarea
            value={textoPersonalizado}
            onChange={(e) => setTextoPersonalizado(e.target.value)}
            placeholder="Escribe aquí para probar tu regex..."
            className="w-full bg-slate-800/50 p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none min-h-[80px]"
          />
          {textoPersonalizado && (
            <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700 font-mono text-sm">
              <TextoConMatches
                texto={textoPersonalizado}
                matches={resultados.matches.get(textoPersonalizado) ?? []}
              />
            </div>
          )}
        </div>
      </div>

      {/* Verificación */}
      {data.patronEsperado && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleVerificar}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Verificar solución
          </button>

          {verificado !== null && (
            <div
              className={`
              mt-3 p-3 rounded-lg flex items-center gap-3
              ${verificado ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}
            `}
            >
              {verificado ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    ¡Correcto! Tu regex coincide con el patrón esperado.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">
                    Tu regex no produce los mismos resultados. ¡Sigue intentando!
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pistas */}
      {data.pistas && data.pistas.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setMostrarPista(!mostrarPista)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {mostrarPista ? 'Ocultar pista' : '¿Necesitas una pista?'}
          </button>

          {mostrarPista && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-300">{data.pistas[pistaActual]}</p>
              {pistaActual < data.pistas.length - 1 && (
                <button
                  type="button"
                  onClick={() => setPistaActual((p) => p + 1)}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300"
                >
                  Siguiente pista ({pistaActual + 1}/{data.pistas.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explicación */}
      {data.explicacion && (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Referencia rápida</h4>
              <p className="text-sm text-slate-400 whitespace-pre-line">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para RegexTester
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'patronInicial',
    type: 'string',
    description: 'Patrón regex inicial en el editor',
    required: false,
  },
  {
    name: 'textosPrueba',
    type: 'array',
    description: 'Lista de textos para probar el regex',
    required: true,
  },
  {
    name: 'patronEsperado',
    type: 'string',
    description: 'Patrón correcto para verificación',
    required: false,
  },
  {
    name: 'flags',
    type: 'string',
    description: 'Modificadores iniciales del regex (g, i, m, s)',
    required: false,
    defaultValue: 'g',
  },
  {
    name: 'mostrarFlags',
    type: 'boolean',
    description: 'Si se muestran los botones de modificadores',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarGrupos',
    type: 'boolean',
    description: 'Si se muestran los grupos capturados',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Texto de ayuda o referencia',
    required: false,
  },
  {
    name: 'pistas',
    type: 'array',
    description: 'Lista de pistas progresivas',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: RegexTesterExampleData = {
  instruccion: 'Crea un regex que encuentre todos los correos electrónicos en el texto',
  patronInicial: '',
  textosPrueba: [
    'Contacta a juan@ejemplo.com para más información',
    'Los correos maria.garcia@empresa.org y soporte@tienda.co están disponibles',
    'Este texto no tiene correos válidos: @invalido o nombre@',
    'Múltiples: a@b.co, test123@dominio.com.mx',
  ],
  patronEsperado: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
  flags: 'g',
  mostrarFlags: true,
  mostrarGrupos: true,
  pistas: [
    'Un correo tiene la estructura: usuario@dominio.extension',
    'El usuario puede contener letras, números, puntos y guiones',
    'Después del @ viene el dominio seguido de un punto y la extensión',
    'Usa \\w+ para letras y números, o [a-zA-Z0-9]+ para ser más específico',
  ],
  explicacion: `Metacaracteres comunes:
. → cualquier carácter
\\d → dígito (0-9)
\\w → letra, número o _
\\s → espacio en blanco
+ → uno o más
* → cero o más
? → cero o uno
{n,m} → entre n y m veces
[abc] → cualquiera de a, b, c
[^abc] → ninguno de a, b, c`,
};

/**
 * Definición del preview para el registry
 */
export const RegexTesterPreview: PreviewDefinition = {
  component: RegexTesterPreviewComponent,
  exampleData,
  propsDocumentation,
};
