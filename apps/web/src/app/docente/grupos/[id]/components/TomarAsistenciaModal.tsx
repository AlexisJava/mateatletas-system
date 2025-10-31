'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserCheck,
  UserX,
  UserMinus,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { StudentAvatar } from '@/components/ui/StudentAvatar';
import {
  tomarAsistenciaBatch,
  type EstadoAsistencia,
  type AsistenciaEstudianteItem,
} from '@/lib/api/asistencia.api';
import type { EstudianteConStatsDto } from '@/lib/api/clase-grupos.api';
import { isAxiosError } from 'axios';

interface TomarAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  claseGrupoId: string;
  estudiantes: EstudianteConStatsDto[];
  onSuccess: () => void;
}

interface EstadoEstudiante {
  estudiante: EstudianteConStatsDto;
  estado: EstadoAsistencia | null;
  observaciones: string;
}

export default function TomarAsistenciaModal({
  isOpen,
  onClose,
  claseGrupoId,
  estudiantes,
  onSuccess,
}: TomarAsistenciaModalProps) {
  const [estadosEstudiantes, setEstadosEstudiantes] = useState<
    EstadoEstudiante[]
  >(
    estudiantes.map((est) => ({
      estudiante: est,
      estado: null,
      observaciones: '',
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEstadoChange = (index: number, estado: EstadoAsistencia) => {
    const newEstados = [...estadosEstudiantes];
    if (newEstados[index]) {
      newEstados[index].estado = estado;
    }
    setEstadosEstudiantes(newEstados);
  };

  const handleObservacionChange = (index: number, observacion: string) => {
    const newEstados = [...estadosEstudiantes];
    if (newEstados[index]) {
      newEstados[index].observaciones = observacion;
    }
    setEstadosEstudiantes(newEstados);
  };

  const handleMarcarTodos = (estado: EstadoAsistencia) => {
    setEstadosEstudiantes(
      estadosEstudiantes.map((est) => ({
        ...est,
        estado,
      }))
    );
  };

  const handleSubmit = async () => {
    // Validar que todos tengan estado
    const sinEstado = estadosEstudiantes.filter((est) => !est.estado);
    if (sinEstado.length > 0) {
      toast.error(
        `Debes marcar asistencia para todos los estudiantes (${sinEstado.length} pendientes)`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const asistencias: AsistenciaEstudianteItem[] = estadosEstudiantes.map(
        (est) => ({
          estudiante_id: est.estudiante.id,
          estado: est.estado!,
          observaciones: est.observaciones || undefined,
        })
      );

      const fechaHoy = new Date().toISOString().split('T')[0] as string; // YYYY-MM-DD

      const response = await tomarAsistenciaBatch({
        clase_grupo_id: claseGrupoId,
        fecha: fechaHoy,
        asistencias,
      });

      toast.success(
        `✅ ${response?.mensaje ?? "Asistencia registrada"} (${response?.registrosCreados ?? 0} nuevos, ${response?.registrosActualizados ?? 0} actualizados)`
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al tomar asistencia:', error);
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            'Error al guardar asistencia. Intenta nuevamente.'
        );
      } else {
        toast.error('Error al guardar asistencia. Intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMarcados = estadosEstudiantes.filter((est) => est.estado).length;
  const totalPresentes = estadosEstudiantes.filter(
    (est) => est.estado === 'Presente'
  ).length;
  const totalAusentes = estadosEstudiantes.filter(
    (est) => est.estado === 'Ausente'
  ).length;
  const totalJustificados = estadosEstudiantes.filter(
    (est) => est.estado === 'Justificado'
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-purple-500/30 pointer-events-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      TOMAR ASISTENCIA
                    </h2>
                    <p className="text-green-100 font-semibold">
                      {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="bg-slate-800/50 border-b border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-bold">
                    Progreso: {totalMarcados}/{estudiantes.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarcarTodos('Presente')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-lg transition-all"
                    >
                      ✓ Todos Presentes
                    </button>
                    <button
                      onClick={() => handleMarcarTodos('Ausente')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg transition-all"
                    >
                      ✗ Todos Ausentes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-3 text-center">
                    <p className="text-green-400 font-black text-2xl">
                      {totalPresentes}
                    </p>
                    <p className="text-green-300 font-bold text-sm">
                      Presentes
                    </p>
                  </div>
                  <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 text-center">
                    <p className="text-red-400 font-black text-2xl">
                      {totalAusentes}
                    </p>
                    <p className="text-red-300 font-bold text-sm">Ausentes</p>
                  </div>
                  <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 font-black text-2xl">
                      {totalJustificados}
                    </p>
                    <p className="text-yellow-300 font-bold text-sm">
                      Justificados
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de estudiantes */}
              <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                {estadosEstudiantes.map((item, index) => (
                  <div
                    key={item.estudiante.id}
                    className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <StudentAvatar
                        nombre={item.estudiante.nombre}
                        apellido={item.estudiante.apellido}
                        avatar_url={item.estudiante.avatar_url}
                        size="lg"
                        className="border-2 border-purple-400/50"
                      />

                      {/* Info + Controles */}
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {item.estudiante.nombre} {item.estudiante.apellido}
                        </h3>

                        {/* Botones de estado */}
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => handleEstadoChange(index, 'Presente')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                              item.estado === 'Presente'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            <UserCheck className="w-4 h-4" />
                            Presente
                          </button>

                          <button
                            onClick={() => handleEstadoChange(index, 'Ausente')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                              item.estado === 'Ausente'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            <UserX className="w-4 h-4" />
                            Ausente
                          </button>

                          <button
                            onClick={() =>
                              handleEstadoChange(index, 'Justificado')
                            }
                            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                              item.estado === 'Justificado'
                                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/50'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            <UserMinus className="w-4 h-4" />
                            Justificado
                          </button>
                        </div>

                        {/* Campo de observaciones opcional */}
                        <input
                          type="text"
                          placeholder="Observaciones (opcional)..."
                          value={item.observaciones}
                          onChange={(e) =>
                            handleObservacionChange(index, e.target.value)
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-slate-800/50 border-t border-white/10 p-4 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || totalMarcados !== estudiantes.length}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      GUARDAR ASISTENCIA
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
