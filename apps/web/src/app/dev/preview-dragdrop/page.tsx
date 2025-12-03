'use client';

/**
 * Página de desarrollo para probar DragAndDrop sin autenticación
 * Acceso: http://localhost:3000/dev/preview-dragdrop
 */

import { DragAndDropPreview } from '@/components/studio/biblioteca/preview/previews/DragAndDropPreview';

export default function DevPreviewDragDrop() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          DragAndDrop Preview - Modo Desarrollo
        </h1>

        <div className="bg-slate-800 rounded-2xl p-6 border border-white/10">
          <DragAndDropPreview.component
            exampleData={DragAndDropPreview.exampleData}
            interactive={true}
          />
        </div>

        <div className="mt-8 bg-slate-800/50 rounded-xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3">Props del componente:</h2>
          <pre className="text-sm text-slate-300 overflow-x-auto">
            {JSON.stringify(DragAndDropPreview.propsDocumentation, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
