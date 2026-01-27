'use client';

import { useState, type ReactElement } from 'react';
import {
  ArrowLeft,
  Zap,
  Play,
  Layers,
  Flag,
  ChevronRight,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useCreateContent } from '../hooks';
import type { ContenidoBackend } from '@/lib/api/contenidos.api';
import styles from './ConfigMicroLeccionModal.module.css';

export interface ConfigMicroLeccionResult {
  id: string;
  data: ContenidoBackend;
}

interface ConfigMicroLeccionModalProps {
  onBack: () => void;
  onCreated: (result: ConfigMicroLeccionResult) => void;
}

export function ConfigMicroLeccionModal({
  onBack,
  onCreated,
}: ConfigMicroLeccionModalProps): ReactElement {
  const [titulo, setTitulo] = useState('');
  const { createMicroleccion, isCreating, error } = useCreateContent();

  const handleCreate = async (): Promise<void> => {
    if (!titulo.trim()) return;

    const result = await createMicroleccion({
      titulo: titulo.trim(),
      casaTipo: 'QUANTUM',
      mundoTipo: 'MATEMATICA',
    });

    if (result) {
      onCreated({ id: result.id, data: result });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && titulo.trim() && !isCreating) {
      handleCreate();
    }
  };

  return (
    <div className={styles.overlay}>
      {/* Background glows */}
      <div className={styles.glowViolet} aria-hidden="true" />
      <div className={styles.glowCyan} aria-hidden="true" />

      {/* Back button */}
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <ArrowLeft />
        <span>Volver</span>
      </button>

      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Zap />
          </div>
          <h1 className={styles.headerTitle}>Crear Micro-lección</h1>
          <p className={styles.headerSubtitle}>Una experiencia de aprendizaje breve y enfocada</p>
        </header>

        {/* Structure Preview */}
        <div className={styles.structurePreview}>
          <p className={styles.structureLabel}>Estructura de tu micro-lección</p>
          <div className={styles.structureFlow}>
            <div className={styles.structureStep} data-step="inicio">
              <div className={styles.stepIcon}>
                <Play />
              </div>
              <span className={styles.stepLabel}>Inicio</span>
              <span className={styles.stepDesc}>Presentación</span>
            </div>

            <div className={styles.structureArrow}>
              <ChevronRight />
            </div>

            <div className={styles.structureStep} data-step="contenido">
              <div className={styles.stepIcon}>
                <Layers />
              </div>
              <span className={styles.stepLabel}>Contenido</span>
              <span className={styles.stepDesc}>Tus intents</span>
            </div>

            <div className={styles.structureArrow}>
              <ChevronRight />
            </div>

            <div className={styles.structureStep} data-step="cierre">
              <div className={styles.stepIcon}>
                <Flag />
              </div>
              <span className={styles.stepLabel}>Cierre</span>
              <span className={styles.stepDesc}>Resumen</span>
            </div>
          </div>
        </div>

        {/* Lesson name input */}
        <div className={styles.inputGroup}>
          <label htmlFor="lessonName" className={styles.inputLabel}>
            Nombre de la micro-lección
          </label>
          <input
            id="lessonName"
            type="text"
            className={styles.input}
            placeholder="Introducción a Variables"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {/* Tip */}
        <div className={styles.tip}>
          <div className={styles.tipIcon}>
            <Lightbulb />
          </div>
          <p className={styles.tipText}>
            Las micro-lecciones son ideales para conceptos que se aprenden en 2-5 minutos
          </p>
        </div>

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onBack}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.continueBtn}
            onClick={handleCreate}
            disabled={!titulo.trim() || isCreating}
          >
            <span>{isCreating ? 'Creando...' : 'Crear Micro-lección'}</span>
            {!isCreating && <ArrowRight />}
          </button>
        </div>
      </div>
    </div>
  );
}
