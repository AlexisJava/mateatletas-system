'use client';

import { useState } from 'react';
import { X, Copy, Check, Key, User, Shield, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CrearEstudianteConCredencialesResponse } from '@/lib/api/admin.api';

interface CredencialesModalProps {
  isOpen: boolean;
  onClose: () => void;
  credenciales: CrearEstudianteConCredencialesResponse | null;
}

/**
 * CredencialesModal - Modal para mostrar credenciales generadas
 *
 * Muestra las credenciales del estudiante y tutor para que el admin
 * pueda copiarlas y enviarlas por WhatsApp.
 */
export function CredencialesModal({ isOpen, onClose, credenciales }: CredencialesModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !credenciales) return null;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      toast.error('Error al copiar');
    }
  };

  const copyAllCredentials = async () => {
    const { credencialesEstudiante, credencialesTutor, estudiante, tutor } = credenciales;

    let message = `*Credenciales de Mateatletas*\n\n`;
    message += `*Estudiante: ${estudiante.nombre} ${estudiante.apellido}*\n`;
    message += `Usuario: ${credencialesEstudiante.username}\n`;
    message += `PIN: ${credencialesEstudiante.pin}\n\n`;

    if (credencialesTutor) {
      message += `*Tutor: ${tutor.nombre} ${tutor.apellido}*\n`;
      message += `Usuario: ${credencialesTutor.username}\n`;
      message += `Contraseña temporal: ${credencialesTutor.passwordTemporal}\n`;
      message += `(Deberá cambiarla en el primer inicio de sesión)\n\n`;
    }

    message += `Portal: https://mateatletas.com/login`;

    await copyToClipboard(message, 'all');
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
      title="Copiar"
    >
      {copiedField === fieldName ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-[var(--admin-text-muted)]" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--admin-text)]">
                Credenciales Generadas
              </h2>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Copia y envía por WhatsApp al tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estudiante */}
          <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-[var(--admin-accent)]" />
              <h3 className="font-medium text-[var(--admin-text)]">
                Estudiante: {credenciales.estudiante.nombre} {credenciales.estudiante.apellido}
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--admin-surface-1)]">
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)]">Usuario</span>
                  <p className="font-mono text-[var(--admin-text)]">
                    {credenciales.credencialesEstudiante.username}
                  </p>
                </div>
                <CopyButton
                  text={credenciales.credencialesEstudiante.username}
                  fieldName="est-user"
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--admin-surface-1)]">
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)]">PIN</span>
                  <p className="font-mono text-2xl font-bold text-[var(--admin-accent)]">
                    {credenciales.credencialesEstudiante.pin}
                  </p>
                </div>
                <CopyButton text={credenciales.credencialesEstudiante.pin} fieldName="est-pin" />
              </div>
            </div>
          </div>

          {/* Tutor (si se creó nuevo) */}
          {credenciales.credencialesTutor && (
            <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-violet-500" />
                <h3 className="font-medium text-[var(--admin-text)]">
                  Tutor: {credenciales.tutor.nombre} {credenciales.tutor.apellido}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                  Nuevo
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--admin-surface-1)]">
                  <div>
                    <span className="text-xs text-[var(--admin-text-muted)]">Usuario</span>
                    <p className="font-mono text-[var(--admin-text)]">
                      {credenciales.credencialesTutor.username}
                    </p>
                  </div>
                  <CopyButton
                    text={credenciales.credencialesTutor.username}
                    fieldName="tutor-user"
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--admin-surface-1)]">
                  <div>
                    <span className="text-xs text-[var(--admin-text-muted)]">
                      Contraseña temporal
                    </span>
                    <p className="font-mono text-[var(--admin-text)]">
                      {credenciales.credencialesTutor.passwordTemporal}
                    </p>
                  </div>
                  <CopyButton
                    text={credenciales.credencialesTutor.passwordTemporal}
                    fieldName="tutor-pass"
                  />
                </div>
              </div>
              <p className="text-xs text-amber-500 mt-2">
                * El tutor deberá cambiar la contraseña en su primer inicio de sesión
              </p>
            </div>
          )}

          {/* Tutor existente */}
          {!credenciales.tutorCreado && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-amber-600">
                  El tutor{' '}
                  <strong>
                    {credenciales.tutor.nombre} {credenciales.tutor.apellido}
                  </strong>{' '}
                  ya existía en el sistema. Sus credenciales no fueron modificadas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t border-[var(--admin-border)]">
          <button
            onClick={copyAllCredentials}
            className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Copiar todo para WhatsApp
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CredencialesModal;
