'use client';

import { X, Mail, Calendar, Home, Award, GraduationCap } from 'lucide-react';
import { formatDate } from '@/lib/constants/admin-mock-data';
import type { PersonDetailModalProps } from '../types/personas.types';
import { ROLE_CONFIG } from '../constants/role-config';

/**
 * PersonDetailModal - Modal de detalle de persona
 */

export function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  if (!person) return null;

  const roleConfig = ROLE_CONFIG[person.role];
  const Icon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Detalle de Persona</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl ${roleConfig.bgColor} flex items-center justify-center`}
            >
              <span className="text-2xl font-bold text-[var(--admin-text)]">
                {person.nombre.charAt(0)}
                {person.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[var(--admin-text)]">
                {person.nombre} {person.apellido}
              </h4>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}
              >
                <Icon className="w-3 h-3" />
                {roleConfig.label}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs">Email</span>
              </div>
              <p className="text-sm font-medium text-[var(--admin-text)] truncate">
                {person.email}
              </p>
            </div>
            <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Registro</span>
              </div>
              <p className="text-sm font-medium text-[var(--admin-text)]">
                {formatDate(person.createdAt)}
              </p>
            </div>
            {person.casa && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <Home className="w-4 h-4" />
                  <span className="text-xs">Casa</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">{person.casa}</p>
              </div>
            )}
            {person.puntos !== undefined && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">Puntos</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">
                  {person.puntos.toLocaleString()}
                </p>
              </div>
            )}
            {person.tier && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg col-span-2">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs">Tier</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">{person.tier}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-2)] rounded-lg">
            <span className="text-sm text-[var(--admin-text-muted)]">Estado</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                person.status === 'active'
                  ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                  : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${person.status === 'active' ? 'bg-[var(--status-success)]' : 'bg-[var(--admin-text-disabled)]'}`}
              />
              {person.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Cerrar
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonDetailModal;
