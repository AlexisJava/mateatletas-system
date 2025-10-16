'use client';

import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { motion } from 'framer-motion';
import { getReportesDocente, ReportesDocente } from '@/lib/api/asistencia.api';
import { LoadingSpinner } from '@/components/effects';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function DocenteReportesPage() {
  const [reportes, setReportes] = useState<ReportesDocente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setIsLoading(true);
      const data = await getReportesDocente();
      setReportes(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar reportes'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !reportes) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'No se pudieron cargar los reportes'}</p>
      </div>
    );
  }

  // Preparar datos para gráfico de asistencia semanal
  const semanasLabels = Object.keys(reportes.asistencia_semanal).reverse();
  const dataAsistenciaSemanal = {
    labels: semanasLabels,
    datasets: [
      {
        label: 'Presentes',
        data: semanasLabels.map((sem) => reportes.asistencia_semanal[sem].presentes),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Ausentes',
        data: semanasLabels.map((sem) => reportes.asistencia_semanal[sem].ausentes),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const opcionesAsistenciaSemanal: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Asistencia Semanal (Últimas 8 Semanas)',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Preparar datos para gráfico de torta (estados)
  const dataTorta = {
    labels: ['Presentes', 'Ausentes', 'Justificados'],
    datasets: [
      {
        data: [
          reportes.estadisticas_globales.total_presentes,
          reportes.estadisticas_globales.total_ausentes,
          reportes.estadisticas_globales.total_justificados,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const opcionesTorta: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribución de Estados',
        font: { size: 16, weight: 'bold' },
      },
    },
  };

  // Preparar datos para gráfico de líneas por ruta
  const dataLineasRutas = {
    labels: reportes.por_ruta_curricular.map((r) => r.ruta),
    datasets: [
      {
        label: 'Porcentaje de Asistencia',
        data: reportes.por_ruta_curricular.map((r) => parseFloat(r.porcentaje)),
        borderColor: 'rgb(255, 107, 53)',
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const opcionesLineasRutas: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Asistencia por Ruta Curricular (%)',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Asistencia</h1>
          <p className="text-gray-600 mt-1">
            Análisis y estadísticas de tus clases
          </p>
        </div>

        {/* Cards de estadísticas globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Registros */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Registros</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reportes.estadisticas_globales.total_registros}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </motion.div>

          {/* Presentes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Presentes</p>
                <p className="text-3xl font-bold text-green-600">
                  {reportes.estadisticas_globales.total_presentes}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </motion.div>

          {/* Ausentes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ausentes</p>
                <p className="text-3xl font-bold text-red-600">
                  {reportes.estadisticas_globales.total_ausentes}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </motion.div>

          {/* Porcentaje Global */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">% Asistencia</p>
                <p className="text-3xl font-bold text-[#ff6b35]">
                  {reportes.estadisticas_globales.porcentaje_asistencia.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de barras - Asistencia semanal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div style={{ height: '350px' }} data-testid="chart-asistencia-semanal">
              <Bar data={dataAsistenciaSemanal} options={opcionesAsistenciaSemanal} />
            </div>
          </motion.div>

          {/* Gráfico de torta - Distribución */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div style={{ height: '350px' }} data-testid="chart-distribucion-estados">
              <Doughnut data={dataTorta} options={opcionesTorta} />
            </div>
          </motion.div>
        </div>

        {/* Gráfico de líneas - Por ruta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div style={{ height: '300px' }} data-testid="chart-lineas-rutas">
            <Line data={dataLineasRutas} options={opcionesLineasRutas} />
          </div>
        </motion.div>

        {/* Tabla de Top Estudiantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              🏆 Top 10 Estudiantes Más Frecuentes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Estudiantes con mayor asistencia a tus clases
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencias
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.top_estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No hay datos de estudiantes aún
                    </td>
                  </tr>
                ) : (
                  reportes.top_estudiantes.map((estudiante, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {estudiante.foto_url ? (
                            <img
                              src={estudiante.foto_url}
                              alt={estudiante.nombre}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7b801] flex items-center justify-center text-white font-bold mr-3">
                              {estudiante.nombre.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {estudiante.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {estudiante.asistencias} clases
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Tabla de Asistencia por Ruta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              📚 Asistencia por Ruta Curricular
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Porcentaje de asistencia en cada ruta
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta Curricular
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presentes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.por_ruta_curricular.map((ruta, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: ruta.color }}
                        />
                        <span className="font-medium text-gray-900">{ruta.ruta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                      {ruta.presentes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                      {ruta.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(ruta.porcentaje) >= 80
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(ruta.porcentaje) >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ruta.porcentaje}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
