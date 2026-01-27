'use client';

import { useState, type ReactElement } from 'react';
import { ArrowLeft, Calendar, Check, ArrowRight } from 'lucide-react';
import { useCreateContent } from '../hooks';
import type { Planificacion } from '@/lib/api/planificaciones-admin.api';
import styles from './ConfigPlanificacionModal.module.css';

export interface ConfigPlanificacionResult {
  id: string;
  data: Planificacion;
}

interface ConfigPlanificacionModalProps {
  onBack: () => void;
  onCreated: (result: ConfigPlanificacionResult) => void;
}

const CLASS_OPTIONS = [4, 6, 8, 12, 16, 20];

export function ConfigPlanificacionModal({
  onBack,
  onCreated,
}: ConfigPlanificacionModalProps): ReactElement {
  const [titulo, setTitulo] = useState('');
  const [cantidadClases, setCantidadClases] = useState(8);
  const [customClases, setCustomClases] = useState('');
  const { createPlanificacion, isCreating, error } = useCreateContent();

  const handleSelectOption = (value: number): void => {
    setCantidadClases(value);
    setCustomClases('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setCustomClases(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setCantidadClases(parsed);
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (!titulo.trim()) return;

    const result = await createPlanificacion({
      titulo: titulo.trim(),
      casaTipo: 'QUANTUM',
      mundoTipo: 'MATEMATICA',
      cantidadClases,
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
            <Calendar />
          </div>
          <h1 className={styles.headerTitle}>Configurar Planificación</h1>
          <p className={styles.headerSubtitle}>¿Cuántas clases tendrá tu curso?</p>
        </header>

        {/* Options Grid */}
        <div className={styles.optionsGrid}>
          {CLASS_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.optionCard} ${cantidadClases === value && !customClases ? styles.selected : ''}`}
              onClick={() => handleSelectOption(value)}
            >
              <span className={styles.optionNumber}>{value}</span>
              <span className={styles.optionLabel}>clases</span>
              <div className={styles.optionCheck}>
                <Check />
              </div>
            </button>
          ))}
        </div>

        {/* Custom option */}
        <div className={styles.customOption}>
          <span>O ingresa un número personalizado:</span>
          <input
            type="number"
            className={styles.customInput}
            value={customClases}
            onChange={handleCustomChange}
            min={1}
            max={50}
            placeholder="—"
          />
          <span>clases</span>
        </div>

        {/* Course name input */}
        <div className={styles.inputGroup}>
          <label htmlFor="courseName" className={styles.inputLabel}>
            Nombre del curso
          </label>
          <input
            id="courseName"
            type="text"
            className={styles.input}
            placeholder="Mi nuevo curso"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={handleKeyDown}
          />
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
            <span>{isCreating ? 'Creando...' : 'Crear Planificación'}</span>
            {!isCreating && <ArrowRight />}
          </button>
        </div>
      </div>
    </div>
  );
}
