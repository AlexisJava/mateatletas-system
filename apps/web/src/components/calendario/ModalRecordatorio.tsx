'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Calendar, Clock, Check, Palette } from 'lucide-react';
import { useCalendarioStore } from '@/store/calendario.store';
import {
  getDateInputValue,
  getDatePartFromISO,
  getTimePartFromISO,
  buildISODateTime,
  buildEndOfDayISO,
} from './helpers';
import type {
  CreateRecordatorioDto,
  UpdateRecordatorioDto,
  Evento,
} from '@/types/calendario.types';
import { TipoEvento } from '@/types/calendario.types';

interface ModalRecordatorioProps {
  isOpen: boolean;
  onClose: () => void;
  recordatorioExistente?: Evento;
}

const COLORES_PREDEFINIDOS = [
  { nombre: 'Indigo', hex: '#6366f1', from: 'from-indigo-500', to: 'to-indigo-600' },
  { nombre: 'Azul', hex: '#3b82f6', from: 'from-blue-500', to: 'to-blue-600' },
  { nombre: 'Morado', hex: '#8b5cf6', from: 'from-purple-500', to: 'to-purple-600' },
  { nombre: 'Rosa', hex: '#ec4899', from: 'from-pink-500', to: 'to-pink-600' },
  { nombre: 'Rojo', hex: '#ef4444', from: 'from-red-500', to: 'to-red-600' },
  { nombre: 'Naranja', hex: '#f97316', from: 'from-orange-500', to: 'to-orange-600' },
  { nombre: 'Verde', hex: '#10b981', from: 'from-green-500', to: 'to-green-600' },
  { nombre: 'Celeste', hex: '#06b6d4', from: 'from-cyan-500', to: 'to-cyan-600' },
];

export function ModalRecordatorio({
  isOpen,
  onClose,
  recordatorioExistente,
}: ModalRecordatorioProps) {
  const { crearRecordatorio, actualizarRecordatorio } = useCalendarioStore();

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('09:00');
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [completado, setCompletado] = useState(false);

  // Load existing recordatorio data
  useEffect(() => {
    if (recordatorioExistente) {
      setTitulo(recordatorioExistente.titulo);
      setDescripcion(recordatorioExistente.descripcion || '');

      setFechaInicio(getDatePartFromISO(recordatorioExistente.fechaInicio));
      setHoraInicio(getTimePartFromISO(recordatorioExistente.fechaInicio, '09:00'));

      setFechaFin(getDatePartFromISO(recordatorioExistente.fechaFin));
      setHoraFin(getTimePartFromISO(recordatorioExistente.fechaFin, '09:00'));

      setEsTodoElDia(recordatorioExistente.esTodoElDia);

      if (recordatorioExistente.recordatorio) {
        setColor(recordatorioExistente.recordatorio.color);
        setCompletado(recordatorioExistente.recordatorio.completado);
      }
    } else {
      const hoy = getDateInputValue(new Date());
      setFechaInicio(hoy);
      setHoraInicio('09:00');
      setFechaFin(hoy);
      setHoraFin('09:00');
    }
  }, [recordatorioExistente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaInicioISO = esTodoElDia
      ? buildISODateTime(fechaInicio, '00:00')
      : buildISODateTime(fechaInicio, horaInicio);

    const fechaFinISO = esTodoElDia
      ? buildEndOfDayISO(fechaFin || fechaInicio)
      : buildISODateTime(fechaFin, horaFin);

    const recordatorioData: CreateRecordatorioDto | UpdateRecordatorioDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.RECORDATORIO,
      fechaInicio: fechaInicioISO,
      fechaFin: fechaFinISO,
      esTodoElDia: esTodoElDia,
      color,
      completado,
    };

    try {
      if (recordatorioExistente) {
        await actualizarRecordatorio(
          recordatorioExistente.id,
          recordatorioData as UpdateRecordatorioDto,
        );
      } else {
        await crearRecordatorio(recordatorioData as CreateRecordatorioDto);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    const hoy = getDateInputValue(new Date());
    setFechaInicio(hoy);
    setHoraInicio('09:00');
    setFechaFin(hoy);
    setHoraFin('09:00');
    setEsTodoElDia(false);
    setColor('#6366f1');
    setCompletado(false);
  };

  const colorSeleccionado = COLORES_PREDEFINIDOS.find((c) => c.hex === color);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header with dynamic gradient based on selected color */}
        <div
          className={`p-6 flex items-center justify-between bg-gradient-to-r ${
            colorSeleccionado
              ? `${colorSeleccionado.from} ${colorSeleccionado.to}`
              : 'from-indigo-500 to-indigo-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">
              {recordatorioExistente ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2">
              Título del Recordatorio *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ej: Reunión de equipo"
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
              placeholder="Agrega detalles adicionales..."
              className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-medium text-indigo-900 dark:text-white placeholder:text-purple-400/60"
            />
          </div>

          {/* Todo el día toggle */}
          <div className="flex items-center gap-3 glass-card p-4 rounded-xl">
            <input
              type="checkbox"
              id="todoElDia"
              checked={esTodoElDia}
              onChange={(e) => setEsTodoElDia(e.target.checked)}
              className="w-5 h-5 rounded accent-purple-600 cursor-pointer"
            />
            <label
              htmlFor="todoElDia"
              className="flex-1 text-sm font-bold text-indigo-900 dark:text-white cursor-pointer"
            >
              Todo el día
            </label>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha {!esTodoElDia && 'Inicio'} *
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  if (esTodoElDia) setFechaFin(e.target.value);
                }}
                required
                className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
              />
            </div>
            {!esTodoElDia && (
              <div>
                <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setHoraFin(e.target.value);
                  }}
                  className="w-full px-4 py-3 glass-card focus:ring-2 focus:ring-purple-500 rounded-xl font-semibold text-indigo-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-bold text-indigo-900 dark:text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color del Recordatorio
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {COLORES_PREDEFINIDOS.map((colorOption) => (
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

          {/* Completado toggle */}
          <div className="flex items-center gap-3 glass-card p-4 rounded-xl">
            <input
              type="checkbox"
              id="completado"
              checked={completado}
              onChange={(e) => setCompletado(e.target.checked)}
              className="w-5 h-5 rounded accent-green-600 cursor-pointer"
            />
            <label
              htmlFor="completado"
              className="flex-1 text-sm font-bold text-indigo-900 dark:text-white cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Marcar como completado
            </label>
          </div>

          {/* Footer - Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-purple-100 dark:border-purple-900">
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
                colorSeleccionado
                  ? `${colorSeleccionado.from} ${colorSeleccionado.to}`
                  : 'from-indigo-500 to-indigo-600'
              }`}
              style={{
                boxShadow: `0 10px 25px -5px ${color}40`,
              }}
            >
              {recordatorioExistente ? 'Guardar Cambios' : 'Crear Recordatorio'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
