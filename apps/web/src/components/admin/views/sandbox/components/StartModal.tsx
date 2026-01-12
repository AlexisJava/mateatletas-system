'use client';

import { useState } from 'react';
import { useCreateContent, type ContentType } from '../hooks';
import type { CasaTipo, MundoTipo } from '@/lib/api/contenidos.api';
import styles from './StartModal.module.css';

interface StartModalProps {
  onCreated: (id: string, type: ContentType) => void;
}

const CASAS: { value: CasaTipo; label: string; color: string }[] = [
  { value: 'QUANTUM', label: 'Quantum', color: '#F472B6' },
  { value: 'VERTEX', label: 'Vertex', color: '#60A5FA' },
  { value: 'PULSAR', label: 'Pulsar', color: '#34D399' },
];

const MUNDOS: { value: MundoTipo; label: string }[] = [
  { value: 'MATEMATICA', label: 'Matemática' },
  { value: 'PROGRAMACION', label: 'Programación' },
  { value: 'CIENCIAS', label: 'Ciencias' },
];

export function StartModal({ onCreated }: StartModalProps) {
  const [contentType, setContentType] = useState<ContentType>('microleccion');
  const [casa, setCasa] = useState<CasaTipo>('QUANTUM');
  const [mundo, setMundo] = useState<MundoTipo>('MATEMATICA');
  const [titulo, setTitulo] = useState('');
  const [cantidadClases, setCantidadClases] = useState(8);

  const { createMicroleccion, createPlanificacion, isCreating, error } = useCreateContent();

  const handleCreate = async () => {
    if (!titulo.trim()) return;

    if (contentType === 'microleccion') {
      const result = await createMicroleccion({
        titulo: titulo.trim(),
        casaTipo: casa,
        mundoTipo: mundo,
      });
      if (result) onCreated(result.id, 'microleccion');
    } else {
      const result = await createPlanificacion({
        titulo: titulo.trim(),
        casaTipo: casa,
        mundoTipo: mundo,
        cantidadClases,
      });
      if (result) onCreated(result.id, 'planificacion');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Crear Contenido</h2>

        {/* Tipo de contenido */}
        <div className={styles.section}>
          <label className={styles.label}>Tipo</label>
          <div className={styles.typeCards}>
            <button
              type="button"
              className={`${styles.typeCard} ${contentType === 'microleccion' ? styles.active : ''}`}
              onClick={() => setContentType('microleccion')}
            >
              <span className={styles.typeIcon}>📄</span>
              <span>Microlección</span>
            </button>
            <button
              type="button"
              className={`${styles.typeCard} ${contentType === 'planificacion' ? styles.active : ''}`}
              onClick={() => setContentType('planificacion')}
            >
              <span className={styles.typeIcon}>📚</span>
              <span>Planificación</span>
            </button>
          </div>
        </div>

        {/* Casa */}
        <div className={styles.section}>
          <label className={styles.label}>Casa</label>
          <div className={styles.options}>
            {CASAS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.option} ${casa === c.value ? styles.active : ''}`}
                style={{ '--option-color': c.color } as React.CSSProperties}
                onClick={() => setCasa(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mundo */}
        <div className={styles.section}>
          <label className={styles.label}>Materia</label>
          <div className={styles.options}>
            {MUNDOS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`${styles.option} ${mundo === m.value ? styles.active : ''}`}
                onClick={() => setMundo(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cantidad de clases (solo planificación) */}
        {contentType === 'planificacion' && (
          <div className={styles.section}>
            <label className={styles.label}>Cantidad de clases</label>
            <input
              type="number"
              className={styles.input}
              value={cantidadClases}
              onChange={(e) => setCantidadClases(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={24}
            />
          </div>
        )}

        {/* Título */}
        <div className={styles.section}>
          <label className={styles.label}>Título</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Nombre del contenido..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={!titulo.trim() || isCreating}
        >
          {isCreating ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </div>
  );
}
