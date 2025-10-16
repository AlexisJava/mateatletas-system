'use client';
import { Button } from '@/components/ui';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import { AdminUser } from '@/types/admin.types';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatUsersForExport
} from '@/lib/utils/export.utils';

type ModalType = 'delete' | 'role' | 'view' | null;

export default function UsuariosPage() {
  const { users, fetchUsers, deleteUser, changeUserRole, isLoading, error } = useAdminStore();
  const [filter, setFilter] = useState<'all' | 'tutor' | 'docente' | 'admin'>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'docente' | 'admin'>('tutor');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    docente: 'bg-purple-100 text-purple-800',
    tutor: 'bg-blue-100 text-blue-800',
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

  const openModal = (type: ModalType, user: AdminUser) => {
    setSelectedUser(user);
    if (type === 'role') {
      setSelectedRole(user.role);
    }
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatUsersForExport(filteredUsers);
    const timestamp = new Date().getTime();

    if (format === 'excel') {
      exportToExcel(formattedData as any, `usuarios-${timestamp}`, 'Usuarios');
    } else if (format === 'csv') {
      exportToCSV(formattedData as any, `usuarios-${timestamp}`);
    } else {
      exportToPDF(
        formattedData,
        `usuarios-${timestamp}`,
        'Listado de Usuarios',
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2a1a5e]">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administrá usuarios, roles y permisos</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            {(['all', 'tutor', 'docente', 'admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === f
                    ? 'bg-[#ff6b35] text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f === 'all' ? 'Todos' : roleLabels[f]}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
            >
              📊 Exportar
              <span className="text-xs">▼</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📊 Exportar a Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📄 Exportar a CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📕 Exportar a PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700">Total Usuarios</div>
          <div className="text-2xl font-bold text-blue-900">{users.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-700">Docentes</div>
          <div className="text-2xl font-bold text-purple-900">
            {users.filter(u => u.role === 'docente').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700">Tutores</div>
          <div className="text-2xl font-bold text-green-900">
            {users.filter(u => u.role === 'tutor').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="text-sm font-medium text-red-700">Admins</div>
          <div className="text-2xl font-bold text-red-900">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No hay usuarios con el filtro seleccionado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#ff6b35] to-[#f7b801] rounded-full flex items-center justify-center text-white font-bold">
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openModal('view', user)}
                      className="text-[#2a1a5e] hover:text-[#ff6b35] transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => openModal('role', user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Cambiar Rol
                    </button>
                    <button
                      onClick={() => openModal('delete', user)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">¿Eliminar usuario?</h3>
            <p className="text-gray-600 mb-2">
              Estás por eliminar a <strong>{selectedUser.nombre} {selectedUser.apellido}</strong>
            </p>
            <p className="text-sm text-red-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteUser}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {modalType === 'role' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">Cambiar Rol</h3>
            <p className="text-gray-600 mb-4">
              Usuario: <strong>{selectedUser.nombre} {selectedUser.apellido}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccioná el nuevo rol:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              >
                <option value="tutor">Tutor</option>
                <option value="docente">Docente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeRole}
                className="flex-1"
              >
                Cambiar Rol
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {modalType === 'view' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-2xl font-bold text-[#2a1a5e] mb-6">Detalles del Usuario</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-[#ff6b35] to-[#f7b801] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedUser.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </div>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${roleColors[selectedUser.role]} mt-1`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-sm text-gray-900 mt-1">{selectedUser.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">ID de Usuario</div>
                  <div className="text-sm text-gray-900 mt-1 font-mono">{selectedUser.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Fecha de Registro</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Rol Actual</div>
                  <div className="text-sm text-gray-900 mt-1">{roleLabels[selectedUser.role]}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => setModalType('role')}
                className="flex-1"
              >
                Cambiar Rol
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
