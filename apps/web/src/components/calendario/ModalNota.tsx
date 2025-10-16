'use client';

import { useState, useEffect } from 'react';
import { useCalendarioStore } from '@/store/calendario.store';
import { Modal } from '@/components/ui/Modal';
import {
  TipoEvento,
  CreateNotaDto,
} from '@/types/calendario.types';

interface ModalNotaProps {
  isOpen: boolean;
  onClose: () => void;
  notaExistente?: any;
}

const COLORES_NOTA = [
  { nombre: 'Morado', hex: '#8b5cf6' },
  { nombre: 'Rosa', hex: '#ec4899' },
  { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Verde', hex: '#10b981' },
  { nombre: 'Amarillo', hex: '#f59e0b' },
  { nombre: 'Gris', hex: '#6b7280' },
];

const CATEGORIAS_SUGERIDAS = [
  'Ideas',
  'Reuniones',
  'Observaciones',
  'Planificación',
  'Personal',
  'Pedagógico',
];

export function ModalNota({ isOpen, onClose, notaExistente }: ModalNotaProps) {
  const { crearNota, actualizarNota, isLoading } = useCalendarioStore();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contenido, setContenido] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [esTodoElDia, setEsTodoElDia] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('#8b5cf6');

  useEffect(() => {
    if (notaExistente) {
      setTitulo(notaExistente.titulo);
      setDescripcion(notaExistente.descripcion || '');

      const fechaInicioDate = new Date(notaExistente.fecha_inicio);
      setFechaInicio(fechaInicioDate.toISOString().split('T')[0]);
      setHoraInicio(fechaInicioDate.toTimeString().slice(0, 5));

      const fechaFinDate = new Date(notaExistente.fecha_fin);
      setFechaFin(fechaFinDate.toISOString().split('T')[0]);
      setHoraFin(fechaFinDate.toTimeString().slice(0, 5));

      setEsTodoElDia(notaExistente.es_todo_el_dia);

      if (notaExistente.nota) {
        setContenido(notaExistente.nota.contenido);
        setCategoria(notaExistente.nota.categoria || '');
        setColor(notaExistente.nota.color);
      }
    } else {
      const ahora = new Date();
      setFechaInicio(ahora.toISOString().split('T')[0]);
      setHoraInicio('00:00');
      setFechaFin(ahora.toISOString().split('T')[0]);
      setHoraFin('23:59');
    }
  }, [notaExistente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaInicioISO = esTodoElDia
      ? `${fechaInicio}T00:00:00.000Z`
      : `${fechaInicio}T${horaInicio}:00.000Z`;

    const fechaFinISO = esTodoElDia
      ? `${fechaFin}T23:59:59.999Z`
      : `${fechaFin}T${horaFin}:00.000Z`;

    const notaData: CreateNotaDto = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: TipoEvento.NOTA,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      es_todo_el_dia: esTodoElDia,
      contenido,
      categoria: categoria || undefined,
      color,
    };

    try {
      if (notaExistente) {
        await actualizarNota(notaExistente.id, notaData);
      } else {
        await crearNota(notaData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar nota:', error);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setContenido('');
    setCategoria('');
    setColor('#8b5cf6');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={notaExistente ? 'Editar Nota' : 'Nueva Nota'}
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Ideas para el próximo trimestre"
          />
        </div>

        {/* Descripción breve */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción breve
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Resumen en una línea..."
          />
        </div>

        {/* Contenido (campo principal) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contenido *
          </label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="Escribe tu nota aquí... (puedes usar markdown, listas, etc.)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {contenido.length} caracteres
          </p>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setFechaFin(e.target.value);
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORIAS_SUGERIDAS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoria(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  categoria === cat
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
            placeholder="O escribe una categoría personalizada..."
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORES_NOTA.map((colorPredef) => (
              <button
                key={colorPredef.hex}
                type="button"
                onClick={() => setColor(colorPredef.hex)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  color === colorPredef.hex
                    ? 'ring-2 ring-offset-2 ring-violet-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: colorPredef.hex }}
                title={colorPredef.nombre}
              />
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
            className="flex-1 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : notaExistente ? 'Actualizar' : 'Crear Nota'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
