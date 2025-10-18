/**
 * Types para el sistema de Sectores y Rutas de Especialidad
 */

export interface Sector {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
  rutas?: RutaEspecialidad[];
  _count?: {
    rutas: number;
    docentes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RutaEspecialidad {
  id: string;
  nombre: string;
  descripcion?: string;
  sectorId: string;
  sector?: Sector;
  activo: boolean;
  docentes?: DocenteRuta[];
  _count?: {
    docentes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocenteRuta {
  id: string;
  docenteId: string;
  rutaId: string;
  sectorId: string;
  ruta?: RutaEspecialidad;
  sector?: Sector;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  asignadoEn: string;
}

// DTOs para crear/actualizar

export interface CreateSectorDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activo?: boolean;
}

export interface UpdateSectorDto {
  nombre?: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activo?: boolean;
}

export interface CreateRutaEspecialidadDto {
  nombre: string;
  descripcion?: string;
  sectorId: string;
  activo?: boolean;
}

export interface UpdateRutaEspecialidadDto {
  nombre?: string;
  descripcion?: string;
  sectorId?: string;
  activo?: boolean;
}

export interface AsignarRutasDocenteDto {
  rutaIds: string[];
}
