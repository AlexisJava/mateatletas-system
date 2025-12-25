'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Save,
  Loader2,
  Info,
  Gamepad2,
  Sparkles,
  Crown,
  UserMinus,
} from 'lucide-react';
import type { ConfigModalProps, TierConfig } from '../types/finance.types';
import { PriceInput } from './PriceInput';

/**
 * ConfigModal - Modal de configuración de tiers STEAM
 *
 * Permite editar precios y descuentos de los tiers.
 */

export function ConfigModal({ isOpen, onClose, config, onSave }: ConfigModalProps) {
  const [formData, setFormData] = useState<TierConfig>(config);
  const [saving, setSaving] = useState(false);
  const [motivoCambio, setMotivoCambio] = useState('');

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSave(formData);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[var(--status-info)] to-[var(--admin-accent-secondary)] p-5 flex items-center justify-between border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Configuracion Tiers STEAM 2026</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="p-4 bg-[var(--status-info-muted)] border border-[var(--status-info)]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[var(--status-info)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--status-info)] mb-1">
                  Sistema de Tiers STEAM 2026
                </p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  STEAM Libros: Plataforma completa (Mate + Progra + Ciencias). STEAM Asincronico:
                  Todo + clases grabadas. STEAM Sincronico: Todo + clases en vivo.
                </p>
              </div>
            </div>
          </div>

          {/* Precios por Tier */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text-muted)]">
              Precios por Tier STEAM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PriceInput
                icon={Gamepad2}
                label="STEAM Libros"
                value={formData.precioSteamLibros}
                onChange={(v) => setFormData({ ...formData, precioSteamLibros: v })}
                focusColor="focus:border-[var(--status-info)]"
              />
              <PriceInput
                icon={Sparkles}
                label="STEAM Asincronico"
                value={formData.precioSteamAsincronico}
                onChange={(v) => setFormData({ ...formData, precioSteamAsincronico: v })}
                focusColor="focus:border-[var(--admin-accent-secondary)]"
              />
              <PriceInput
                icon={Crown}
                label="STEAM Sincronico"
                value={formData.precioSteamSincronico}
                onChange={(v) => setFormData({ ...formData, precioSteamSincronico: v })}
                focusColor="focus:border-[var(--status-warning)]"
              />
            </div>
          </div>

          {/* Descuento Familiar */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text-muted)] flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Descuento Familiar
            </h4>
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                2do hermano en adelante (%)
              </label>
              <input
                type="number"
                value={formData.descuentoSegundoHermano}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descuentoSegundoHermano: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--status-success)]"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Motivo del Cambio */}
          <div>
            <label className="block text-sm font-semibold text-[var(--admin-text-muted)] mb-2">
              Motivo del Cambio (Opcional)
            </label>
            <textarea
              value={motivoCambio}
              onChange={(e) => setMotivoCambio(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-[var(--admin-accent)] resize-none"
              placeholder="Ej: Ajuste de precios para ciclo 2026"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--admin-border)]">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-semibold border border-[var(--admin-border)] hover:bg-[var(--admin-surface-1)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[var(--status-success)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigModal;
