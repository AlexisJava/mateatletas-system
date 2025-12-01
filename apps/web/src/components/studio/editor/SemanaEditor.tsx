'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useEditorSemanaStore } from '@/stores/editor-semana.store';
import { cargarSemana, guardarSemana } from '@/services/studio';
import { listarHabilitados } from '@/services/studio/catalogo.service';
import { BloqueMetadata } from '../blocks/types';
import { EditorToolbar } from './EditorToolbar';
import { EditorVisual } from './EditorVisual';
import { EditorJSON } from './EditorJSON';
import { EditorPreview } from './EditorPreview';
import { EditorSidebar } from '../sidebar';

interface Props {
  cursoId: string;
  semanaNum: number;
}

export function SemanaEditor({ cursoId, semanaNum }: Props): React.ReactElement {
  const [showPreview, setShowPreview] = useState(false);
  const [componentesCatalogo, setComponentesCatalogo] = useState<BloqueMetadata[]>([]);

  // Store
  const {
    metadata,
    bloques,
    modoEdicion,
    bloqueSeleccionadoId,
    isDirty,
    isSaving,
    isLoading,
    error,
    setDatos,
    setMetadata,
    setModoEdicion,
    agregarBloque,
    eliminarBloque,
    moverBloque,
    duplicarBloque,
    actualizarBloqueConfig,
    actualizarBloqueTitulo,
    seleccionarBloque,
    importarJSON,
    exportarJSON,
    setLoading,
    setSaving,
    setError,
    marcarLimpio,
  } = useEditorSemanaStore();

  // Cargar datos iniciales
  useEffect(() => {
    const cargar = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const [semanaData, catalogoData] = await Promise.all([
          cargarSemana(cursoId, semanaNum),
          listarHabilitados(),
        ]);

        setDatos(
          cursoId,
          semanaNum,
          semanaData.metadata,
          semanaData.bloques,
          semanaData.componentesDisponibles,
        );
        setComponentesCatalogo(catalogoData);
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al cargar';
        setError(mensaje);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [cursoId, semanaNum, setDatos, setError, setLoading]);

  // Guardar
  const handleGuardar = useCallback(async (): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      await guardarSemana(cursoId, semanaNum, { metadata, bloques });
      marcarLimpio();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al guardar';
      setError(mensaje);
    } finally {
      setSaving(false);
    }
  }, [cursoId, semanaNum, metadata, bloques, setSaving, setError, marcarLimpio]);

  // Bloque seleccionado
  const bloqueSeleccionado = bloqueSeleccionadoId
    ? (bloques.find((b) => b.id === bloqueSeleccionadoId) ?? null)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <EditorToolbar
        modo={modoEdicion}
        onModoChange={setModoEdicion}
        onGuardar={handleGuardar}
        onPreview={() => setShowPreview(true)}
        isDirty={isDirty}
        isSaving={isSaving}
        error={error}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1">
          {modoEdicion === 'visual' ? (
            <EditorVisual
              bloques={bloques}
              bloqueSeleccionadoId={bloqueSeleccionadoId}
              onSeleccionar={seleccionarBloque}
              onMover={moverBloque}
              onAgregarBloque={() => agregarBloque('TextoEnriquecido')}
              onEliminarBloque={eliminarBloque}
              onDuplicarBloque={duplicarBloque}
              onTituloChange={actualizarBloqueTitulo}
              onConfigChange={actualizarBloqueConfig}
            />
          ) : (
            <EditorJSON value={exportarJSON()} onChange={importarJSON} />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <EditorSidebar
            metadata={metadata}
            onMetadataChange={setMetadata}
            bloqueSeleccionado={bloqueSeleccionado}
            onBloqueConfigChange={(contenido) => {
              if (bloqueSeleccionadoId) {
                actualizarBloqueConfig(bloqueSeleccionadoId, contenido);
              }
            }}
            componentesDisponibles={componentesCatalogo}
            onAgregarBloque={agregarBloque}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <EditorPreview isOpen={showPreview} onClose={() => setShowPreview(false)} bloques={bloques} />
    </div>
  );
}
