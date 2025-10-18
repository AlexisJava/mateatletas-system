'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';

interface Pago {
  id: string;
  monto: number;
  estado: string;
  mercadopago_payment_id: string | null;
  fecha_pago: string;
  tutor: {
    nombre: string;
    apellido: string;
    email: string;
  };
  producto: {
    nombre: string;
    tipo: string;
  };
  membresia?: {
    estado: string;
    estudiantes: Array<{
      nombre: string;
      apellido: string;
    }>;
  };
  inscripcion?: {
    estudiante: {
      nombre: string;
      apellido: string;
    };
  };
}

export default function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPagos();
  }, []);

  const loadPagos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/pagos/admin/all');
      setPagos((response || []) as unknown as Pago[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar pagos'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(monto);
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { bg: string; text: string }> = {
      Aprobado: { bg: 'bg-green-100', text: 'text-green-700' },
      Pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      Rechazado: { bg: 'bg-red-100', text: 'text-red-700' },
      Cancelado: { bg: 'bg-gray-100', text: 'text-gray-700' },
    };

    const style = estados[estado] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-lg ${style.bg} ${style.text} text-sm font-semibold`}>
        {estado}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Cargando pagos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Calcular estadísticas de forma segura
  const pagosArray = Array.isArray(pagos) ? pagos : [];
  const totalRecaudado = pagosArray
    .filter((p) => p.estado === 'Aprobado')
    .reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)]">
            Todos los Pagos
          </h1>
          <p className="text-gray-600 mt-2">
            Historial completo de pagos de la plataforma
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/[0.05] rounded-xl border-2 border-gray-200 shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Pagos</p>
          <p className="text-3xl font-bold text-gray-900">{pagosArray.length}</p>
        </div>
        <div className="bg-emerald-500/[0.05] rounded-xl border-2 border-gray-200 shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Pagos Aprobados</p>
          <p className="text-3xl font-bold text-green-600">
            {pagosArray.filter((p) => p.estado === 'Aprobado').length}
          </p>
        </div>
        <div className="bg-emerald-500/[0.05] rounded-xl border-2 border-gray-200 shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Total Recaudado</p>
          <p className="text-3xl font-bold text-indigo-600">
            {formatMonto(totalRecaudado)}
          </p>
        </div>
      </div>

      {/* Lista de pagos */}
      {pagosArray.length === 0 ? (
        <div className="bg-emerald-500/[0.05] rounded-xl border-2 border-gray-200 shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">💳</span>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay pagos</h3>
          <p className="text-gray-600">
            No se encontraron pagos en el sistema
          </p>
        </div>
      ) : (
        <div className="bg-emerald-500/[0.05] rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estudiante(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID MercadoPago
                  </th>
                </tr>
              </thead>
              <tbody className="bg-emerald-500/[0.05] divide-y divide-gray-200">
                {pagosArray.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFecha(pago.fecha_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {pago.tutor.nombre} {pago.tutor.apellido}
                      </div>
                      <div className="text-xs text-gray-500">{pago.tutor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {pago.producto.nombre}
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">
                        {pago.producto.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pago.membresia && pago.membresia.estudiantes.length > 0 ? (
                        <div>
                          {pago.membresia.estudiantes.map((est, idx) => (
                            <div key={idx}>
                              {est.nombre} {est.apellido}
                            </div>
                          ))}
                        </div>
                      ) : pago.inscripcion ? (
                        <div>
                          {pago.inscripcion.estudiante.nombre} {pago.inscripcion.estudiante.apellido}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatMonto(pago.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(pago.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.mercadopago_payment_id || (
                        <span className="text-gray-400">Mock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
