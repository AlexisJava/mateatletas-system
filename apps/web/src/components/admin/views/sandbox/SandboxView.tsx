'use client';

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

// Components
import { StudioSidebar } from './components/StudioSidebar';
import { CodePreview } from './components/CodePreview';
import { LessonPlayer } from './components/LessonPlayer';
import { PreviewErrorBoundary } from './components/PreviewErrorBoundary';
import { PublishModal, SuccessToast } from './components/PublishModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ViewportContext } from './components/DesignSystem';
import { SandboxIcons } from './components/SandboxIcons';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';

// Types & Constants
import { House, type Subject, type Lesson, type SandboxViewMode, type PreviewMode } from './types';
import { INITIAL_JSON, HOUSES } from './constants';

// Hooks
import { useDebouncedCallback, useAutoSave } from './hooks';

// API
import {
  createContenido,
  publicarContenido,
  addSlide as apiAddSlide,
  deleteSlide as apiDeleteSlide,
  subjectToMundoTipo,
  mundoTipoToSubject,
  type ContenidoBackend,
  type CasaTipo,
} from '@/lib/api/contenidos.api';

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX VIEW
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte respuesta del backend a Lesson del frontend */
function backendToLesson(contenido: ContenidoBackend): Lesson {
  return {
    id: contenido.id,
    title: contenido.titulo,
    house: contenido.casaTipo as House,
    subject: mundoTipoToSubject(contenido.mundoTipo),
    slides: contenido.slides.map((s) => ({
      id: s.id,
      title: s.titulo,
      content: s.contenidoJson,
    })),
  };
}

export function SandboxView() {
  // ─── Initial State ───
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendId, setBackendId] = useState<string | null>(null);
  const initialJsonString = JSON.stringify(INITIAL_JSON, null, 2);

  const [lesson, setLesson] = useState<Lesson>({
    id: 'l1',
    title: 'Nueva Lección',
    house: House.QUANTUM,
    subject: 'MATH',
    slides: [{ id: 's1', title: 'Main Sequence', content: initialJsonString }],
  });

  // ─── Auto-Save Hook ───
  const {
    status: saveStatus,
    errorMessage: saveError,
    saveSlideContent,
    saveSlideTitle,
    saveContenidoMeta,
  } = useAutoSave(backendId);

  // ─── Editor State ───
  const [activeSlideId, setActiveSlideId] = useState('s1');
  const [view, setView] = useState<SandboxViewMode>('split');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileScale, setMobileScale] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Publish State ───
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ─── Tab Editing State ───
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  // ─── Refs ───
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ─── Derived State ───
  const activeSlide = useMemo(() => {
    const found = lesson.slides.find((s) => s.id === activeSlideId);
    // slides siempre tiene al menos un elemento (inicializado en useState)
    return found ?? lesson.slides[0]!;
  }, [lesson.slides, activeSlideId]);

  const houseStyles = useMemo(() => HOUSES[lesson.house], [lesson.house]);

  // ─── Auto-Scaling for Mobile Simulator ───
  useLayoutEffect(() => {
    if (previewMode !== 'mobile' || !previewContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const TARGET_WIDTH = 450;
        const TARGET_HEIGHT = 900;

        const scaleX = width / TARGET_WIDTH;
        const scaleY = height / TARGET_HEIGHT;

        let newScale = Math.min(scaleX, scaleY, 1);
        newScale = Math.max(newScale * 0.95, 0.4);

        setMobileScale(newScale);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [previewMode, view]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Format
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFormatCode();
      }
      // Cmd/Ctrl + Enter = Play
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsPlayerOpen(true);
      }
      // Escape = Close player
      if (e.key === 'Escape' && isPlayerOpen) {
        setIsPlayerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerOpen]);

  // ─── Editor Handlers ───
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const updateSlideContent = useCallback(
    (value: string) => {
      setLesson((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => (s.id === activeSlideId ? { ...s, content: value } : s)),
      }));
      // Trigger auto-save to backend
      if (backendId) {
        saveSlideContent(activeSlideId, value);
      }
    },
    [activeSlideId, backendId, saveSlideContent],
  );

  const debouncedUpdateContent = useDebouncedCallback(updateSlideContent, 150);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      debouncedUpdateContent(value);
    }
  };

  const handleInsertCode = (snippet: string) => {
    const editor = editorRef.current;
    if (editor) {
      const selection = editor.getSelection();
      if (selection) {
        const op = { range: selection, text: snippet, forceMoveMarkers: true };
        editor.executeEdits('sandbox', [op]);
        editor.focus();
        setTimeout(() => editor.getAction('editor.action.formatDocument')?.run(), 100);
      }
    } else {
      updateSlideContent(activeSlide.content + '\n' + snippet);
    }
  };

  const handleUpdateBackground = (bg: string) => {
    try {
      const jsonContent = JSON.parse(activeSlide.content);
      if (jsonContent.type === 'Stage') {
        jsonContent.props = { ...jsonContent.props, background: bg };
        const newCode = JSON.stringify(jsonContent, null, 2);
        updateSlideContent(newCode);
      }
    } catch {
      console.error('No se pudo actualizar el fondo: JSON inválido');
    }
  };

  // ─── Slide Management ───
  const addSlide = async () => {
    const tempId = `s${Date.now()}`;
    const newTitle = `Sequence ${lesson.slides.length + 1}`;

    // Optimistic update
    setLesson((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: tempId, title: newTitle, content: initialJsonString }],
    }));
    setActiveSlideId(tempId);

    // Sync with backend
    if (backendId) {
      try {
        const newSlide = await apiAddSlide(backendId, {
          titulo: newTitle,
          contenidoJson: initialJsonString,
        });
        // Replace temp ID with real ID
        setLesson((prev) => ({
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === tempId
              ? { id: newSlide.id, title: newSlide.titulo, content: newSlide.contenidoJson }
              : s,
          ),
        }));
        setActiveSlideId(newSlide.id);
      } catch (error) {
        console.error('Error al agregar slide:', error);
      }
    }
  };

  const removeSlide = async (id: string) => {
    if (lesson.slides.length === 1) return;

    const newSlides = lesson.slides.filter((s) => s.id !== id);

    // Optimistic update
    setLesson((prev) => ({ ...prev, slides: newSlides }));
    if (activeSlideId === id) setActiveSlideId(newSlides[0]!.id);

    // Sync with backend
    if (backendId) {
      try {
        await apiDeleteSlide(backendId, id);
      } catch (error) {
        console.error('Error al eliminar slide:', error);
        // Revert on error
        setLesson((prev) => {
          const slide = lesson.slides.find((s) => s.id === id);
          if (slide) {
            return { ...prev, slides: [...prev.slides, slide] };
          }
          return prev;
        });
      }
    }
  };

  // ─── Tab Renaming ───
  const startEditingTab = (slideId: string, currentTitle: string) => {
    setEditingTabId(slideId);
    setTempTitle(currentTitle);
  };

  const saveTabTitle = () => {
    if (editingTabId && tempTitle.trim() !== '') {
      setLesson((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => (s.id === editingTabId ? { ...s, title: tempTitle } : s)),
      }));
      // Auto-save title to backend
      if (backendId) {
        saveSlideTitle(editingTabId, tempTitle);
      }
    }
    setEditingTabId(null);
  };

  // ─── Start Handler ───
  const handleStart = async (house: House, subject: Subject, pattern: string) => {
    const tempObj = JSON.parse(initialJsonString);
    tempObj.props.pattern = pattern;
    const newCode = JSON.stringify(tempObj, null, 2);

    setIsLoading(true);
    try {
      // Crear borrador en backend
      const contenido = await createContenido({
        titulo: 'Nueva Lección',
        casaTipo: house as CasaTipo,
        mundoTipo: subjectToMundoTipo(subject),
        slides: [{ titulo: 'Main Sequence', contenidoJson: newCode }],
      });

      // Actualizar estado local con datos del backend
      setBackendId(contenido.id);
      setLesson(backendToLesson(contenido));
      setActiveSlideId(contenido.slides[0]?.id ?? 's1');
      setHasStarted(true);
    } catch (error) {
      console.error('Error al crear contenido:', error);
      // Fallback: continuar sin backend
      setLesson((prev) => {
        const firstSlide = prev.slides[0]!;
        return {
          ...prev,
          house,
          subject,
          slides: [{ id: firstSlide.id, title: firstSlide.title, content: newCode }],
        };
      });
      setHasStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Publish Handler ───
  const handlePublish = async () => {
    if (!backendId) {
      console.error('No hay contenido guardado para publicar');
      return;
    }

    setIsPublishing(true);
    try {
      await publicarContenido(backendId);
      setShowPublishModal(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error al publicar:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── Render Welcome Screen ───
  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // ─── Render Main Editor ───
  return (
    <div className="flex h-[calc(100vh-10rem)] bg-[#030014] text-slate-200 overflow-hidden font-sans selection:bg-[#a855f7]/30 relative rounded-2xl border border-white/5">
      {/* Modals */}
      {showPublishModal && (
        <PublishModal
          isPublishing={isPublishing}
          onClose={() => setShowPublishModal(false)}
          onConfirm={handlePublish}
          lessonTitle={lesson.title}
          slideCount={lesson.slides.length}
        />
      )}
      {showSuccessToast && <SuccessToast />}

      {/* Sidebar */}
      <StudioSidebar
        currentHouse={lesson.house}
        setHouse={(h) => setLesson((prev) => ({ ...prev, house: h }))}
        onInsertCode={handleInsertCode}
        onUpdateBackground={handleUpdateBackground}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#030014]">
        {/* Navbar */}
        <div className="h-14 flex items-center justify-between px-4 bg-[#030014] shrink-0 z-20 border-b border-[#8b5cf6]/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#0f0720] p-1.5 pr-4 rounded-full border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-sm text-[#a855f7]">
                <SandboxIcons.Document />
              </div>
              <input
                value={lesson.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setLesson((prev) => ({ ...prev, title: newTitle }));
                  if (backendId) {
                    saveContenidoMeta({ titulo: newTitle });
                  }
                }}
                className="bg-transparent text-sm font-bold text-white focus:outline-none w-48 placeholder-[#64748b]"
                placeholder="Nombre del Proyecto"
              />
            </div>
            <SaveStatusIndicator status={saveStatus} errorMessage={saveError} />
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-[#0f0720] p-1 rounded-full border border-white/5">
              {(['split', 'editor', 'preview'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-wide ${view === v ? 'bg-[#1e1b4b] text-white shadow-sm ring-1 ring-white/10' : 'text-[#64748b] hover:text-white'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Publish Button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 rounded-full border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-2"
              aria-label="Publicar lección"
            >
              <SandboxIcons.Upload />
              Publicar
            </button>

            {/* Play Button */}
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="group w-9 h-9 rounded-full bg-white text-black hover:bg-[#06b6d4] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              aria-label="Previsualizar lección (Cmd+Enter)"
            >
              <SandboxIcons.Play />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="h-10 px-4 flex items-end gap-0.5 overflow-x-auto hide-scrollbar shrink-0 bg-[#030014] pt-2 select-none z-10">
          {lesson.slides.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSlideId(s.id)}
              className={`group relative px-5 py-2 rounded-t-[1rem] text-[11px] font-bold transition-all flex items-center gap-3 border-t border-x min-w-[140px] max-w-[200px] cursor-pointer ${
                activeSlideId === s.id
                  ? 'bg-[#0f0720] border-[#8b5cf6]/20 text-white z-10'
                  : 'bg-transparent border-transparent text-[#64748b] hover:bg-[#0f0720]/50 hover:text-white z-0'
              }`}
              title="Doble click para renombrar"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${activeSlideId === s.id ? 'bg-[#a855f7] shadow-[0_0_5px_#a855f7]' : 'bg-[#1e1b4b]'}`}
              />

              <div
                className="flex-1 truncate relative"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditingTab(s.id, s.title);
                }}
              >
                {editingTabId === s.id ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={saveTabTitle}
                    onKeyDown={(e) => e.key === 'Enter' && saveTabTitle()}
                    className="bg-transparent border-b border-[#a855f7] text-white w-full outline-none p-0 m-0 font-mono"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="font-mono cursor-text hover:text-[#a855f7] transition-colors">
                    {s.title}
                  </span>
                )}
              </div>

              {lesson.slides.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 w-4 h-4 rounded-full flex items-center justify-center transition-all text-sm leading-none pb-0.5"
                >
                  ×
                </span>
              )}

              {activeSlideId === s.id && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-1 bg-[#0f0720] z-20" />
              )}
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-8 h-8 rounded-full hover:bg-[#0f0720] text-[#64748b] hover:text-[#a855f7] flex items-center justify-center transition-all ml-1 mb-0.5"
            aria-label="Agregar slide"
          >
            <SandboxIcons.Plus />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden gap-4 bg-[#030014] relative z-0 px-4 pb-4">
          {/* EDITOR */}
          {(view === 'split' || view === 'editor') && (
            <div
              className={`flex-1 relative flex flex-col ${view === 'editor' ? 'w-full' : 'w-1/2'} bg-[#0f0720] rounded-b-2xl rounded-tr-2xl rounded-tl-none overflow-hidden border border-[#8b5cf6]/20 shadow-2xl group transition-all duration-300`}
            >
              <div className="absolute top-3 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleFormatCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1b4b]/90 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-bold text-[#94a3b8] hover:text-white hover:bg-[#2e1065] transition-colors shadow-lg"
                  aria-label="Formatear JSON (Cmd+S)"
                >
                  <SandboxIcons.Format />
                  <span>PRETTIFY</span>
                </button>
              </div>

              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={activeSlide.content}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontLigatures: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 24, bottom: 24 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  bracketPairColorization: { enabled: true },
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          )}

          {/* PREVIEW */}
          {(view === 'split' || view === 'preview') && (
            <div
              className={`flex-1 relative flex flex-col ${view === 'preview' ? 'w-full' : 'w-1/2'} transition-all duration-300`}
            >
              <div
                ref={previewContainerRef}
                className="absolute inset-0 bg-[#0f0720] rounded-2xl border border-white/5 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f0720_90%)]" />
              </div>

              <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
                {previewMode === 'mobile' ? (
                  <div
                    style={{ transform: `scale(${mobileScale})` }}
                    className="origin-center transition-transform duration-300 ease-out will-change-transform"
                  >
                    <div className="relative w-[375px] h-[780px] bg-black rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_0_12px_#1a1a1a,0_0_0_13px_#333] border-4 border-[#1a1a1a] overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
                        <div className="w-16 h-1 bg-[#1a1a1a] rounded-full" />
                        <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
                      </div>
                      <div
                        className="w-full h-full bg-[#030014] overflow-hidden relative"
                        style={
                          {
                            '--house-primary': houseStyles.primaryColor,
                            '--house-secondary': houseStyles.secondaryColor,
                            '--house-accent': houseStyles.accentColor,
                          } as React.CSSProperties
                        }
                      >
                        <ViewportContext.Provider value={{ isMobile: true }}>
                          <PreviewErrorBoundary onReset={() => setRefreshKey((k) => k + 1)}>
                            <CodePreview
                              code={activeSlide.content}
                              key={`${activeSlide.id}-${refreshKey}`}
                              showGuidelines={false}
                            />
                          </PreviewErrorBoundary>
                        </ViewportContext.Provider>
                        <div className="absolute top-1 right-5 text-[10px] font-bold text-white z-40">
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full max-h-[700px] bg-[#030014] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/50">
                    <div className="h-8 bg-[#0b101b] border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <div className="flex-1 bg-[#02040a] h-5 rounded flex items-center justify-center text-[9px] text-[#64748b] font-mono border border-white/5">
                        <span className="text-[#a855f7]">localhost</span>:3000/preview
                      </div>
                    </div>
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
                      <PreviewErrorBoundary onReset={() => setRefreshKey((k) => k + 1)}>
                        <CodePreview
                          code={activeSlide.content}
                          key={`${activeSlide.id}-${refreshKey}`}
                          showGuidelines={true}
                        />
                      </PreviewErrorBoundary>
                    </div>
                  </div>
                )}

                {/* Floating Control Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0f0720]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 hover:scale-105 transition-transform duration-300">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-full transition-all duration-300 ${previewMode === 'desktop' ? 'bg-[#3bf6ff]/10 text-[#3bf6ff] shadow-[0_0_15px_rgba(59,246,255,0.2)]' : 'text-[#64748b] hover:text-white hover:bg-white/5'}`}
                    aria-label="Modo escritorio"
                  >
                    <SandboxIcons.Desktop />
                  </button>
                  <div className="w-px h-4 bg-white/10" />
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-full transition-all duration-300 ${previewMode === 'mobile' ? 'bg-[#3bf6ff]/10 text-[#3bf6ff] shadow-[0_0_15px_rgba(59,246,255,0.2)]' : 'text-[#64748b] hover:text-white hover:bg-white/5'}`}
                    aria-label="Modo móvil"
                  >
                    <SandboxIcons.Mobile />
                  </button>
                  <div className="w-px h-4 bg-white/10" />
                  <button
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="p-2 rounded-full text-[#64748b] hover:text-[#00ffa3] hover:bg-[#00ffa3]/10 transition-all active:rotate-180 duration-500"
                    aria-label="Recargar preview"
                  >
                    <SandboxIcons.Refresh />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lesson Player Overlay */}
      {isPlayerOpen && (
        <LessonPlayer
          lesson={lesson}
          houseStyles={houseStyles}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
}

export default SandboxView;
