'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import { AdminUser } from '@/types/admin.types';
import { docentesApi, CreateDocenteData, Docente } from '@/lib/api/docentes.api';
import { createAdmin, CreateAdminData } from '@/lib/api/admin.api';
import { asignarRutasDocente, crearRutaEspecialidad, listarRutasEspecialidad } from '@/lib/api/sectores.api';

interface SelectedRuta {
  sectorId: string;
  sectorNombre: string;
  sectorIcono: string;
  sectorColor: string;
  rutaNombre: string;
}
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatUsersForExport
} from '@/lib/utils/export.utils';
import { Button } from '@/components/ui';
import { Users, GraduationCap, Crown, Plus, Download, Eye, Trash2, UserCog, X } from 'lucide-react';
import CreateDocenteForm from '@/components/admin/CreateDocenteForm';
import ViewEditDocenteModal from '@/components/admin/ViewEditDocenteModal';
import MultiRoleModal from '@/components/admin/MultiRoleModal';

type TabType = 'tutores' | 'estudiantes' | 'personal';
type ModalType = 'delete' | 'roles' | 'view' | 'viewDocente' | 'createDocente' | 'createAdmin' | null;

export default function UsuariosPage() {
  const { users, fetchUsers, deleteUser, changeUserRole, isLoading, error } = useAdminStore();
  const [activeTab, setActiveTab] = useState<TabType>('tutores');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'docente' | 'admin'>('tutor');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

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
  const estudiantes: Record<string, unknown>[] = []; // TODO: Agregar endpoint para estudiantes
  const personal = users.filter(u => u.role === 'docente' || u.role === 'admin');

  const displayedUsers = activeTab === 'tutores' ? tutores : activeTab === 'estudiantes' ? estudiantes : personal;

  const roleColors: Record<string, string> = {
    admin: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
    docente: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    tutor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    docente: 'Docente',
    tutor: 'Tutor',
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const success = await deleteUser(selectedUser.id);
    if (success) {
      setModalType(null);
      setSelectedUser(null);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    const success = await changeUserRole(selectedUser.id, selectedRole);
    if (success) {
      setModalType(null);
      setSelectedUser(null);
    }
  };

  const handleCreateDocente = async (data: CreateDocenteData, rutas?: SelectedRuta[]) => {
    setFormLoading(true);
    setFormError(null);

    try {
      // Crear el docente
      const newDocente = await docentesApi.create(data);

      // Si hay rutas seleccionadas, crearlas y asignarlas
      if (rutas && rutas.length > 0 && newDocente?.id) {
        const rutaIds: string[] = [];

        // Obtener todas las rutas existentes para verificar cuáles ya existen
        const rutasExistentes = await listarRutasEspecialidad();

        for (const ruta of rutas) {
          // Buscar si la ruta ya existe (mismo nombre y sector)
          const rutaExistente = rutasExistentes.find(
            (r) => r.nombre.toLowerCase() === ruta.rutaNombre.toLowerCase() && r.sectorId === ruta.sectorId
          );

          if (rutaExistente) {
            // La ruta ya existe, usar su ID
            rutaIds.push(rutaExistente.id);
          } else {
            // La ruta no existe, crearla
            const nuevaRuta = await crearRutaEspecialidad({
              nombre: ruta.rutaNombre,
              sectorId: ruta.sectorId,
              descripcion: `Creada automáticamente al asignar docente`,
            });
            rutaIds.push(nuevaRuta.id);
          }
        }

        // Asignar todas las rutas al docente
        await asignarRutasDocente(newDocente.id, { rutaIds });
      }

      await fetchUsers();
      setModalType(null);
    } catch (error) {
      setFormError(error?.message || 'Error al crear el docente');
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
      setFormError(error?.message || 'Error al cargar el docente');
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
      setFormError(error?.message || 'Error al crear el administrador');
    } finally {
      setFormLoading(false);
    }
  };

  const openModal = (type: ModalType, user?: AdminUser) => {
    if (user) {
      setSelectedUser(user);
      if (type === 'role') {
        setSelectedRole(user.role);
      }
    }
    setModalType(type);
    setFormError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setFormError(null);
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatUsersForExport(displayedUsers);
    const timestamp = new Date().getTime();
    const tabName = activeTab === 'tutores' ? 'tutores' : activeTab === 'estudiantes' ? 'estudiantes' : 'personal';

    if (format === 'excel') {
      exportToExcel(formattedData as Record<string, unknown>, `${tabName}-${timestamp}`, 'Usuarios');
    } else if (format === 'csv') {
      exportToCSV(formattedData as Record<string, unknown>, `${tabName}-${timestamp}`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 dark:from-purple-200 dark:via-indigo-300 dark:to-purple-200 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h1>
          <p className="text-white/60 mt-2">Administrá usuarios, roles y permisos del sistema</p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Crear Nuevo (solo en Personal del Club) */}
          {activeTab === 'personal' && (
            <div className="relative">
              <button
                onClick={() => setModalType('createDocente')}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Nuevo
              </button>
            </div>
          )}

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-emerald-500/[0.08] rounded-xl shadow-2xl border border-emerald-500/20 py-2 z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-500/10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Exportar a Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-500/10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Exportar a CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-500/10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Exportar a PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-emerald-500/20">
        <button
          onClick={() => setActiveTab('tutores')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-t-xl ${
            activeTab === 'tutores'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-500/20'
              : 'text-white/60 hover:bg-emerald-500/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Tutores
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'tutores' ? 'bg-white/20' : 'bg-emerald-500/10 text-white/70'
          }`}>
            {tutores.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('estudiantes')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-t-xl ${
            activeTab === 'estudiantes'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
              : 'text-white/60 hover:bg-emerald-500/10'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Estudiantes
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'estudiantes' ? 'bg-white/20' : 'bg-emerald-500/10 text-white/70'
          }`}>
            {estudiantes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-t-xl ${
            activeTab === 'personal'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-white/60 hover:bg-emerald-500/10'
          }`}
        >
          <Crown className="w-4 h-4" />
          Personal del Club
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'personal' ? 'bg-white/20' : 'bg-emerald-500/10 text-white/70'
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
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-400"></div>
          <p className="mt-4 text-white/60 font-medium">Cargando usuarios...</p>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-500/20 p-16 text-center">
          <p className="text-white/50 text-lg font-medium">
            {activeTab === 'estudiantes' ? 'No hay estudiantes registrados' : 'No hay usuarios en esta categoría'}
          </p>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-emerald-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-200/20 dark:divide-purple-700/20">
              {displayedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-xs text-white/50 font-mono">
                          {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(user.roles && user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
                        <span key={role} className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-md ${roleColors[role]}`}>
                          {roleLabels[role]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (user.role === 'docente') {
                            handleViewDocente(user.id);
                          } else {
                            openModal('view', user);
                          }
                        }}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-black/60 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal('roles', user)}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-all"
                        title="Gestionar roles"
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal('delete', user)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
            <h3 className="text-xl font-bold text-white mb-4">¿Eliminar usuario?</h3>
            <p className="text-white/70 mb-2">
              Estás por eliminar a <strong>{selectedUser.nombre} {selectedUser.apellido}</strong>
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-medium">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/40"
              >
                Eliminar
              </button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Detalles del Usuario</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 pb-4 border-b border-emerald-500/20">
                <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/30">
                  {selectedUser.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </div>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg shadow-md ${roleColors[selectedUser.role]} mt-1`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs font-semibold text-white/50 mb-1">Email</div>
                  <div className="text-sm font-medium text-white break-all">{selectedUser.email}</div>
                </div>
                <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs font-semibold text-white/50 mb-1">ID de Usuario</div>
                  <div className="text-sm font-medium text-white font-mono">{selectedUser.id}</div>
                </div>
                <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs font-semibold text-white/50 mb-1">Fecha de Registro</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs font-semibold text-white/50 mb-1">Rol Actual</div>
                  <div className="text-sm font-medium text-white">{roleLabels[selectedUser.role]}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => setModalType('role')}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                Cambiar Rol
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Crear Nuevo Administrador</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.nombre}
                    onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.apellido}
                    onChange={(e) => setAdminForm({ ...adminForm, apellido: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    DNI (opcional)
                  </label>
                  <input
                    type="text"
                    value={adminForm.dni}
                    onChange={(e) => setAdminForm({ ...adminForm, dni: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={adminForm.telefono}
                    onChange={(e) => setAdminForm({ ...adminForm, telefono: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {formError && (
                <div className="backdrop-blur-xl bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creando...' : 'Crear Administrador'}
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('createDocente')}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
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
