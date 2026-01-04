'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { aulaVivaApi } from '@/lib/api/aula-viva.api';
import type { MensajeChat, ChatConnectionState } from '@/components/docente/live/types';

/**
 * Respuesta del servidor al unirse a una sala
 */
interface UnirseSalaResponse {
  exito: boolean;
  salaId: string;
}

/**
 * Handlers guardados para cleanup
 */
interface SocketHandlers {
  handleConnect: () => void;
  handleConnectError: (err: Error) => void;
  handleDisconnect: (reason: string) => void;
  handleNuevoMensaje: (mensaje: MensajeChat) => void;
  handleParticipanteEntro: (data: { nombre: string }) => void;
  handleParticipanteSalio: (data: { nombre: string }) => void;
}

/**
 * Respuesta del servidor al enviar un mensaje
 */
interface EnviarMensajeResponse {
  exito: boolean;
  mensaje?: MensajeChat;
  error?: string;
}

/**
 * Opciones del hook
 */
interface UseAulaVivaChatOptions {
  /** ID de la clase grupo (genera salaId: clase:${id}) */
  claseGrupoId?: string;
  /** ID de la comisión (genera salaId: comision:${id}) */
  comisionId?: string;
  /** Callback cuando se recibe un mensaje */
  onMessage?: (mensaje: MensajeChat) => void;
  /** Callback cuando cambia el estado de conexión */
  onConnectionChange?: (state: ChatConnectionState) => void;
}

/**
 * Retorno del hook
 */
interface UseAulaVivaChatReturn {
  /** Lista de mensajes recibidos */
  mensajes: MensajeChat[];
  /** Estado de la conexión */
  connectionState: ChatConnectionState;
  /** Error si ocurrió alguno */
  error: string | null;
  /** ID de la sala actual */
  salaId: string | null;
  /** Función para enviar un mensaje */
  enviarMensaje: (contenido: string) => Promise<EnviarMensajeResponse>;
  /** Función para reconectar manualmente */
  reconectar: () => void;
  /** Función para desconectar */
  desconectar: () => void;
}

/**
 * Hook para gestionar chat en tiempo real via WebSocket
 *
 * Conecta al namespace /aula-viva y maneja:
 * - Autenticación con token JWT
 * - Unirse a sala automáticamente
 * - Envío y recepción de mensajes
 * - Reconexión automática
 *
 * @example
 * ```tsx
 * const { mensajes, enviarMensaje, connectionState } = useAulaVivaChat({
 *   claseGrupoId: 'uuid-de-clase',
 * });
 * ```
 */
export function useAulaVivaChat(options: UseAulaVivaChatOptions): UseAulaVivaChatReturn {
  const { claseGrupoId, comisionId, onMessage, onConnectionChange } = options;

  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [connectionState, setConnectionState] = useState<ChatConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [salaId, setSalaId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<SocketHandlers | null>(null);
  const isConnectingRef = useRef(false);

  // URL base del WebSocket (sin /api)
  const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

  /**
   * Actualiza el estado de conexión y notifica
   */
  const updateConnectionState = useCallback(
    (state: ChatConnectionState) => {
      setConnectionState(state);
      onConnectionChange?.(state);
    },
    [onConnectionChange],
  );

  /**
   * Conectar al WebSocket
   */
  const conectar = useCallback(async () => {
    // Evitar conexiones duplicadas
    if (isConnectingRef.current || socketRef.current?.connected) {
      return;
    }

    // Validar que tenemos un ID de sala
    if (!claseGrupoId && !comisionId) {
      setError('Se requiere claseGrupoId o comisionId');
      return;
    }

    isConnectingRef.current = true;
    updateConnectionState('connecting');
    setError(null);

    try {
      // Crear conexión Socket.IO con auth function para token refresh
      const socket = io(`${wsUrl}/aula-viva`, {
        auth: async (cb) => {
          try {
            const { token } = await aulaVivaApi.getWsToken();
            cb({ token });
          } catch (authErr) {
            console.error('Error obteniendo token WS:', authErr);
            cb({ token: '' }); // Fallará en servidor con mensaje claro
          }
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // Funciones nombradas para cleanup correcto
      const handleConnect = () => {
        updateConnectionState('connected');
        setError(null);

        // Unirse a la sala
        const payload = claseGrupoId ? { claseGrupoId } : { comisionId };
        socket.emit('unirse-sala', payload, (response: UnirseSalaResponse) => {
          if (response.exito) {
            setSalaId(response.salaId);
          } else {
            setError('Error al unirse a la sala');
          }
        });
      };

      const handleConnectError = (err: Error) => {
        console.error('Error de conexión WebSocket:', err.message);
        setError(`Error de conexión: ${err.message}`);
        updateConnectionState('error');
      };

      const handleDisconnect = (reason: string) => {
        console.log('WebSocket desconectado:', reason);
        updateConnectionState('disconnected');
        setSalaId(null);
      };

      const handleNuevoMensaje = (mensaje: MensajeChat) => {
        setMensajes((prev) => [...prev, mensaje]);
        onMessage?.(mensaje);
      };

      const handleParticipanteEntro = (data: { nombre: string }) => {
        console.log(`${data.nombre} se unió al chat`);
      };

      const handleParticipanteSalio = (data: { nombre: string }) => {
        console.log(`${data.nombre} salió del chat`);
      };

      // Guardar referencias para cleanup
      handlersRef.current = {
        handleConnect,
        handleConnectError,
        handleDisconnect,
        handleNuevoMensaje,
        handleParticipanteEntro,
        handleParticipanteSalio,
      };

      // Registrar listeners
      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.on('disconnect', handleDisconnect);
      socket.on('nuevo-mensaje', handleNuevoMensaje);
      socket.on('participante-entro', handleParticipanteEntro);
      socket.on('participante-salio', handleParticipanteSalio);
    } catch (err) {
      console.error('Error al conectar WebSocket:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar al chat');
      updateConnectionState('error');
    } finally {
      isConnectingRef.current = false;
    }
  }, [claseGrupoId, comisionId, wsUrl, onMessage, updateConnectionState]);

  /**
   * Desconectar del WebSocket
   */
  const desconectar = useCallback(() => {
    const socket = socketRef.current;
    const handlers = handlersRef.current;

    if (socket && handlers) {
      // Limpiar listeners específicos para evitar memory leaks
      socket.off('connect', handlers.handleConnect);
      socket.off('connect_error', handlers.handleConnectError);
      socket.off('disconnect', handlers.handleDisconnect);
      socket.off('nuevo-mensaje', handlers.handleNuevoMensaje);
      socket.off('participante-entro', handlers.handleParticipanteEntro);
      socket.off('participante-salio', handlers.handleParticipanteSalio);

      socket.disconnect();
    }

    socketRef.current = null;
    handlersRef.current = null;
    setMensajes([]);
    setSalaId(null);
    updateConnectionState('disconnected');
  }, [updateConnectionState]);

  /**
   * Reconectar manualmente
   */
  const reconectar = useCallback(() => {
    desconectar();
    setTimeout(conectar, 100);
  }, [desconectar, conectar]);

  /**
   * Enviar un mensaje
   */
  const enviarMensaje = useCallback(
    async (contenido: string): Promise<EnviarMensajeResponse> => {
      if (!socketRef.current?.connected) {
        return { exito: false, error: 'No conectado al chat' };
      }

      if (!salaId) {
        return { exito: false, error: 'No está en una sala' };
      }

      // Validar longitud
      if (contenido.length > 2000) {
        return { exito: false, error: 'El mensaje excede 2000 caracteres' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'enviar-mensaje',
          { salaId, contenido },
          (response: EnviarMensajeResponse) => {
            resolve(response);
          },
        );
      });
    },
    [salaId],
  );

  // Conectar automáticamente cuando hay un ID de sala
  useEffect(() => {
    if (claseGrupoId || comisionId) {
      conectar();
    }

    return () => {
      desconectar();
    };
  }, [claseGrupoId, comisionId, conectar, desconectar]);

  return {
    mensajes,
    connectionState,
    error,
    salaId,
    enviarMensaje,
    reconectar,
    desconectar,
  };
}
