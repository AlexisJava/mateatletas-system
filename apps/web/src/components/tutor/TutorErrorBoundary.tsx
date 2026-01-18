'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface TutorErrorBoundaryProps {
  children: ReactNode;
}

interface TutorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para el Portal de Tutores
 *
 * Captura errores de renderizado en componentes hijos y muestra
 * una UI amigable con opciones de recuperación.
 *
 * Importante: Los Error Boundaries solo capturan errores en:
 * - Render methods
 * - Lifecycle methods
 * - Constructors
 *
 * NO capturan errores en:
 * - Event handlers
 * - Código asíncrono
 * - Server-side rendering
 * - Errores en el propio boundary
 */
export class TutorErrorBoundary extends Component<
  TutorErrorBoundaryProps,
  TutorErrorBoundaryState
> {
  constructor(props: TutorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<TutorErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(_error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // En producción, aquí enviaríamos el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    // errorTrackingService.captureException(_error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/tutor';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Card con glassmorphism */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              {/* Icono */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Título */}
              <h1 className="text-xl font-semibold text-white text-center mb-2">Algo salió mal</h1>

              {/* Descripción */}
              <p className="text-slate-400 text-center mb-6">
                Ocurrió un error inesperado. No te preocupes, tus datos están seguros. Podés
                intentar recargar la página o volver al inicio.
              </p>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-xl border border-white/[0.1] transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recargar página
                </button>
              </div>

              {/* Detalles técnicos (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6">
                  <summary className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                    <Bug className="w-4 h-4" />
                    Detalles técnicos
                  </summary>
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm font-mono break-all">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-xs text-slate-500 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Mensaje de soporte */}
            <p className="text-center text-slate-500 text-sm mt-4">
              Si el problema persiste,{' '}
              <a
                href="mailto:soporte@mateatletas.com"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                contactá a soporte
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TutorErrorBoundary;
