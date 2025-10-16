'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarioStore } from '@/store/calendario.store';
import { LoadingSpinner } from '@/components/effects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Evento } from '@/types/calendario.types';
import { getColorPorTipo, getIconoPorTipo, formatearHora } from '@/lib/api/calendario.api';
import { TipoEvento, EstadoTarea, PrioridadTarea } from '@/types/calendario.types';
import { ModalTarea, ModalRecordatorio, ModalNota } from '@/components/calendario';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

/**
 * Página de Calendario del Docente
 *
 * Sistema completo de calendario con:
 * - Vista Agenda (principal): agrupación inteligente por días
 * - Vista Semana: grid semanal con timeline
 * - Gestión de Tareas, Recordatorios y Notas
 * - Integración con Clases del sistema
 */
export default function DocenteCalendarioPage() {
  const {
    vistaActiva,
    vistaAgenda,
    vistaSemana,
    estadisticas,
    isLoading,
    error,
    modalAbierto,
    tipoModalCreacion,
    eventoSeleccionado,
    cargarVistaAgenda,
    cargarVistaSemana,
    cargarEstadisticas,
    setVistaActiva,
    abrirModalCreacion,
    setEventoSeleccionado,
    cerrarModal,
  } = useCalendarioStore();

  useEffect(() => {
    // Cargar vista inicial y estadísticas
    cargarVistaAgenda();
    cargarEstadisticas();
  }, []);

  if (isLoading && !vistaAgenda) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 dark:text-white mb-2">
            Calendario y Agenda
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus tareas, recordatorios, notas y clases
          </p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              titulo="Total Eventos"
              valor={estadisticas.total}
              color="bg-indigo-500"
              icono="📅"
            />
            <StatCard
              titulo="Tareas"
              valor={estadisticas.totalTareas}
              color="bg-amber-500"
              icono="✓"
            />
            <StatCard
              titulo="Pendientes"
              valor={estadisticas.tareasPendientes}
              color="bg-orange-500"
              icono="⏳"
            />
            <StatCard
              titulo="Recordatorios"
              valor={estadisticas.totalRecordatorios}
              color="bg-blue-500"
              icono="🔔"
            />
            <StatCard
              titulo="Notas"
              valor={estadisticas.totalNotas}
              color="bg-violet-500"
              icono="📝"
            />
          </div>
        )}

        {/* Barra de acciones */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Botones de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setVistaActiva('agenda')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === 'agenda'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📋 Vista Agenda
              </button>
              <button
                onClick={() => setVistaActiva('semana')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === 'semana'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📆 Vista Semana
              </button>
            </div>

            {/* Botones de creación */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => abrirModalCreacion(TipoEvento.TAREA)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                ✓ Nueva Tarea
              </button>
              <button
                onClick={() => abrirModalCreacion(TipoEvento.RECORDATORIO)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                🔔 Recordatorio
              </button>
              <button
                onClick={() => abrirModalCreacion(TipoEvento.NOTA)}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                📝 Nota
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Contenido de vistas */}
        <AnimatePresence mode="wait">
          {vistaActiva === 'agenda' && vistaAgenda && (
            <VistaAgenda data={vistaAgenda} onEventoClick={setEventoSeleccionado} />
          )}
          {vistaActiva === 'semana' && vistaSemana && (
            <VistaSemana eventos={vistaSemana} onEventoClick={setEventoSeleccionado} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals de Creación/Edición */}
      <ModalTarea
        isOpen={modalAbierto && tipoModalCreacion === TipoEvento.TAREA}
        onClose={cerrarModal}
        tareaExistente={eventoSeleccionado?.tipo === TipoEvento.TAREA ? eventoSeleccionado : undefined}
      />
      <ModalRecordatorio
        isOpen={modalAbierto && tipoModalCreacion === TipoEvento.RECORDATORIO}
        onClose={cerrarModal}
        recordatorioExistente={eventoSeleccionado?.tipo === TipoEvento.RECORDATORIO ? eventoSeleccionado : undefined}
      />
      <ModalNota
        isOpen={modalAbierto && tipoModalCreacion === TipoEvento.NOTA}
        onClose={cerrarModal}
        notaExistente={eventoSeleccionado?.tipo === TipoEvento.NOTA ? eventoSeleccionado : undefined}
      />
    </div>
  );
}

// ==================== COMPONENTES ====================

interface StatCardProps {
  titulo: string;
  valor: number;
  color: string;
  icono: string;
}

function StatCard({ titulo, valor, color, icono }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icono}</span>
        <span className={`${color} text-white text-2xl font-bold px-3 py-1 rounded-lg`}>
          {valor}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{titulo}</p>
    </motion.div>
  );
}

// ==================== VISTA AGENDA ====================

interface VistaAgendaProps {
  data: {
    hoy: Evento[];
    manana: Evento[];
    proximos7Dias: Evento[];
    masAdelante: Evento[];
  };
  onEventoClick: (evento: Evento) => void;
}

function VistaAgenda({ data, onEventoClick }: VistaAgendaProps) {
  return (
    <motion.div
      key="vista-agenda"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Hoy */}
      <GrupoEventos
        titulo="📌 Hoy"
        subtitulo={format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        eventos={data.hoy}
        onEventoClick={onEventoClick}
        colorAccent="border-l-indigo-500"
      />

      {/* Mañana */}
      {data.manana.length > 0 && (
        <GrupoEventos
          titulo="☀️ Mañana"
          subtitulo={format(new Date(Date.now() + 86400000), "EEEE, d 'de' MMMM", { locale: es })}
          eventos={data.manana}
          onEventoClick={onEventoClick}
          colorAccent="border-l-blue-500"
        />
      )}

      {/* Próximos 7 días */}
      {data.proximos7Dias.length > 0 && (
        <GrupoEventos
          titulo="📅 Próximos 7 días"
          eventos={data.proximos7Dias}
          onEventoClick={onEventoClick}
          colorAccent="border-l-violet-500"
        />
      )}

      {/* Más adelante */}
      {data.masAdelante.length > 0 && (
        <GrupoEventos
          titulo="🔮 Más adelante"
          eventos={data.masAdelante}
          onEventoClick={onEventoClick}
          colorAccent="border-l-gray-400"
        />
      )}

      {/* Mensaje vacío */}
      {data.hoy.length === 0 &&
        data.manana.length === 0 &&
        data.proximos7Dias.length === 0 &&
        data.masAdelante.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay eventos próximos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Crea una tarea, recordatorio o nota para comenzar
            </p>
          </div>
        )}
    </motion.div>
  );
}

interface GrupoEventosProps {
  titulo: string;
  subtitulo?: string;
  eventos: Evento[];
  onEventoClick: (evento: Evento) => void;
  colorAccent?: string;
}

function GrupoEventos({ titulo, subtitulo, eventos, onEventoClick, colorAccent = 'border-l-gray-400' }: GrupoEventosProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{titulo}</h2>
        {subtitulo && (
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{subtitulo}</p>
        )}
      </div>

      <div className="space-y-3">
        {eventos.map((evento) => (
          <EventoCard
            key={evento.id}
            evento={evento}
            onClick={() => onEventoClick(evento)}
            colorAccent={colorAccent}
          />
        ))}
      </div>
    </div>
  );
}

interface EventoCardProps {
  evento: Evento;
  onClick: () => void;
  colorAccent?: string;
}

function EventoCard({ evento, onClick, colorAccent }: EventoCardProps) {
  const icono = getIconoPorTipo(evento.tipo);
  const color = getColorPorTipo(evento.tipo);

  // Determinar info adicional según tipo
  let infoAdicional = '';
  let badgeColor = 'bg-gray-100 text-gray-700';

  if (evento.tipo === TipoEvento.TAREA && evento.tarea) {
    const { estado, prioridad, porcentaje_completado } = evento.tarea;
    infoAdicional = `${estado} • ${prioridad} • ${porcentaje_completado}%`;

    if (estado === EstadoTarea.COMPLETADA) {
      badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    } else if (prioridad === PrioridadTarea.URGENTE) {
      badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    } else if (estado === EstadoTarea.EN_PROGRESO) {
      badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }
  } else if (evento.tipo === TipoEvento.RECORDATORIO && evento.recordatorio) {
    infoAdicional = evento.recordatorio.completado ? '✓ Completado' : 'Pendiente';
    badgeColor = evento.recordatorio.completado
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`border-l-4 ${colorAccent} bg-gray-50 dark:bg-gray-700/50 rounded-r-xl p-4 cursor-pointer hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{icono}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {evento.titulo}
            </h3>
            {evento.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                {evento.descripcion}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>⏰ {formatearHora(evento.fecha_inicio)}</span>
              {!evento.es_todo_el_dia && (
                <span>→ {formatearHora(evento.fecha_fin)}</span>
              )}
              {evento.es_todo_el_dia && (
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                  Todo el día
                </span>
              )}
            </div>
          </div>
        </div>

        {infoAdicional && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${badgeColor} whitespace-nowrap`}>
            {infoAdicional}
          </span>
        )}
      </div>

      {/* Subtareas preview para Tareas */}
      {evento.tipo === TipoEvento.TAREA && evento.tarea?.subtareas && evento.tarea.subtareas.length > 0 && (
        <div className="mt-3 pl-9 space-y-1">
          {evento.tarea.subtareas.slice(0, 3).map((subtarea: any) => (
            <div key={subtarea.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={subtarea.completada}
                readOnly
                className="w-3 h-3 rounded border-gray-300"
              />
              <span className={subtarea.completada ? 'line-through' : ''}>{subtarea.titulo}</span>
            </div>
          ))}
          {evento.tarea.subtareas.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{evento.tarea.subtareas.length - 3} más...
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ==================== VISTA SEMANA ====================

interface VistaSemanaProps {
  eventos: Evento[];
  onEventoClick: (evento: Evento) => void;
}

function VistaSemana({ eventos, onEventoClick }: VistaSemanaProps) {
  return (
    <motion.div
      key="vista-semana"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Vista Semana</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Próximamente: Grid semanal interactivo con timeline
        </p>
      </div>

      <div className="space-y-3">
        {eventos.map((evento) => (
          <EventoCard
            key={evento.id}
            evento={evento}
            onClick={() => onEventoClick(evento)}
            colorAccent="border-l-indigo-500"
          />
        ))}

        {eventos.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No hay eventos esta semana
          </div>
        )}
      </div>
    </motion.div>
  );
}
