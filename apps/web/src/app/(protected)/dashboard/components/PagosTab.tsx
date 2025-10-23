'use client';

import { useState, useEffect } from 'react';
import { getMisInscripciones } from '@/lib/api/tutor.api';
import type {
  MisInscripcionesResponse,
  InscripcionMensual,
  EstadoPago
} from '@/types/tutor-dashboard.types';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Info,
} from 'lucide-react';

/**
 * PagosTab - Tab de Pagos del Dashboard del Tutor
 *
 * Muestra las inscripciones mensuales (pagos mensuales) del tutor
 * con filtros por periodo y estado, y resumen financiero.
 */
export default function PagosTab() {
  const [data, setData] = useState<MisInscripcionesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoPago | ''>('');

  // Modal de detalle
  const [selectedInscripcion, setSelectedInscripcion] = useState<InscripcionMensual | null>(null);

  useEffect(() => {
    loadInscripciones();
  }, [selectedPeriodo, selectedEstado]);

  const loadInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { periodo?: string; estadoPago?: EstadoPago } = {};

      if (selectedPeriodo) {
        params.periodo = selectedPeriodo;
      }

      if (selectedEstado) {
        params.estadoPago = selectedEstado;
      }

      const response = await getMisInscripciones(params);
      setData(response);
    } catch (err) {
      console.error('Error loading inscripciones:', err);
      setError('Error al cargar los pagos. Por favor, intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatea un número como moneda argentina
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Formatea el periodo YYYY-MM a formato legible
   */
  const formatPeriodo = (periodo: string): string => {
    const [year, month] = periodo.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

  /**
   * Genera las opciones de periodo (últimos 6 meses)
   */
  const getPeriodosOptions = (): string[] => {
    const options: string[] = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const periodo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push(periodo);
    }

    return options;
  };

  /**
   * Renderiza el badge de estado con color
   */
  const renderEstadoBadge = (estado: EstadoPago) => {
    const config = {
      Pagado: {
        bg: 'bg-green-600',
        text: 'text-white',
        icon: CheckCircle,
        label: 'Pagado',
      },
      Pendiente: {
        bg: 'bg-yellow-600',
        text: 'text-white',
        icon: Clock,
        label: 'Pendiente',
      },
      Vencido: {
        bg: 'bg-red-600',
        text: 'text-white',
        icon: XCircle,
        label: 'Vencido',
      },
    };

    const { bg, text, icon: Icon, label } = config[estado];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-xl font-bold text-white mb-2">Error</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadInscripciones}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.inscripciones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-xl font-bold text-white mb-2">Sin pagos registrados</p>
          <p className="text-gray-400">
            {selectedPeriodo || selectedEstado
              ? 'No hay pagos con los filtros seleccionados. Intentá cambiar los filtros.'
              : 'Todavía no hay inscripciones mensuales registradas.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Resumen Financiero - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(data.resumen.totalPendiente)}</p>
          <p className="text-sm opacity-90">Total Pendiente</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(data.resumen.totalPagado)}</p>
          <p className="text-sm opacity-90">Total Pagado</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.resumen.cantidadInscripciones}</p>
          <p className="text-sm opacity-90">Inscripciones</p>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white shadow-lg">
          <User className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.resumen.estudiantesUnicos}</p>
          <p className="text-sm opacity-90">Estudiantes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Filtro por Periodo */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Periodo
            </label>
            <select
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-white"
            >
              <option value="">Todos los periodos</option>
              {getPeriodosOptions().map((periodo) => (
                <option key={periodo} value={periodo}>
                  {formatPeriodo(periodo)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value as EstadoPago | '')}
              className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-white"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagado">Pagado</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedPeriodo('');
                setSelectedEstado('');
              }}
              disabled={!selectedPeriodo && !selectedEstado}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Inscripciones - Scrollable */}
      <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-4 overflow-hidden flex flex-col">
        <h3 className="text-lg font-bold text-white mb-3">
          Inscripciones Mensuales ({data.inscripciones.length})
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3">
          {data.inscripciones.map((inscripcion) => (
            <div
              key={inscripcion.id}
              className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info de la Inscripción */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="bg-indigo-600 rounded-lg p-2 flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{inscripcion.productoNombre}</h4>
                      <p className="text-sm text-indigo-400 flex items-center gap-1.5 mt-1">
                        <User className="w-4 h-4" />
                        {inscripcion.estudianteNombre}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatPeriodo(inscripcion.periodo)}
                      </p>
                    </div>
                  </div>

                  {/* Descuentos Aplicados */}
                  {inscripcion.descuentosAplicados && inscripcion.descuentosAplicados.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {inscripcion.descuentosAplicados.map((descuento, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium flex items-center gap-1"
                        >
                          <TrendingUp className="w-3 h-3" />
                          {descuento.tipo} -{descuento.porcentaje}%
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botón Ver Detalle */}
                  <button
                    onClick={() => setSelectedInscripcion(inscripcion)}
                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    Ver detalle completo
                  </button>
                </div>

                {/* Precio y Estado */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-white">{formatCurrency(inscripcion.precioFinal)}</p>
                  <div className="mt-2">{renderEstadoBadge(inscripcion.estadoPago)}</div>
                  {inscripcion.fechaPago && (
                    <p className="text-xs text-gray-400 mt-2">
                      Pagado el {new Date(inscripcion.fechaPago).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedInscripcion && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedInscripcion(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold">Detalle de Inscripción</h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {formatPeriodo(selectedInscripcion.periodo)}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Info General */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-semibold text-gray-300">Producto:</span>
                    <span className="text-white">{selectedInscripcion.productoNombre}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-semibold text-gray-300">Estudiante:</span>
                    <span className="text-white">{selectedInscripcion.estudianteNombre}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-semibold text-gray-300">Periodo:</span>
                    <span className="text-white">{formatPeriodo(selectedInscripcion.periodo)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-semibold text-gray-300">Estado:</span>
                    {renderEstadoBadge(selectedInscripcion.estadoPago)}
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-semibold text-gray-300">Precio Final:</span>
                    <span className="text-2xl font-bold text-indigo-400">
                      {formatCurrency(selectedInscripcion.precioFinal)}
                    </span>
                  </div>
                </div>

                {/* Descuentos Aplicados */}
                {selectedInscripcion.descuentosAplicados && selectedInscripcion.descuentosAplicados.length > 0 && (
                  <div className="bg-green-900/20 rounded-xl p-4 border-2 border-green-600">
                    <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Descuentos Aplicados
                    </h3>
                    <div className="space-y-2">
                      {selectedInscripcion.descuentosAplicados.map((descuento, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">{descuento.tipo}:</span>
                          <span className="font-semibold text-green-400">
                            -{descuento.porcentaje}% ({formatCurrency(descuento.monto)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fechas */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <h3 className="font-bold text-white mb-3">Fechas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creada:</span>
                      <span className="text-white">
                        {new Date(selectedInscripcion.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    {selectedInscripcion.fechaVencimiento && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vencimiento:</span>
                        <span className="text-white">
                          {new Date(selectedInscripcion.fechaVencimiento).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                    {selectedInscripcion.fechaPago && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pagada:</span>
                        <span className="text-green-400 font-semibold">
                          {new Date(selectedInscripcion.fechaPago).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-800 rounded-b-2xl border-t border-gray-700">
                <button
                  onClick={() => setSelectedInscripcion(null)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
