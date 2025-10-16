'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocenteStore } from '@/store/docente.store';
import { Breadcrumbs, toast } from '@/components/ui';
import { Clase, EstadoClase } from '@/types/clases.types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  FileText,
  Users,
  Clock,
  Calendar,

  AlertCircle,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,


  Eye,
  Sparkles,
} from 'lucide-react';

/**
 * Mis Clases - Portal Docente v2.0
 *
 * Diseño Premium con:
 * - Agrupación inteligente por fecha
 * - Quick Actions contextuales
 * - Card/List view toggle
 * - Breadcrumbs de navegación
 * - Animaciones fluidas
 * - Información contextual (asistencia, observaciones, materiales)
 */
export default function MisClasesPage() {
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
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  /**
   * Cargar clases al montar el componente
   */
  useEffect(() => {
    fetchMisClases();
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
  const agruparClasesPorFecha = (clases: Clase[]) => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const proximosSieteDias = new Date(hoy);
    proximosSieteDias.setDate(proximosSieteDias.getDate() + 7);

    const grupos: {
      hoy: Clase[];
      proximosSieteDias: Clase[];
      futuras: Clase[];
      pasadas: Clase[];
    } = {
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
    // TODO: Implementar videollamada
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
  const getEstadoColor = (estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada') => {
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Mis Clases' }]} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-indigo-900 dark:text-white">Mis Clases</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-1 font-medium">
            Gestiona y organiza todas tus clases
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 glass-card p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
              viewMode === 'card'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'text-indigo-900 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'text-indigo-900 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </motion.div>

      {/* Filtros y controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtro por estado */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-bold text-indigo-900 dark:text-white">
              Filtrar:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoClase | 'Todas')}
              className="px-4 py-2 bg-white/60 dark:bg-indigo-900/60 border border-purple-200/50 dark:border-purple-700/50 rounded-xl text-sm font-semibold text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Todas">Todas las clases</option>
              <option value={EstadoClase.Programada}>Programadas</option>
              <option value={EstadoClase.EnCurso}>En Curso</option>
              <option value={EstadoClase.Finalizada}>Finalizadas</option>
              <option value={EstadoClase.Cancelada}>Canceladas</option>
            </select>
          </div>

          {/* Toggle clases pasadas */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={mostrarClasesPasadas}
              onChange={toggleMostrarClasesPasadas}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-indigo-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              Mostrar clases pasadas
            </span>
          </label>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 font-semibold">
          <Sparkles className="w-4 h-4" />
          {clasesFiltradas.length} clase(s) encontrada(s)
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-4 border-l-4 border-red-500"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de clases agrupadas */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
          <p className="text-purple-600 dark:text-purple-300 mt-4 font-semibold">
            Cargando clases...
          </p>
        </motion.div>
      ) : clasesFiltradas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-indigo-900 dark:text-white">No hay clases</h3>
          <p className="text-purple-600 dark:text-purple-300 mt-2 font-medium">
            {filtroEstado === 'Todas'
              ? 'No tienes clases programadas'
              : `No tienes clases con estado "${filtroEstado}"`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Grupo: Hoy */}
          {clasesAgrupadas.hoy.length > 0 && (
            <ClaseGroup
              title="Hoy"
              icon="🔥"
              clases={clasesAgrupadas.hoy}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
              router={router}
            />
          )}

          {/* Grupo: Próximos 7 días */}
          {clasesAgrupadas.proximosSieteDias.length > 0 && (
            <ClaseGroup
              title="Próximos 7 días"
              icon="📅"
              clases={clasesAgrupadas.proximosSieteDias}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
              router={router}
            />
          )}

          {/* Grupo: Futuras */}
          {clasesAgrupadas.futuras.length > 0 && (
            <ClaseGroup
              title="Clases Futuras"
              icon="⏰"
              clases={clasesAgrupadas.futuras}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
              router={router}
            />
          )}

          {/* Grupo: Pasadas (solo si está activado) */}
          {mostrarClasesPasadas && clasesAgrupadas.pasadas.length > 0 && (
            <ClaseGroup
              title="Clases Pasadas"
              icon="📚"
              clases={clasesAgrupadas.pasadas}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
              router={router}
            />
          )}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      <AnimatePresence>
        {claseACancelar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setClaseACancelar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full shadow-2xl shadow-purple-900/40"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 dark:text-white">
                    ¿Cancelar clase?
                  </h3>
                  <p className="text-purple-600 dark:text-purple-300 mt-1 text-sm font-medium">
                    Esta acción no se puede deshacer y se notificará a todos los estudiantes
                    inscritos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setClaseACancelar(null)}
                  disabled={isLoadingAction}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-indigo-900 dark:text-white font-semibold hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all disabled:opacity-50"
                >
                  No, mantener
                </button>
                <button
                  onClick={() => handleCancelar(claseACancelar)}
                  disabled={isLoadingAction}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/40 transition-all disabled:opacity-50"
                >
                  {isLoadingAction ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ClaseGroup Component
 * Renderiza un grupo de clases con título
 */
interface ClaseGroupProps {
  title: string;
  icon: string;
  clases: Clase[];
  viewMode: 'card' | 'list';
  onIniciarClase: (id: string) => void;
  onEnviarRecordatorio: (id: string) => void;
  onCancelar: (id: string) => void;
  puedeCancelar: (clase: Clase) => boolean;
  puedeRegistrarAsistencia: (clase: Clase) => boolean;
  getEstadoColor: (estado: EstadoClase) => string;
  formatFecha: (isoDate: string) => string;
  router: ReturnType<typeof useRouter>;
}

function ClaseGroup({
  title,
  icon,
  clases,
  viewMode,
  onIniciarClase,
  onEnviarRecordatorio,
  onCancelar,
  puedeCancelar,
  puedeRegistrarAsistencia,
  getEstadoColor,
  formatFecha,
  router,
}: ClaseGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Group Header */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-black text-indigo-900 dark:text-white">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-700"></div>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
          {clases.length}
        </span>
      </div>

      {/* Classes */}
      <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
        {clases.map((clase, index) => (
          <motion.div
            key={clase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {viewMode === 'card' ? (
              <ClaseCard
                clase={clase}
                onIniciarClase={onIniciarClase}
                onEnviarRecordatorio={onEnviarRecordatorio}
                onCancelar={onCancelar}
                puedeCancelar={puedeCancelar}
                puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                getEstadoColor={getEstadoColor}
                formatFecha={formatFecha}
                router={router}
              />
            ) : (
              <ClaseRow
                clase={clase}
                onIniciarClase={onIniciarClase}
                onEnviarRecordatorio={onEnviarRecordatorio}
                onCancelar={onCancelar}
                puedeCancelar={puedeCancelar}
                puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                getEstadoColor={getEstadoColor}
                formatFecha={formatFecha}
                router={router}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * ClaseCard Component - Vista de tarjeta
 */
interface ClaseCardProps {
  clase: Clase;
  onIniciarClase: (id: string) => void;
  onEnviarRecordatorio: (id: string) => void;
  onCancelar: (id: string) => void;
  puedeCancelar: (clase: Clase) => boolean;
  puedeRegistrarAsistencia: (clase: Clase) => boolean;
  getEstadoColor: (estado: EstadoClase) => string;
  formatFecha: (isoDate: string) => string;
  router: ReturnType<typeof useRouter>;
}

function ClaseCard({
  clase,
  onIniciarClase,
  onCancelar,
  puedeCancelar,
  puedeRegistrarAsistencia,
  getEstadoColor,
  router,
}: ClaseCardProps) {
  const esHoy = () => {
    const hoy = new Date();
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return (
      hoy.getDate() === fechaClase.getDate() &&
      hoy.getMonth() === fechaClase.getMonth() &&
      hoy.getFullYear() === fechaClase.getFullYear()
    );
  };

  // Mock data contextual
  const asistenciaPromedio = 85; // TODO: Traer del backend
  const observacionesPendientes = 2; // TODO: Traer del backend

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-5 border-l-4 hover:shadow-2xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/40 transition-all cursor-pointer group"
      style={{ borderLeftColor: clase.ruta_curricular?.color || '#8b5cf6' }}
      onClick={() => router.push(`/docente/grupos/${clase.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {clase.titulo}
          </h3>
          {clase.ruta_curricular && (
            <span
              className="inline-block px-2 py-0.5 rounded-md text-xs font-bold mt-1"
              style={{
                backgroundColor: `${clase.ruta_curricular.color}20`,
                color: clase.ruta_curricular.color,
              }}
            >
              {clase.ruta_curricular.nombre}
            </span>
          )}
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoColor(clase.estado as any)}`}>
          {clase.estado}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium truncate">
            {new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {clase.duracion_minutos}min
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {clase.cupo_maximo - clase.cupo_disponible}/{clase.cupo_maximo}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {asistenciaPromedio}%
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {esHoy() && clase.estado === EstadoClase.Programada && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onIniciarClase(clase.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/40 hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            <Video className="w-4 h-4" />
            Iniciar
          </motion.button>
        )}

        {puedeRegistrarAsistencia(clase) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/docente/clases/${clase.id}/asistencia`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold hover:bg-purple-200/70 dark:hover:bg-purple-800/50 transition-all"
          >
            <FileText className="w-4 h-4" />
            Asistencia
          </motion.button>
        )}

        {puedeCancelar(clase) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancelar(clase.id)}
            className="px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Contextual Info */}
      {observacionesPendientes > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200/30 dark:border-purple-700/30">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {observacionesPendientes} observación(es) pendiente(s)
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * ClaseRow Component - Vista de lista
 */
function ClaseRow({
  clase,
  onIniciarClase,
  puedeRegistrarAsistencia,
  getEstadoColor,
  router,
}: ClaseCardProps) {
  const esHoy = () => {
    const hoy = new Date();
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return (
      hoy.getDate() === fechaClase.getDate() &&
      hoy.getMonth() === fechaClase.getMonth() &&
      hoy.getFullYear() === fechaClase.getFullYear()
    );
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="glass-card p-4 border-l-4 hover:shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/30 transition-all"
      style={{ borderLeftColor: clase.ruta_curricular?.color || '#8b5cf6' }}
    >
      <div className="flex items-center gap-4">
        {/* Hora */}
        <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
          <div className="text-2xl font-black text-indigo-900 dark:text-white">
            {new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs font-bold text-purple-600 dark:text-purple-300">
            {new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-indigo-900 dark:text-white truncate">
                {clase.titulo}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                {clase.ruta_curricular && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: `${clase.ruta_curricular.color}20`,
                      color: clase.ruta_curricular.color,
                    }}
                  >
                    {clase.ruta_curricular.nombre}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {clase.cupo_maximo - clase.cupo_disponible}/{clase.cupo_maximo}
                </span>
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {clase.duracion_minutos}min
                </span>
              </div>
            </div>

            {/* Estado */}
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoColor(clase.estado as any)}`}>
              {clase.estado}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {esHoy() && clase.estado === EstadoClase.Programada && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onIniciarClase(clase.id)}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/40"
            >
              <Video className="w-4 h-4" />
            </motion.button>
          )}

          {puedeRegistrarAsistencia(clase) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/docente/clases/${clase.id}/asistencia`)}
              className="px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold"
            >
              <FileText className="w-4 h-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/docente/grupos/${clase.id}`)}
            className="px-3 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-indigo-900 dark:text-white text-sm font-bold"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
