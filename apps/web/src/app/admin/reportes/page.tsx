'use client';

import { useEffect, useState } from 'react';
import { useStats, useFetchStats, useStatsLoading } from '@/features/admin/stats';
import { useUsers, useFetchUsers } from '@/features/admin/users';
import { useClasses, useFetchClasses } from '@/features/admin/classes';
import { useFetchDashboard } from '@/features/admin/dashboard';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatUsersForExport,
  formatClassesForExport,
  generateSystemReport
} from '@/lib/utils/export.utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { ReporteAdmin } from '@/types/reportes.types';

export default function AdminReportesPage() {
  const stats = useStats();
  const users = useUsers();
  const classes = useClasses();
  const fetchDashboard = useFetchDashboard();
  const fetchStats = useFetchStats();
  const fetchUsers = useFetchUsers();
  const fetchClasses = useFetchClasses();
  const isLoading = useStatsLoading();
  const [exportStatus, setExportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchStats();
    fetchUsers();
    fetchClasses();
  }, []);

  // Auto-hide export status after 5 seconds
  useEffect(() => {
    if (exportStatus) {
      const timer = setTimeout(() => setExportStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [exportStatus]);

  const handleExportUsers = async (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatUsersForExport(users);
    const timestamp = new Date().getTime();
    let result;

    if (format === 'excel') {
      result = exportToExcel(formattedData, `usuarios-${timestamp}`, 'Usuarios');
    } else if (format === 'csv') {
      result = exportToCSV(formattedData, `usuarios-${timestamp}`);
    } else {
      result = exportToPDF(
        formattedData,
        `usuarios-${timestamp}`,
        'Listado de Usuarios',
        [
          { header: 'Nombre', dataKey: 'Nombre' },
          { header: 'Email', dataKey: 'Email' },
          { header: 'Rol', dataKey: 'Rol' },
          { header: 'Registro', dataKey: 'Fecha de Registro' },
          { header: 'Estado', dataKey: 'Estado' }
        ]
      );
    }

    setExportStatus(result);
  };

  const handleExportClasses = async (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatClassesForExport(classes);
    const timestamp = new Date().getTime();
    let result;

    if (format === 'excel') {
      result = exportToExcel(formattedData, `clases-${timestamp}`, 'Clases');
    } else if (format === 'csv') {
      result = exportToCSV(formattedData, `clases-${timestamp}`);
    } else {
      result = exportToPDF(
        formattedData,
        `clases-${timestamp}`,
        'Listado de Clases',
        [
          { header: 'Ruta', dataKey: 'Ruta Curricular' },
          { header: 'Docente', dataKey: 'Docente' },
          { header: 'Fecha', dataKey: 'Fecha' },
          { header: 'Hora', dataKey: 'Hora' },
          { header: 'Cupos', dataKey: 'Cupos Ocupados' },
          { header: 'Estado', dataKey: 'Estado' }
        ]
      );
    }

    setExportStatus(result);
  };

  const handleGenerateFullReport = async () => {
    const reporte: ReporteAdmin = {
      stats,
      usuarios: users,
      classes,
      productos: [],
      fechaInicio: dateRange.start,
      fechaFin: dateRange.end,
    };

    const result = generateSystemReport({
      users: formatUsersForExport(reporte.usuarios),
      classes: formatClassesForExport(reporte.clases),
      products: [], // Will be added when products page is complete
      stats: reporte.stats || {},
    });

    setExportStatus(result);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
        <p className="mt-4 text-gray-600">Cargando reportes...</p>
      </div>
    );
  }

  // Filter data based on date range
  const filteredUsers = users.filter(u => {
    const userDate = new Date(u.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include entire end date
    return userDate >= startDate && userDate <= endDate;
  });

  const filteredClasses = classes.filter((c) => {
    const classDate = new Date(c.fecha_hora_inicio || c.fecha_hora_inicio);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return classDate >= startDate && classDate <= endDate;
  });

  const usersByRole = {
    tutores: filteredUsers.filter(u => u.role === 'tutor').length,
    docentes: filteredUsers.filter(u => u.role === 'docente').length,
    admins: filteredUsers.filter(u => u.role === 'admin').length,
  };

  const classesByStatus = {
    programadas: filteredClasses.filter((c) => c.estado === 'Programada').length,
    canceladas: filteredClasses.filter((c) => c.estado === 'Cancelada').length,
  };

  // Prepare data for charts
  const roleDistributionData = [
    { name: 'Tutores', value: usersByRole.tutores, color: '#3b82f6' },
    { name: 'Docentes', value: usersByRole.docentes, color: '#a855f7' },
    { name: 'Administradores', value: usersByRole.admins, color: '#ef4444' }
  ];

  const classStatusData = [
    { name: 'Programadas', value: classesByStatus.programadas, color: '#10b981' },
    { name: 'Canceladas', value: classesByStatus.canceladas, color: '#ef4444' }
  ];

  // Simulate user growth over last 6 months (in production, this would come from backend)
  const userGrowthData = [
    { month: 'Ene', usuarios: Math.max(0, filteredUsers.length - 50) },
    { month: 'Feb', usuarios: Math.max(0, filteredUsers.length - 40) },
    { month: 'Mar', usuarios: Math.max(0, filteredUsers.length - 30) },
    { month: 'Abr', usuarios: Math.max(0, filteredUsers.length - 20) },
    { month: 'May', usuarios: Math.max(0, filteredUsers.length - 10) },
    { month: 'Jun', usuarios: filteredUsers.length }
  ];

  // Classes by curriculum route (filtered)
  const classesByRoute = filteredClasses.reduce((acc, clase) => {
    const route =
      clase.ruta_curricular?.nombre ??
      clase.rutaCurricular?.nombre ??
      'Sin Ruta';
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const routeData = Object.entries(classesByRoute).map(([name, value]) => ({
    name,
    clases: value
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-emerald-500/[0.05] p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-[#2a1a5e]">{label || payload[0]?.name}</p>
          <p className="text-sm text-gray-600">
            {payload[0]?.name}: <span className="font-bold">{payload[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#2a1a5e]">Reportes y Analytics</h1>
          <p className="text-gray-600 mt-1">Visualizá métricas y estadísticas del sistema</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#f7b801] transition-colors font-semibold flex items-center gap-2"
        >
          <span>{showFilters ? '🔼' : '🔽'}</span>
          Filtros de Fecha
        </button>
      </div>

      {/* Date Range Filters */}
      {showFilters && (
        <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6 border-2 border-[#ff6b35]">
          <h3 className="text-lg font-bold text-[#2a1a5e] mb-4">Rango de Fechas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange({
                  start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                })}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Último Mes
              </button>
              <button
                onClick={() => setDateRange({
                  start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                })}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Últimos 6 Meses
              </button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Mostrando:</strong> {filteredUsers.length} usuarios y {filteredClasses.length} clases en el rango seleccionado
            </p>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90">Usuarios en Rango</div>
          <div className="text-4xl font-bold mt-2">{filteredUsers.length}</div>
          <div className="text-xs opacity-75 mt-1">Total sistema: {users.length}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90">Docentes en Rango</div>
          <div className="text-4xl font-bold mt-2">{usersByRole.docentes}</div>
          <div className="text-xs opacity-75 mt-1">Profesores registrados</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90">Tutores en Rango</div>
          <div className="text-4xl font-bold mt-2">{usersByRole.tutores}</div>
          <div className="text-xs opacity-75 mt-1">Padres/Tutores registrados</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90">Clases en Rango</div>
          <div className="text-4xl font-bold mt-2">{filteredClasses.length}</div>
          <div className="text-xs opacity-75 mt-1">Total sistema: {classes.length}</div>
        </div>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Distribution - Pie Chart */}
        <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">Distribución de Usuarios por Rol</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const percent = (props as { percent?: number }).percent || 0;
                  const name = (props as { name?: string }).name || '';
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Tutores: {usersByRole.tutores}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Docentes: {usersByRole.docentes}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Admins: {usersByRole.admins}</span>
            </div>
          </div>
        </div>

        {/* Classes Status - Pie Chart */}
        <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">Estado de Clases</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const percent = (props as { percent?: number }).percent || 0;
                  const name = (props as { name?: string }).name || '';
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {classStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Programadas: {classesByStatus.programadas}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Canceladas: {classesByStatus.canceladas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Trend - Line Chart */}
      <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">Crecimiento de Usuarios (Últimos 6 Meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="usuarios"
              stroke="#ff6b35"
              strokeWidth={3}
              dot={{ fill: '#ff6b35', r: 6 }}
              activeDot={{ r: 8 }}
              name="Usuarios"
              animationBegin={0}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Classes by Curriculum Route - Bar Chart */}
      {routeData.length > 0 && (
        <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">Clases por Ruta Curricular</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
              />
              <Bar
                dataKey="clases"
                fill="#8b5cf6"
                name="Clases"
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="bg-emerald-500/[0.05] rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-[#2a1a5e] mb-6">Resumen Ejecutivo (Rango Seleccionado)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#2a1a5e]">{classesByStatus.programadas}</div>
            <div className="text-sm text-gray-600 mt-1">Clases Programadas</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#2a1a5e]">{usersByRole.tutores}</div>
            <div className="text-sm text-gray-600 mt-1">Tutores</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#2a1a5e]">{filteredUsers.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Usuarios</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#2a1a5e]">
              {filteredClasses.length > 0 ? ((classesByStatus.programadas / filteredClasses.length) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Tasa de Clases Activas</div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-br from-[#2a1a5e] to-[#4a3a7e] rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Exportar Reportes</h3>
        <p className="text-sm opacity-90 mb-4">
          Descargá reportes detallados en diferentes formatos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exportar Usuarios */}
          <div className="bg-emerald-500/[0.05]/10 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>👥</span> Usuarios
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExportUsers('excel')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExportUsers('csv')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExportUsers('pdf')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📕 PDF
              </button>
            </div>
          </div>

          {/* Exportar Clases */}
          <div className="bg-emerald-500/[0.05]/10 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>📚</span> Clases
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExportClasses('excel')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExportClasses('csv')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExportClasses('pdf')}
                className="px-4 py-2 bg-emerald-500/[0.05]/20 hover:bg-emerald-500/[0.05]/30 rounded-lg font-semibold transition-all text-sm"
              >
                📕 PDF
              </button>
            </div>
          </div>

          {/* Reporte Completo */}
          <div className="bg-emerald-500/[0.05]/10 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>📈</span> Reporte Completo
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleGenerateFullReport}
                className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#f7b801] hover:opacity-90 rounded-lg font-semibold transition-all text-sm"
              >
                🎯 Generar PDF Completo
              </button>
              <p className="text-xs opacity-75 mt-2">
                Incluye todos los datos del sistema
              </p>
            </div>
          </div>
        </div>

        {exportStatus && (
          <div className={`mt-4 p-3 rounded-lg ${
            exportStatus.success ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <p className="text-sm font-semibold">
              {exportStatus.success ? '✅' : '❌'} {exportStatus.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
