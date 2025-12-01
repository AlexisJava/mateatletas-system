'use client';

import React from 'react';
import { X } from 'lucide-react';
import { BloqueJson } from '../blocks/types';
import { SemanaRenderer } from '../renderer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bloques: BloqueJson[];
}

export function EditorPreview({ isOpen, onClose, bloques }: Props): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative h-[90vh] w-[90vw] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vista previa</h2>
            <p className="text-sm text-gray-500">Así verán los estudiantes esta semana</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-auto bg-gray-50 p-6">
          {bloques.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="mb-2 text-4xl">📭</div>
                <p>No hay bloques para mostrar</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl">
              <SemanaRenderer bloques={bloques} modo="preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
