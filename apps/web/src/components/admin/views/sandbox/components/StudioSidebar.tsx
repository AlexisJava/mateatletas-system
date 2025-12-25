'use client';

import React, { useState, useRef } from 'react';
import { DESIGN_SYSTEM_COMPONENTS, HOUSES, BACKGROUND_PRESETS } from '../constants';
import type { House, DesignSystemComponent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const Icons = {
  Layout: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  Content: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Image: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Upload: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT ITEM
// ─────────────────────────────────────────────────────────────────────────────

interface ComponentItemProps {
  comp: DesignSystemComponent;
  onInsertCode: (code: string) => void;
}

function ComponentItem({ comp, onInsertCode }: ComponentItemProps) {
  const handleInsert = () => {
    const jsonSnippet = JSON.stringify(comp.defaultStructure, null, 2);
    onInsertCode(jsonSnippet + ',');
  };

  return (
    <button
      onClick={handleInsert}
      className="group relative w-full text-left p-3 rounded-xl bg-transparent hover:bg-[#131b2e]/40 border border-transparent hover:border-[#3bf6ff]/10 transition-all duration-200 flex items-center gap-3 active:scale-[0.98] outline-none focus:bg-[#131b2e]/40"
    >
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3bf6ff]/0 via-[#3bf6ff]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Icon Container */}
      <div className="relative w-9 h-9 rounded-lg bg-[#0b101b] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#64748b] group-hover:text-[#3bf6ff] group-hover:border-[#3bf6ff]/30 shadow-sm transition-all shrink-0 z-10 group-hover:shadow-[0_0_10px_rgba(59,246,255,0.1)]">
        <span className="text-[10px] font-mono font-bold tracking-tighter">
          {comp.name.substring(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-w-0 py-0.5 z-10">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-[#94a3b8] group-hover:text-white transition-colors tracking-tight truncate pr-2">
            {comp.name}
          </span>
        </div>
        <p className="text-[10px] text-[#475569] leading-tight line-clamp-1 group-hover:text-[#64748b] transition-colors">
          {comp.description}
        </p>
      </div>

      {/* Action Icon (Plus) */}
      <div className="relative w-6 h-6 flex items-center justify-center rounded-md text-[#3bf6ff] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-[#3bf6ff]/10 z-10">
        <Icons.Plus />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDIO SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

interface StudioSidebarProps {
  currentHouse: House;
  setHouse: (h: House) => void;
  onInsertCode: (snippet: string) => void;
  onUpdateBackground: (bg: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function StudioSidebar({
  currentHouse,
  setHouse,
  onInsertCode,
  onUpdateBackground,
  isOpen,
  toggleSidebar,
}: StudioSidebarProps) {
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'env'>('layout');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const layouts = DESIGN_SYSTEM_COMPONENTS.filter((c) => c.category === 'layout');
  const content = DESIGN_SYSTEM_COMPONENTS.filter((c) => c.category === 'content');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateBackground(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      className={`relative h-full shrink-0 z-40 bg-[#02040a] border-r border-[rgba(255,255,255,0.05)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isOpen ? 'w-80' : 'w-20'}`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0b101b]/80 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0 relative z-10 border-b border-[rgba(255,255,255,0.03)] backdrop-blur-sm bg-[#02040a]/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-white/20">
            <span className="text-black font-black text-sm font-mono">M</span>
          </div>
          <div
            className={`flex flex-col transition-opacity duration-300 ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'}`}
          >
            <span className="font-bold text-sm text-white tracking-wide">Sandbox</span>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className={`absolute ${isOpen ? 'right-4' : 'left-1/2 -translate-x-1/2 top-20'} w-8 h-8 flex items-center justify-center rounded-lg text-[#64748b] hover:text-white hover:bg-[#131b2e] transition-all z-50`}
          aria-label={isOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          <div className={`transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''}`}>
            <Icons.ChevronLeft />
          </div>
        </button>
      </div>

      {isOpen ? (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-left-4 duration-500">
          {/* House Selector */}
          <div className="px-5 py-5">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#3bf6ff]" />
                Facción
              </label>
            </div>
            <div className="flex gap-1.5 p-1 bg-[#0b101b] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-inner">
              {(Object.keys(HOUSES) as House[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setHouse(h)}
                  className={`flex-1 relative py-1.5 rounded-lg text-[10px] font-bold transition-all overflow-hidden group ${
                    currentHouse === h ? 'text-white shadow-sm' : 'text-[#64748b] hover:text-white'
                  }`}
                >
                  {currentHouse === h && (
                    <div className="absolute inset-0 bg-[#1c263b] rounded-lg shadow-sm" />
                  )}
                  <span className="relative z-10">{h}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Segmented Tabs */}
          <div className="px-5 pb-2">
            <div className="flex bg-[#0b101b] p-1 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-inner">
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                  activeTab === 'layout'
                    ? 'bg-[#1c263b] text-white shadow-sm'
                    : 'text-[#64748b] hover:text-white'
                }`}
              >
                <span>Estructura</span>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                  activeTab === 'content'
                    ? 'bg-[#1c263b] text-white shadow-sm'
                    : 'text-[#64748b] hover:text-white'
                }`}
              >
                <span>Bloques</span>
              </button>
              <button
                onClick={() => setActiveTab('env')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                  activeTab === 'env'
                    ? 'bg-[#1c263b] text-white shadow-sm'
                    : 'text-[#64748b] hover:text-white'
                }`}
              >
                <span>Entorno</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-1 custom-scrollbar pt-2">
            {activeTab === 'env' ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => onUpdateBackground(bg.id)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-[#3bf6ff]/40 transition-all bg-[#0b101b]"
                    >
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{ background: bg.css, backgroundSize: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white uppercase tracking-wide bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="h-px bg-white/5 my-4" />

                <div
                  className="p-4 rounded-xl border border-dashed border-white/10 hover:border-[#3bf6ff]/30 hover:bg-[#3bf6ff]/5 transition-all text-center group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-10 h-10 rounded-full bg-[#131b2e] flex items-center justify-center mx-auto mb-3 text-[#3bf6ff] group-hover:scale-110 transition-transform">
                    <Icons.Upload />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Subir Imagen Propia</h4>
                  <p className="text-[10px] text-[#64748b]">Soporta PNG, JPG (Max 2MB)</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="px-1 pb-2">
                  <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider">
                    {activeTab === 'layout' ? 'Componentes Estructurales' : 'Bloques de Contenido'}
                  </span>
                </div>
                {activeTab === 'layout'
                  ? layouts
                      .filter((l) => l.name !== 'Stage')
                      .map((c) => (
                        <ComponentItem key={c.name} comp={c} onInsertCode={onInsertCode} />
                      ))
                  : content.map((c) => (
                      <ComponentItem key={c.name} comp={c} onInsertCode={onInsertCode} />
                    ))}
              </>
            )}
            <div className="h-12" />
          </div>
        </div>
      ) : (
        /* Collapsed State */
        <div className="flex-1 pt-8 flex flex-col items-center gap-6 animate-in fade-in">
          <div className="flex flex-col gap-4 w-full items-center px-2">
            <div className="w-8 h-[1px] bg-white/5" />
            <button
              onClick={() => {
                toggleSidebar();
                setActiveTab('layout');
              }}
              className="group p-2.5 rounded-xl hover:bg-[#131b2e] text-[#64748b] hover:text-[#3bf6ff] transition-all border border-transparent hover:border-[#3bf6ff]/20"
              aria-label="Abrir estructura"
            >
              <div className="group-hover:scale-110 transition-transform">
                <Icons.Layout />
              </div>
            </button>
            <button
              onClick={() => {
                toggleSidebar();
                setActiveTab('content');
              }}
              className="group p-2.5 rounded-xl hover:bg-[#131b2e] text-[#64748b] hover:text-[#3bf6ff] transition-all border border-transparent hover:border-[#3bf6ff]/20"
              aria-label="Abrir bloques"
            >
              <div className="group-hover:scale-110 transition-transform">
                <Icons.Content />
              </div>
            </button>
            <button
              onClick={() => {
                toggleSidebar();
                setActiveTab('env');
              }}
              className="group p-2.5 rounded-xl hover:bg-[#131b2e] text-[#64748b] hover:text-[#3bf6ff] transition-all border border-transparent hover:border-[#3bf6ff]/20"
              aria-label="Abrir entorno"
            >
              <div className="group-hover:scale-110 transition-transform">
                <Icons.Image />
              </div>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default StudioSidebar;
