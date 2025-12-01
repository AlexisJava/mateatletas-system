'use client';

import React, { useState } from 'react';
import { FileText, Settings, PlusCircle } from 'lucide-react';
import { BloqueJson, BloqueMetadata, SemanaMetadata } from '../blocks/types';
import { SemanaMetadataPanel } from './SemanaMetadataPanel';
import { PropiedadesPanel } from './PropiedadesPanel';
import { ComponentePicker } from './ComponentePicker';

type TabId = 'metadata' | 'propiedades' | 'agregar';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'metadata', label: 'Metadata', icon: <FileText className="h-4 w-4" /> },
  { id: 'propiedades', label: 'Propiedades', icon: <Settings className="h-4 w-4" /> },
  { id: 'agregar', label: 'Agregar', icon: <PlusCircle className="h-4 w-4" /> },
];

interface Props {
  metadata: SemanaMetadata;
  onMetadataChange: (metadata: Partial<SemanaMetadata>) => void;
  bloqueSeleccionado: BloqueJson | null;
  onBloqueConfigChange: (contenido: Record<string, unknown>) => void;
  componentesDisponibles: BloqueMetadata[];
  onAgregarBloque: (tipo: string) => void;
}

export function EditorSidebar({
  metadata,
  onMetadataChange,
  bloqueSeleccionado,
  onBloqueConfigChange,
  componentesDisponibles,
  onAgregarBloque,
}: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('metadata');

  // Cambiar automáticamente a propiedades cuando se selecciona un bloque
  React.useEffect(() => {
    if (bloqueSeleccionado && activeTab !== 'propiedades') {
      setActiveTab('propiedades');
    }
  }, [bloqueSeleccionado, activeTab]);

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'metadata':
        return <SemanaMetadataPanel metadata={metadata} onChange={onMetadataChange} />;
      case 'propiedades':
        return <PropiedadesPanel bloque={bloqueSeleccionado} onChange={onBloqueConfigChange} />;
      case 'agregar':
        return (
          <ComponentePicker componentes={componentesDisponibles} onSeleccionar={onAgregarBloque} />
        );
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{renderContent()}</div>
    </div>
  );
}
