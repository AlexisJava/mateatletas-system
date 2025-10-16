'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Calendar, Clock, Tag, Palette, Check } from 'lucide-react';
import { useCalendarioStore } from '@/store/calendario.store';
import type {
  CreateNotaDto,
  UpdateNotaDto,
  Evento,
} from '@/types/calendario.types';
import { TipoEvento } from '@/types/calendario.types';

interface ModalNotaProps {
  isOpen: boolean;
  onClose: () => void;
  notaExistente?: Evento;
}

const CATEGORIAS_SUGERIDAS = [
  { nombre: 'Ideas', icon: '💡', color: 'from-yellow-500 to-amber-600' },
  { nombre: 'Reuniones', icon: '👥', color: 'from-blue-500 to-indigo-600' },
  { nombre: 'Observaciones', icon: '👁️', color: 'from-purple-500 to-violet-600' },
  { nombre: 'Planificación', icon: '📋', color: 'from-green-500 to-emerald-600' },
  { nombre: 'Personal', icon: '✨', color: 'from-pink-500 to-rose-600' },
  { nombre: 'Pedagógico', icon: '📚', color: 'from-indigo-500 to-purple-600' },
];

const COLORES_NOTA = [
  { nombre: 'Morado', hex: '#8b5cf6', from: 'from-purple-500', to: 'to-purple-600' },
  { nombre: 'Indigo', hex: '#6366f1', from: 'from-indigo-500', to: 'to-indigo-600' },
  { nombre: 'Azul', hex: '#3b82f6', from: 'from-blue-500', to: 'to-blue-600' },
  { nombre: 'Verde', hex: '#10b981', from: 'from-green-500', to: 'to-green-600' },
  { nombre: 'Amarillo', hex: '#f59e0b', from: 'from-amber-500', to: 'to-amber-600' },
  { nombre: 'Naranja', hex: '#f97316', from: 'from-orange-500', to: 'to-orange-600' },
];

export function ModalNota({ isOpen, onClose, notaExistente }: ModalNotaProps) {
  const { crearNota, actualizarNota } = useCalendarioStore();

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contenido, setContenido] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('00:00');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('#8b5cf6');

  // Load existing nota data
  useEffect(() => {
    if (notaExistente?.nota) {
      setTitulo(notaExistente.titulo);
      setDescripcion(notaExistente.descripcion || '');

      const fechaInicioDate = new Date(notaExistente.fecha_inicio);
      setFechaInicio(fechaInicioDate.toISOString().split('T')[0]);
      setHoraInicio(fechaInicioDate.toTimeString().slice(0, 5));

      setContenido(notaExistente.nota.contenido);
      setCategoria(notaExistente.nota.categoria || '');
      setColor(notaExistente.nota.color);
    } else {
      resetForm();
    }
  }, [notaExistente, isOpen]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setContenido('');
    const ahora = new Date();
    setFechaInicio(ahora.toISOString().split('T')[0]);
    setHoraInicio('00:00');
    setCategoria('');
    setColor('#8b5cf6');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaInicioISO = `${fechaInicio}T${horaInicio}:00.000Z`;
    const fechaFinDate = new Date(fechaInicioISO);
    fechaFinDate.setHours(23, 59, 59, 999);
    const fechaFinISO = fechaFinDate.toISOString();

    const notaData: CreateNotaDto | UpdateNotaDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.NOTA,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      es_todo_el_dia: true,
      contenido,
      categoria: categoria || undefined,
      color,
    };

    try {
      if (notaExistente) {
        await actualizarNota(notaExistente.id, notaData as UpdateNotaDto);
      } else {
        await crearNota(notaData as CreateNotaDto);
      }
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error('Error al guardar nota:', error);
    }
  };

  const colorSeleccionado = COLORES_NOTA.find((c) => c.hex === color);

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
        {/* Header with dynamic gradient */}
        <div
          className={`p-6 flex items-center justify-between bg-gradient-to-r ${
            colorSeleccionado ? `${colorSeleccionado.from} ${colorSeleccionado.to}` : 'from-purple-500 to-purple-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">
              {notaExistente ? 'Editar Nota' : 'Nueva Nota'}
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
                Título de la Nota *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                placeholder="Ej: Ideas para gamificación"
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Descripción corta */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
                Descripción Breve
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Resumen corto de la nota..."
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-medium text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Contenido principal - Grande */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contenido de la Nota *
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-300">
                  {contenido.length} caracteres
                </span>
              </label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
                rows={10}
                placeholder="Escribe tus ideas, observaciones, notas detalladas..."
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-mono text-sm text-indigo-900 dark:text-white placeholder:text-purple-400/60 resize-none"
              />
            </div>

            {/* Categoría con sugerencias */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categoría
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {CATEGORIAS_SUGERIDAS.map((cat) => (
                  <button
                    key={cat.nombre}
                    type="button"
                    onClick={() => setCategoria(cat.nombre)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      categoria === cat.nombre
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                        : 'glass-card text-indigo-900 dark:text-white hover:scale-105'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.nombre}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="O escribe una categoría personalizada..."
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white placeholder:text-purple-400/60"
              />
            </div>

            {/* Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha *
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
                  Hora (opcional)
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
            </div>

            {/* Color de la nota */}
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color de la Nota
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {COLORES_NOTA.map((colorOption) => (
                  <button
                    key={colorOption.hex}
                    type="button"
                    onClick={() => setColor(colorOption.hex)}
                    className={`group relative h-12 rounded-xl transition-all duration-200 ${
                      color === colorOption.hex
                        ? 'ring-4 ring-purple-500 ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    } bg-gradient-to-br ${colorOption.from} ${colorOption.to} shadow-lg`}
                    title={colorOption.nombre}
                  >
                    {color === colorOption.hex && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    )}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-indigo-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {colorOption.nombre}
                    </span>
                  </button>
                ))}
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
              className={`px-6 py-3 text-white rounded-xl font-bold hover-lift shadow-lg bg-gradient-to-r ${
                colorSeleccionado ? `${colorSeleccionado.from} ${colorSeleccionado.to}` : 'from-purple-500 to-purple-600'
              }`}
              style={{
                boxShadow: `0 10px 25px -5px ${color}40`,
              }}
            >
              {notaExistente ? 'Guardar Cambios' : 'Crear Nota'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
