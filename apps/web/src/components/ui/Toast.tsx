'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * Configuración global de notificaciones toast
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Estilos por defecto
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#1e1b4b',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
        },
        // Success
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
          style: {
            background: 'rgba(236, 253, 245, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        },
        // Error
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
          style: {
            background: 'rgba(254, 242, 242, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#8b5cf6',
            secondary: 'white',
          },
        },
      }}
    />
  );
}

export { toast } from 'react-hot-toast';
