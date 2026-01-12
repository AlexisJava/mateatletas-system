'use client';

import React from 'react';
import { CodePreview } from './CodePreview';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';
import { ViewportContext } from '@/components/lesson-renderer/DesignSystem';
import type { HouseStyles } from '../types';

interface PreviewPanelProps {
  content: string;
  houseStyles: HouseStyles;
  activeNodoId: string | null;
  refreshKey: number;
  onRefresh: () => void;
}

export function PreviewPanel({
  content,
  houseStyles,
  activeNodoId,
  refreshKey,
  onRefresh,
}: PreviewPanelProps) {
  return (
    <div className="h-full flex flex-col bg-[#0f0720] rounded-2xl border border-white/5 overflow-hidden relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f0720_90%)] pointer-events-none" />

      {/* Browser chrome */}
      <div className="h-8 bg-[#0b101b] border-b border-white/5 flex items-center px-4 gap-4 shrink-0 relative z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <div className="flex-1 bg-[#02040a] h-5 rounded flex items-center justify-center text-[9px] text-[#64748b] font-mono border border-white/5">
          <span className="text-[#a855f7]">localhost</span>:3000/preview
        </div>
        <button
          onClick={onRefresh}
          className="p-1 rounded text-[#64748b] hover:text-[#00ffa3] hover:bg-[#00ffa3]/10 transition-all"
          aria-label="Recargar preview"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Preview content */}
      <div
        className="flex-1 relative overflow-hidden"
        style={
          {
            '--house-primary': houseStyles.primaryColor,
            '--house-secondary': houseStyles.secondaryColor,
            '--house-accent': houseStyles.accentColor,
          } as React.CSSProperties
        }
      >
        <PreviewErrorBoundary onReset={onRefresh}>
          <ViewportContext.Provider value={{ isMobile: false }}>
            <CodePreview
              code={content}
              key={`preview-${activeNodoId}-${refreshKey}`}
              showGuidelines={true}
            />
          </ViewportContext.Provider>
        </PreviewErrorBoundary>
      </div>
    </div>
  );
}
