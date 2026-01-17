'use client';

import { X, Calendar, Clock, User, GraduationCap, Video } from 'lucide-react';
import type { ClaseProxima } from '@/lib/api/tutores.api';

interface ClaseDetalleModalProps {
  clase: ClaseProxima;
  onClose: () => void;
}

/**
 * Modal con detalle de una clase específica
 * Muestra información completa y link de reunión si está disponible
 */
export function ClaseDetalleModal({ clase, onClose }: ClaseDetalleModalProps) {
  const fechaInicio = new Date(clase.fechaHoraInicio);
  const fechaFin = new Date(clase.fechaHoraFin);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Color según estado
  const statusConfig = {
    Programada: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    EnVivo: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Finalizada: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    Cancelada: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const status = statusConfig[clase.estado];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white pr-10">{clase.nombre}</h2>

          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.border} border mt-2`}
          >
            <span className={`text-sm font-semibold ${status.text}`}>{clase.estado}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Fecha y hora */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Fecha</p>
              <p className="text-white font-medium capitalize">{formatDate(fechaInicio)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Horario</p>
              <p className="text-white font-medium">
                {formatTime(fechaInicio)} - {formatTime(fechaFin)} ({clase.duracionMinutos} min)
              </p>
            </div>
          </div>

          {/* Estudiante */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Estudiante</p>
              <p className="text-white font-medium">
                {clase.estudiante.nombre} {clase.estudiante.apellido}
              </p>
            </div>
          </div>

          {/* Docente */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Docente</p>
              <p className="text-white font-medium">
                Prof. {clase.docente.nombre} {clase.docente.apellido}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="p-6 pt-0">
          {clase.puedeUnirse && clase.urlReunion ? (
            <a
              href={clase.urlReunion}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all"
            >
              <Video className="w-5 h-5" />
              Unirse a la clase
            </a>
          ) : clase.puedeUnirse ? (
            <div className="text-center py-3 bg-slate-800/50 rounded-xl">
              <p className="text-slate-400 text-sm">Link de reunión disponible pronto</p>
            </div>
          ) : (
            <div className="text-center py-3 bg-slate-800/50 rounded-xl">
              <p className="text-slate-400 text-sm">
                {clase.esHoy
                  ? 'La clase comenzará pronto'
                  : `Disponible el ${formatDate(fechaInicio)}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
