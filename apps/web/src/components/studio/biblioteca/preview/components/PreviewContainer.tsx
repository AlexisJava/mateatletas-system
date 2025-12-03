'use client';

import React, { ReactElement, Suspense } from 'react';
import { Loader2, Eye } from 'lucide-react';
import { PreviewContainerProps } from '../types';
import { getPreview, hasPreview } from '../preview-registry';
import { NotImplementedPlaceholder } from './NotImplementedPlaceholder';
import { PropsDocumentationPanel } from './PropsDocumentationPanel';
import { BloqueMetadata } from '../../../blocks/types';

interface PreviewContainerFullProps extends PreviewContainerProps {
  componente: BloqueMetadata;
}

/**
 * Loading fallback para el preview
 */
function PreviewLoading(): ReactElement {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-white/50">Cargando preview...</p>
      </div>
    </div>
  );
}

/**
 * Contenedor del preview interactivo
 */
export function PreviewContainer({ componente }: PreviewContainerFullProps): ReactElement {
  const { tipo, implementado, nombre, descripcion, icono, categoria } = componente;

  // Si no está implementado, mostrar placeholder
  if (!implementado) {
    return (
      <NotImplementedPlaceholder
        nombre={nombre}
        descripcion={descripcion}
        icono={icono}
        categoria={categoria}
      />
    );
  }

  // Buscar preview registrado
  const previewDef = getPreview(tipo);

  // Si está implementado pero no tiene preview registrado
  if (!previewDef) {
    return (
      <div className="flex flex-col h-full">
        {/* Preview area sin componente */}
        <div className="flex-1 flex items-center justify-center min-h-[200px] bg-white/[0.02] rounded-lg border border-white/5 m-4">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Componente implementado</h3>
            <p className="text-sm text-white/50 max-w-sm">
              El componente <code className="text-orange-400">{tipo}</code> está implementado pero
              aún no tiene un preview visual registrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const PreviewComponent = previewDef.component;

  return (
    <div className="flex flex-col h-full">
      {/* Preview area */}
      <div className="flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-400" />
            Preview interactivo
          </h4>
          <span className="text-[10px] text-white/30">Podés interactuar con el componente</span>
        </div>

        <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6 min-h-[200px]">
          <Suspense fallback={<PreviewLoading />}>
            <PreviewComponent exampleData={previewDef.exampleData} interactive={true} />
          </Suspense>
        </div>
      </div>

      {/* Documentación de props */}
      <div className="border-t border-white/10">
        <PropsDocumentationPanel props={previewDef.propsDocumentation} />
      </div>
    </div>
  );
}
