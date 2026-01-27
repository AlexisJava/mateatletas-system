'use client';

import { type ReactElement } from 'react';
import {
  Zap,
  Calendar,
  Play,
  Flag,
  Timer,
  Layers,
  GitBranch,
  Target,
  ArrowRight,
} from 'lucide-react';
import type { ContentType } from '../hooks';
import styles from './StartModal.module.css';

interface StartModalProps {
  onSelectType: (type: ContentType) => void;
}

const MICRO_LECCION_FEATURES = [
  { icon: Play, text: 'Pantalla de Inicio' },
  { icon: Flag, text: 'Pantalla de Cierre' },
  { icon: Timer, text: '2-5 minutos de contenido' },
];

const PLANIFICACION_FEATURES = [
  { icon: Layers, text: '4, 6, 8 o hasta 20 clases' },
  { icon: GitBranch, text: 'Estructura modular' },
  { icon: Target, text: 'Objetivos por clase' },
];

export function StartModal({ onSelectType }: StartModalProps): ReactElement {
  return (
    <div className={styles.overlay}>
      {/* Background glows */}
      <div className={styles.glowViolet} aria-hidden="true" />
      <div className={styles.glowCyan} aria-hidden="true" />

      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>S</div>
          <h1 className={styles.title}>¿Qué quieres crear hoy?</h1>
          <p className={styles.subtitle}>Elige el tipo de contenido educativo que vas a diseñar</p>
        </header>

        {/* Type Cards */}
        <div className={styles.cardsContainer}>
          {/* Micro-lección Card */}
          <button
            type="button"
            className={styles.typeCard}
            data-type="microleccion"
            onClick={() => onSelectType('microleccion')}
          >
            <div className={styles.cardIcon}>
              <Zap />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Micro-lección</h2>
              <p className={styles.cardDescription}>
                Contenido educativo breve y enfocado. Ideal para conceptos puntuales que se pueden
                aprender en pocos minutos.
              </p>
            </div>
            <div className={styles.cardFeatures}>
              {MICRO_LECCION_FEATURES.map((feature) => (
                <div key={feature.text} className={styles.feature}>
                  <feature.icon />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            <div className={styles.cardCta}>
              <span>Crear Micro-lección</span>
              <ArrowRight />
            </div>
          </button>

          {/* Planificación Card */}
          <button
            type="button"
            className={styles.typeCard}
            data-type="planificacion"
            onClick={() => onSelectType('planificacion')}
          >
            <div className={styles.cardIcon}>
              <Calendar />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Planificación</h2>
              <p className={styles.cardDescription}>
                Diseña un curso completo con múltiples clases estructuradas. Perfecto para programas
                de formación extensos.
              </p>
            </div>
            <div className={styles.cardFeatures}>
              {PLANIFICACION_FEATURES.map((feature) => (
                <div key={feature.text} className={styles.feature}>
                  <feature.icon />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            <div className={styles.cardCta}>
              <span>Crear Planificación</span>
              <ArrowRight />
            </div>
          </button>
        </div>

        {/* Recent Projects - placeholder for future implementation */}
        {/*
        <section className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h3 className={styles.recentTitle}>Proyectos recientes</h3>
            <button type="button" className={styles.recentViewAll}>
              Ver todos →
            </button>
          </div>
          <div className={styles.recentList}>
            {recentProjects.map((project) => (
              <button key={project.id} className={styles.recentItem}>
                ...
              </button>
            ))}
          </div>
        </section>
        */}
      </div>
    </div>
  );
}
