'use client';

import React, { useMemo } from 'react';
import { JSONRenderer } from './JSONRenderer';
import type { ContentBlock } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// CODE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

interface CodePreviewProps {
  /** JSON string from the Monaco editor */
  code: string;
  /** Show safe zone guidelines overlay */
  showGuidelines?: boolean;
}

/**
 * Parses JSON code and renders it using the Design System.
 * Shows syntax errors inline with a friendly UI.
 */
export function CodePreview({ code, showGuidelines = false }: CodePreviewProps) {
  const { data, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(code);
      return { data: parsed as ContentBlock, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Error de parseo' };
    }
  }, [code]);

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden group">
      {/* Safe Zone Guidelines */}
      {showGuidelines && (
        <div className="absolute inset-8 border border-dashed border-white/10 rounded-3xl pointer-events-none z-0 opacity-50">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0b101b] px-3 py-0.5 rounded text-[9px] text-[#64748b] font-bold uppercase tracking-widest font-mono border border-white/5">
            Safe Zone
          </div>
        </div>
      )}

      <div className="w-full h-full relative z-10">
        {error ? (
          <div className="absolute bottom-6 left-6 right-6 z-50 p-4 bg-red-950/90 border border-red-500/20 text-red-200 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-red-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-bold uppercase tracking-wide">Error de Sintaxis</span>
            </div>
            {error}
          </div>
        ) : (
          <JSONRenderer data={data} />
        )}
      </div>
    </div>
  );
}

export default CodePreview;
