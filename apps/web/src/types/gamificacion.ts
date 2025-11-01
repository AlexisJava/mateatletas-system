import type { Logro } from '@mateatletas/contracts';
import { logroSchema, logrosListSchema } from '@mateatletas/contracts';

export type { Logro };

export function normalizarLogro(raw: Logro): Logro {
  const validado = logroSchema.parse(raw);

  if (validado.fecha_desbloqueo && typeof validado.fecha_desbloqueo === 'string') {
    return {
      ...validado,
      fecha_desbloqueo: new Date(validado.fecha_desbloqueo)
    };
  }

  return validado;
}

export function normalizarLogros(raw: Logro[]): Logro[] {
  const validados = logrosListSchema.parse(raw);
  return validados.map(normalizarLogro);
}
