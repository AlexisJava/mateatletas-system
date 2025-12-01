'use client';

import React, { useState } from 'react';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import { BloqueJson } from '../../blocks/types';

interface Props {
  bloque: BloqueJson;
  isSelected: boolean;
  onSelect: () => void;
  onTituloChange: (titulo: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function BloqueWrapper({
  bloque,
  isSelected,
  onSelect,
  onTituloChange,
  onDuplicate,
  onDelete,
  children,
  dragHandleProps,
}: Props): React.ReactElement {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(bloque.titulo);

  const handleTitleSubmit = (): void => {
    setIsEditingTitle(false);
    if (titleValue.trim() !== bloque.titulo) {
      onTituloChange(titleValue.trim() || bloque.titulo);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleValue(bloque.titulo);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg border-2 bg-white transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Título editable */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="w-full rounded border border-blue-300 px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="truncate text-left text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {bloque.titulo}
            </button>
          )}
        </div>

        {/* Tipo de componente */}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {bloque.componente}
        </span>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
