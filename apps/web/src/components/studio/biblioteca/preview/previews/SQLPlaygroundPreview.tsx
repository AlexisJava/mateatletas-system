'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Database,
  Table,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Tipos para la base de datos simulada
 */
interface TableSchema {
  nombre: string;
  columnas: {
    nombre: string;
    tipo: 'INTEGER' | 'TEXT' | 'REAL' | 'DATE' | 'BOOLEAN';
    primaryKey?: boolean;
    nullable?: boolean;
  }[];
  datos: Record<string, unknown>[];
}

interface QueryResult {
  columnas: string[];
  filas: unknown[][];
  tiempoMs: number;
  filasAfectadas?: number;
}

interface SQLPlaygroundExampleData {
  instruccion: string;
  tablas: TableSchema[];
  consultaInicial?: string;
  consultaEsperada?: string;
  pistas?: string[];
  mostrarEsquema?: boolean;
  permitirDDL?: boolean;
  altura?: number;
}

/**
 * Motor SQL simplificado para consultas básicas
 */
function ejecutarSQL(
  sql: string,
  tablas: TableSchema[],
): { resultado?: QueryResult; error?: string } {
  const sqlNormalizado = sql.trim().toUpperCase();
  const sqlOriginal = sql.trim();

  try {
    // SELECT básico
    if (sqlNormalizado.startsWith('SELECT')) {
      return ejecutarSelect(sqlOriginal, tablas);
    }

    // INSERT
    if (sqlNormalizado.startsWith('INSERT')) {
      return { error: 'INSERT no está habilitado en este playground' };
    }

    // UPDATE
    if (sqlNormalizado.startsWith('UPDATE')) {
      return { error: 'UPDATE no está habilitado en este playground' };
    }

    // DELETE
    if (sqlNormalizado.startsWith('DELETE')) {
      return { error: 'DELETE no está habilitado en este playground' };
    }

    return { error: 'Consulta no reconocida. Solo SELECT está habilitado.' };
  } catch (e) {
    return { error: `Error de sintaxis: ${(e as Error).message}` };
  }
}

function ejecutarSelect(
  sql: string,
  tablas: TableSchema[],
): { resultado?: QueryResult; error?: string } {
  const inicio = performance.now();

  // Parser muy simplificado para SELECT
  const matchFrom = sql.match(/FROM\s+(\w+)/i);
  if (!matchFrom || !matchFrom[1]) {
    return { error: 'Falta la cláusula FROM' };
  }

  const nombreTabla = matchFrom[1].toLowerCase();
  const tabla = tablas.find((t) => t.nombre.toLowerCase() === nombreTabla);

  if (!tabla) {
    return { error: `Tabla "${nombreTabla}" no encontrada` };
  }

  // Extraer columnas seleccionadas
  const matchSelect = sql.match(/SELECT\s+(.+?)\s+FROM/i);
  if (!matchSelect || !matchSelect[1]) {
    return { error: 'Error en la cláusula SELECT' };
  }

  const columnasStr = matchSelect[1].trim();
  let columnasSeleccionadas: string[];

  if (columnasStr === '*') {
    columnasSeleccionadas = tabla.columnas.map((c) => c.nombre);
  } else {
    columnasSeleccionadas = columnasStr.split(',').map((c) => c.trim());
  }

  // Verificar que las columnas existen
  const columnasTabla = tabla.columnas.map((c) => c.nombre.toLowerCase());
  for (const col of columnasSeleccionadas) {
    if (!columnasTabla.includes(col.toLowerCase()) && col !== '*') {
      return { error: `Columna "${col}" no existe en la tabla "${tabla.nombre}"` };
    }
  }

  // Filtrar datos (WHERE básico)
  let datosFiltrados = [...tabla.datos];
  const matchWhere = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/i);

  if (matchWhere && matchWhere[1]) {
    const condicion = matchWhere[1].trim();
    datosFiltrados = filtrarPorCondicion(datosFiltrados, condicion);
  }

  // ORDER BY básico
  const matchOrder = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (matchOrder && matchOrder[1]) {
    const columnaOrden = matchOrder[1];
    const direccion = matchOrder[2]?.toUpperCase() === 'DESC' ? -1 : 1;
    datosFiltrados.sort((a, b) => {
      const valA = a[columnaOrden];
      const valB = b[columnaOrden];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      return valA < valB ? -direccion : direccion;
    });
  }

  // LIMIT básico
  const matchLimit = sql.match(/LIMIT\s+(\d+)/i);
  if (matchLimit && matchLimit[1]) {
    const limite = parseInt(matchLimit[1], 10);
    datosFiltrados = datosFiltrados.slice(0, limite);
  }

  // Construir resultado
  const filas = datosFiltrados.map((fila) => columnasSeleccionadas.map((col) => fila[col] ?? null));

  const fin = performance.now();

  return {
    resultado: {
      columnas: columnasSeleccionadas,
      filas,
      tiempoMs: Math.round((fin - inicio) * 100) / 100,
    },
  };
}

function filtrarPorCondicion(
  datos: Record<string, unknown>[],
  condicion: string,
): Record<string, unknown>[] {
  // Parser muy básico de condiciones
  // Soporta: columna = valor, columna > valor, columna < valor, columna LIKE '%valor%'

  const matchIgual = condicion.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/i);
  if (matchIgual) {
    const columna = matchIgual[1] ?? '';
    const valor = matchIgual[2] ?? '';
    if (columna && valor) {
      return datos.filter((fila) => {
        const valFila = fila[columna];
        if (typeof valFila === 'number') {
          return valFila === parseFloat(valor);
        }
        return String(valFila).toLowerCase() === valor.toLowerCase();
      });
    }
  }

  const matchMayor = condicion.match(/(\w+)\s*>\s*(\d+(?:\.\d+)?)/i);
  if (matchMayor) {
    const columna = matchMayor[1] ?? '';
    const valor = matchMayor[2] ?? '';
    if (columna && valor) {
      return datos.filter((fila) => {
        const valFila = fila[columna];
        return typeof valFila === 'number' && valFila > parseFloat(valor);
      });
    }
  }

  const matchMenor = condicion.match(/(\w+)\s*<\s*(\d+(?:\.\d+)?)/i);
  if (matchMenor) {
    const columna = matchMenor[1] ?? '';
    const valor = matchMenor[2] ?? '';
    if (columna && valor) {
      return datos.filter((fila) => {
        const valFila = fila[columna];
        return typeof valFila === 'number' && valFila < parseFloat(valor);
      });
    }
  }

  const matchLike = condicion.match(/(\w+)\s+LIKE\s+['"]%?([^%'"]+)%?['"]/i);
  if (matchLike) {
    const columna = matchLike[1] ?? '';
    const patron = matchLike[2] ?? '';
    if (columna && patron) {
      return datos.filter((fila) => {
        const valFila = fila[columna];
        return String(valFila).toLowerCase().includes(patron.toLowerCase());
      });
    }
  }

  return datos;
}

/**
 * Preview interactivo del componente SQLPlayground
 */
function SQLPlaygroundPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as SQLPlaygroundExampleData;

  const [consulta, setConsulta] = useState(data.consultaInicial ?? '');
  const [resultado, setResultado] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificado, setVerificado] = useState<boolean | null>(null);
  const [mostrarEsquema, setMostrarEsquema] = useState(data.mostrarEsquema !== false);
  const [pistaActual, setPistaActual] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);

  const ejecutar = useCallback(() => {
    if (!consulta.trim()) {
      setError('Escribe una consulta SQL');
      setResultado(null);
      setVerificado(null);
      return;
    }

    const { resultado: res, error: err } = ejecutarSQL(consulta, data.tablas);

    if (err) {
      setError(err);
      setResultado(null);
      setVerificado(null);
    } else if (res) {
      setError(null);
      setResultado(res);

      // Verificar si coincide con la consulta esperada
      if (data.consultaEsperada) {
        const { resultado: resEsperado } = ejecutarSQL(data.consultaEsperada, data.tablas);
        if (resEsperado) {
          const coincide =
            JSON.stringify(res.columnas) === JSON.stringify(resEsperado.columnas) &&
            JSON.stringify(res.filas) === JSON.stringify(resEsperado.filas);
          setVerificado(coincide);
        }
      }
    }
  }, [consulta, data.tablas, data.consultaEsperada]);

  const reiniciar = useCallback(() => {
    setConsulta(data.consultaInicial ?? '');
    setResultado(null);
    setError(null);
    setVerificado(null);
    setMostrarPista(false);
    setPistaActual(0);
  }, [data.consultaInicial]);

  const siguientePista = useCallback(() => {
    if (data.pistas && pistaActual < data.pistas.length - 1) {
      setPistaActual((p) => p + 1);
    }
  }, [data.pistas, pistaActual]);

  // Estadísticas de la base de datos
  const stats = useMemo(() => {
    const totalFilas = data.tablas.reduce((acc, t) => acc + t.datos.length, 0);
    const totalColumnas = data.tablas.reduce((acc, t) => acc + t.columnas.length, 0);
    return { tablas: data.tablas.length, filas: totalFilas, columnas: totalColumnas };
  }, [data.tablas]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            {stats.tablas} {stats.tablas === 1 ? 'tabla' : 'tablas'}
          </span>
          <span className="flex items-center gap-1">
            <Table className="w-3.5 h-3.5" />
            {stats.filas} filas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Panel izquierdo: Esquema */}
        <div className="col-span-1">
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setMostrarEsquema(!mostrarEsquema)}
              className="w-full bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Esquema
              </span>
              {mostrarEsquema ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {mostrarEsquema && (
              <div className="bg-slate-800/50 p-3 max-h-80 overflow-y-auto">
                {data.tablas.map((tabla) => (
                  <div key={tabla.nombre} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Table className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">{tabla.nombre}</span>
                      <span className="text-xs text-slate-500">({tabla.datos.length} filas)</span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {tabla.columnas.map((col) => (
                        <div key={col.nombre} className="flex items-center gap-2 text-xs">
                          <span className={col.primaryKey ? 'text-yellow-400' : 'text-slate-300'}>
                            {col.nombre}
                          </span>
                          <span className="text-slate-500">{col.tipo}</span>
                          {col.primaryKey && (
                            <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px]">
                              PK
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel central y derecho: Editor y Resultados */}
        <div className="col-span-2 space-y-4">
          {/* Editor SQL */}
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Consulta SQL</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reiniciar}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={ejecutar}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Ejecutar
                </button>
              </div>
            </div>
            <Editor
              height={data.altura ?? 120}
              language="sql"
              value={consulta}
              onChange={(value) => setConsulta(value ?? '')}
              theme="vs-dark"
              options={{
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

          {/* Resultados */}
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Resultados</span>
              {resultado && (
                <span className="text-xs text-slate-500">
                  {resultado.filas.length} filas • {resultado.tiempoMs}ms
                </span>
              )}
            </div>

            <div className="bg-slate-800/50 min-h-[150px] max-h-[250px] overflow-auto">
              {error && (
                <div className="p-4 flex items-start gap-3 text-red-400">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                </div>
              )}

              {resultado && resultado.filas.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 sticky top-0">
                    <tr>
                      {resultado.columnas.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left text-slate-300 font-medium border-b border-slate-700"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.filas.map((fila, i) => (
                      <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        {fila.map((valor, j) => (
                          <td key={j} className="px-4 py-2 text-slate-400">
                            {valor === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : (
                              String(valor)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {resultado && resultado.filas.length === 0 && (
                <div className="p-4 text-center text-slate-500">
                  La consulta no devolvió resultados
                </div>
              )}

              {!resultado && !error && (
                <div className="p-4 text-center text-slate-500">
                  Escribe una consulta SQL y presiona Ejecutar
                </div>
              )}
            </div>
          </div>

          {/* Verificación */}
          {verificado !== null && (
            <div
              className={`
              p-3 rounded-lg flex items-center gap-3
              ${verificado ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}
            `}
            >
              {verificado ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    ¡Correcto! Tu consulta devuelve el resultado esperado.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">
                    El resultado no coincide con el esperado. ¡Sigue intentando!
                  </span>
                </>
              )}
            </div>
          )}

          {/* Pistas */}
          {data.pistas && data.pistas.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMostrarPista(!mostrarPista)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4" />
                {mostrarPista ? 'Ocultar pista' : '¿Necesitas una pista?'}
              </button>

              {mostrarPista && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">{data.pistas[pistaActual]}</p>
                  {pistaActual < data.pistas.length - 1 && (
                    <button
                      type="button"
                      onClick={siguientePista}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Siguiente pista ({pistaActual + 1}/{data.pistas.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Documentación de props para SQLPlayground
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'tablas',
    type: 'array',
    description: 'Definición de tablas con esquema y datos',
    required: true,
  },
  {
    name: 'consultaInicial',
    type: 'string',
    description: 'Consulta SQL inicial en el editor',
    required: false,
  },
  {
    name: 'consultaEsperada',
    type: 'string',
    description: 'Consulta correcta para verificación',
    required: false,
  },
  {
    name: 'pistas',
    type: 'array',
    description: 'Lista de pistas progresivas',
    required: false,
  },
  {
    name: 'mostrarEsquema',
    type: 'boolean',
    description: 'Si se muestra el esquema de tablas',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirDDL',
    type: 'boolean',
    description: 'Si se permiten comandos DDL (CREATE, ALTER, DROP)',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'altura',
    type: 'number',
    description: 'Altura del editor SQL en píxeles',
    required: false,
    defaultValue: '120',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: SQLPlaygroundExampleData = {
  instruccion: 'Escribe una consulta para obtener los productos con precio mayor a 50',
  tablas: [
    {
      nombre: 'productos',
      columnas: [
        { nombre: 'id', tipo: 'INTEGER', primaryKey: true },
        { nombre: 'nombre', tipo: 'TEXT' },
        { nombre: 'precio', tipo: 'REAL' },
        { nombre: 'categoria', tipo: 'TEXT' },
      ],
      datos: [
        { id: 1, nombre: 'Laptop', precio: 899.99, categoria: 'Electrónica' },
        { id: 2, nombre: 'Mouse', precio: 29.99, categoria: 'Electrónica' },
        { id: 3, nombre: 'Teclado', precio: 79.99, categoria: 'Electrónica' },
        { id: 4, nombre: 'Monitor', precio: 299.99, categoria: 'Electrónica' },
        { id: 5, nombre: 'Silla', precio: 149.99, categoria: 'Muebles' },
        { id: 6, nombre: 'Escritorio', precio: 249.99, categoria: 'Muebles' },
        { id: 7, nombre: 'Lámpara', precio: 39.99, categoria: 'Decoración' },
        { id: 8, nombre: 'Audífonos', precio: 59.99, categoria: 'Electrónica' },
      ],
    },
  ],
  consultaInicial: 'SELECT * FROM productos',
  consultaEsperada: 'SELECT * FROM productos WHERE precio > 50',
  pistas: [
    'Usa la cláusula WHERE para filtrar los resultados',
    'La condición debe comparar la columna "precio" con el valor 50',
    'La sintaxis es: WHERE columna > valor',
  ],
  mostrarEsquema: true,
  altura: 100,
};

/**
 * Definición del preview para el registry
 */
export const SQLPlaygroundPreview: PreviewDefinition = {
  component: SQLPlaygroundPreviewComponent,
  exampleData,
  propsDocumentation,
};
