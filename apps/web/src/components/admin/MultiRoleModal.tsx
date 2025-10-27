'use client';

import { useState, useEffect } from 'react';
import { X, Save, Shield, GraduationCap, Users, BookOpen } from 'lucide-react';
import { AdminUser } from '@/types/admin.types';

interface MultiRoleModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (
    _userId: string,
    _roles: ('tutor' | 'docente' | 'admin' | 'estudiante')[],
  ) => Promise<boolean>;
  isLoading?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrador', icon: Shield, color: 'from-purple-600 to-violet-600' },
  { value: 'docente', label: 'Docente', icon: GraduationCap, color: 'from-blue-600 to-cyan-600' },
  { value: 'tutor', label: 'Tutor', icon: Users, color: 'from-green-600 to-emerald-600' },
  { value: 'estudiante', label: 'Estudiante', icon: BookOpen, color: 'from-amber-600 to-orange-600' },
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-2xl shadow-purple-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Gestionar Roles
              </h3>
              <p className="text-base text-white/70 mt-1 font-bold">
                {user.nombre} {user.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-base text-white/70 font-medium">
            Selecciona uno o más roles para este usuario. Debe tener al menos un rol asignado.
          </p>

          <div className="space-y-4">
            {AVAILABLE_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role.value);
              const Icon = role.icon;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleRole(role.value)}
                  disabled={isLoading || (isSelected && selectedRoles.length === 1)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${role.color} text-white border-transparent shadow-2xl hover:scale-105`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } ${
                    isSelected && selectedRoles.length === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        isSelected ? 'bg-white/20' : 'bg-white/10'
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 ${
                          isSelected ? 'text-white' : 'text-white/70'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        className={`text-lg font-black ${
                          isSelected ? 'text-white' : 'text-white'
                        }`}
                      >
                        {role.label}
                      </div>
                      {isSelected && (
                        <div className="text-sm text-white/90 mt-1 font-bold">✓ Rol activo</div>
                      )}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-white/20 border-white'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && <div className="w-4 h-4 bg-white rounded-lg" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRoles.length === 1 && (
            <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 px-5 py-4 rounded-2xl text-sm font-bold">
              ℹ️ Un usuario debe tener al menos un rol asignado
            </div>
          )}

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="text-sm font-black text-white/70 uppercase tracking-wider mb-3">
              Roles seleccionados ({selectedRoles.length})
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedRoles.map((roleValue) => {
                const roleConfig = AVAILABLE_ROLES.find((r) => r.value === roleValue);
                if (!roleConfig) return null;

                return (
                  <span
                    key={roleValue}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-black bg-gradient-to-r ${roleConfig.color} text-white shadow-2xl`}
                  >
                    {roleConfig.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-8 bg-white/5">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-4 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || selectedRoles.length === 0}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Guardando...' : 'Guardar Roles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
