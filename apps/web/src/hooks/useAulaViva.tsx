'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { aulaVivaApi } from '@/lib/api/aula-viva.api';
import type {
  ConnectionState,
  Participante,
  UnirseSalaResponse,
  ManoLevantadaEvent,
  ManoBajadaEvent,
  PalabraOtorgadaEvent,
  ParticipanteMuteadoEvent,
  ParticipanteDesmuteadoEvent,
  TodosMuteadosEvent,
  TodosDesmuteadosEvent,
  ParticipanteExpulsadoEvent,
  AlguienExpulsadoEvent,
  UsuarioHablandoEvent,
  MensajeChat,
  ChatToggleEvent,
  ReaccionAgregada,
  TipoReaccion,
  PulsoCreadoEvent,
  PulsoStats,
  EstudianteSeleccionadoEvent,
  SelectorReseteadoEvent,
} from '@mateatletas/contracts';

// ============================================================================
// TYPES
// ============================================================================

interface AulaVivaState {
  connectionState: ConnectionState;
  error: string | null;
  salaId: string | null;
  participantes: Participante[];
  /** Manos levantadas ordenadas por FIFO */
  manosLevantadas: ManoLevantadaEvent[];
  /** IDs de usuarios muteados */
  usuariosMuteados: Set<string>;
  /** Mapa de usuarios hablando */
  usuariosHablando: Map<string, boolean>;
  /** Mensajes de chat */
  mensajes: MensajeChat[];
  /** Si el chat está habilitado */
  chatHabilitado: boolean;
  /** Si el usuario actual fue expulsado */
  expulsado: boolean;
  motivoExpulsion: string | null;
  /** Reacciones recientes (últimos 5 segundos por tipo) */
  reaccionesRecientes: ReaccionAgregada[];
  /** Pulso activo (encuesta rápida) */
  pulsoActivo: PulsoStats | null;
  /** Último estudiante seleccionado aleatoriamente */
  estudianteSeleccionado: EstudianteSeleccionadoEvent | null;
  /** Ronda actual del selector */
  selectorRonda: number;
}

interface AulaVivaContextValue extends AulaVivaState {
  socket: Socket | null;
  conectar: () => Promise<void>;
  desconectar: () => void;
  isDocente: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AulaVivaContext = createContext<AulaVivaContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface AulaVivaProviderProps {
  children: React.ReactNode;
  claseGrupoId?: string;
  comisionId?: string;
  autoConnect?: boolean;
}

export function AulaVivaProvider({
  children,
  claseGrupoId,
  comisionId,
  autoConnect = true,
}: AulaVivaProviderProps) {
  const [state, setState] = useState<AulaVivaState>({
    connectionState: 'disconnected',
    error: null,
    salaId: null,
    participantes: [],
    manosLevantadas: [],
    usuariosMuteados: new Set(),
    usuariosHablando: new Map(),
    mensajes: [],
    chatHabilitado: true,
    expulsado: false,
    motivoExpulsion: null,
    reaccionesRecientes: [],
    pulsoActivo: null,
    estudianteSeleccionado: null,
    selectorRonda: 1,
  });

  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);
  const isDocenteRef = useRef(false);

  // TODO [CRIT-004]: Validar NEXT_PUBLIC_API_URL en producción, no permitir fallback a localhost
  // Ver: /docs/TODO_PRE_LAUNCH.md
  const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

  // --------------------------------------------------------------------------
  // CONNECTION
  // --------------------------------------------------------------------------

  const conectar = useCallback(async () => {
    if (isConnectingRef.current || socketRef.current?.connected) {
      return;
    }

    if (!claseGrupoId && !comisionId) {
      setState((prev) => ({ ...prev, error: 'Se requiere claseGrupoId o comisionId' }));
      return;
    }

    isConnectingRef.current = true;
    setState((prev) => ({ ...prev, connectionState: 'connecting', error: null }));

    try {
      const socket = io(`${wsUrl}/aula-viva`, {
        auth: async (cb) => {
          try {
            const { token } = await aulaVivaApi.getWsToken();
            cb({ token });
          } catch {
            cb({ token: '' });
          }
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // --- Connection Events ---
      socket.on('connect', () => {
        setState((prev) => ({ ...prev, connectionState: 'connected', error: null }));

        const payload = claseGrupoId ? { claseGrupoId } : { comisionId };
        socket.emit('unirse-sala', payload, (response: UnirseSalaResponse) => {
          if (response.exito && response.salaId) {
            setState((prev) => ({
              ...prev,
              salaId: response.salaId!,
              participantes: response.participantes ?? [],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              error: response.error ?? 'Error al unirse a la sala',
            }));
          }
        });
      });

      socket.on('connect_error', (err: Error) => {
        setState((prev) => ({
          ...prev,
          connectionState: 'error',
          error: `Error de conexión: ${err.message}`,
        }));
      });

      socket.on('disconnect', () => {
        setState((prev) => ({
          ...prev,
          connectionState: 'disconnected',
          salaId: null,
          participantes: [],
          manosLevantadas: [],
        }));
      });

      // --- Participantes Events ---
      socket.on(
        'participante-entro',
        (data: { odidentidadUsuario: string; nombre: string; rol: string }) => {
          setState((prev) => ({
            ...prev,
            participantes: [
              ...prev.participantes,
              {
                odidentidadUsuario: data.odidentidadUsuario,
                odidentidadSala: prev.salaId ?? '',
                socketId: '',
                nombre: data.nombre,
                rol: data.rol as 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN',
                conectadoEn: new Date().toISOString(),
              },
            ],
          }));
        },
      );

      socket.on('participante-salio', (data: { odidentidadUsuario: string }) => {
        setState((prev) => ({
          ...prev,
          participantes: prev.participantes.filter(
            (p) => p.odidentidadUsuario !== data.odidentidadUsuario,
          ),
          manosLevantadas: prev.manosLevantadas.filter((m) => m.odooId !== data.odidentidadUsuario),
        }));
      });

      // --- Manos Events ---
      socket.on('mano-levantada', (data: ManoLevantadaEvent) => {
        setState((prev) => {
          const exists = prev.manosLevantadas.some((m) => m.odooId === data.odooId);
          if (exists) return prev;
          return {
            ...prev,
            manosLevantadas: [...prev.manosLevantadas, data],
          };
        });
      });

      socket.on('mano-bajada', (data: ManoBajadaEvent) => {
        setState((prev) => ({
          ...prev,
          manosLevantadas: prev.manosLevantadas.filter((m) => m.odooId !== data.odooId),
        }));
      });

      socket.on('palabra-otorgada', (data: PalabraOtorgadaEvent) => {
        setState((prev) => ({
          ...prev,
          manosLevantadas: prev.manosLevantadas.filter((m) => m.odooId !== data.odooId),
        }));
      });

      // --- Moderación Events ---
      socket.on('participante-muteado', (data: ParticipanteMuteadoEvent) => {
        setState((prev) => {
          const newSet = new Set(prev.usuariosMuteados);
          newSet.add(data.odooId);
          return { ...prev, usuariosMuteados: newSet };
        });
      });

      socket.on('participante-desmuteado', (data: ParticipanteDesmuteadoEvent) => {
        setState((prev) => {
          const newSet = new Set(prev.usuariosMuteados);
          newSet.delete(data.odooId);
          return { ...prev, usuariosMuteados: newSet };
        });
      });

      socket.on('todos-muteados', (data: TodosMuteadosEvent) => {
        setState((prev) => ({
          ...prev,
          usuariosMuteados: new Set(data.muteados),
        }));
      });

      socket.on('todos-desmuteados', (_data: TodosDesmuteadosEvent) => {
        setState((prev) => ({
          ...prev,
          usuariosMuteados: new Set(),
        }));
      });

      socket.on('participante-expulsado', (data: ParticipanteExpulsadoEvent) => {
        setState((prev) => ({
          ...prev,
          expulsado: true,
          motivoExpulsion: data.motivo,
        }));
        socket.disconnect();
      });

      socket.on('alguien-expulsado', (data: AlguienExpulsadoEvent) => {
        setState((prev) => ({
          ...prev,
          participantes: prev.participantes.filter((p) => p.odidentidadUsuario !== data.odooId),
          manosLevantadas: prev.manosLevantadas.filter((m) => m.odooId !== data.odooId),
        }));
      });

      // --- Hablando Events ---
      socket.on('usuario-hablando', (data: UsuarioHablandoEvent) => {
        setState((prev) => {
          const newMap = new Map(prev.usuariosHablando);
          if (data.activo) {
            newMap.set(data.odooId, true);
          } else {
            newMap.delete(data.odooId);
          }
          return { ...prev, usuariosHablando: newMap };
        });
      });

      // --- Chat Events ---
      socket.on('nuevo-mensaje', (mensaje: MensajeChat) => {
        setState((prev) => ({
          ...prev,
          mensajes: [...prev.mensajes, mensaje],
        }));
      });

      socket.on('chat-toggle', (data: ChatToggleEvent) => {
        setState((prev) => ({
          ...prev,
          chatHabilitado: data.habilitado,
        }));
      });

      // --- Reacciones Events ---
      socket.on('reaccion', (data: ReaccionAgregada) => {
        setState((prev) => {
          // Actualizar o agregar la reacción por tipo
          const existingIndex = prev.reaccionesRecientes.findIndex((r) => r.tipo === data.tipo);
          let newReacciones: ReaccionAgregada[];

          if (existingIndex >= 0) {
            // Actualizar la existente
            newReacciones = [...prev.reaccionesRecientes];
            newReacciones[existingIndex] = data;
          } else {
            // Agregar nueva
            newReacciones = [...prev.reaccionesRecientes, data];
          }

          return { ...prev, reaccionesRecientes: newReacciones };
        });
      });

      // --- Pulso Events ---
      socket.on('pulso-creado', (data: PulsoCreadoEvent) => {
        setState((prev) => ({
          ...prev,
          pulsoActivo: {
            id: data.id,
            pregunta: data.pregunta,
            opciones: data.opciones,
            activo: true,
            conteos: new Array(data.opciones.length).fill(0),
            totalRespuestas: 0,
            porcentajes: new Array(data.opciones.length).fill(0),
          },
        }));
      });

      socket.on('pulso-actualizado', (data: PulsoStats) => {
        setState((prev) => ({
          ...prev,
          pulsoActivo: data,
        }));
      });

      socket.on('pulso-cerrado', (data: PulsoStats) => {
        setState((prev) => ({
          ...prev,
          pulsoActivo: { ...data, activo: false },
        }));
      });

      // --- Selector Aleatorio Events ---
      socket.on('estudiante-seleccionado', (data: EstudianteSeleccionadoEvent) => {
        setState((prev) => ({
          ...prev,
          estudianteSeleccionado: data,
        }));
      });

      socket.on('selector-reseteado', (data: SelectorReseteadoEvent) => {
        setState((prev) => ({
          ...prev,
          estudianteSeleccionado: null,
          selectorRonda: data.ronda,
        }));
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        connectionState: 'error',
        error: err instanceof Error ? err.message : 'Error al conectar',
      }));
    } finally {
      isConnectingRef.current = false;
    }
  }, [claseGrupoId, comisionId, wsUrl]);

  const desconectar = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState({
      connectionState: 'disconnected',
      error: null,
      salaId: null,
      participantes: [],
      manosLevantadas: [],
      usuariosMuteados: new Set(),
      usuariosHablando: new Map(),
      mensajes: [],
      chatHabilitado: true,
      expulsado: false,
      motivoExpulsion: null,
      reaccionesRecientes: [],
      pulsoActivo: null,
      estudianteSeleccionado: null,
      selectorRonda: 1,
    });
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && (claseGrupoId || comisionId)) {
      conectar();
    }

    return () => {
      desconectar();
    };
  }, [autoConnect, claseGrupoId, comisionId, conectar, desconectar]);

  const contextValue: AulaVivaContextValue = {
    ...state,
    socket: socketRef.current,
    conectar,
    desconectar,
    isDocente: isDocenteRef.current,
  };

  return <AulaVivaContext.Provider value={contextValue}>{children}</AulaVivaContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook principal para acceder al estado de Aula Viva
 * Debe usarse dentro de un AulaVivaProvider
 */
export function useAulaViva() {
  const context = useContext(AulaVivaContext);
  if (!context) {
    throw new Error('useAulaViva must be used within an AulaVivaProvider');
  }
  return context;
}

/**
 * Hook para funciones de manos levantadas
 */
export function useAulaVivaManos() {
  const { socket, salaId, manosLevantadas } = useAulaViva();

  const levantarMano = useCallback(() => {
    if (!socket?.connected || !salaId) {
      return Promise.resolve({ exito: false, error: 'No conectado' });
    }

    return new Promise<{ exito: boolean; error?: string }>((resolve) => {
      socket.emit('levantar-mano', { salaId }, resolve);
    });
  }, [socket, salaId]);

  const bajarMano = useCallback(() => {
    if (!socket?.connected || !salaId) {
      return Promise.resolve({ exito: false, error: 'No conectado' });
    }

    return new Promise<{ exito: boolean; error?: string }>((resolve) => {
      socket.emit('bajar-mano', { salaId }, resolve);
    });
  }, [socket, salaId]);

  const darPalabra = useCallback(
    (odooIdEstudiante: string) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('dar-palabra', { salaId, odooIdEstudiante }, resolve);
      });
    },
    [socket, salaId],
  );

  return {
    manosLevantadas,
    levantarMano,
    bajarMano,
    darPalabra,
  };
}

/**
 * Hook para funciones de moderación (solo docentes)
 */
export function useAulaVivaModeracion() {
  const { socket, salaId, usuariosMuteados } = useAulaViva();

  const mutearParticipante = useCallback(
    (odooIdEstudiante: string, tipo: 'chat' | 'audio' | 'ambos' = 'ambos') => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('mutear-participante', { salaId, odooIdEstudiante, tipo }, resolve);
      });
    },
    [socket, salaId],
  );

  const desmutearParticipante = useCallback(
    (odooIdEstudiante: string) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('desmutear-participante', { salaId, odooIdEstudiante }, resolve);
      });
    },
    [socket, salaId],
  );

  const mutearTodos = useCallback(
    (tipo: 'chat' | 'audio' | 'ambos' = 'ambos', excepto: string[] = []) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('mutear-todos', { salaId, tipo, excepto }, resolve);
      });
    },
    [socket, salaId],
  );

  const desmutearTodos = useCallback(() => {
    if (!socket?.connected || !salaId) {
      return Promise.resolve({ exito: false, error: 'No conectado' });
    }

    return new Promise<{ exito: boolean; error?: string }>((resolve) => {
      socket.emit('desmutear-todos', { salaId }, resolve);
    });
  }, [socket, salaId]);

  const expulsarParticipante = useCallback(
    (odooIdEstudiante: string, motivo?: string) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('expulsar-participante', { salaId, odooIdEstudiante, motivo }, resolve);
      });
    },
    [socket, salaId],
  );

  const estaMuteado = useCallback(
    (odooId: string) => usuariosMuteados.has(odooId),
    [usuariosMuteados],
  );

  return {
    usuariosMuteados,
    mutearParticipante,
    desmutearParticipante,
    mutearTodos,
    desmutearTodos,
    expulsarParticipante,
    estaMuteado,
  };
}

/**
 * Hook para indicador de "está hablando"
 */
export function useAulaVivaHablando() {
  const { socket, salaId, usuariosHablando } = useAulaViva();

  const setHablando = useCallback(
    (activo: boolean) => {
      if (!socket?.connected || !salaId) {
        return;
      }

      socket.emit('hablando', { salaId, activo });
    },
    [socket, salaId],
  );

  const estaHablando = useCallback(
    (odooId: string) => usuariosHablando.get(odooId) ?? false,
    [usuariosHablando],
  );

  return {
    usuariosHablando,
    setHablando,
    estaHablando,
  };
}

/**
 * Hook para chat (refactorizado para usar el contexto compartido)
 */
export function useAulaVivaChat() {
  const { socket, salaId, mensajes, chatHabilitado, connectionState, error } = useAulaViva();

  const enviarMensaje = useCallback(
    (contenido: string) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      if (contenido.length > 2000) {
        return Promise.resolve({ exito: false, error: 'Mensaje muy largo' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('enviar-mensaje', { salaId, contenido }, resolve);
      });
    },
    [socket, salaId],
  );

  const toggleChat = useCallback(
    (habilitado: boolean) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('toggle-chat', { salaId, habilitado }, resolve);
      });
    },
    [socket, salaId],
  );

  return {
    mensajes,
    chatHabilitado,
    connectionState,
    error,
    enviarMensaje,
    toggleChat,
  };
}

/**
 * Hook para reacciones en tiempo real
 * Incluye rate limiting automático del servidor (2 segundos)
 */
export function useAulaVivaReacciones() {
  const { socket, salaId, reaccionesRecientes } = useAulaViva();

  const enviarReaccion = useCallback(
    (tipo: TipoReaccion) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('enviar-reaccion', { salaId, tipo }, resolve);
      });
    },
    [socket, salaId],
  );

  return {
    reaccionesRecientes,
    enviarReaccion,
  };
}

/**
 * Hook para pulsos de atención (encuestas rápidas)
 * Solo el docente puede crear/cerrar pulsos
 * Los estudiantes pueden responder
 */
export function useAulaVivaPulso() {
  const { socket, salaId, pulsoActivo } = useAulaViva();

  const crearPulso = useCallback(
    (pregunta: string, opciones: string[]) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('crear-pulso', { salaId, pregunta, opciones }, resolve);
      });
    },
    [socket, salaId],
  );

  const responderPulso = useCallback(
    (pulsoId: string, opcionIndex: number) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('responder-pulso', { salaId, pulsoId, opcionIndex }, resolve);
      });
    },
    [socket, salaId],
  );

  const cerrarPulso = useCallback(
    (pulsoId: string) => {
      if (!socket?.connected || !salaId) {
        return Promise.resolve({ exito: false, error: 'No conectado' });
      }

      return new Promise<{ exito: boolean; error?: string }>((resolve) => {
        socket.emit('cerrar-pulso', { salaId, pulsoId }, resolve);
      });
    },
    [socket, salaId],
  );

  return {
    pulsoActivo,
    crearPulso,
    responderPulso,
    cerrarPulso,
  };
}

/**
 * Hook para selector aleatorio de estudiantes
 * Solo el docente puede seleccionar/resetear
 * Selección justa: evita repetir hasta que todos hayan sido seleccionados
 */
export function useAulaVivaSelector() {
  const { socket, salaId, estudianteSeleccionado, selectorRonda } = useAulaViva();

  const seleccionarAleatorio = useCallback(() => {
    if (!socket?.connected || !salaId) {
      return Promise.resolve({ exito: false, error: 'No conectado' });
    }

    return new Promise<{ exito: boolean; error?: string }>((resolve) => {
      socket.emit('seleccionar-aleatorio', { salaId }, resolve);
    });
  }, [socket, salaId]);

  const resetearSelector = useCallback(() => {
    if (!socket?.connected || !salaId) {
      return Promise.resolve({ exito: false, error: 'No conectado' });
    }

    return new Promise<{ exito: boolean; error?: string }>((resolve) => {
      socket.emit('resetear-selector', { salaId }, resolve);
    });
  }, [socket, salaId]);

  return {
    estudianteSeleccionado,
    selectorRonda,
    seleccionarAleatorio,
    resetearSelector,
  };
}
