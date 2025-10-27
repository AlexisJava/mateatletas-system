import type { CreateDocenteData } from '@/lib/api/docentes.api';

export type CreateDocenteFormSubmitHandler = (
  _data: CreateDocenteData,
  _sectores: string[],
) => Promise<void>;
