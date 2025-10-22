import { useState, useCallback, useEffect } from 'react';
import { useAdminStore } from '@/store/admin.store';
import * as adminApi from '@/lib/api/admin.api';
import type { ClaseListado } from '@/types/admin-clases.types';
import type { RutaEspecialidadFromSchema } from '@/lib/schemas/ruta.schema';
import type { DocenteFromSchema } from '@/lib/schemas/docente.schema';
import type { SectorFromSchema } from '@/lib/schemas/sector.schema';

/**
 * Hook personalizado para gestión de clases
 * Encapsula lógica de estado y operaciones CRUD
 */
export function useClases() {
  const { classes, createClass, cancelClass, fetchClasses, isLoading, error } = useAdminStore();

  const safeClasses: ClaseListado[] = Array.isArray(classes) ? classes : [];

  return {
    clases: safeClasses,
    isLoading,
    error,
    fetchClases: fetchClasses,
    createClase: createClass,
    cancelClase: cancelClass,
  };
}

/**
 * Hook para cargar datos de formulario de clases
 * (Rutas, Docentes, Sectores)
 */
export function useClasesFormData() {
  const [rutas, setRutas] = useState<RutaEspecialidadFromSchema[]>([]);
  const [docentes, setDocentes] = useState<DocenteFromSchema[]>([]);
  const [sectores, setSectores] = useState<SectorFromSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFormData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [rutasResponse, docentesResponse, sectoresResponse] = await Promise.all([
        adminApi.getRutasCurriculares(),
        adminApi.getDocentes(),
        adminApi.getSectores(),
      ]);

      setRutas(rutasResponse);
      setDocentes(docentesResponse);
      setSectores(sectoresResponse);
    } catch (err: unknown) {
      console.error('Error loading form data:', err);
      setError('Error cargando datos del formulario');
      setRutas([]);
      setDocentes([]);
      setSectores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  return {
    rutas,
    docentes,
    sectores,
    isLoading,
    error,
    reload: loadFormData,
  };
}

/**
 * Hook para filtrado de clases
 */
export function useClasesFilter(clases: ClaseListado[]) {
  const [filter, setFilter] = useState<'all' | 'Programada' | 'Cancelada'>('all');

  const filteredClases = filter === 'all'
    ? clases
    : clases.filter((c) => c.estado === filter || c.estado === filter);

  return {
    filter,
    setFilter,
    filteredClases,
  };
}

/**
 * Hook para manejo de formulario de crear clase
 */
export function useClaseForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    docente_id: '',
    sector_id: '',
    fecha_hora_inicio: '',
    duracion_minutos: 90,
    cupo_maximo: 10,
    descripcion: '',
  });

  const updateField = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      docente_id: '',
      sector_id: '',
      fecha_hora_inicio: '',
      duracion_minutos: 90,
      cupo_maximo: 10,
      descripcion: '',
    });
  }, []);

  return {
    formData,
    updateField,
    resetForm,
    setFormData,
  };
}
