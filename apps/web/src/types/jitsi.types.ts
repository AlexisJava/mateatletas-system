/**
 * TypeScript definitions for Jitsi Meet External API
 * Created to eliminate 'any' types from the codebase
 */

export interface JitsiParticipant {
  participantId?: string;
  displayName?: string;
  formattedDisplayName?: string;
  email?: string;
}

export interface JitsiMeetExternalAPI {
  // Methods
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  dispose: () => void;
  getRoomsInfo: () => Promise<unknown>;
  getParticipantsInfo: () => JitsiParticipant[];
  
  // Properties
  _frame?: HTMLIFrameElement;
}

export interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: {
    roomName: string;
    width?: string | number;
    height?: string | number;
    parentNode?: HTMLElement;
    configOverwrite?: Record<string, unknown>;
    interfaceConfigOverwrite?: Record<string, unknown>;
    jwt?: string;
  }): JitsiMeetExternalAPI;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: JitsiMeetExternalAPIConstructor;
  }
}
