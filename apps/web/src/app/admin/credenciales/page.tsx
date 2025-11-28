'use client';

import { useEffect, useState } from 'react';
import { Download, Search, Key, Eye, EyeOff, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { exportToExcel, exportToCSV, exportToPDF } from '@/lib/utils/export.utils';

interface CredencialUsuario {
  id: string;
  rol: 'Tutor' | 'Estudiante' | 'Docente';
  nombre: string;
  apellido: string;
  usuario: string;
  password_temporal: string | null;
  estado: 'Pendiente' | 'Contraseña Cambiada';
  fecha_creacion: string;
  tutor?: string; // Solo para estudiantes
}

type FilterRole = 'Todos' | 'Tutor' | 'Estudiante' | 'Docente';
type FilterStatus = 'Todos' | 'Pendiente' | 'Contraseña Cambiada';

export default function CredencialesPage() {
  const [tutores, setTutores] = useState<CredencialUsuario[]>([]);
  const [estudiantes, setEstudiantes] = useState<CredencialUsuario[]>([]);
  const [docentes, setDocentes] = useState<CredencialUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filterRole, setFilterRole] = useState<FilterRole>('Todos');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // UI States
  const [showPasswords, setShowPasswords] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<{ id: string; password: string } | null>(null);

  useEffect(() => {
    loadCredenciales();
  }, []);

  const loadCredenciales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // El interceptor ya retorna response.data directamente
      const data = await apiClient.get<{
        tutores: CredencialUsuario[];
        estudiantes: CredencialUsuario[];
        docentes: CredencialUsuario[];
      }>('/admin/credenciales');
      setTutores(data.tutores || []);
      setEstudiantes(data.estudiantes || []);
      setDocentes(data.docentes || []);
    } catch (err) {
      setError(getErrorMessage(err as Error, 'Error al cargar credenciales'));
    } finally {
      setIsLoading(false);
    }
  };

  // Combinar todos los usuarios
  const todosLosUsuarios = [...tutores, ...estudiantes, ...docentes];

  // Aplicar filtros
  const usuariosFiltrados = todosLosUsuarios.filter((usuario) => {
    // Filtro por rol
    if (filterRole !== 'Todos' && usuario.rol !== filterRole) return false;

    // Filtro por estado
    if (filterStatus !== 'Todos' && usuario.estado !== filterStatus) return false;

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
      const usuarioLower = usuario.usuario.toLowerCase();
      if (!nombreCompleto.includes(searchLower) && !usuarioLower.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const handleCopyPassword = (password: string, id: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = async (usuarioId: string, rol: string) => {
    if (
      !confirm(
        '¿Estás seguro de resetear la contraseña de este usuario? Se generará una nueva contraseña temporal.',
      )
    ) {
      return;
    }

    try {
      setResettingId(usuarioId);
      const tipoUsuario = rol.toLowerCase() as 'tutor' | 'estudiante' | 'docente';

      const response = await apiClient.post<{ password_temporal?: string }>(
        `/admin/credenciales/${usuarioId}/reset`,
        {
          tipoUsuario,
        },
      );

      const nuevaPassword = response.password_temporal ?? '';

      // Mostrar nueva contraseña
      setResetSuccess({ id: usuarioId, password: nuevaPassword });

      // Auto-copiar al clipboard
      if (response.password_temporal) {
        navigator.clipboard.writeText(response.password_temporal);
      }

      // Recargar credenciales
      await loadCredenciales();

      // Limpiar después de 10 segundos
      setTimeout(() => setResetSuccess(null), 10000);
    } catch (err) {
      alert(getErrorMessage(err as Error, 'Error al resetear contraseña'));
    } finally {
      setResettingId(null);
    }
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = usuariosFiltrados.map((u) => ({
      Rol: u.rol,
      Nombre: u.nombre,
      Apellido: u.apellido,
      Usuario: u.usuario,
      'Contraseña Temporal': u.password_temporal || 'N/A',
      Estado: u.estado,
      ...(u.tutor ? { Tutor: u.tutor } : {}),
      'Fecha de Creación': new Date(u.fecha_creacion).toLocaleDateString('es-AR'),
    }));

    switch (format) {
      case 'excel':
        exportToExcel(formattedData, 'credenciales');
        break;
      case 'csv':
        exportToCSV(formattedData, 'credenciales');
        break;
      case 'pdf':
        exportToPDF(formattedData, 'credenciales', 'Credenciales de Usuarios', [
          { header: 'Rol', dataKey: 'Rol' },
          { header: 'Nombre', dataKey: 'Nombre' },
          { header: 'Usuario', dataKey: 'Usuario' },
          { header: 'Contraseña', dataKey: 'Contraseña Temporal' },
          { header: 'Estado', dataKey: 'Estado' },
        ]);
        break;
    }

    setShowExportMenu(false);
  };

  // Contadores
  const counts = {
    total: todosLosUsuarios.length,
    tutores: tutores.length,
    estudiantes: estudiantes.length,
    docentes: docentes.length,
    pendientes: todosLosUsuarios.filter((u) => u.estado === 'Pendiente').length,
    cambiadas: todosLosUsuarios.filter((u) => u.estado === 'Contraseña Cambiada').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Key className="w-8 h-8 text-amber-400" />
            Credenciales de Acceso
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Gestión de credenciales de primer ingreso para todos los usuarios
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="px-4 py-2 backdrop-blur-xl bg-purple-500/[0.08] border border-purple-500/30 hover:bg-purple-500/20 text-white/90 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? 'Ocultar' : 'Mostrar'} Contraseñas
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 hover:bg-emerald-500/20 text-white/90 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl shadow-2xl shadow-emerald-500/20 border border-emerald-500/30 overflow-hidden z-20">
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-green-500/20 transition-all text-sm font-medium border-b border-emerald-500/20"
                >
                  📊 Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-blue-500/20 transition-all text-sm font-medium border-b border-emerald-500/20"
                >
                  📄 CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                  📕 PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advertencia de Seguridad */}
      <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-amber-200 font-bold mb-1">Advertencia de Seguridad</h3>
            <p className="text-amber-200/80 text-sm">
              Esta planilla muestra contraseñas temporales en texto plano para facilitar el primer
              ingreso. Las contraseñas se eliminan automáticamente cuando el usuario cambia su
              contraseña.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.08] rounded-xl border border-blue-500/20 p-4 shadow-lg shadow-blue-500/10">
          <p className="text-blue-300 text-xs font-semibold mb-1">Total</p>
          <p className="text-3xl font-black text-white">{counts.total}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/[0.08] to-indigo-500/[0.08] rounded-xl border border-purple-500/20 p-4 shadow-lg shadow-purple-500/10">
          <p className="text-purple-300 text-xs font-semibold mb-1">Tutores</p>
          <p className="text-3xl font-black text-white">{counts.tutores}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.08] rounded-xl border border-emerald-500/20 p-4 shadow-lg shadow-emerald-500/10">
          <p className="text-emerald-300 text-xs font-semibold mb-1">Estudiantes</p>
          <p className="text-3xl font-black text-white">{counts.estudiantes}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/[0.08] to-amber-500/[0.08] rounded-xl border border-orange-500/20 p-4 shadow-lg shadow-orange-500/10">
          <p className="text-orange-300 text-xs font-semibold mb-1">Docentes</p>
          <p className="text-3xl font-black text-white">{counts.docentes}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/[0.08] to-amber-500/[0.08] rounded-xl border border-yellow-500/20 p-4 shadow-lg shadow-yellow-500/10">
          <p className="text-yellow-300 text-xs font-semibold mb-1">Pendientes</p>
          <p className="text-3xl font-black text-white">{counts.pendientes}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/[0.08] to-emerald-500/[0.08] rounded-xl border border-green-500/20 p-4 shadow-lg shadow-green-500/10">
          <p className="text-green-300 text-xs font-semibold mb-1">Cambiadas</p>
          <p className="text-3xl font-black text-white">{counts.cambiadas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl border border-emerald-500/20 p-4 shadow-lg shadow-emerald-500/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Rol */}
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Filtrar por Rol</label>
            <div className="flex gap-2 flex-wrap">
              {(['Todos', 'Tutor', 'Estudiante', 'Docente'] as FilterRole[]).map((rol) => (
                <button
                  key={rol}
                  onClick={() => setFilterRole(rol)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    filterRole === rol
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                      : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
                  }`}
                >
                  {rol}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">
              Filtrar por Estado
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['Todos', 'Pendiente', 'Contraseña Cambiada'] as FilterStatus[]).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFilterStatus(estado)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    filterStatus === estado
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                      : 'backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white/70 hover:bg-emerald-500/20'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, apellido o usuario..."
                className="w-full pl-10 pr-4 py-2 backdrop-blur-xl bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-400 mb-4"></div>
          <p className="text-white/60 font-medium">Cargando credenciales...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-red-300 mb-2">Error</h3>
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-500/20">
              <thead className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Contraseña Temporal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-white/40">
                        No se encontraron usuarios con los filtros seleccionados
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-emerald-500/[0.08] transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            usuario.rol === 'Tutor'
                              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                              : usuario.rol === 'Estudiante'
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                : 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                          }`}
                        >
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        {usuario.tutor && (
                          <div className="text-xs text-white/50 mt-1">Tutor: {usuario.tutor}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-mono">
                        {usuario.usuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {usuario.password_temporal ? (
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1 bg-black/30 rounded-lg border border-emerald-500/20 text-emerald-300 font-mono text-sm font-semibold">
                              {showPasswords ? usuario.password_temporal : '••••••••'}
                            </code>
                            <button
                              onClick={() =>
                                handleCopyPassword(usuario.password_temporal!, usuario.id)
                              }
                              className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-all"
                              title="Copiar contraseña"
                            >
                              {copiedId === usuario.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white/60" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            usuario.estado === 'Pendiente'
                              ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                              : 'bg-green-500/20 border border-green-500/30 text-green-300'
                          }`}
                        >
                          {usuario.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(usuario.fecha_creacion).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleResetPassword(usuario.id, usuario.rol)}
                          disabled={resettingId === usuario.id}
                          className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resetear contraseña"
                        >
                          {resettingId === usuario.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Reseteando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Resetear
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alert de Reseteo Exitoso */}
      {resetSuccess && (
        <div className="fixed bottom-6 right-6 backdrop-blur-xl bg-green-500/20 border border-green-500/30 rounded-xl p-6 shadow-2xl shadow-green-500/20 z-50 max-w-md">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-green-300 font-bold mb-2">¡Contraseña Reseteada!</h4>
              <p className="text-green-200/80 text-sm mb-3">
                Nueva contraseña temporal generada y copiada al portapapeles:
              </p>
              <code className="block px-3 py-2 bg-black/30 rounded-lg border border-green-500/20 text-green-300 font-mono text-sm font-semibold break-all">
                {resetSuccess.password}
              </code>
              <p className="text-green-200/60 text-xs mt-2">
                El usuario deberá cambiar esta contraseña en su próximo login
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      {!isLoading && !error && usuariosFiltrados.length > 0 && (
        <div className="text-center text-white/60 text-sm">
          Mostrando {usuariosFiltrados.length} de {todosLosUsuarios.length} usuarios
        </div>
      )}
    </div>
  );
}
