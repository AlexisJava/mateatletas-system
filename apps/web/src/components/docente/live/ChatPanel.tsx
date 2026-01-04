'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  MessageCircleOff,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { MensajeChat, ChatConnectionState } from './types';

interface ChatPanelProps {
  /** Lista de mensajes */
  mensajes: MensajeChat[];
  /** Estado de conexión */
  connectionState: ChatConnectionState;
  /** Error actual (si hay) */
  error: string | null;
  /** Si el chat está habilitado (controlado por el docente) */
  chatHabilitado?: boolean;
  /** Si el usuario actual es docente (para mostrar toggle) */
  isDocente?: boolean;
  /** Función para enviar mensaje */
  onSendMessage: (contenido: string) => Promise<{ exito: boolean; error?: string }>;
  /** Función para toggle del chat (solo docentes) */
  onToggleChat?: (habilitado: boolean) => Promise<{ exito: boolean; error?: string }>;
  /** Función para reconectar */
  onReconnect: () => void;
  /** ID del usuario actual (para diferenciar mensajes propios) */
  currentUserId?: string;
}

/**
 * Panel de chat en tiempo real para clases en vivo
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({
  mensajes,
  connectionState,
  error,
  chatHabilitado = true,
  isDocente = false,
  onSendMessage,
  onToggleChat,
  onReconnect,
  currentUserId,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handler para toggle del chat
  const handleToggleChat = async () => {
    if (!onToggleChat || isToggling) return;
    setIsToggling(true);
    await onToggleChat(!chatHabilitado);
    setIsToggling(false);
  };

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Manejador de envío
  const handleSend = async () => {
    const contenido = inputValue.trim();
    if (!contenido || isSending) return;

    // Validar longitud
    if (contenido.length > 2000) {
      setSendError('El mensaje es muy largo (máx. 2000 caracteres)');
      return;
    }

    setIsSending(true);
    setSendError(null);

    const result = await onSendMessage(contenido);

    if (result.exito) {
      setInputValue('');
      inputRef.current?.focus();
    } else {
      setSendError(result.error || 'Error al enviar mensaje');
    }

    setIsSending(false);
  };

  // Manejador de Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Formatear timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener color según rol
  const getRolColor = (rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN') => {
    switch (rol) {
      case 'DOCENTE':
        return 'text-emerald-400';
      case 'ADMIN':
        return 'text-amber-400';
      default:
        return 'text-blue-400';
    }
  };

  // Obtener badge según rol
  const getRolBadge = (rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN') => {
    if (rol === 'DOCENTE') {
      return (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
          DOCENTE
        </span>
      );
    }
    if (rol === 'ADMIN') {
      return (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded">
          ADMIN
        </span>
      );
    }
    return null;
  };

  // Renderizar indicador de conexión
  const renderConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <div className="flex items-center gap-1 text-emerald-400">
            <Wifi size={14} />
            <span className="text-xs">Conectado</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1 text-amber-400">
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-xs">Conectando...</span>
          </div>
        );
      case 'error':
        return (
          <button
            onClick={onReconnect}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <AlertCircle size={14} />
            <span className="text-xs">Reconectar</span>
          </button>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-slate-500">
            <WifiOff size={14} />
            <span className="text-xs">Desconectado</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Chat</h3>
          {/* Toggle para docente */}
          {isDocente && onToggleChat && (
            <button
              onClick={handleToggleChat}
              disabled={isToggling || connectionState !== 'connected'}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                chatHabilitado
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={chatHabilitado ? 'Deshabilitar chat' : 'Habilitar chat'}
            >
              {isToggling ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : chatHabilitado ? (
                <ToggleRight size={14} />
              ) : (
                <ToggleLeft size={14} />
              )}
              <span>{chatHabilitado ? 'Activo' : 'Pausado'}</span>
            </button>
          )}
        </div>
        {renderConnectionStatus()}
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensajes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">No hay mensajes aún</p>
          </div>
        ) : (
          mensajes.map((mensaje) => {
            const isOwn = mensaje.visibleIdUsuario === currentUserId;

            return (
              <div
                key={mensaje.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Header del mensaje */}
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-xs font-medium ${getRolColor(mensaje.rol)}`}>
                    {mensaje.nombreUsuario}
                  </span>
                  {getRolBadge(mensaje.rol)}
                  <span className="text-[10px] text-slate-500">
                    {formatTime(mensaje.timestamp)}
                  </span>
                </div>

                {/* Contenido del mensaje */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{mensaje.contenido}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        {/* Banner de chat deshabilitado (solo para no-docentes) */}
        {!chatHabilitado && !isDocente && (
          <div className="flex items-center justify-center gap-2 py-2 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <MessageCircleOff size={16} className="text-amber-400" />
            <span className="text-xs text-amber-400">El chat está pausado por el docente</span>
          </div>
        )}
        {sendError && <p className="text-xs text-red-400 mb-2">{sendError}</p>}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !chatHabilitado && !isDocente
                ? 'Chat pausado...'
                : connectionState === 'connected'
                  ? 'Escribe un mensaje...'
                  : 'Conectando...'
            }
            disabled={
              connectionState !== 'connected' || isSending || (!chatHabilitado && !isDocente)
            }
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={
              connectionState !== 'connected' ||
              isSending ||
              !inputValue.trim() ||
              (!chatHabilitado && !isDocente)
            }
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 text-right">{inputValue.length}/2000</p>
      </div>
    </div>
  );
};
