'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import { AdminUser } from '@/types/admin.types';
import { docentesApi, CreateDocenteData, Docente } from '@/lib/api/docentes.api';
import { createAdmin, CreateAdminData } from '@/lib/api/admin.api';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatUsersForExport
} from '@/lib/utils/export.utils';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { Users, GraduationCap, Crown, Plus, Download, Eye, Trash2, UserCog, X } from 'lucide-react';
import CreateDocenteForm from '@/components/admin/CreateDocenteForm';
import ViewEditDocenteModal from '@/components/admin/ViewEditDocenteModal';
import MultiRoleModal from '@/components/admin/MultiRoleModal';

type TabType = 'tutores' | 'estudiantes' | 'personal';
type ModalType = 'delete' | 'roles' | 'view' | 'viewDocente' | 'createDocente' | 'createAdmin' | 'reassignClasses' | null;

export default function UsuariosPage() {
  const { users, fetchUsers, deleteUser, isLoading, error } = useAdminStore();
  const [activeTab, setActiveTab] = useState<TabType>('tutores');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [clasesCount, setClasesCount] = useState<number>(0);
  const [docentesDisponibles, setDocentesDisponibles] = useState<Docente[]>([]);
  const [targetDocenteId, setTargetDocenteId] = useState<string>('');

  // Form states para crear Admin
  const [adminForm, setAdminForm] = useState<CreateAdminData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios según el tab activo
  const tutores = users.filter(u => u.role === 'tutor');
  const estudiantes: AdminUser[] = []; // TODO: Agregar endpoint para estudiantes
  const personal = users.filter(u => u.role === 'docente' || u.role === 'admin');

  const displayedUsers = activeTab === 'tutores' ? tutores : activeTab === 'estudiantes' ? estudiantes : personal;

  const roleColors: Record<string, string> = {
    admin: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white',
    docente: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    tutor: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    docente: 'Docente',
    tutor: 'Tutor',
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteError(null);
    setFormLoading(true);

    try {
      const success = await deleteUser(selectedUser.id);
      if (success) {
        setModalType(null);
        setSelectedUser(null);
      }
    } catch (error: any) {
      // Detectar error de clases asignadas
      const errorMsg = error?.response?.data?.errorMessage || error?.response?.data?.message || error?.message || 'Error al eliminar usuario';

      if (errorMsg.includes('clase(s) asignada(s)')) {
        // Extraer número de clases del mensaje
        const match = errorMsg.match(/(\d+) clase\(s\)/);
        const numClases = match ? parseInt(match[1]) : 0;
        setClasesCount(numClases);
        setDeleteError(errorMsg);

        // Cargar docentes disponibles para reasignación
        try {
          const docentes = await docentesApi.getAll();
          setDocentesDisponibles(docentes.filter((d: Docente) => d.id !== selectedUser.id));
        } catch (err) {
          console.error('Error loading docentes:', err);
        }
      } else {
        setDeleteError(errorMsg);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleReassignClasses = async () => {
    if (!selectedUser || !targetDocenteId) return;
    setFormLoading(true);
    setDeleteError(null);

    try {
      await docentesApi.reassignClasses(selectedUser.id, targetDocenteId);
      // Ahora sí intentar eliminar
      const success = await deleteUser(selectedUser.id);
      if (success) {
        setModalType(null);
        setSelectedUser(null);
        setTargetDocenteId('');
      }
    } catch (error: any) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateDocente = async (data: CreateDocenteData, sectores: string[]) => {
    setFormLoading(true);
    setFormError(null);

    try {
      // Crear el docente
      const newDocente = await docentesApi.create(data);

      // Si el docente fue creado con contraseña autogenerada, mostrarla al admin
      if (newDocente?.generatedPassword) {
        alert(
          `✅ Docente creado exitosamente!\n\n` +
          `Contraseña temporal generada:\n${newDocente.generatedPassword}\n\n` +
          `⚠️ Importante: Compartí esta contraseña con el docente. ` +
          `El docente deberá cambiarla en su primer inicio de sesión.\n\n` +
          `Esta contraseña no se volverá a mostrar.`
        );
      }

      // TODO: Implementar lógica de asignación de sectores cuando el backend lo soporte
      // Por ahora, los sectores seleccionados se guardan como parte del docente
      if (sectores.length > 0) {
        console.log(`Sectores seleccionados para ${newDocente.email}:`, sectores);
      }

      await fetchUsers();
      setModalType(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDocente = async (userId: string) => {
    setFormLoading(true);
    try {
      const docente = await docentesApi.getById(userId);
      setSelectedDocente(docente);
      setModalType('viewDocente');
    } catch (error) {
      console.error('Error fetching docente:', error);
      setFormError(getErrorMessage(error));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDocente = async (id: string, data: Partial<Docente>) => {
    setFormLoading(true);
    try {
      await docentesApi.update(id, data);
      await fetchUsers();
      setModalType(null);
      setSelectedDocente(null);
    } catch (error) {
      console.error('Error updating docente:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      await createAdmin(adminForm);
      await fetchUsers();
      setModalType(null);
      setAdminForm({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setFormLoading(false);
    }
  };

  const openModal = (type: ModalType, user?: AdminUser) => {
    if (user) {
      setSelectedUser(user);
    }
    setModalType(type);
    setFormError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setFormError(null);
    setDeleteError(null);
    setClasesCount(0);
    setDocentesDisponibles([]);
    setTargetDocenteId('');
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatUsersForExport(displayedUsers);
    const timestamp = new Date().getTime();
    const tabName = activeTab === 'tutores' ? 'tutores' : activeTab === 'estudiantes' ? 'estudiantes' : 'personal';

    if (format === 'excel') {
      exportToExcel(formattedData, `${tabName}-${timestamp}`, 'Usuarios');
    } else if (format === 'csv') {
      exportToCSV(formattedData, `${tabName}-${timestamp}`);
    } else {
      exportToPDF(
        formattedData,
        `${tabName}-${timestamp}`,
        `Listado de ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`,
        [
          { header: 'Nombre', dataKey: 'Nombre' },
          { header: 'Email', dataKey: 'Email' },
          { header: 'Rol', dataKey: 'Rol' },
          { header: 'Registro', dataKey: 'Fecha de Registro' }
        ]
      );
    }

    setShowExportMenu(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                Gestión de Usuarios
              </h1>
              <p className="text-white/70 text-lg font-medium">Administrá la comunidad completa de Mateatletas</p>
            </div>

            <div className="flex gap-3 items-center">
              {/* Crear Nuevo (solo en Personal del Club) */}
              {activeTab === 'personal' && (
                <button
                  onClick={() => setModalType('createDocente')}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Crear Nuevo
                </button>
              )}

              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 backdrop-blur-2xl bg-slate-900/90 rounded-2xl shadow-2xl border border-white/10 py-2 z-10">
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-5 py-3 text-left hover:bg-white/10 text-sm font-bold text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-green-400">📊</span> Exportar a Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-5 py-3 text-left hover:bg-white/10 text-sm font-bold text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-blue-400">📄</span> Exportar a CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full px-5 py-3 text-left hover:bg-white/10 text-sm font-bold text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-red-400">📕</span> Exportar a PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('tutores')}
          className={`group relative flex items-center gap-3 px-8 py-4 font-bold text-base transition-all rounded-2xl overflow-hidden ${
            activeTab === 'tutores'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/40 scale-105'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10'
          }`}
        >
          {activeTab === 'tutores' && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent animate-pulse"></div>
          )}
          <Users className={`${activeTab === 'tutores' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 transition-all`} />
          <span className="relative z-10">Tutores</span>
          <span className={`relative z-10 px-3 py-1 rounded-xl text-sm font-black ${
            activeTab === 'tutores' ? 'bg-white/25' : 'bg-white/10'
          }`}>
            {tutores.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('estudiantes')}
          className={`group relative flex items-center gap-3 px-8 py-4 font-bold text-base transition-all rounded-2xl overflow-hidden ${
            activeTab === 'estudiantes'
              ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-2xl shadow-green-500/40 scale-105'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10'
          }`}
        >
          {activeTab === 'estudiantes' && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent animate-pulse"></div>
          )}
          <GraduationCap className={`${activeTab === 'estudiantes' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 transition-all`} />
          <span className="relative z-10">Estudiantes</span>
          <span className={`relative z-10 px-3 py-1 rounded-xl text-sm font-black ${
            activeTab === 'estudiantes' ? 'bg-white/25' : 'bg-white/10'
          }`}>
            {estudiantes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`group relative flex items-center gap-3 px-8 py-4 font-bold text-base transition-all rounded-2xl overflow-hidden ${
            activeTab === 'personal'
              ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-2xl shadow-purple-500/40 scale-105'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10'
          }`}
        >
          {activeTab === 'personal' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent animate-pulse"></div>
          )}
          <Crown className={`${activeTab === 'personal' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 transition-all`} />
          <span className="relative z-10">Personal del Club</span>
          <span className={`relative z-10 px-3 py-1 rounded-xl text-sm font-black ${
            activeTab === 'personal' ? 'bg-white/25' : 'bg-white/10'
          }`}>
            {personal.length}
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-xl bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-white/10 border-t-purple-500"></div>
          <p className="mt-6 text-white/70 font-bold text-lg">Cargando usuarios...</p>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-20 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-white/60 text-xl font-bold">
            {activeTab === 'estudiantes' ? 'No hay estudiantes registrados' : 'No hay usuarios en esta categoría'}
          </p>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    Registrado
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-black text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all">
                          {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">
                            {user.nombre} {user.apellido}
                          </div>
                          <div className="text-xs text-white/40 font-mono mt-1">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm text-white/70 font-medium">{user.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {(user.roles && user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
                          <span key={role} className={`px-4 py-2 text-xs font-black rounded-xl shadow-lg ${roleColors[role]}`}>
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-white/60 font-bold">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (user.role === 'docente') {
                              handleViewDocente(user.id);
                            } else {
                              openModal('view', user);
                            }
                          }}
                          className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all hover:scale-110"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('roles', user)}
                          className="p-3 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all hover:scale-110"
                          title="Gestionar roles"
                        >
                          <UserCog className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('delete', user)}
                          className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-500/30">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 mb-4 shadow-2xl shadow-red-500/50">
                <Trash2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">¿Eliminar usuario?</h3>
              <p className="text-white/70 text-base">
                Estás por eliminar a <span className="font-bold text-white">{selectedUser.nombre} {selectedUser.apellido}</span>
              </p>
            </div>

            {/* Error Display con opción de reasignación */}
            {deleteError ? (
              <div className="space-y-4 mb-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <p className="text-sm text-amber-300 font-bold text-center">⚠️ {deleteError}</p>
                </div>

                {/* Si hay clases, mostrar selector de docente */}
                {clasesCount > 0 && docentesDisponibles.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-white">
                      Reasignar {clasesCount} clase{clasesCount > 1 ? 's' : ''} a:
                    </label>
                    <select
                      value={targetDocenteId}
                      onChange={(e) => setTargetDocenteId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      disabled={formLoading}
                    >
                      <option value="">Seleccionar docente...</option>
                      {docentesDisponibles.map((docente) => (
                        <option key={docente.id} value={docente.id} className="bg-slate-800">
                          {docente.nombre} {docente.apellido}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleReassignClasses}
                      disabled={!targetDocenteId || formLoading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {formLoading ? 'Reasignando...' : 'Reasignar y Eliminar'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-400 font-bold text-center">⚠️ Esta acción no se puede deshacer</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={formLoading}
                className="flex-1 px-6 py-3 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              {!deleteError && (
                <button
                  onClick={handleDeleteUser}
                  disabled={formLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Role Management Modal */}
      {modalType === 'roles' && selectedUser && (
        <MultiRoleModal
          user={selectedUser}
          onClose={closeModal}
          onSave={async (userId, roles) => {
            const success = await useAdminStore.getState().updateUserRoles(userId, roles);
            return success;
          }}
          isLoading={isLoading}
        />
      )}

      {/* View User Modal */}
      {modalType === 'view' && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Detalles del Usuario
              </h3>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="flex-shrink-0 h-24 w-24 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-purple-500/50">
                  {selectedUser.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-2xl font-black text-white mb-2">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </div>
                  <span className={`inline-block px-4 py-2 text-sm font-black rounded-xl shadow-lg ${roleColors[selectedUser.role]}`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Email</div>
                  <div className="text-base font-bold text-white break-all">{selectedUser.email}</div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">ID de Usuario</div>
                  <div className="text-base font-bold text-white font-mono">{selectedUser.id.slice(0, 16)}...</div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Fecha de Registro</div>
                  <div className="text-base font-bold text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Rol Actual</div>
                  <div className="text-base font-bold text-white">{roleLabels[selectedUser.role]}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-4 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => setModalType('roles')}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
              >
                Cambiar Roles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Docente Modal - NEW COMPONENT */}
      {modalType === 'createDocente' && (
        <CreateDocenteForm
          onSubmit={handleCreateDocente}
          onCancel={closeModal}
          onSwitchToAdmin={() => setModalType('createAdmin')}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {/* View/Edit Docente Modal - NEW COMPONENT */}
      {modalType === 'viewDocente' && selectedDocente && (
        <ViewEditDocenteModal
          docente={selectedDocente}
          onClose={() => {
            setModalType(null);
            setSelectedDocente(null);
          }}
          onUpdate={handleUpdateDocente}
          isLoading={formLoading}
        />
      )}

      {/* Create Admin Modal */}
      {modalType === 'createAdmin' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-purple-500/30 my-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-2xl shadow-purple-500/50">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Crear Nuevo Administrador
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.nombre}
                    onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.apellido}
                    onChange={(e) => setAdminForm({ ...adminForm, apellido: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                    DNI (opcional)
                  </label>
                  <input
                    type="text"
                    value={adminForm.dni}
                    onChange={(e) => setAdminForm({ ...adminForm, dni: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={adminForm.telefono}
                    onChange={(e) => setAdminForm({ ...adminForm, telefono: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 px-5 py-4 rounded-2xl text-sm font-bold">
                  {formError}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="flex-1 px-6 py-4 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creando...' : 'Crear Administrador'}
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('createDocente')}
                  className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  ¿Querés crear un Docente en su lugar?
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
