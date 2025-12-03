'use client';

import React, { ReactElement } from 'react';
import {
  PropsDocumentationPanelProps,
  PropListItemProps,
  PropTypeBadgeProps,
  PropType,
} from '../types';
import { PROP_TYPE_COLORS } from '../constants';

/**
 * Badge que muestra el tipo de una prop
 */
function PropTypeBadge({ type }: PropTypeBadgeProps): ReactElement {
  const colors = PROP_TYPE_COLORS[type];

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${colors.bg} ${colors.text}`}
    >
      {type}
    </span>
  );
}

/**
 * Item individual de la lista de props
 */
function PropListItem({ prop }: PropListItemProps): ReactElement {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 min-w-[140px]">
        <code className="text-sm font-mono text-orange-400">{prop.name}</code>
        {prop.required && <span className="text-red-400 text-xs">*</span>}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <PropTypeBadge type={prop.type} />
          {prop.defaultValue && (
            <span className="text-[10px] text-white/30">
              default: <code className="text-white/50">{prop.defaultValue}</code>
            </span>
          )}
        </div>
        <p className="text-xs text-white/50">{prop.description}</p>
      </div>
    </div>
  );
}

/**
 * Panel que muestra la documentación de props del componente
 */
export function PropsDocumentationPanel({ props }: PropsDocumentationPanelProps): ReactElement {
  if (props.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-white/40">
        No hay documentación de props disponible
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
        <span>Props disponibles</span>
        <span className="text-xs font-normal text-white/40">({props.length})</span>
      </h4>
      <div className="bg-white/[0.02] rounded-lg border border-white/5 p-3">
        {props.map((prop) => (
          <PropListItem key={prop.name} prop={prop} />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-white/30">
        <span className="text-red-400">*</span> Props requeridas
      </p>
    </div>
  );
}
