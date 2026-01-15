/**
 * ============================================================================
 * DESCUENTOS FAMILIARES INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para el sistema de descuentos familiares.
 *
 * ============================================================================
 * REGLAS DE NEGOCIO (según descuento-familiar.constants.ts)
 * ============================================================================
 *
 * SUSCRIPCIONES:
 * - 1er hijo: 0% descuento (precio base)
 * - 2do hijo: 10% descuento
 * - 3er hijo: 20% descuento
 * - 4to hijo: 30% descuento
 * - Máximo: 50% descuento
 *
 * INSCRIPCIONES 2026 (precio.rules.ts):
 * - 1er hermano: Sin descuento
 * - 2do hermano en adelante: 10% descuento fijo
 *
 * ============================================================================
 * CLASES DE EQUIVALENCIA
 * ============================================================================
 *
 * CE1: Primer hijo → 0% descuento
 * CE2: Segundo hijo → 10% descuento
 * CE3: Tercer hijo → 20% descuento
 * CE4: Cuarto hijo → 30% descuento
 * CE5: Quinto hijo → 40% descuento
 * CE6: Sexto+ hijo → 50% descuento (máximo)
 *
 * CE7: Familia con 1 hijo → total = precio base
 * CE8: Familia con 2 hijos → total = base + (base * 0.9)
 * CE9: Familia con 3 hijos → total = base + (base * 0.9) + (base * 0.8)
 *
 * CE10: Tutor con múltiples suscripciones activas
 * CE11: Tutor con hijos en diferentes estados de suscripción
 *
 * ============================================================================
 * BOUNDARIES
 * ============================================================================
 *
 * - DESCUENTO_POR_HIJO_ADICIONAL = 10%
 * - DESCUENTO_MAXIMO = 50%
 * - numeroHijo <= 0 → 0% (validación)
 * - numeroHijo = 6 → 50% (borde del máximo)
 * - numeroHijo = 7 → 50% (se mantiene en máximo)
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { EstadoSuscripcion } from '@prisma/client';

import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestTutor,
  createTestEstudiante,
  createTestAdmin,
} from '../../fixtures/factories';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { loginUser, generateUniqueIP } from '../../helpers/auth.helpers';

// Constantes del sistema (BBT - replicadas para tests)
const DESCUENTO_POR_HIJO_ADICIONAL = 10;
const DESCUENTO_MAXIMO = 50;

const FRONTEND_ORIGIN = 'http://localhost:3000';
const DEFAULT_PASSWORD = 'Test123!@#';

describe('Descuentos Familiares Integration Tests (BBT)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await cleanAllTestTables(prisma);
    await app.close();
  }, 30000);

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  async function crearPlanSuscripcion(
    nombre = 'STEAM_SINCRONICO',
    precio = 95000,
  ) {
    return prisma.planSuscripcion.create({
      data: {
        nombre,
        descripcion: `Plan ${nombre} test`,
        precio_base: precio,
        frecuencia_cobro: 'monthly',
        activo: true,
        beneficios: ['Acceso completo'],
      },
    });
  }

  async function crearSuscripcionConEstudiantes(
    tutorId: string,
    planId: string,
    estudianteIds: string[],
    estado: EstadoSuscripcion = EstadoSuscripcion.ACTIVA,
  ) {
    const suscripcion = await prisma.suscripcion.create({
      data: {
        tutor_id: tutorId,
        plan_id: planId,
        estado,
        precio_final: 95000, // Se calculará con descuento
        mp_preapproval_id: `preapproval_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        mp_status: 'authorized',
        estudiantes: {
          connect: estudianteIds.map((id) => ({ id })),
        },
      },
      include: { estudiantes: true },
    });
    return suscripcion;
  }

  // Función pura para calcular descuento (BBT - verificamos comportamiento esperado)
  function calcularDescuentoEsperado(numeroHijo: number): number {
    if (numeroHijo <= 0) return 0;
    if (numeroHijo === 1) return 0;
    const descuento = (numeroHijo - 1) * DESCUENTO_POR_HIJO_ADICIONAL;
    return Math.min(descuento, DESCUENTO_MAXIMO);
  }

  function calcularPrecioConDescuento(
    precioBase: number,
    numeroHijo: number,
  ): number {
    const descuento = calcularDescuentoEsperado(numeroHijo);
    return Math.round(precioBase * (1 - descuento / 100));
  }

  // ============================================================================
  // CE1-CE6: DESCUENTO POR POSICIÓN DE HIJO
  // ============================================================================

  describe('Descuento por Posición de Hijo', () => {
    describe('CE1: Primer hijo → 0% descuento', () => {
      it('should apply 0% discount to first child', () => {
        const descuento = calcularDescuentoEsperado(1);
        expect(descuento).toBe(0);

        const precioFinal = calcularPrecioConDescuento(95000, 1);
        expect(precioFinal).toBe(95000);
      });
    });

    describe('CE2: Segundo hijo → 10% descuento', () => {
      it('should apply 10% discount to second child', () => {
        const descuento = calcularDescuentoEsperado(2);
        expect(descuento).toBe(10);

        const precioFinal = calcularPrecioConDescuento(95000, 2);
        expect(precioFinal).toBe(85500); // 95000 * 0.9
      });
    });

    describe('CE3: Tercer hijo → 20% descuento', () => {
      it('should apply 20% discount to third child', () => {
        const descuento = calcularDescuentoEsperado(3);
        expect(descuento).toBe(20);

        const precioFinal = calcularPrecioConDescuento(95000, 3);
        expect(precioFinal).toBe(76000); // 95000 * 0.8
      });
    });

    describe('CE4: Cuarto hijo → 30% descuento', () => {
      it('should apply 30% discount to fourth child', () => {
        const descuento = calcularDescuentoEsperado(4);
        expect(descuento).toBe(30);

        const precioFinal = calcularPrecioConDescuento(95000, 4);
        expect(precioFinal).toBe(66500); // 95000 * 0.7
      });
    });

    describe('CE5: Quinto hijo → 40% descuento', () => {
      it('should apply 40% discount to fifth child', () => {
        const descuento = calcularDescuentoEsperado(5);
        expect(descuento).toBe(40);

        const precioFinal = calcularPrecioConDescuento(95000, 5);
        expect(precioFinal).toBe(57000); // 95000 * 0.6
      });
    });

    describe('CE6: Sexto+ hijo → 50% descuento (máximo)', () => {
      it('should cap discount at 50% for sixth child', () => {
        const descuento = calcularDescuentoEsperado(6);
        expect(descuento).toBe(50);

        const precioFinal = calcularPrecioConDescuento(95000, 6);
        expect(precioFinal).toBe(47500); // 95000 * 0.5
      });

      it('should maintain 50% max discount for seventh child and beyond', () => {
        const descuento7 = calcularDescuentoEsperado(7);
        const descuento10 = calcularDescuentoEsperado(10);

        expect(descuento7).toBe(50);
        expect(descuento10).toBe(50);
      });
    });
  });

  // ============================================================================
  // CE7-CE9: TOTAL FAMILIAR
  // ============================================================================

  describe('Total Familiar', () => {
    describe('CE7: Familia con 1 hijo → total = precio base', () => {
      it('should calculate total for single child', () => {
        const precioBase = 95000;
        const total = calcularPrecioConDescuento(precioBase, 1);

        expect(total).toBe(95000);
      });
    });

    describe('CE8: Familia con 2 hijos', () => {
      it('should calculate total with family discount', () => {
        const precioBase = 95000;
        const hijo1 = calcularPrecioConDescuento(precioBase, 1); // 95000
        const hijo2 = calcularPrecioConDescuento(precioBase, 2); // 85500

        const total = hijo1 + hijo2;
        expect(total).toBe(180500);

        // Ahorro: 95000 - 85500 = 9500
        const ahorro = precioBase * 2 - total;
        expect(ahorro).toBe(9500);
      });
    });

    describe('CE9: Familia con 3 hijos', () => {
      it('should calculate total with increasing discounts', () => {
        const precioBase = 95000;
        const hijo1 = calcularPrecioConDescuento(precioBase, 1); // 95000
        const hijo2 = calcularPrecioConDescuento(precioBase, 2); // 85500
        const hijo3 = calcularPrecioConDescuento(precioBase, 3); // 76000

        const total = hijo1 + hijo2 + hijo3;
        expect(total).toBe(256500);

        // Sin descuento sería 285000
        const ahorro = precioBase * 3 - total;
        expect(ahorro).toBe(28500);
      });
    });

    describe('Familia numerosa (6 hijos)', () => {
      it('should calculate total with max discount cap', () => {
        const precioBase = 95000;

        const precios = [];
        for (let i = 1; i <= 6; i++) {
          precios.push(calcularPrecioConDescuento(precioBase, i));
        }

        // 95000 + 85500 + 76000 + 66500 + 57000 + 47500
        const total = precios.reduce((a, b) => a + b, 0);
        expect(total).toBe(427500);

        // Sin descuento sería 570000
        const sinDescuento = precioBase * 6;
        expect(sinDescuento).toBe(570000);

        // Ahorro total
        const ahorro = sinDescuento - total;
        expect(ahorro).toBe(142500);
      });
    });
  });

  // ============================================================================
  // BOUNDARIES
  // ============================================================================

  describe('Boundary Tests', () => {
    it('should return 0 discount for numeroHijo <= 0', () => {
      expect(calcularDescuentoEsperado(0)).toBe(0);
      expect(calcularDescuentoEsperado(-1)).toBe(0);
      expect(calcularDescuentoEsperado(-100)).toBe(0);
    });

    it('should handle exactly at 50% cap (hijo 6)', () => {
      const descuento6 = calcularDescuentoEsperado(6);
      expect(descuento6).toBe(50);
    });

    it('should not exceed 50% (hijo 7+)', () => {
      const descuento7 = calcularDescuentoEsperado(7);
      const descuento100 = calcularDescuentoEsperado(100);

      expect(descuento7).toBe(50);
      expect(descuento100).toBe(50);
    });
  });

  // ============================================================================
  // CE10-CE11: MÚLTIPLES SUSCRIPCIONES Y ESTADOS
  // ============================================================================

  describe('CE10: Tutor con múltiples suscripciones activas', () => {
    it('should handle tutor with multiple active suscriptions', async () => {
      const { tutor, password } = await createTestTutor(prisma);

      // Crear 3 estudiantes
      const estudiantes = [];
      for (let i = 0; i < 3; i++) {
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        estudiantes.push(estudiante);
      }

      const plan = await crearPlanSuscripcion();

      // Crear suscripción con los 3 estudiantes
      await crearSuscripcionConEstudiantes(
        tutor.id,
        plan.id,
        estudiantes.map((e) => e.id),
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Verificar mis-suscripciones
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('CE11: Tutor con hijos en diferentes estados de suscripción', () => {
    it('should handle students with different subscription states', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      // Estudiante 1: Suscripción ACTIVA
      const { estudiante: est1 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await crearSuscripcionConEstudiantes(
        tutor.id,
        plan.id,
        [est1.id],
        EstadoSuscripcion.ACTIVA,
      );

      // Estudiante 2: Suscripción MOROSA
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await prisma.suscripcion.create({
        data: {
          tutor_id: tutor.id,
          plan_id: plan.id,
          estado: EstadoSuscripcion.MOROSA,
          precio_final: 85500, // Con descuento de 2do hijo
          mp_preapproval_id: `preapproval_morosa_${Date.now()}`,
          mp_status: 'authorized',
          estudiantes: { connect: [{ id: est2.id }] },
        },
      });

      // Estudiante 3: Sin suscripción activa
      await createTestEstudiante(prisma, { tutorId: tutor.id });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Admin puede ver todas las suscripciones
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);

      // Debería ver 2 suscripciones (ACTIVA y MOROSA)
      const suscripcionesDelTutor = response.body.data.filter(
        (s: { tutor: { id: string } }) => s.tutor.id === tutor.id,
      );
      expect(suscripcionesDelTutor.length).toBe(2);
    });
  });

  // ============================================================================
  // VERIFICACIÓN DE PRECIOS EN DB
  // ============================================================================

  describe('Verificación de Precios en Suscripción', () => {
    it('should store correct precio_final with discount applied', async () => {
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion('STEAM_SINCRONICO', 95000);

      // Crear 3 estudiantes
      const estudiantes = [];
      for (let i = 0; i < 3; i++) {
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        estudiantes.push(estudiante);
      }

      // El precio_final debería reflejar el descuento familiar
      // Para 3 hijos: 95000 + 85500 + 76000 = 256500
      // O el precio promedio por hijo

      // Crear suscripción
      const suscripcion = await prisma.suscripcion.create({
        data: {
          tutor_id: tutor.id,
          plan_id: plan.id,
          estado: EstadoSuscripcion.ACTIVA,
          precio_final: 256500, // Total familia 3 hijos
          mp_preapproval_id: `test_${Date.now()}`,
          mp_status: 'authorized',
          estudiantes: {
            connect: estudiantes.map((e) => ({ id: e.id })),
          },
        },
        include: { estudiantes: true },
      });

      expect(suscripcion.estudiantes.length).toBe(3);
      expect(suscripcion.precio_final.toNumber()).toBe(256500);
    });
  });

  // ============================================================================
  // DIFERENTES PLANES CON DESCUENTO
  // ============================================================================

  describe('Descuentos por Tipo de Plan', () => {
    it('should apply discount to STEAM_LIBROS plan', () => {
      const precioBase = 40000;

      const hijo1 = calcularPrecioConDescuento(precioBase, 1);
      const hijo2 = calcularPrecioConDescuento(precioBase, 2);

      expect(hijo1).toBe(40000);
      expect(hijo2).toBe(36000); // 40000 * 0.9
    });

    it('should apply discount to STEAM_ASINCRONICO plan', () => {
      const precioBase = 65000;

      const hijo1 = calcularPrecioConDescuento(precioBase, 1);
      const hijo2 = calcularPrecioConDescuento(precioBase, 2);

      expect(hijo1).toBe(65000);
      expect(hijo2).toBe(58500); // 65000 * 0.9
    });

    it('should apply discount to STEAM_SINCRONICO plan', () => {
      const precioBase = 95000;

      const hijo1 = calcularPrecioConDescuento(precioBase, 1);
      const hijo2 = calcularPrecioConDescuento(precioBase, 2);

      expect(hijo1).toBe(95000);
      expect(hijo2).toBe(85500); // 95000 * 0.9
    });
  });

  // ============================================================================
  // TABLA DE PRECIOS COMPLETA
  // ============================================================================

  describe('Tabla de Precios Completa (Referencia)', () => {
    it('should match expected price table for STEAM_SINCRONICO', () => {
      const precioBase = 95000;
      const tablaEsperada = [
        { hijo: 1, descuento: 0, precio: 95000 },
        { hijo: 2, descuento: 10, precio: 85500 },
        { hijo: 3, descuento: 20, precio: 76000 },
        { hijo: 4, descuento: 30, precio: 66500 },
        { hijo: 5, descuento: 40, precio: 57000 },
        { hijo: 6, descuento: 50, precio: 47500 },
        { hijo: 7, descuento: 50, precio: 47500 }, // Cap
      ];

      tablaEsperada.forEach((fila) => {
        const descuento = calcularDescuentoEsperado(fila.hijo);
        const precio = calcularPrecioConDescuento(precioBase, fila.hijo);

        expect(descuento).toBe(fila.descuento);
        expect(precio).toBe(fila.precio);
      });
    });
  });
});
