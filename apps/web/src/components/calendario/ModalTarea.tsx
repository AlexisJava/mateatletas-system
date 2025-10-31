'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { useCalendarioStore } from '@/store/calendario.store';
import {
  getDateInputValue,
  getDatePartFromISO,
  getTimePartFromISO,
  buildISODateTime,
} from './helpers';
import type {
  CreateTareaDto,
  UpdateTareaDto,
  Subtarea,
  Evento,
} from '@/types/calendario.types';
import { TipoEvento, EstadoTarea, PrioridadTarea } from '@/types/calendario.types';

interface ModalTareaProps {
  isOpen: boolean;
  onClose: () => void;
  tareaExistente?: Evento;
}

export function ModalTarea({ isOpen, onClose, tareaExistente }: ModalTareaProps) {
  const { crearTarea, actualizarTarea } = useCalendarioStore();

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('10:00');
  const [estado, setEstado] = useState<EstadoTarea>(EstadoTarea.PENDIENTE);
  const [prioridad, setPrioridad] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [categoria, setCategoria] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [subtareas, setSubtareas] = useState<Subtarea[]>([]);
  const [tiempoEstimado, setTiempoEstimado] = useState<number | undefined>();

  // Input temporal para nuevas etiquetas y subtareas
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');

  // Load existing tarea data
  useEffect(() => {
    if (tareaExistente?.tarea) {
      setTitulo(tareaExistente.titulo);
      setDescripcion(tareaExistente.descripcion || '');

      setFechaInicio(getDatePartFromISO(tareaExistente.fecha_inicio));
      setHoraInicio(getTimePartFromISO(tareaExistente.fecha_inicio, '09:00'));

      setFechaFin(getDatePartFromISO(tareaExistente.fecha_fin));
      setHoraFin(getTimePartFromISO(tareaExistente.fecha_fin, '10:00'));

      setEstado(tareaExistente.tarea.estado);
      setPrioridad(tareaExistente.tarea.prioridad);
      setPorcentajeCompletado(tareaExistente.tarea.porcentaje_completado);
      setCategoria(tareaExistente.tarea.categoria || '');
      setEtiquetas(tareaExistente.tarea.etiquetas);
      setSubtareas(tareaExistente.tarea.subtareas || []);
      setTiempoEstimado(tareaExistente.tarea.tiempo_estimado_minutos || undefined);
    } else {
      resetForm();
    }
  }, [tareaExistente, isOpen]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    const ahora = new Date();
    const hoy = getDateInputValue(ahora);
    setFechaInicio(hoy);
    setHoraInicio('09:00');
    setFechaFin(hoy);
    setHoraFin('10:00');
    setEstado(EstadoTarea.PENDIENTE);
    setPrioridad(PrioridadTarea.MEDIA);
    setPorcentajeCompletado(0);
    setCategoria('');
    setEtiquetas([]);
    setSubtareas([]);
    setTiempoEstimado(undefined);
    setNuevaEtiqueta('');
    setNuevaSubtarea('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaInicioISO = buildISODateTime(fechaInicio, horaInicio);
    const fechaFinISO = buildISODateTime(fechaFin, horaFin);

    const tareaData: CreateTareaDto | UpdateTareaDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.TAREA,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      es_todo_el_dia: false,
      estado,
      prioridad,
      porcentaje_completado: porcentajeCompletado,
      categoria: categoria || undefined,
      etiquetas,
      subtareas,
      tiempo_estimado_minutos: tiempoEstimado,
    };

    try {
      if (tareaExistente) {
        await actualizarTarea(tareaExistente.id, tareaData as UpdateTareaDto);
      } else {
        await crearTarea(tareaData as CreateTareaDto);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !etiquetas.includes(nuevaEtiqueta.trim())) {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter((e) => e !== etiqueta));
  };

  const agregarSubtarea = () => {
    if (nuevaSubtarea.trim()) {
      const nueva: Subtarea = {
        id: Date.now().toString(),
        titulo: nuevaSubtarea.trim(),
        completada: false,
        orden: subtareas.length,
      };
      setSubtareas([...subtareas, nueva]);
      setNuevaSubtarea('');
    }
  };

  const toggleSubtarea = (id: string) => {
    setSubtareas(
      subtareas.map((st) =>
        st.id === id ? { ...st, completada: !st.completada } : st
      )
    );
  };

  const eliminarSubtarea = (id: string) => {
    setSubtareas(subtareas.filter((st) => st.id !== id));
  };

  const getPrioridadIcon = (prioridad: PrioridadTarea) => {
    switch (prioridad) {
      case PrioridadTarea.URGENTE:
        return '🔴';
      case PrioridadTarea.ALTA:
        return '🟠';
      case PrioridadTarea.MEDIA:
        return '🟡';
      case PrioridadTarea.BAJA:
        return '🟢';
    }
  };

  const getPrioridadColor = (prioridad: PrioridadTarea) => {
    switch (prioridad) {
      case PrioridadTarea.URGENTE:
        return 'from-red-500 to-rose-600';
      case PrioridadTarea.ALTA:
        return 'from-orange-500 to-amber-600';
      case PrioridadTarea.MEDIA:
        return 'from-yellow-500 to-orange-500';
      case PrioridadTarea.BAJA:
        return 'from-green-500 to-emerald-600';
    }
  };

  const getEstadoColor = (estado: EstadoTarea) => {
    switch (estado) {
      case EstadoTarea.COMPLETADA:
        return 'from-green-500 to-emerald-600';
      case EstadoTarea.EN_PROGRESO:
        return 'from-blue-500 to-indigo-600';
      case EstadoTarea.PENDIENTE:
        return 'from-purple-500 to-violet-600';
      case EstadoTarea.CANCELADA:
        return 'from-gray-500 to-slate-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative glass-card max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">
              {tareaExistente ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                Título de la Tarea *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                placeholder="Ej: Preparar material de Álgebra"
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Describe los detalles de la tarea..."
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-medium text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Estado y Prioridad - Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoTarea)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${getEstadoColor(
                    estado
                  )} shadow-lg focus:ring-2 focus:ring-purple-500 cursor-pointer`}
                >
                  <option value={EstadoTarea.PENDIENTE}>⏸️ Pendiente</option>
                  <option value={EstadoTarea.EN_PROGRESO}>▶️ En Progreso</option>
                  <option value={EstadoTarea.COMPLETADA}>✅ Completada</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                  Prioridad
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${getPrioridadColor(
                    prioridad
                  )} shadow-lg focus:ring-2 focus:ring-purple-500 cursor-pointer`}
                >
                  <option value={PrioridadTarea.BAJA}>{getPrioridadIcon(PrioridadTarea.BAJA)} Baja</option>
                  <option value={PrioridadTarea.MEDIA}>{getPrioridadIcon(PrioridadTarea.MEDIA)} Media</option>
                  <option value={PrioridadTarea.ALTA}>{getPrioridadIcon(PrioridadTarea.ALTA)} Alta</option>
                  <option value={PrioridadTarea.URGENTE}>{getPrioridadIcon(PrioridadTarea.URGENTE)} Urgente</option>
                </select>
              </div>
            </div>

            {/* Fechas y Horas - Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tiempo Estimado y Porcentaje */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Tiempo Estimado (minutos)
                </label>
                <input
                  type="number"
                  value={tiempoEstimado || ''}
                  onChange={(e) => setTiempoEstimado(e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                  placeholder="60"
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                  Progreso: {porcentajeCompletado}%
                </label>
                <input
                  type="range"
                  value={porcentajeCompletado}
                  onChange={(e) => setPorcentajeCompletado(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-200 to-violet-300 dark:from-purple-900 dark:to-violet-900"
                />
                <div className="mt-2 h-2 bg-purple-100 dark:bg-purple-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${porcentajeCompletado}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ej: Planificación, Evaluación..."
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Etiquetas
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarEtiqueta();
                    }
                  }}
                  placeholder="Escribe una etiqueta..."
                  className="flex-1 px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
                />
                <button
                  type="button"
                  onClick={agregarEtiqueta}
                  className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover-lift shadow-lg shadow-purple-500/50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {etiquetas.map((etiqueta, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 glass-card rounded-full text-sm font-bold text-purple-600 dark:text-purple-300"
                  >
                    <Tag className="w-3 h-3" />
                    {etiqueta}
                    <button
                      type="button"
                      onClick={() => eliminarEtiqueta(etiqueta)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Subtareas */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Subtareas ({subtareas.filter((s) => s.completada).length}/{subtareas.length})
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={nuevaSubtarea}
                  onChange={(e) => setNuevaSubtarea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarSubtarea();
                    }
                  }}
                  placeholder="Escribe una subtarea..."
                  className="flex-1 px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
                />
                <button
                  type="button"
                  onClick={agregarSubtarea}
                  className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover-lift shadow-lg shadow-purple-500/50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {subtareas.map((subtarea) => (
                    <motion.div
                      key={subtarea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 glass-card rounded-xl group"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtarea(subtarea.id)}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {subtarea.completada ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-purple-400" />
                        )}
                      </button>
                      <span
                        className={`flex-1 font-semibold ${
                          subtarea.completada
                            ? 'text-gray-400 line-through'
                            : 'text-indigo-900 dark:text-white'
                        }`}
                      >
                        {subtarea.titulo}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarSubtarea(subtarea.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer - Botones */}
          <div className="p-6 bg-purple-50/50 dark:bg-purple-900/20 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 glass-card rounded-xl font-bold text-indigo-900 dark:text-white hover-lift"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover-lift shadow-lg shadow-purple-500/50"
            >
              {tareaExistente ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
