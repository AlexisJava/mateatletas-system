'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for the preview panel.
 * Catches render errors from malformed JSON or invalid component props.
 */
export class PreviewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PreviewErrorBoundary] Render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-[#030014] p-8">
          <div className="max-w-md w-full bg-[#0f0720]/80 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-400"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2">Error de Renderizado</h3>

            {/* Description */}
            <p className="text-sm text-[#94a3b8] mb-4">
              El contenido JSON tiene props inválidas o estructura incorrecta que impide renderizar
              el preview.
            </p>

            {/* Error details */}
            <div className="bg-[#030014]/50 border border-white/5 rounded-lg p-3 mb-4">
              <code className="text-xs text-red-300 font-mono break-all">
                {this.state.error?.message || 'Error desconocido'}
              </code>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#1e1b4b] border border-white/10 text-white text-sm font-medium hover:bg-[#2e1065] transition-colors"
              >
                Reintentar
              </button>
            </div>

            {/* Tip */}
            <p className="text-[10px] text-[#64748b] mt-4 text-center">
              Tip: Verifica que los props del JSON coincidan con los tipos esperados
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PreviewErrorBoundary;
