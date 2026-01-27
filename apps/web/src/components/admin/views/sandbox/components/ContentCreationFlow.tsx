'use client';

import { useState, type ReactElement } from 'react';
import { StartModal } from './StartModal';
import { ConfigMicroLeccionModal, type ConfigMicroLeccionResult } from './ConfigMicroLeccionModal';
import {
  ConfigPlanificacionModal,
  type ConfigPlanificacionResult,
} from './ConfigPlanificacionModal';
import type { ContentType } from '../hooks';
import type { ContenidoBackend } from '@/lib/api/contenidos.api';
import type { Planificacion } from '@/lib/api/planificaciones-admin.api';

type FlowStep = 'select-type' | 'config-microleccion' | 'config-planificacion';

export interface CreatedContentResult {
  id: string;
  type: ContentType;
  data: ContenidoBackend | Planificacion;
}

interface ContentCreationFlowProps {
  onCreated: (result: CreatedContentResult) => void;
}

export function ContentCreationFlow({ onCreated }: ContentCreationFlowProps): ReactElement {
  const [step, setStep] = useState<FlowStep>('select-type');

  const handleSelectType = (type: ContentType): void => {
    if (type === 'microleccion') {
      setStep('config-microleccion');
    } else {
      setStep('config-planificacion');
    }
  };

  const handleBack = (): void => {
    setStep('select-type');
  };

  const handleMicroLeccionCreated = (result: ConfigMicroLeccionResult): void => {
    onCreated({
      id: result.id,
      type: 'microleccion',
      data: result.data,
    });
  };

  const handlePlanificacionCreated = (result: ConfigPlanificacionResult): void => {
    onCreated({
      id: result.id,
      type: 'planificacion',
      data: result.data,
    });
  };

  switch (step) {
    case 'select-type':
      return <StartModal onSelectType={handleSelectType} />;
    case 'config-microleccion':
      return <ConfigMicroLeccionModal onBack={handleBack} onCreated={handleMicroLeccionCreated} />;
    case 'config-planificacion':
      return (
        <ConfigPlanificacionModal onBack={handleBack} onCreated={handlePlanificacionCreated} />
      );
  }
}
