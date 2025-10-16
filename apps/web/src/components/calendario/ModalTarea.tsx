'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarioStore } from '@/store/calendario.store';
import { Modal } from '@/components/ui/Modal';
import {
  TipoEvento,
  EstadoTarea,
  PrioridadTarea,
  CreateTareaDto,
  Subtarea,
} from '@/types/calendario.types';

interface ModalTareaProps {
  isOpen: boolean;
  onClose: () => void;
  tareaExistente?: any; // Para edición
}

export function ModalTarea({ isOpen, onClose, tareaExistente }: ModalTareaProps) {
  const { crearTarea, actualizarTarea, isLoading } = useCalendarioStore();

  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [prioridad, setPrioridad] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
  const [estado, setEstado] = useState<EstadoTarea>(EstadoTarea.PENDIENTE);
  const [categoria, setCategoria] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [etiquetaInput, setEtiquetaInput] = useState('');
  const [subtareas, setSubtareas] = useState<Subtarea[]>([]);
  const [subtareaInput, setSubtareaInput] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState('');

  // Cargar datos si es edición
  useEffect(() => {
    if (tareaExistente) {
      setTitulo(tareaExistente.titulo);
      setDescripcion(tareaExistente.descripcion || '');
      
      const fechaInicioDate = new Date(tareaExistente.fecha_inicio);
      setFechaInicio(fechaInicioDate.toISOString().split('T')[0]);
      setHoraInicio(fechaInicioDate.toTimeString().slice(0, 5));
      
      const fechaFinDate = new Date(tareaExistente.fecha_fin);
      setFechaFin(fechaFinDate.toISOString().split('T')[0]);
      setHoraFin(fechaFinDate.toTimeString().slice(0, 5));
      
      setEsTodoElDia(tareaExistente.es_todo_el_dia);
      
      if (tareaExistente.tarea) {
        setPrioridad(tareaExistente.tarea.prioridad);
        setEstado(tareaExistente.tarea.estado);
        setCategoria(tareaExistente.tarea.categoria || '');
        setEtiquetas(tareaExistente.tarea.etiquetas || []);
        setSubtareas(tareaExistente.tarea.subtareas || []);
        setTiempoEstimado(tareaExistente.tarea.tiempo_estimado_minutos?.toString() || '');
      }
    } else {
      // Valores por defecto para nueva tarea
      const ahora = new Date();
      setFechaInicio(ahora.toISOString().split('T')[0]);
      setHoraInicio('09:00');
      setFechaFin(ahora.toISOString().split('T')[0]);
      setHoraFin('10:00');
    }
  }, [tareaExistente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construir fecha ISO
    const fechaInicioISO = esTodoElDia
      ? `${fechaInicio}T00:00:00.000Z`
      : `${fechaInicio}T${horaInicio}:00.000Z`;
    
    const fechaFinISO = esTodoElDia
      ? `${fechaFin}T23:59:59.999Z`
      : `${fechaFin}T${horaFin}:00.000Z`;

    const tareaData: CreateTareaDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.TAREA,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      es_todo_el_dia: esTodoElDia,
      prioridad,
      estado,
      categoria: categoria || undefined,
      etiquetas: etiquetas.length > 0 ? etiquetas : undefined,
      subtareas: subtareas.length > 0 ? subtareas : undefined,
      tiempo_estimado_minutos: tiempoEstimado ? parseInt(tiempoEstimado) : undefined,
    };

    try {
      if (tareaExistente) {
        await actualizarTarea(tareaExistente.id, tareaData);
      } else {
        await crearTarea(tareaData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setCategoria('');
    setEtiquetas([]);
    setSubtareas([]);
    setEtiquetaInput('');
    setSubtareaInput('');
    setTiempoEstimado('');
    setPrioridad(PrioridadTarea.MEDIA);
    setEstado(EstadoTarea.PENDIENTE);
  };

  const agregarEtiqueta = () => {
    if (etiquetaInput.trim() && !etiquetas.includes(etiquetaInput.trim())) {
      setEtiquetas([...etiquetas, etiquetaInput.trim()]);
      setEtiquetaInput('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter((e) => e !== etiqueta));
  };

  const agregarSubtarea = () => {
    if (subtareaInput.trim()) {
      const nuevaSubtarea: Subtarea = {
        id: Date.now().toString(),
        titulo: subtareaInput.trim(),
        completada: false,
        orden: subtareas.length,
      };
      setSubtareas([...subtareas, nuevaSubtarea]);
      setSubtareaInput('');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tareaExistente ? 'Editar Tarea' : 'Nueva Tarea'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Preparar material para clase de álgebra"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Inicio *
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Fin *
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Horas */}
        {!esTodoElDia && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora Inicio
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora Fin
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Todo el día */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="todoElDia"
            checked={esTodoElDia}
            onChange={(e) => setEsTodoElDia(e.target.checked)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <label htmlFor="todoElDia" className="text-sm text-gray-700 dark:text-gray-300">
            Todo el día
          </label>
        </div>

        {/* Prioridad y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={PrioridadTarea.BAJA}>🟢 Baja</option>
              <option value={PrioridadTarea.MEDIA}>🟡 Media</option>
              <option value={PrioridadTarea.ALTA}>🟠 Alta</option>
              <option value={PrioridadTarea.URGENTE}>🔴 Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoTarea)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={EstadoTarea.PENDIENTE}>⏳ Pendiente</option>
              <option value={EstadoTarea.EN_PROGRESO}>🔄 En Progreso</option>
              <option value={EstadoTarea.COMPLETADA}>✅ Completada</option>
              <option value={EstadoTarea.CANCELADA}>❌ Cancelada</option>
            </select>
          </div>
        </div>

        {/* Categoría y Tiempo Estimado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Planificación"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiempo Estimado (min)
            </label>
            <input
              type="number"
              value={tiempoEstimado}
              onChange={(e) => setTiempoEstimado(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              placeholder="60"
            />
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Etiquetas
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={etiquetaInput}
              onChange={(e) => setEtiquetaInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEtiqueta())}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              placeholder="Agregar etiqueta..."
            />
            <button
              type="button"
              onClick={agregarEtiqueta}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
              >
                {etiqueta}
                <button
                  type="button"
                  onClick={() => eliminarEtiqueta(etiqueta)}
                  className="hover:text-amber-900 dark:hover:text-amber-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Subtareas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtareas
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={subtareaInput}
              onChange={(e) => setSubtareaInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarSubtarea())}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              placeholder="Agregar subtarea..."
            />
            <button
              type="button"
              onClick={agregarSubtarea}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              +
            </button>
          </div>
          <div className="space-y-2">
            {subtareas.map((subtarea) => (
              <div
                key={subtarea.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={subtarea.completada}
                  onChange={() => toggleSubtarea(subtarea.id)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className={`flex-1 text-sm ${subtarea.completada ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {subtarea.titulo}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarSubtarea(subtarea.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : tareaExistente ? 'Actualizar' : 'Crear Tarea'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
