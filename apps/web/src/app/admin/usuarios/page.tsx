'use client';

import { useEffect, useState } from 'react';
import {
  useUsers,
  useUsersLoading,
  useUsersError,
  useFetchUsers,
  useDeleteUser,
  useUsersStore,
} from '@/features/admin/users';
import { AdminUser } from '@/types/admin.types';
import { docentesApi, CreateDocenteData, Docente } from '@/lib/api/docentes.api';
import { createAdmin, CreateAdminData } from '@/lib/api/admin.api';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatUsersForExport,
} from '@/lib/utils/export.utils';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { toErrorLike } from '@/types/common';
import {
  Users,
  Crown,
  Plus,
  Download,
  Eye,
  Trash2,
  UserCog,
  X,
  DollarSign,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import CreateDocenteForm from '@/components/admin/CreateDocenteForm';
import ViewEditDocenteModal from '@/components/admin/ViewEditDocenteModal';
import MultiRoleModal from '@/components/admin/MultiRoleModal';
import { EmptyState } from '@/components/admin/EmptyState';

type TabType = 'tutores' | 'personal';
type ModalType =
  | 'delete'
  | 'roles'
  | 'view'
  | 'viewDocente'
  | 'createDocente'
  | 'createAdmin'
  | 'reassignClasses'
  | null;

export default function UsuariosPage() {
  const users = useUsers();
  const fetchUsers = useFetchUsers();
  const deleteUser = useDeleteUser();
  const isLoading = useUsersLoading();
  const error = useUsersError();
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
  const [needsReassignment, setNeedsReassignment] = useState<boolean>(false);
  const [pagoLoading, setPagoLoading] = useState<string | null>(null);

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
    void fetchUsers();
  }, [fetchUsers]);

  // Ensure users is always an array before filtering
  const safeUsers = Array.isArray(users) ? users : [];

  // Filtrar usuarios según el tab activo
  const tutores = safeUsers.filter((u) => u.role === 'tutor');
  const personal = safeUsers.filter((u) => u.role === 'docente' || u.role === 'admin');

  const displayedUsers = activeTab === 'tutores' ? tutores : personal;

  const roleColors: Record<string, string> = {
    admin: 'admin-badge-purple',
    docente: 'admin-badge-info',
    tutor: 'admin-badge-success',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    docente: 'Docente',
    tutor: 'Tutor',
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteError(null);
    setNeedsReassignment(false);
    setFormLoading(true);

    try {
      const success = await deleteUser(selectedUser.id);
      if (success) {
        setModalType(null);
        setSelectedUser(null);
      }
    } catch (error) {
      // Solo detectar error de clases asignadas si es DOCENTE
      if (selectedUser.role === 'docente') {
        const axiosError = error as {
          response?: { data?: { errorMessage?: string; message?: string } };
          message?: string;
        };

        const errorMsg =
          axiosError?.response?.data?.errorMessage ||
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Error al eliminar usuario';

        if (errorMsg.includes('clase(s) asignada(s)')) {
          // Extraer número de clases del mensaje
          const match = errorMsg.match(/(\d+) clase\(s\)/);
          const numClases = match && match[1] ? parseInt(match[1], 10) : 0;
          setClasesCount(numClases);
          setDeleteError(errorMsg);
          setNeedsReassignment(true); // Marcar que necesita reasignación

          // Cargar docentes disponibles para reasignación
          try {
            const response = await docentesApi.getAll();
            // El backend puede devolver { data: [...] } o directamente [...]
            const docentes = Array.isArray(response)
              ? response
              : (response as { data?: Docente[] }).data || [];
            setDocentesDisponibles(docentes.filter((d: Docente) => d.id !== selectedUser.id));
          } catch (err) {
            console.error('Error loading docentes:', err);
          }
        } else {
          setDeleteError(errorMsg);
        }
      } else {
        // Para tutores u otros roles, mostrar error directamente pero NO bloquear
        const axiosError = error as {
          response?: { data?: { errorMessage?: string; message?: string } };
          message?: string;
        };
        const errorMsg =
          axiosError?.response?.data?.errorMessage ||
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Error al eliminar usuario';
        setDeleteError(errorMsg);
        setNeedsReassignment(false); // NO necesita reasignación
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleReassignClasses = async () => {
    if (!selectedUser || !targetDocenteId) return;
    console.log('🔄 Reasignando clases...');
    console.log('🔄 De docente (selectedUser.id):', selectedUser.id);
    console.log('🔄 A docente (targetDocenteId):', targetDocenteId);
    console.log('🔄 Tipo de targetDocenteId:', typeof targetDocenteId);
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
    } catch (error) {
      setDeleteError(getErrorMessage(toErrorLike(error)));
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
            `Esta contraseña no se volverá a mostrar.`,
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
      setFormError(getErrorMessage(toErrorLike(error)));
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
      setFormError(getErrorMessage(toErrorLike(error)));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDocente = async (docenteId: string, data: Partial<Docente>) => {
    setFormLoading(true);
    try {
      await docentesApi.update(docenteId, data);
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
      setFormError(getErrorMessage(toErrorLike(error)));
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
    setNeedsReassignment(false);
  };

  const handleRegistrarPago = async (tutorId: string) => {
    if (pagoLoading) return;

    setPagoLoading(tutorId);
    try {
      // ✅ SECURITY FIX: NO usar localStorage ni Authorization header
      // El token viaja automáticamente en httpOnly cookie con credentials: 'include'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pagos/registrar-pago-manual/${tutorId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // ✅ Envía cookies automáticamente
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el pago');
      }

      alert(
        `✅ Pago registrado exitosamente\n\nEstudiante: ${data.estudianteNombre}\nPeríodo: ${data.periodo}\nMonto: $${data.montoTotal.toLocaleString()}\nInscripciones: ${data.cantidadInscripciones}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar el pago';
      alert(`❌ ${errorMessage}`);
    } finally {
      setPagoLoading(null);
    }
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatUsersForExport(displayedUsers);
    const timestamp = new Date().getTime();
    const tabName = activeTab === 'tutores' ? 'tutores' : 'personal';

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
          { header: 'Registro', dataKey: 'Fecha de Registro' },
        ],
      );
    }

    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Gestión de Usuarios</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Administrá la comunidad completa de Mateatletas
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {activeTab === 'personal' && (
            <button
              onClick={() => setModalType('createDocente')}
              className="admin-btn admin-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="admin-btn admin-btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--admin-surface-2)] rounded-lg shadow-lg border border-[var(--admin-border)] py-1 z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-[var(--admin-surface-3)] text-sm text-[var(--admin-text)] transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[var(--status-success)]" />
                  Exportar a Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-[var(--admin-surface-3)] text-sm text-[var(--admin-text)] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[var(--status-info)]" />
                  Exportar a CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-[var(--admin-surface-3)] text-sm text-[var(--admin-text)] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[var(--status-danger)]" />
                  Exportar a PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('tutores')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all rounded-lg ${
            activeTab === 'tutores'
              ? 'bg-[var(--admin-accent)] text-black'
              : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)] border border-[var(--admin-border)]'
          }`}
        >
          <Users className="w-4 h-4" />
          Tutores
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${
              activeTab === 'tutores'
                ? 'bg-black/20 text-black'
                : 'bg-[var(--admin-surface-3)] text-[var(--admin-text-muted)]'
            }`}
          >
            {tutores.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all rounded-lg ${
            activeTab === 'personal'
              ? 'bg-[var(--admin-accent)] text-black'
              : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)] border border-[var(--admin-border)]'
          }`}
        >
          <Crown className="w-4 h-4" />
          Personal del Club
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${
              activeTab === 'personal'
                ? 'bg-black/20 text-black'
                : 'bg-[var(--admin-surface-3)] text-[var(--admin-text-muted)]'
            }`}
          >
            {personal.length}
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30 text-[var(--status-danger)]">
          {error}
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--admin-text-muted)]">Cargando usuarios...</p>
          </div>
        </div>
      ) : displayedUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay usuarios en esta categoría"
          description={
            activeTab === 'personal'
              ? 'Creá el primer docente o administrador para comenzar'
              : 'Los tutores aparecerán aquí cuando se registren'
          }
          action={
            activeTab === 'personal'
              ? { label: 'Crear Usuario', onClick: () => setModalType('createDocente') }
              : undefined
          }
        />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Username</th>
                  {activeTab === 'tutores' && <th>Credencial</th>}
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center text-[var(--admin-accent)] font-semibold">
                          {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--admin-text)]">
                            {user.nombre} {user.apellido}
                          </div>
                          <div className="text-xs text-[var(--admin-text-disabled)] font-mono">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-mono text-[var(--admin-text-secondary)]">
                        {user.username ||
                          `${user.nombre.toLowerCase()}.${user.apellido.toLowerCase()}`}
                      </span>
                    </td>
                    {activeTab === 'tutores' && (
                      <td>
                        {user.password_temporal ? (
                          <span className="admin-badge-warning font-mono text-xs">
                            {user.password_temporal}
                          </span>
                        ) : (
                          <span className="text-[var(--admin-text-disabled)] text-xs">
                            Ya cambió contraseña
                          </span>
                        )}
                      </td>
                    )}
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {activeTab === 'tutores' && (
                          <button
                            onClick={() => handleRegistrarPago(user.id)}
                            disabled={pagoLoading === user.id}
                            className="admin-btn-icon text-[var(--status-success)] hover:bg-[var(--status-success-muted)]"
                            title="Registrar pago"
                          >
                            {pagoLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <DollarSign className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (user.role === 'docente') {
                              handleViewDocente(user.id);
                            } else {
                              openModal('view', user);
                            }
                          }}
                          className="admin-btn-icon text-[var(--status-info)] hover:bg-[var(--status-info-muted)]"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('roles', user)}
                          className="admin-btn-icon text-[var(--admin-accent)] hover:bg-[var(--admin-accent-muted)]"
                          title="Gestionar roles"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('delete', user)}
                          className="admin-btn-icon text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)]"
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
                Estás por eliminar a{' '}
                <span className="font-bold text-white">
                  {selectedUser.nombre} {selectedUser.apellido}
                </span>
              </p>
            </div>

            {/* Error Display con opción de reasignación */}
            {deleteError && needsReassignment ? (
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
            ) : deleteError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-400 font-bold text-center">⚠️ {deleteError}</p>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-400 font-bold text-center">
                  ⚠️ Esta acción no se puede deshacer
                </p>
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
              {!needsReassignment && (
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
            const success = await useUsersStore.getState().updateUserRoles(userId, roles);
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
                  <span
                    className={`inline-block px-4 py-2 text-sm font-black rounded-xl shadow-lg ${roleColors[selectedUser.role]}`}
                  >
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">
                    Email
                  </div>
                  <div className="text-base font-bold text-white break-all">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">
                    ID de Usuario
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {selectedUser.id.slice(0, 16)}...
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">
                    Fecha de Registro
                  </div>
                  <div className="text-base font-bold text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">
                    Rol Actual
                  </div>
                  <div className="text-base font-bold text-white">
                    {roleLabels[selectedUser.role]}
                  </div>
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
