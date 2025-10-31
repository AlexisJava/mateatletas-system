'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClases } from '@/lib/api/clases.api';
import { useOverlayStack } from '../contexts/OverlayStackProvider';
import type { ClaseConRelaciones } from '@/types/clases.types';

interface CalendarioViewProps {
  estudiante: {
    id: string;
    nombre: string;
  };
}

export function CalendarioView({ estudiante: _estudiante }: CalendarioViewProps) {
  const { pop } = useOverlayStack();
  const [clases, setClases] = useState<ClaseConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());

  useEffect(() => {
    const cargarClases = async () => {
      try {
        setLoading(true);

        // Obtener clases del mes actual
        const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
        const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

        const data = await getClases({
          fechaDesde: primerDia.toISOString().split('T')[0],
          fechaHasta: ultimoDia.toISOString().split('T')[0],
        });

        setClases(data);
      } catch (error) {
        console.error('Error cargando clases:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarClases();
  }, [mesActual]);

  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
  };

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));
  };

  const nombreMes = mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Agrupar clases por día
  const clasesPorDia: Record<string, ClaseConRelaciones[]> = {};
  clases.forEach((clase) => {
    const [fecha] = new Date(clase.fecha_hora_inicio).toISOString().split('T');
    if (!fecha) {
      return;
    }
    if (!clasesPorDia[fecha]) {
      clasesPorDia[fecha] = [];
    }
    clasesPorDia[fecha].push(clase);
  });

  // Calcular días del mes
  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay();
  const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();

  const dias: Array<number | null> = Array((primerDia === 0 ? 6 : primerDia - 1)).fill(null);
  for (let i = 1; i <= ultimoDia; i++) {
    dias.push(i);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Calendario</h1>
            <p className="text-sm text-white/60">Tus clases sincrónicas programadas</p>
          </div>
        </div>
        <button
          onClick={pop}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Selector de Mes */}
      <div className="flex items-center justify-between p-4 bg-black/10">
        <button
          onClick={mesAnterior}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white capitalize">{nombreMes}</h2>
        <button
          onClick={mesSiguiente}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Calendario */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Cargando calendario...</div>
          </div>
        ) : (
          <>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                <div key={dia} className="text-center py-2 text-sm font-bold text-white/60">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-2 pb-20">
              {dias.map((dia, index) => {
                if (dia === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const fechaStr = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                const clasesDelDia = clasesPorDia[fechaStr] || [];
                const hoy = new Date().toISOString().split('T')[0] === fechaStr;

                return (
                  <DiaCard
                    key={dia}
                    dia={dia}
                    clases={clasesDelDia}
                    esHoy={hoy}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface DiaCardProps {
  dia: number;
  clases: ClaseConRelaciones[];
  esHoy: boolean;
}

function DiaCard({ dia, clases, esHoy }: DiaCardProps) {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => clases.length > 0 && setMostrarDetalle(true)}
        whileHover={clases.length > 0 ? { scale: 1.05 } : undefined}
        whileTap={clases.length > 0 ? { scale: 0.95 } : undefined}
        className={`relative aspect-square rounded-xl p-2 transition-all ${
          esHoy
            ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400'
            : clases.length > 0
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 hover:border-blue-400'
            : 'bg-white/5 border-2 border-white/10'
        }`}
      >
        <div className="text-sm font-bold text-white">{dia}</div>
        {clases.length > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {clases.slice(0, 3).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            ))}
          </div>
        )}
      </motion.button>

      {/* Modal de Detalle */}
      {mostrarDetalle && (
        <div
          onClick={() => setMostrarDetalle(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-6 border-4 border-white/20 shadow-2xl"
          >
            <button
              onClick={() => setMostrarDetalle(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <h3 className="text-2xl font-black text-white mb-4">
              Clases del día {dia}
            </h3>

            <div className="space-y-3">
              {clases.map((clase) => (
                <ClaseCard key={clase.id} clase={clase} />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

interface ClaseCardProps {
  clase: ClaseConRelaciones;
}

function ClaseCard({ clase }: ClaseCardProps) {
  const hora = new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-4 rounded-xl bg-white/10 border-2 border-white/20">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold text-white">{clase.nombre}</h4>
          <p className="text-sm text-white/60">{clase.rutaCurricular?.nombre || 'Sin ruta'}</p>
        </div>
        {clase.modalidad === 'virtual' && (
          <Video className="w-5 h-5 text-cyan-400" />
        )}
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2 text-white/80">
          <Clock className="w-4 h-4" />
          <span>{hora}</span>
        </div>

        {clase.docente && (
          <div className="flex items-center gap-2 text-white/80">
            <Users className="w-4 h-4" />
            <span>{clase.docente.nombre} {clase.docente.apellido}</span>
          </div>
        )}

        {clase.modalidad === 'presencial' && clase.ubicacion && (
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{clase.ubicacion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
