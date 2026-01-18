'use client';

interface FechaNacimientoInputProps {
  readonly value: string;
  readonly onChange: (fecha: string) => void;
}

/** Opciones de meses en español */
const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
] as const;

/** Genera array de días (1-31) */
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

/** Genera array de años válidos (estudiantes de 5-22 años atrás) */
function generarAnios(): number[] {
  const anioActual = new Date().getFullYear();
  return Array.from({ length: 18 }, (_, i) => anioActual - 5 - i);
}

/**
 * Parsea un valor ISO (YYYY-MM-DD) a componentes de fecha
 */
function parseValue(val: string): { dia: string; mes: string; anio: string } {
  if (!val) return { dia: '', mes: '', anio: '' };
  const [y, m, d] = val.split('-');
  return {
    dia: d ? String(parseInt(d, 10)) : '',
    mes: m ? String(parseInt(m, 10)) : '',
    anio: y || '',
  };
}

/**
 * Construye un valor ISO desde componentes de fecha
 */
function buildValue(dia: string, mes: string, anio: string): string {
  const d = dia ? dia.padStart(2, '0') : '00';
  const m = mes ? mes.padStart(2, '0') : '00';
  const y = anio || '0000';
  return `${y}-${m}-${d}`;
}

const SELECT_CLASS =
  'px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 appearance-none cursor-pointer';

/**
 * Input de fecha con formato DD/MM/AAAA usando selects nativos
 *
 * Permite ingresar día, mes y año en cualquier orden.
 * Ideal para móviles donde el date picker nativo no funciona bien.
 */
export function FechaNacimientoInput({
  value,
  onChange,
}: FechaNacimientoInputProps): React.ReactElement {
  const { dia, mes, anio } = parseValue(value);
  const anios = generarAnios();

  const handleDiaChange = (newDia: string) => {
    onChange(buildValue(newDia, mes, anio));
  };

  const handleMesChange = (newMes: string) => {
    onChange(buildValue(dia, newMes, anio));
  };

  const handleAnioChange = (newAnio: string) => {
    onChange(buildValue(dia, mes, newAnio));
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <select
        value={dia}
        onChange={(e) => handleDiaChange(e.target.value)}
        className={SELECT_CLASS}
        aria-label="Día de nacimiento"
      >
        <option value="" className="bg-slate-900">
          Día
        </option>
        {DIAS.map((d) => (
          <option key={d} value={d.toString()} className="bg-slate-900">
            {d}
          </option>
        ))}
      </select>

      <select
        value={mes}
        onChange={(e) => handleMesChange(e.target.value)}
        className={SELECT_CLASS}
        aria-label="Mes de nacimiento"
      >
        <option value="" className="bg-slate-900">
          Mes
        </option>
        {MESES.map((m) => (
          <option key={m.value} value={m.value} className="bg-slate-900">
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={anio}
        onChange={(e) => handleAnioChange(e.target.value)}
        className={SELECT_CLASS}
        aria-label="Año de nacimiento"
      >
        <option value="" className="bg-slate-900">
          Año
        </option>
        {anios.map((a) => (
          <option key={a} value={a.toString()} className="bg-slate-900">
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
