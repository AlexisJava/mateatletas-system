'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  tutoresApi,
  type MisInscripcionesResponse,
  type InscripcionMensual,
  type EstadoPagoFilter,
} from '@/lib/api/tutores.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Filter,
} from 'lucide-react';

export default function TutorHistorialPagosPage(): React.ReactNode {
  const router = useRouter();
  const [data, setData] = useState<MisInscripcionesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPagoFilter | undefined>(undefined);
  const [filtroPeriodo, setFiltroPeriodo] = useState<string | undefined>(undefined);

  const loadInscripciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tutoresApi.getMisInscripciones(filtroPeriodo, filtroEstado);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar historial de pagos'));
    } finally {
      setIsLoading(false);
    }
  }, [filtroEstado, filtroPeriodo]);

  useEffect(() => {
    loadInscripciones();
  }, [loadInscripciones]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            Pagado
          </span>
        );
      case 'Pendiente':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'Vencido':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
            <AlertTriangle className="w-3 h-3" />
            Vencido
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">
            {estado}
          </span>
        );
    }
  };

  const formatMoney = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getPeriodos = () => {
    const now = new Date();
    const periodos: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periodos.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    return periodos;
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadInscripciones}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tutor/dashboard')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-green-400" />
            Historial de Pagos
          </h1>
          <p className="text-gray-400 mt-1">
            {data.resumen.cantidadInscripciones} inscripción
            {data.resumen.cantidadInscripciones !== 1 ? 'es' : ''} •{' '}
            {data.resumen.estudiantesUnicos} estudiante
            {data.resumen.estudiantesUnicos !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadInscripciones}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">Total Pagado</span>
          </div>
          <p className="text-xl font-bold text-green-400">
            {formatMoney(data.resumen.totalPagado)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">Pendiente</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">
            {formatMoney(data.resumen.totalPendiente)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">Inscripciones</span>
          </div>
          <p className="text-xl font-bold text-white">{data.resumen.cantidadInscripciones}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">Estudiantes</span>
          </div>
          <p className="text-xl font-bold text-white">{data.resumen.estudiantesUnicos}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">Filtros:</span>
        </div>

        <select
          value={filtroEstado ?? ''}
          onChange={(e) => setFiltroEstado((e.target.value as EstadoPagoFilter) || undefined)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">Todos los estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Vencido">Vencido</option>
        </select>

        <select
          value={filtroPeriodo ?? ''}
          onChange={(e) => setFiltroPeriodo(e.target.value || undefined)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">Todos los períodos</option>
          {getPeriodos().map((p) => (
            <option key={p} value={p}>
              {new Date(p + '-01').toLocaleDateString('es-AR', {
                month: 'long',
                year: 'numeric',
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Inscriptions List */}
      {data.inscripciones.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sin inscripciones</h3>
          <p className="text-gray-400">
            No hay inscripciones para mostrar con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.inscripciones.map((inscripcion) => (
            <div
              key={inscripcion.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{inscripcion.producto.nombre}</h3>
                    <p className="text-sm text-gray-400">
                      {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(inscripcion.periodo + '-01').toLocaleDateString('es-AR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {formatMoney(inscripcion.precioFinal)}
                    </p>
                    {parseFloat(inscripcion.descuentoAplicado) > 0 && (
                      <p className="text-xs text-green-400">
                        -{formatMoney(inscripcion.descuentoAplicado)} descuento
                      </p>
                    )}
                  </div>
                  {getEstadoBadge(inscripcion.estadoPago)}
                </div>
              </div>

              {inscripcion.fechaPago && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Pagado el{' '}
                    {new Date(inscripcion.fechaPago).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {inscripcion.metodoPago && ` • ${inscripcion.metodoPago}`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
