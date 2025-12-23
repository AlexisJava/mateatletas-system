'use client';

import { useState, useCallback } from 'react';
import { useCanvasStore } from '../stores/canvas.store';
import { allThemeList } from '@/design-system/themes';

export function Toolbar() {
  const {
    zoom,
    setZoom,
    snapToGrid,
    toggleSnapToGrid,
    gridSize,
    setGridSize,
    themeId,
    setTheme,
    history,
    historyIndex,
    undo,
    redo,
    exportToJson,
  } = useCanvasStore();

  const [projectName, setProjectName] = useState('Sin título');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(zoom + 0.25, 3));
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(zoom - 0.25, 0.25));
  }, [zoom, setZoom]);

  const handleSave = useCallback(() => {
    const json = exportToJson();
    console.log('Saved canvas:', json);
    // TODO: Implement actual save
  }, [exportToJson]);

  const handlePreview = useCallback(() => {
    console.log('Preview clicked');
    // TODO: Open preview in new tab
  }, []);

  const currentTheme = allThemeList.find((t) => t.id === themeId);

  return (
    <div
      className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4"
      data-testid="toolbar"
    >
      {/* Left Group */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="font-semibold text-gray-900">Studio</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="px-2 py-1 text-sm border-0 border-b border-transparent hover:border-gray-300 focus:border-cyan-500 focus:outline-none bg-transparent"
          placeholder="Nombre del proyecto"
          data-testid="project-name"
        />
      </div>

      {/* Center Group */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Deshacer (Ctrl+Z)"
          data-testid="btn-undo"
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Rehacer (Ctrl+Y)"
          data-testid="btn-redo"
        >
          ↪️
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Zoom */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          title="Alejar"
          data-testid="btn-zoom-out"
        >
          ➖
        </button>
        <span className="text-sm text-gray-600 min-w-[50px] text-center" data-testid="zoom-level">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          title="Acercar"
          data-testid="btn-zoom-in"
        >
          ➕
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Grid & Snap */}
        <button
          onClick={toggleSnapToGrid}
          className={`p-2 rounded-lg transition-colors ${
            snapToGrid ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-gray-100 text-gray-500'
          }`}
          title={snapToGrid ? 'Desactivar ajuste a grilla' : 'Activar ajuste a grilla'}
          data-testid="btn-snap"
        >
          📏
        </button>
        {snapToGrid && (
          <select
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
            data-testid="grid-size"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={40}>40px</option>
            <option value={50}>50px</option>
          </select>
        )}
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-3">
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            data-testid="theme-selector"
          >
            <span>{currentTheme?.emoji ?? '🎨'}</span>
            <span>{currentTheme?.name ?? 'Tema'}</span>
            <span className="text-gray-400">▼</span>
          </button>

          {showThemeDropdown && (
            <div
              className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
              data-testid="theme-dropdown"
            >
              {['programming', 'math', 'science'].map((area) => (
                <div key={area}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    {area === 'programming'
                      ? 'Programación'
                      : area === 'math'
                        ? 'Matemáticas'
                        : 'Ciencias'}
                  </div>
                  {allThemeList
                    .filter((t) => t.area === area)
                    .map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setShowThemeDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          theme.id === themeId ? 'bg-cyan-50 text-cyan-700' : 'text-gray-700'
                        }`}
                      >
                        <span>{theme.emoji}</span>
                        <span>{theme.name}</span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <button
          onClick={handlePreview}
          className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          data-testid="btn-preview"
        >
          Vista previa
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          data-testid="btn-save"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
