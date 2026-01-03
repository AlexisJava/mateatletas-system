'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, Clock, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/effects';
import apiClient from '@/lib/axios';

interface EstudianteInscrito {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  estado: string;
}

interface ComisionDetalle {
  id: string;
  nombre: string;
  descripcion: string | null;
  producto: {
    id: string;
    nombre: string;
    tipo: string;
  };
  casa: {
    id: string;
    nombre: string;
    emoji: string;
  } | null;
  horario: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cupo_maximo: number | null;
  activo: boolean;
  estudiantes: EstudianteInscrito[];
}

export default function ComisionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const comisionId = params.id as string;

  const [comision, setComision] = useState<ComisionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (comisionId) {
      fetchComision();
    }
  }, [comisionId]);

  const fetchComision = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<ComisionDetalle>(`/docentes/me/comisiones/${comisionId}`);
      setComision(data);
    } catch (error) {
      console.error('Error al cargar la comisión:', error);
      toast.error('Error al cargar los detalles de la comisión');
      router.push('/docente/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando comisión..." />
      </div>
    );
  }

  if (!comision) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-purple-300">Comisión no encontrada</p>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full px-8 h-full flex flex-col gap-6 overflow-y-auto pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/docente/dashboard' },
            { label: 'Comisiones' },
            { label: comision.nombre },
          ]}
        />

        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white">{comision.nombre}</h1>
              {comision.casa && (
                <span className="text-3xl" title={comision.casa.nombre}>
                  {comision.casa.emoji}
                </span>
              )}
            </div>
            <p className="text-purple-300">{comision.producto.nombre}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-black text-white">
              {comision.estudiantes.length}
              {comision.cupo_maximo && `/${comision.cupo_maximo}`}
            </p>
            <p className="text-purple-300 text-sm">Estudiantes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Calendar className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm font-bold text-white">{formatDate(comision.fecha_inicio)}</p>
            <p className="text-purple-300 text-sm">Fecha Inicio</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Calendar className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-sm font-bold text-white">{formatDate(comision.fecha_fin)}</p>
            <p className="text-purple-300 text-sm">Fecha Fin</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Clock className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm font-bold text-white">{comision.horario || 'No definido'}</p>
            <p className="text-purple-300 text-sm">Horario</p>
          </motion.div>
        </div>

        {/* Descripción */}
        {comision.descripcion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Descripción
            </h2>
            <p className="text-purple-200">{comision.descripcion}</p>
          </motion.div>
        )}

        {/* Lista de Estudiantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            ESTUDIANTES INSCRITOS ({comision.estudiantes.length})
          </h2>

          {comision.estudiantes.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center">
              <p className="text-purple-300">No hay estudiantes inscritos en esta comisión</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {comision.estudiantes.map((estudiante, index) => (
                <motion.div
                  key={estudiante.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">
                        {estudiante.nombre} {estudiante.apellido}
                      </p>
                      {estudiante.email && (
                        <p className="text-purple-300 text-sm">{estudiante.email}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        estudiante.estado === 'Confirmada'
                          ? 'bg-green-500/20 text-green-400'
                          : estudiante.estado === 'Pendiente'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {estudiante.estado}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
