/**
 * Motor SQL simplificado para el SQLPlayground
 * Soporta: SELECT con WHERE, ORDER BY, LIMIT
 */

export interface TableSchema {
  nombre: string;
  columnas: {
    nombre: string;
    tipo: 'INTEGER' | 'TEXT' | 'REAL' | 'DATE' | 'BOOLEAN';
    primaryKey?: boolean;
    nullable?: boolean;
  }[];
  datos: Record<string, unknown>[];
}

export interface QueryResult {
  columnas: string[];
  filas: unknown[][];
  tiempoMs: number;
  filasAfectadas?: number;
}

export interface SQLExecutionResult {
  resultado?: QueryResult;
  error?: string;
}

/**
 * Filtra datos por condición WHERE
 */
function filtrarPorCondicion(
  datos: Record<string, unknown>[],
  condicion: string,
): Record<string, unknown>[] {
  // Igualdad: columna = valor
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

  // Mayor que: columna > valor
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

  // Menor que: columna < valor
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

  // LIKE: columna LIKE '%valor%'
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
 * Ejecuta un SELECT básico
 */
function ejecutarSelect(sql: string, tablas: TableSchema[]): SQLExecutionResult {
  const inicio = performance.now();

  // FROM
  const matchFrom = sql.match(/FROM\s+(\w+)/i);
  if (!matchFrom?.[1]) {
    return { error: 'Falta la cláusula FROM' };
  }

  const nombreTabla = matchFrom[1].toLowerCase();
  const tabla = tablas.find((t) => t.nombre.toLowerCase() === nombreTabla);
  if (!tabla) {
    return { error: `Tabla "${nombreTabla}" no encontrada` };
  }

  // SELECT columns
  const matchSelect = sql.match(/SELECT\s+(.+?)\s+FROM/i);
  if (!matchSelect?.[1]) {
    return { error: 'Error en la cláusula SELECT' };
  }

  const columnasStr = matchSelect[1].trim();
  const columnasSeleccionadas =
    columnasStr === '*'
      ? tabla.columnas.map((c) => c.nombre)
      : columnasStr.split(',').map((c) => c.trim());

  // Validar columnas
  const columnasTabla = tabla.columnas.map((c) => c.nombre.toLowerCase());
  for (const col of columnasSeleccionadas) {
    if (!columnasTabla.includes(col.toLowerCase()) && col !== '*') {
      return { error: `Columna "${col}" no existe en la tabla "${tabla.nombre}"` };
    }
  }

  // WHERE
  let datosFiltrados = [...tabla.datos];
  const matchWhere = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/i);
  if (matchWhere?.[1]) {
    datosFiltrados = filtrarPorCondicion(datosFiltrados, matchWhere[1].trim());
  }

  // ORDER BY
  const matchOrder = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (matchOrder?.[1]) {
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

  // LIMIT
  const matchLimit = sql.match(/LIMIT\s+(\d+)/i);
  if (matchLimit?.[1]) {
    datosFiltrados = datosFiltrados.slice(0, parseInt(matchLimit[1], 10));
  }

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

/**
 * Ejecuta una consulta SQL sobre las tablas proporcionadas
 */
export function ejecutarSQL(sql: string, tablas: TableSchema[]): SQLExecutionResult {
  const sqlNormalizado = sql.trim().toUpperCase();

  try {
    if (sqlNormalizado.startsWith('SELECT')) {
      return ejecutarSelect(sql.trim(), tablas);
    }
    if (sqlNormalizado.startsWith('INSERT')) {
      return { error: 'INSERT no está habilitado en este playground' };
    }
    if (sqlNormalizado.startsWith('UPDATE')) {
      return { error: 'UPDATE no está habilitado en este playground' };
    }
    if (sqlNormalizado.startsWith('DELETE')) {
      return { error: 'DELETE no está habilitado en este playground' };
    }
    return { error: 'Consulta no reconocida. Solo SELECT está habilitado.' };
  } catch (e) {
    return { error: `Error de sintaxis: ${(e as Error).message}` };
  }
}

/**
 * Compara dos resultados de consulta
 */
export function compararResultados(a: QueryResult, b: QueryResult): boolean {
  return (
    JSON.stringify(a.columnas) === JSON.stringify(b.columnas) &&
    JSON.stringify(a.filas) === JSON.stringify(b.filas)
  );
}
