import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDocenteStore } from '@/store/docente.store';
import { toast } from '@/components/ui';
import { Clase, EstadoClase } from '@/types/clases.types';

export type ViewMode = 'card' | 'list';

export interface ClasesAgrupadas {
  hoy: Clase[];
  proximosSieteDias: Clase[];
  futuras: Clase[];
  pasadas: Clase[];
}

export function useMisClases() {
  const router = useRouter();
  const {
    misClases,
    fetchMisClases,
    cancelarClase,
    mostrarClasesPasadas,
    toggleMostrarClasesPasadas,
    isLoading,
    isLoadingAction,
    error,
  } = useDocenteStore();

  const [claseACancelar, setClaseACancelar] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoClase | 'Todas'>('Todas');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  useEffect(() => {
    fetchMisClases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Filtrar clases por estado
   */
  const clasesFiltradas = (misClases || []).filter((clase) => {
    if (filtroEstado === 'Todas') return true;
    return clase.estado === filtroEstado;
  });

  /**
   * Agrupar clases por período de tiempo
   */
  const agruparClasesPorFecha = (clases: Clase[]): ClasesAgrupadas => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const proximosSieteDias = new Date(hoy);
    proximosSieteDias.setDate(proximosSieteDias.getDate() + 7);

    const grupos: ClasesAgrupadas = {
      hoy: [],
      proximosSieteDias: [],
      futuras: [],
      pasadas: [],
    };

    clases.forEach((clase) => {
      const fechaClase = new Date(clase.fecha_hora_inicio);
      const fechaClaseSinHora = new Date(
        fechaClase.getFullYear(),
        fechaClase.getMonth(),
        fechaClase.getDate()
      );

      if (fechaClaseSinHora < hoy) {
        grupos.pasadas.push(clase);
      } else if (fechaClaseSinHora.getTime() === hoy.getTime()) {
        grupos.hoy.push(clase);
      } else if (fechaClaseSinHora < proximosSieteDias) {
        grupos.proximosSieteDias.push(clase);
      } else {
        grupos.futuras.push(clase);
      }
    });

    // Ordenar cada grupo por fecha
    Object.keys(grupos).forEach((key) => {
      grupos[key as keyof typeof grupos].sort(
        (a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime()
      );
    });

    return grupos;
  };

  const clasesAgrupadas = agruparClasesPorFecha(clasesFiltradas);

  /**
   * Manejar cancelación de clase
   */
  const handleCancelar = async (claseId: string) => {
    const success = await cancelarClase(claseId);
    if (success) {
      setClaseACancelar(null);
      toast.success('Clase cancelada exitosamente');
    } else {
      toast.error('Error al cancelar la clase');
    }
  };

  /**
   * Manejar inicio de clase
   */
  const handleIniciarClase = (claseId: string) => {
    toast.success('Iniciando clase...');
    router.push(`/docente/clase/${claseId}/sala`);
  };

  /**
   * Manejar envío de recordatorio
   */
  const handleEnviarRecordatorio = (_claseId: string) => {
    toast.success('Recordatorio enviado a todos los estudiantes');
    // TODO: Implementar envío real de notificaciones
  };

  /**
   * Formatear fecha
   */
  const formatFecha = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  /**
   * Obtener color del estado
   */
  const getEstadoColor = (estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada'): string => {
    switch (estado) {
      case EstadoClase.Programada:
      case 'Programada':
        return 'bg-[#4caf50] text-white';
      case EstadoClase.EnCurso:
      case 'EnCurso':
        return 'bg-[#f7b801] text-[#2a1a5e]';
      case EstadoClase.Finalizada:
      case 'Finalizada':
        return 'bg-gray-400 text-white';
      case EstadoClase.Cancelada:
      case 'Cancelada':
        return 'bg-[#f44336] text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  /**
   * Determinar si se puede cancelar una clase
   */
  const puedeCancelar = (clase: Clase) => {
    return clase.estado === EstadoClase.Programada;
  };

  /**
   * Determinar si se puede registrar asistencia
   */
  const puedeRegistrarAsistencia = (clase: Clase) => {
    return (
      clase.estado === EstadoClase.Programada ||
      clase.estado === EstadoClase.EnCurso ||
      clase.estado === EstadoClase.Finalizada
    );
  };

  return {
    // Estado
    clasesFiltradas,
    clasesAgrupadas,
    claseACancelar,
    filtroEstado,
    viewMode,
    mostrarClasesPasadas,
    isLoading,
    isLoadingAction,
    error,

    // Setters
    setClaseACancelar,
    setFiltroEstado,
    setViewMode,
    toggleMostrarClasesPasadas,

    // Handlers
    handleCancelar,
    handleIniciarClase,
    handleEnviarRecordatorio,

    // Utils
    formatFecha,
    getEstadoColor,
    puedeCancelar,
    puedeRegistrarAsistencia,

    // Router
    router,
  };
}
