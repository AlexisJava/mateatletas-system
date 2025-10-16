'use client';

import { useState, useEffect } from 'react';
import { useCalendarioStore } from '@/store/calendario.store';
import { Modal } from '@/components/ui/Modal';
import {
  TipoEvento,
  CreateRecordatorioDto,
} from '@/types/calendario.types';

interface ModalRecordatorioProps {
  isOpen: boolean;
  onClose: () => void;
  recordatorioExistente?: any;
}

const COLORES_PREDEFINIDOS = [
  { nombre: 'Indigo', hex: '#6366f1' },
  { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Verde', hex: '#10b981' },
  { nombre: 'Amarillo', hex: '#f59e0b' },
  { nombre: 'Rojo', hex: '#ef4444' },
  { nombre: 'Rosa', hex: '#ec4899' },
  { nombre: 'Morado', hex: '#8b5cf6' },
];

export function ModalRecordatorio({ isOpen, onClose, recordatorioExistente }: ModalRecordatorioProps) {
  const { crearRecordatorio, actualizarRecordatorio, isLoading } = useCalendarioStore();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    if (recordatorioExistente) {
      setTitulo(recordatorioExistente.titulo);
      setDescripcion(recordatorioExistente.descripcion || '');

      const fechaInicioDate = new Date(recordatorioExistente.fecha_inicio);
      setFechaInicio(fechaInicioDate.toISOString().split('T')[0]);
      setHoraInicio(fechaInicioDate.toTimeString().slice(0, 5));

      const fechaFinDate = new Date(recordatorioExistente.fecha_fin);
      setFechaFin(fechaFinDate.toISOString().split('T')[0]);
      setHoraFin(fechaFinDate.toTimeString().slice(0, 5));

      setEsTodoElDia(recordatorioExistente.es_todo_el_dia);

      if (recordatorioExistente.recordatorio) {
        setColor(recordatorioExistente.recordatorio.color);
        setCompletado(recordatorioExistente.recordatorio.completado);
      }
    } else {
      const ahora = new Date();
      setFechaInicio(ahora.toISOString().split('T')[0]);
      setHoraInicio('09:00');
      setFechaFin(ahora.toISOString().split('T')[0]);
      setHoraFin('09:00');
    }
  }, [recordatorioExistente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaInicioISO = esTodoElDia
      ? `${fechaInicio}T00:00:00.000Z`
      : `${fechaInicio}T${horaInicio}:00.000Z`;

    const fechaFinISO = esTodoElDia
      ? `${fechaFin}T23:59:59.999Z`
      : `${fechaFin}T${horaFin}:00.000Z`;

    const recordatorioData: CreateRecordatorioDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.RECORDATORIO,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      es_todo_el_dia: esTodoElDia,
      color,
      completado,
    };

    try {
      if (recordatorioExistente) {
        await actualizarRecordatorio(recordatorioExistente.id, recordatorioData);
      } else {
        await crearRecordatorio(recordatorioData);
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
    setColor('#6366f1');
    setCompletado(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordatorioExistente ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
    >
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Llamar a los padres de Juan"
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
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setFechaFin(e.target.value);
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {!esTodoElDia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => {
                  setHoraInicio(e.target.value);
                  setHoraFin(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Todo el día */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="todoElDiaRecordatorio"
            checked={esTodoElDia}
            onChange={(e) => setEsTodoElDia(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="todoElDiaRecordatorio" className="text-sm text-gray-700 dark:text-gray-300">
            Todo el día
          </label>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORES_PREDEFINIDOS.map((colorPredef) => (
              <button
                key={colorPredef.hex}
                type="button"
                onClick={() => setColor(colorPredef.hex)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  color === colorPredef.hex
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: colorPredef.hex }}
                title={colorPredef.nombre}
              />
            ))}
          </div>
        </div>

        {/* Completado (solo en edición) */}
        {recordatorioExistente && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completadoRecordatorio"
              checked={completado}
              onChange={(e) => setCompletado(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="completadoRecordatorio" className="text-sm text-gray-700 dark:text-gray-300">
              Marcar como completado
            </label>
          </div>
        )}

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
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : recordatorioExistente ? 'Actualizar' : 'Crear Recordatorio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
