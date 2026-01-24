'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, GraduationCap, Users, BookOpen } from 'lucide-react';
import { AdminUser } from '@/types/admin.types';
import { AdminModal } from './primitives/AdminModal';
import { AdminButton } from './primitives/AdminButton';
import { AdminCard } from './primitives/AdminCard';
import { AdminBadge } from './primitives/AdminBadge';

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
  {
    value: 'admin',
    label: 'Administrador',
    icon: Shield,
    gradient: 'from-purple-600 to-violet-600',
    variant: 'pending' as const,
  },
  {
    value: 'docente',
    label: 'Docente',
    icon: GraduationCap,
    gradient: 'from-[var(--admin-accent)] to-[var(--admin-accent-hover)]',
    variant: 'info' as const,
  },
  {
    value: 'tutor',
    label: 'Tutor',
    icon: Users,
    gradient: 'from-[var(--status-success)] to-emerald-600',
    variant: 'success' as const,
  },
  {
    value: 'estudiante',
    label: 'Estudiante',
    icon: BookOpen,
    gradient: 'from-amber-600 to-orange-600',
    variant: 'warning' as const,
  },
] as const;

export default function MultiRoleModal({
  user,
  onClose,
  onSave,
  isLoading = false,
}: MultiRoleModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user.roles && user.roles.length > 0) {
      setSelectedRoles([...user.roles]);
    } else {
      setSelectedRoles([user.role]);
    }
  }, [user]);

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleValue)) {
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
      return;
    }
    const success = await onSave(
      user.id,
      selectedRoles as ('tutor' | 'docente' | 'admin' | 'estudiante')[],
    );
    if (success) {
      onClose();
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <AdminButton variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </AdminButton>
      <AdminButton
        variant="primary"
        onClick={handleSave}
        loading={isLoading}
        disabled={selectedRoles.length === 0}
        icon={<Save className="w-4 h-4" />}
      >
        Guardar Roles
      </AdminButton>
    </div>
  );

  return (
    <AdminModal
      open={true}
      onClose={onClose}
      title="Gestionar Roles"
      description={`${user.nombre} ${user.apellido}`}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--admin-text-muted)]">
          Selecciona uno o más roles para este usuario. Debe tener al menos un rol asignado.
        </p>

        <div className="space-y-3">
          {AVAILABLE_ROLES.map((role) => {
            const isSelected = selectedRoles.includes(role.value);
            const Icon = role.icon;
            const isLastSelected = isSelected && selectedRoles.length === 1;

            return (
              <button
                key={role.value}
                type="button"
                onClick={() => toggleRole(role.value)}
                disabled={isLoading || isLastSelected}
                className={`w-full p-4 rounded-xl border transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${role.gradient} text-white border-transparent shadow-lg`
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]'
                } ${isLastSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white/[0.05]'}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[var(--admin-text-muted)]'}`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[var(--admin-text)]'}`}
                    >
                      {role.label}
                    </div>
                    {isSelected && <div className="text-xs text-white/80 mt-0.5">✓ Rol activo</div>}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                      isSelected ? 'bg-white/20 border-white' : 'border-white/30'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedRoles.length === 1 && (
          <div className="bg-[var(--status-warning-muted)] border border-[var(--status-warning)]/30 text-[var(--status-warning)] px-4 py-3 rounded-xl text-sm">
            ℹ️ Un usuario debe tener al menos un rol asignado
          </div>
        )}

        <AdminCard padding="sm" animate={false}>
          <div className="text-xs text-[var(--admin-text-muted)] mb-2">
            Roles seleccionados ({selectedRoles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((roleValue) => {
              const roleConfig = AVAILABLE_ROLES.find((r) => r.value === roleValue);
              if (!roleConfig) return null;

              return (
                <AdminBadge key={roleValue} variant={roleConfig.variant} size="md">
                  {roleConfig.label}
                </AdminBadge>
              );
            })}
          </div>
        </AdminCard>
      </div>
    </AdminModal>
  );
}
