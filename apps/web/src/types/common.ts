import type { AxiosError } from 'axios';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ErrorLike =
  | AxiosError
  | Error
  | { message?: string }
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Helper para convertir unknown a ErrorLike en bloques catch
 */
export function toErrorLike(error: unknown): ErrorLike {
  return error as ErrorLike;
}

export type LoggableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | ErrorLike
  | LoggableValue[]
  | { [key: string]: LoggableValue };

export type RequestData =
  | JsonValue
  | FormData
  | URLSearchParams
  | Blob
  | ArrayBuffer
  | ArrayBufferView;
