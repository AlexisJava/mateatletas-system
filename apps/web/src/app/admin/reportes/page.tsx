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
  generateSystemReport,
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
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import type { Payload as TooltipPayload } from 'recharts/types/component/DefaultTooltipContent';
import type { ReporteAdmin } from '@/types/reportes.types';
import { useCasaDistribution } from '@/hooks/useCasaDistribution';
import { CASAS_CONFIG, CASA_NAMES, getCasaPercentage } from '@/lib/constants/casas-2026';

export default function AdminReportesPage() {
  const stats = useStats();
  const users = useUsers();
  const classes = useClasses();
  const fetchDashboard = useFetchDashboard();
  const fetchStats = useFetchStats();
  const fetchUsers = useFetchUsers();
  const fetchClasses = useFetchClasses();
  const isLoading = useStatsLoading();
  const { distribution: casaDistribution } = useCasaDistribution();
  const formatDateInput = (date: Date) => date.toISOString().substring(0, 10);
  const now = new Date();
  const [exportStatus, setExportStatus] = useState<{ success: boolean; message: string } | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: formatDateInput(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())),
    end: formatDateInput(now),
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchStats();
    fetchUsers();
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-hide export status after 5 seconds
  useEffect(() => {
    if (exportStatus) {
      const timer = setTimeout(() => setExportStatus(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
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
      result = exportToPDF(formattedData, `usuarios-${timestamp}`, 'Listado de Usuarios', [
        { header: 'Nombre', dataKey: 'Nombre' },
        { header: 'Email', dataKey: 'Email' },
        { header: 'Rol', dataKey: 'Rol' },
        { header: 'Registro', dataKey: 'Fecha de Registro' },
        { header: 'Estado', dataKey: 'Estado' },
      ]);
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
      result = exportToPDF(formattedData, `clases-${timestamp}`, 'Listado de Clases', [
        { header: 'Ruta', dataKey: 'Ruta Curricular' },
        { header: 'Docente', dataKey: 'Docente' },
        { header: 'Fecha', dataKey: 'Fecha' },
        { header: 'Hora', dataKey: 'Hora' },
        { header: 'Cupos', dataKey: 'Cupos Ocupados' },
        { header: 'Estado', dataKey: 'Estado' },
      ]);
    }

    setExportStatus(result);
  };

  const handleGenerateFullReport = async () => {
    const reporte: ReporteAdmin = {
      stats: stats ?? null,
      usuarios: users,
      clases: classes,
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  // Ensure arrays are valid before filtering
  const safeUsers = Array.isArray(users) ? users : [];
  const safeClasses = Array.isArray(classes) ? classes : [];

  // Filter data based on date range
  const filteredUsers = safeUsers.filter((u) => {
    const userDate = new Date(u.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include entire end date
    return userDate >= startDate && userDate <= endDate;
  });

  const filteredClasses = safeClasses.filter((c) => {
    const classDate = new Date(c.fecha_hora_inicio || c.fecha_hora_inicio);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return classDate >= startDate && classDate <= endDate;
  });

  const usersByRole = {
    tutores: filteredUsers.filter((u) => u.role === 'tutor').length,
    docentes: filteredUsers.filter((u) => u.role === 'docente').length,
    admins: filteredUsers.filter((u) => u.role === 'admin').length,
  };

  const classesByStatus = {
    programadas: filteredClasses.filter((c) => c.estado === 'Programada').length,
    canceladas: filteredClasses.filter((c) => c.estado === 'Cancelada').length,
  };

  // Prepare data for charts
  const roleDistributionData = [
    { name: 'Tutores', value: usersByRole.tutores, color: '#3b82f6' },
    { name: 'Docentes', value: usersByRole.docentes, color: '#a855f7' },
    { name: 'Administradores', value: usersByRole.admins, color: '#ef4444' },
  ];

  const classStatusData = [
    { name: 'Programadas', value: classesByStatus.programadas, color: '#10b981' },
    { name: 'Canceladas', value: classesByStatus.canceladas, color: '#ef4444' },
  ];

  // Simulate user growth over last 6 months (in production, this would come from backend)
  const userGrowthData = [
    { month: 'Ene', usuarios: Math.max(0, filteredUsers.length - 50) },
    { month: 'Feb', usuarios: Math.max(0, filteredUsers.length - 40) },
    { month: 'Mar', usuarios: Math.max(0, filteredUsers.length - 30) },
    { month: 'Abr', usuarios: Math.max(0, filteredUsers.length - 20) },
    { month: 'May', usuarios: Math.max(0, filteredUsers.length - 10) },
    { month: 'Jun', usuarios: filteredUsers.length },
  ];

  // Classes by curriculum route (filtered)
  const classesByRoute = filteredClasses.reduce(
    (acc, clase) => {
      const route = clase.ruta_curricular?.nombre ?? clase.rutaCurricular?.nombre ?? 'Sin Ruta';
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const routeData = Object.entries(classesByRoute).map(([name, value]) => ({
    name,
    clases: value,
  }));

  // Custom tooltip for charts
  type CustomTooltipProps = TooltipProps<number, string> & {
    active?: boolean;
    payload?: ReadonlyArray<TooltipPayload<number, string>>;
    label?: string | number;
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload) {
      return null;
    }

    const item = payload[0];
    if (!item) {
      return null;
    }

    const itemLabel = label ?? item.name ?? '';

    return (
      <div className="bg-[var(--admin-surface-1)] p-3 rounded-lg shadow-lg border border-[var(--admin-border)]">
        <p className="text-sm font-semibold text-[var(--admin-text)]">{itemLabel}</p>
        <p className="text-sm text-[var(--admin-text-muted)]">
          {item.name}: <span className="font-bold">{item.value}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Reportes y Analytics</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Visualizá métricas y estadísticas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="admin-btn admin-btn-secondary flex items-center gap-2"
        >
          <span>{showFilters ? '▲' : '▼'}</span>
          Filtros de Fecha
        </button>
      </div>

      {/* Date Range Filters */}
      {showFilters && (
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Rango de Fechas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:ring-2 focus:ring-[var(--admin-accent)]/50 focus:border-[var(--admin-accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:ring-2 focus:ring-[var(--admin-accent)]/50 focus:border-[var(--admin-accent)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                  setDateRange({
                    start: formatDateInput(startDate),
                    end: formatDateInput(new Date()),
                  });
                }}
                className="flex-1 admin-btn admin-btn-secondary text-sm"
              >
                Último Mes
              </button>
              <button
                onClick={() => {
                  const startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                  setDateRange({
                    start: formatDateInput(startDate),
                    end: formatDateInput(new Date()),
                  });
                }}
                className="flex-1 admin-btn admin-btn-secondary text-sm"
              >
                Últimos 6 Meses
              </button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-[var(--status-info-muted)] rounded-lg border border-[var(--status-info)]/30">
            <p className="text-sm text-[var(--status-info)]">
              <strong>Mostrando:</strong> {filteredUsers.length} usuarios y {filteredClasses.length}{' '}
              clases en el rango seleccionado
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
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold text-[var(--admin-text)] mb-4">
            Distribución de Usuarios por Rol
          </h3>
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
              <span className="text-sm text-[var(--admin-text-muted)]">
                Tutores: {usersByRole.tutores}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-sm text-[var(--admin-text-muted)]">
                Docentes: {usersByRole.docentes}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-[var(--admin-text-muted)]">
                Admins: {usersByRole.admins}
              </span>
            </div>
          </div>
        </div>

        {/* Classes Status - Pie Chart */}
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold text-[var(--admin-text)] mb-4">Estado de Clases</h3>
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
              <span className="text-sm text-[var(--admin-text-muted)]">
                Programadas: {classesByStatus.programadas}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-[var(--admin-text-muted)]">
                Canceladas: {classesByStatus.canceladas}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Casas 2026 - Bar Chart */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[var(--admin-text)]">
            Distribución de Estudiantes por Casa 2026
          </h3>
          <div className="flex items-center gap-2">
            {(['Quantum', 'Vertex', 'Pulsar'] as const).map((casa) => (
              <div key={casa} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CASAS_CONFIG[casa].color }}
                />
                <span className="text-xs text-[var(--admin-text-muted)]">{casa}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              {
                name: 'Quantum',
                estudiantes: casaDistribution.Quantum,
                fill: CASAS_CONFIG.Quantum.color,
              },
              {
                name: 'Vertex',
                estudiantes: casaDistribution.Vertex,
                fill: CASAS_CONFIG.Vertex.color,
              },
              {
                name: 'Pulsar',
                estudiantes: casaDistribution.Pulsar,
                fill: CASAS_CONFIG.Pulsar.color,
              },
              { name: 'Sin Casa', estudiantes: casaDistribution.SinCasa, fill: '#6b7280' },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="name" stroke="var(--admin-text-muted)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--admin-text-muted)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="estudiantes" name="Estudiantes" radius={[8, 8, 0, 0]}>
              {[
                CASAS_CONFIG.Quantum.color,
                CASAS_CONFIG.Vertex.color,
                CASAS_CONFIG.Pulsar.color,
                '#6b7280',
              ].map((color, index) => (
                <Cell key={`casa-cell-${index}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CASA_NAMES.map((casa) => {
            const config = CASAS_CONFIG[casa];
            const count = casaDistribution[casa];
            const percentage = getCasaPercentage(casaDistribution, casa);

            return (
              <div
                key={casa}
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${config.color}10` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{config.emoji}</span>
                  <span className="font-semibold text-sm" style={{ color: config.color }}>
                    {casa}
                  </span>
                </div>
                <div className="text-xl font-bold text-[var(--admin-text)]">{count}</div>
                <div className="text-xs text-[var(--admin-text-muted)]">
                  {percentage}% - {config.descripcion}
                </div>
              </div>
            );
          })}
          <div className="p-3 rounded-lg bg-[var(--admin-surface-2)]">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-[var(--admin-text-muted)]">Sin Casa</span>
            </div>
            <div className="text-xl font-bold text-[var(--admin-text)]">
              {casaDistribution.SinCasa}
            </div>
            <div className="text-xs text-[var(--admin-text-muted)]">Estudiantes sin asignar</div>
          </div>
        </div>
      </div>

      {/* User Growth Trend - Line Chart */}
      <div className="admin-card p-6">
        <h3 className="text-xl font-bold text-[var(--admin-text)] mb-4">
          Crecimiento de Usuarios (Últimos 6 Meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="month" stroke="var(--admin-text-muted)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--admin-text-muted)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} iconType="line" />
            <Line
              type="monotone"
              dataKey="usuarios"
              stroke="var(--admin-accent)"
              strokeWidth={3}
              dot={{ fill: 'var(--admin-accent)', r: 6 }}
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
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold text-[var(--admin-text)] mb-4">
            Clases por Ruta Curricular
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--admin-text-muted)"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="var(--admin-text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
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
      <div className="admin-card p-6">
        <h3 className="text-xl font-bold text-[var(--admin-text)] mb-6">
          Resumen Ejecutivo (Rango Seleccionado)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--admin-text)]">
              {classesByStatus.programadas}
            </div>
            <div className="text-sm text-[var(--admin-text-muted)] mt-1">Clases Programadas</div>
          </div>

          <div className="text-center p-4 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--admin-text)]">{usersByRole.tutores}</div>
            <div className="text-sm text-[var(--admin-text-muted)] mt-1">Tutores</div>
          </div>

          <div className="text-center p-4 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--admin-text)]">
              {filteredUsers.length}
            </div>
            <div className="text-sm text-[var(--admin-text-muted)] mt-1">Total Usuarios</div>
          </div>

          <div className="text-center p-4 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--admin-text)]">
              {filteredClasses.length > 0
                ? ((classesByStatus.programadas / filteredClasses.length) * 100).toFixed(0)
                : 0}
              %
            </div>
            <div className="text-sm text-[var(--admin-text-muted)] mt-1">
              Tasa de Clases Activas
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="admin-card p-8 bg-gradient-to-br from-[var(--admin-surface-1)] to-[var(--admin-surface-2)]">
        <h3 className="text-2xl font-bold text-[var(--admin-text)] mb-2">Exportar Reportes</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-6">
          Descargá reportes detallados en diferentes formatos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exportar Usuarios */}
          <div className="bg-[var(--admin-surface-2)] rounded-lg p-4 border border-[var(--admin-border)]">
            <h4 className="font-bold text-[var(--admin-text)] mb-3 flex items-center gap-2">
              <span>👥</span> Usuarios
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExportUsers('excel')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExportUsers('csv')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExportUsers('pdf')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📕 PDF
              </button>
            </div>
          </div>

          {/* Exportar Clases */}
          <div className="bg-[var(--admin-surface-2)] rounded-lg p-4 border border-[var(--admin-border)]">
            <h4 className="font-bold text-[var(--admin-text)] mb-3 flex items-center gap-2">
              <span>📚</span> Clases
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExportClasses('excel')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExportClasses('csv')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExportClasses('pdf')}
                className="admin-btn admin-btn-secondary text-sm"
              >
                📕 PDF
              </button>
            </div>
          </div>

          {/* Reporte Completo */}
          <div className="bg-[var(--admin-surface-2)] rounded-lg p-4 border border-[var(--admin-border)]">
            <h4 className="font-bold text-[var(--admin-text)] mb-3 flex items-center gap-2">
              <span>📈</span> Reporte Completo
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleGenerateFullReport}
                className="admin-btn admin-btn-primary text-sm"
              >
                🎯 Generar PDF Completo
              </button>
              <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                Incluye todos los datos del sistema
              </p>
            </div>
          </div>
        </div>

        {exportStatus && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              exportStatus.success
                ? 'bg-[var(--status-success-muted)] border border-[var(--status-success)]/30'
                : 'bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30'
            }`}
          >
            <p
              className={`text-sm font-semibold ${exportStatus.success ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}
            >
              {exportStatus.success ? '✅' : '❌'} {exportStatus.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
