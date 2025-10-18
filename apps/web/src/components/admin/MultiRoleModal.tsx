'use client';

import { useState, useEffect } from 'react';
import { X, Save, Shield, GraduationCap, Users, BookOpen } from 'lucide-react';
import { AdminUser } from '@/types/admin.types';

interface MultiRoleModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, roles: ('tutor' | 'docente' | 'admin' | 'estudiante')[]) => Promise<boolean>;
  isLoading?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrador', icon: Shield, color: 'from-red-500 to-rose-600' },
  { value: 'docente', label: 'Docente', icon: GraduationCap, color: 'from-emerald-500 to-teal-500' },
  { value: 'tutor', label: 'Tutor', icon: Users, color: 'from-blue-500 to-cyan-600' },
  { value: 'estudiante', label: 'Estudiante', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
] as const;

export default function MultiRoleModal({ user, onClose, onSave, isLoading = false }: MultiRoleModalProps) {
  // Inicializar con los roles actuales del usuario
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    // Si el usuario tiene el campo roles, usarlo; si no, usar el role único
    if (user.roles && user.roles.length > 0) {
      setSelectedRoles([...user.roles]);
    } else {
      setSelectedRoles([user.role]);
    }
  }, [user]);

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleValue)) {
        // No permitir desmarcar todos los roles
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((r) => r !== roleValue);
      } else {
        return [...prev, roleValue];
      }
    });
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) {
      return; // No permitir guardar sin roles
    }
    const success = await onSave(user.id, selectedRoles as ('tutor' | 'docente' | 'admin' | 'estudiante')[]);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl max-w-lg w-full shadow-2xl border border-purple-200/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
          <div>
            <h3 className="text-xl font-bold text-white">Gestionar Roles</h3>
            <p className="text-sm text-white/60 mt-1">
              {user.nombre} {user.apellido}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/60">
            Selecciona uno o más roles para este usuario. Debe tener al menos un rol asignado.
          </p>

          <div className="space-y-3">
            {AVAILABLE_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role.value);
              const Icon = role.icon;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleRole(role.value)}
                  disabled={isLoading || (isSelected && selectedRoles.length === 1)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${role.color} text-white border-transparent shadow-lg`
                      : 'bg-emerald-500/[0.08]/60 border-emerald-500/20 hover:bg-emerald-500/10'
                  } ${
                    isSelected && selectedRoles.length === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-emerald-500/[0.05]/20' : 'bg-purple-100 dark:bg-purple-900/40'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        className={`font-semibold ${
                          isSelected ? 'text-white' : 'text-white'
                        }`}
                      >
                        {role.label}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-white/80 mt-0.5">Rol activo</div>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500/[0.05] border-white'
                          : 'border-purple-300 dark:border-purple-600'
                      }`}
                    >
                      {isSelected && <div className={`w-3 h-3 bg-gradient-to-r ${role.color} rounded-sm`} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRoles.length === 1 && (
            <div className="backdrop-blur-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm">
              ℹ️ Un usuario debe tener al menos un rol asignado
            </div>
          )}

          <div className="backdrop-blur-xl bg-purple-50/60 dark:bg-purple-950/40 rounded-xl p-3 border border-emerald-500/20">
            <div className="text-xs font-semibold text-white/50 mb-2">
              Roles seleccionados ({selectedRoles.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((roleValue) => {
                const roleConfig = AVAILABLE_ROLES.find((r) => r.value === roleValue);
                if (!roleConfig) return null;

                return (
                  <span
                    key={roleValue}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${roleConfig.color} text-white shadow-md`}
                  >
                    {roleConfig.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-500/20 p-6 bg-emerald-500/[0.05]/50 dark:bg-indigo-950/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || selectedRoles.length === 0}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar Roles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
