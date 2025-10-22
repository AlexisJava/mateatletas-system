'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/axios';
import { CreditCard, DollarSign, CheckCircle, Calendar, Clock, Award, XCircle } from 'lucide-react';
import { pagosHistorialSchema, type PagosHistorial } from '@/lib/schemas/pago.schema';

export default function PagosTab() {
  const [historialData, setHistorialData] = useState<PagosHistorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorialPagos();
  }, []);

  const loadHistorialPagos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/pagos/historial');
      const parsed = pagosHistorialSchema.parse(response);
      setHistorialData(parsed);
    } catch (error: unknown) {
      // Error loading payment history
    } finally{
      setLoading(false);
    }
  };

  const resumen = useMemo(() => {
    if (!historialData) {
      return null;
    }

    const pagosPendientes = historialData.historial.filter((pago) =>
      ['Pendiente', 'Atrasada'].includes(pago.estado),
    ).length;
    const pagosAprobados = historialData.historial.filter((pago) =>
      ['Activa', 'Activo', 'Pagado', 'Aprobado'].includes(pago.estado),
    ).length;
    const pagosRechazados = historialData.historial.filter((pago) =>
      ['Cancelada', 'Cancelado', 'Rechazado'].includes(pago.estado),
    ).length;

    return {
      ...historialData.resumen,
      pagos_pendientes: pagosPendientes,
      pagos_aprobados: pagosAprobados,
      pagos_rechazados: pagosRechazados,
    };
  }, [historialData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Aprobado
          </span>
        );
      case 'Pendiente':
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'Rechazado':
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">{estado}</span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando historial de pagos...</p>
        </div>
      </div>
    );
  }

  if (!historialData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-bold text-gray-900 mb-2">Error al cargar pagos</p>
          <p className="text-gray-600">No se pudo obtener el historial de pagos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Resumen de Pagos - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(historialData.resumen.total_gastado)}</p>
          <p className="text-sm opacity-90">Total Gastado</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{resumen?.pagos_aprobados ?? 0}</p>
          <p className="text-sm opacity-90">Pagos Aprobados</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white shadow-lg">
          <Clock className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{resumen?.pagos_pendientes ?? 0}</p>
          <p className="text-sm opacity-90">Pagos Pendientes</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <XCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{resumen?.pagos_rechazados ?? 0}</p>
          <p className="text-sm opacity-90">Pagos Rechazados</p>
        </div>
      </div>

      {/* Servicios Activos */}
      {(historialData.activos.membresia_actual || historialData.activos.inscripciones_cursos_activas.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Servicios Activos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Membresía Activa */}
            {historialData.activos.membresia_actual && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-indigo-900">
                      {historialData.activos.membresia_actual.producto.nombre}
                    </h4>
                    <p className="text-sm text-indigo-600">Membresía Activa</p>
                  </div>
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Estado:</strong> {historialData.activos.membresia_actual.estado}
                  </p>
                  {historialData.activos.membresia_actual.fecha_inicio && (
                    <p>
                      <strong>Inicio:</strong>{' '}
                      {new Date(historialData.activos.membresia_actual.fecha_inicio).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cursos Activos */}
            {historialData.activos.inscripciones_cursos_activas.map((inscripcion) => (
              <div
                key={inscripcion.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-amber-900">{inscripcion.producto.nombre}</h4>
                    <p className="text-sm text-amber-600">
                      {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                    </p>
                  </div>
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Estado:</strong> {inscripcion.estado}
                  </p>
                  <p>
                    <strong>Precio:</strong> {formatCurrency(inscripcion.producto.precio)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Pagos - Scrollable List */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-gray-300 p-4 overflow-hidden flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Historial de Pagos ({historialData.historial.length})</h3>

        <div className="flex-1 overflow-y-auto space-y-2">
          {historialData.historial.length > 0 ? (
            historialData.historial.map((pago) => {
              const fecha = new Date(pago.fecha);
              return (
                <div
                  key={pago.id}
                  className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info del Pago */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-indigo-100 rounded-lg p-2 flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{pago.producto.nombre}</h4>
                        <p className="text-sm text-gray-600">{pago.producto.tipo}</p>
                        {pago.producto.descripcion && (
                          <p className="text-xs text-gray-500 mt-1">{pago.producto.descripcion}</p>
                        )}

                        {/* Info adicional según tipo */}
                        {pago.estudiante && (
                          <p className="text-sm text-indigo-600 mt-1">
                            Para: {pago.estudiante.nombre} {pago.estudiante.apellido}
                          </p>
                        )}
                        <p className="text-xs uppercase tracking-wide text-gray-500 mt-1 font-semibold">
                          {pago.tipo === 'membresia' ? 'Membresía' : 'Curso'}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {fecha.toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Monto y Estado */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(pago.monto)}</p>
                      <div className="mt-2">{getEstadoBadge(pago.estado)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-600">No hay pagos registrados</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
