'use client';

import React from 'react';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import type { NodoContenido, HouseStyles } from '../types';

interface SplitViewProps {
  content: string;
  onChange: (value: string) => void;
  activeNodo: NodoContenido | null;
  isEditable: boolean;
  houseStyles: HouseStyles;
  activeNodoId: string | null;
  refreshKey: number;
  onRefresh: () => void;
}

export function SplitView({
  content,
  onChange,
  activeNodo,
  isEditable,
  houseStyles,
  activeNodoId,
  refreshKey,
  onRefresh,
}: SplitViewProps) {
  return (
    <div className="absolute inset-0 flex gap-4">
      {/* Editor - 50% */}
      <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-[#8b5cf6]/20 shadow-2xl">
        <EditorPanel
          content={content}
          onChange={onChange}
          activeNodo={activeNodo}
          isEditable={isEditable}
        />
      </div>

      {/* Preview - 50% */}
      <div className="flex-1 min-w-0">
        <PreviewPanel
          content={content}
          houseStyles={houseStyles}
          activeNodoId={activeNodoId}
          refreshKey={refreshKey}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}
