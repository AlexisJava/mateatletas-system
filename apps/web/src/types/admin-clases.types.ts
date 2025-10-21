import type { Clase as ClaseContrato } from '@mateatletas/contracts';

export interface ClaseListado extends ClaseContrato {
  docente?: {
    id?: string;
    nombre?: string;
    apellido?: string;
    titulo?: string;
  };
  ruta_curricular?: {
    id?: string;
    nombre?: string;
    color?: string;
  };
  sector?: {
    id: string;
    nombre: string;
  } | null;
  _count?: {
    inscripciones?: number;
  };
  cupo_disponible?: number;
}
