/**
 * Entidades para Colonia de Verano 2026
 */

export interface ColoniaInscription {
  id: string;
  tutor_id: string;
  estado: 'pending' | 'active' | 'blocked' | 'cancelled';
  descuento_aplicado: number; // 0, 12 o 20
  total_mensual: number; // Monto que se cobra cada mes
  fecha_inscripcion: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColoniaStudent {
  id: string;
  inscripcion_id: string;
  estudiante_id: string; // Referencia a Estudiante existente
  nombre: string;
  edad: number;
  pin: string; // 4 dígitos
  createdAt: Date;
  updatedAt: Date;
}

export interface ColoniaStudentCourse {
  id: string;
  colonia_estudiante_id: string;
  course_id: string; // ID del curso (ej: 'mat-juegos-desafios')
  course_name: string;
  course_area: string;
  instructor: string;
  day_of_week: string;
  time_slot: string;
  precio_base: number; // 55000
  precio_con_descuento: number; // Después de aplicar descuento
  createdAt: Date;
  updatedAt: Date;
}

export interface ColoniaPayment {
  id: string;
  inscripcion_id: string;
  mes: 'enero' | 'febrero' | 'marzo';
  anio: number; // 2026
  monto: number;
  estado: 'pending' | 'paid' | 'failed' | 'cancelled';
  mercadopagoPreferenceId?: string;
  mercadopago_payment_id?: string;
  fecha_vencimiento: Date; // Día 5 del mes
  fecha_pago?: Date;
  fecha_creacion: Date;
  createdAt: Date;
  updatedAt: Date;
}
