'use client';

import React from 'react';
import * as DesignSystem from './DesignSystem';
import type { ContentBlock } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT MAP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps string type names to actual React components.
 * Supports Design System components and basic HTML elements.
 */
const ComponentMap: Record<string, React.ComponentType<Record<string, unknown>> | string> = {
  // Layout Components
  Stage: DesignSystem.Stage,
  ContentZone: DesignSystem.ContentZone,
  Columns: DesignSystem.Columns,

  // Content Components
  LessonHeader: DesignSystem.LessonHeader,
  ActionCard: DesignSystem.ActionCard,
  STEAMChallenge: DesignSystem.STEAMChallenge,
  MathHero: DesignSystem.MathHero,
  InfoAlert: DesignSystem.InfoAlert,
  StatCard: DesignSystem.StatCard,
  Formula: DesignSystem.Formula,
  Timeline: DesignSystem.Timeline,

  // Native HTML elements
  div: 'div',
  span: 'span',
  p: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
};

// ─────────────────────────────────────────────────────────────────────────────
// JSON RENDERER
// ─────────────────────────────────────────────────────────────────────────────

interface JSONRendererProps {
  data: ContentBlock | string | undefined | null;
}

/**
 * Recursively renders a ContentBlock tree as React components.
 *
 * @param data - The ContentBlock to render, or a string for text content
 * @returns React elements representing the content tree
 */
export function JSONRenderer({ data }: JSONRendererProps): React.ReactElement | null {
  // Handle null/undefined
  if (!data) return null;

  // Handle plain text
  if (typeof data === 'string') return <>{data}</>;

  // Resolve component from map
  const Component = ComponentMap[data.type];

  // Fallback for unknown components
  if (!Component) {
    return (
      <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-xl text-red-200 text-xs font-mono">
        Componente desconocido: <strong>{data.type}</strong>
      </div>
    );
  }

  // Render children recursively
  const renderChildren = (): React.ReactNode => {
    if (!data.children) return null;

    if (Array.isArray(data.children)) {
      return data.children.map((child, index) => <JSONRenderer key={index} data={child} />);
    }

    // Children is a string (text content)
    return data.children;
  };

  // Render the component with props and children
  return <Component {...(data.props || {})}>{renderChildren()}</Component>;
}

export default JSONRenderer;
