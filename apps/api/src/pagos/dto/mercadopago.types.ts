import type { Prisma } from '@prisma/client';
import type { PreferenceRequest, PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

export type MercadoPagoPreferenceData = PreferenceRequest;
export type MercadoPagoPreferenceResponse = PreferenceResponse;
export type MercadoPagoPayment = PaymentResponse;

export interface MembershipProductData {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: Prisma.Decimal | number | string;
}

export interface TutorBasicInfo {
  id?: string | null;
  email?: string | null;
  nombre?: string | null;
  apellido?: string | null;
}

export interface CourseProductData {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: Prisma.Decimal | number | string;
}

export interface CourseStudentInfo {
  id: string;
  nombre: string | null;
  apellido: string | null;
}

export interface ProcessedWebhookCache {
  processedAt: string;
  paymentStatus?: string;
  externalRef?: string;
}

export type ProcesarPagoMembresiaResult =
  | {
      action: 'activated';
      membresiaId: string;
      estado: 'Activa';
      fechaInicio: Date;
      fechaProximoPago: Date;
    }
  | {
      action: 'cancelled';
      membresiaId: string;
      estado: 'Cancelada';
      reason: string;
    }
  | {
      action: 'pending';
      membresiaId: string;
      estado: string;
      paymentStatus: string | undefined;
    };

export type ProcesarPagoInscripcionResult =
  | {
      action: 'activated';
      inscripcionId: string;
      estado: 'Activo';
      estudianteId: string;
      productoId: string;
    }
  | {
      action: 'deleted';
      inscripcionId: string;
      estudianteId: string;
      productoId: string;
      reason: string;
    }
  | {
      action: 'pending';
      inscripcionId: string;
      estado: string;
      paymentStatus: string | undefined;
    };

export type ProcesarWebhookResult =
  | { message: 'Mock mode - webhook ignored' }
  | { message: 'Webhook type not handled' }
  | { message: 'No payment ID' }
  | { message: 'Payment without external_reference' }
  | { message: 'Unknown external reference format' }
  | {
      message: 'Webhook already processed (idempotent)';
      paymentId: string;
      previouslyProcessedAt: string;
    }
  | {
      message: 'Webhook processed successfully';
      paymentId: string;
      resultado: ProcesarPagoMembresiaResult | ProcesarPagoInscripcionResult;
    };
