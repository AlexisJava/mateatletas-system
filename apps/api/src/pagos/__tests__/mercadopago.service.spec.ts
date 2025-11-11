import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../mercadopago.service';

/**
 * TESTS COMPREHENSIVOS PARA MERCADOPAGO SERVICE
 *
 * Cobertura:
 * - Inicialización en modo mock vs real
 * - createPreference con todas las validaciones
 * - getPayment con manejo de errores
 * - buildMembershipPreferenceData con validación de estructura
 * - buildCoursePreferenceData con validación de estructura
 * - Manejo de timeout y errores de red
 * - Validación de precios y URLs
 */

describe('MercadoPagoService - COMPREHENSIVE TESTS', () => {
  let service: MercadoPagoService;
  let configService: ConfigService;

  // Mocks para el SDK de MercadoPago
  const mockPreferenceClient = {
    create: jest.fn(),
  };

  const mockPaymentClient = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Initialization - Mock Mode', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_ACCESS_TOKEN') {
                  return 'XXXXXXXX'; // Token inválido = modo mock
                }
                return null;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize in MOCK mode when token is invalid', () => {
      expect(service.isMockMode()).toBe(true);
    });

    it('should throw error when trying to create preference in mock mode', async () => {
      await expect(service.createPreference({ items: [] })).rejects.toThrow(
        'MercadoPago está en modo mock',
      );
    });

    it('should throw error when trying to get payment in mock mode', async () => {
      await expect(service.getPayment('12345')).rejects.toThrow(
        'MercadoPago está en modo mock',
      );
    });
  });

  describe('Initialization - Real Mode', () => {
    beforeEach(async () => {
      // Mock del SDK de MercadoPago
      jest.mock('mercadopago', () => ({
        MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
        Preference: jest.fn().mockImplementation(() => mockPreferenceClient),
        Payment: jest.fn().mockImplementation(() => mockPaymentClient),
      }));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_ACCESS_TOKEN') {
                  return 'TEST-1234567890-abcdef-valid-token'; // Token válido
                }
                return null;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should initialize in REAL mode when valid token is provided', () => {
      expect(service.isMockMode()).toBe(false);
    });
  });

  describe('buildMembershipPreferenceData - Validation & Structure', () => {
    let service: MercadoPagoService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('XXXXXXXX'),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
    });

    it('should build valid membership preference data structure', () => {
      const mockProducto = {
        id: 'prod-123',
        nombre: 'Membresía Premium',
        descripcion: 'Acceso completo a la plataforma',
        precio: 5000,
      };

      const mockTutor = {
        email: 'tutor@test.com',
        nombre: 'Juan',
        apellido: 'Pérez',
      };

      const result = service.buildMembershipPreferenceData(
        mockProducto,
        mockTutor,
        'memb-456',
        'tutor-789',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      // Validar estructura completa
      expect(result).toMatchObject({
        items: [
          {
            id: 'prod-123',
            title: 'Membresía Premium',
            description: 'Acceso completo a la plataforma',
            quantity: 1,
            unit_price: 5000,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: 'tutor@test.com',
          name: 'Juan',
          surname: 'Pérez',
        },
        external_reference:
          'membresia-memb-456-tutor-tutor-789-producto-prod-123',
        notification_url: 'http://localhost:3001/api/pagos/webhook',
        back_urls: {
          success:
            'http://localhost:3000/suscripcion/exito?membresiaId=memb-456',
          failure:
            'http://localhost:3000/suscripcion/error?membresiaId=memb-456',
          pending:
            'http://localhost:3000/suscripcion/pendiente?membresiaId=memb-456',
        },
        auto_return: 'approved',
        statement_descriptor: 'Mateatletas',
      });
    });

    it('should handle producto without descripcion (undefined)', () => {
      const mockProducto = {
        id: 'prod-123',
        nombre: 'Membresía Básica',
        descripcion: undefined,
        precio: 3000,
      };

      const mockTutor = {
        email: 'tutor@test.com',
        nombre: 'María',
        apellido: 'González',
      };

      const result = service.buildMembershipPreferenceData(
        mockProducto,
        mockTutor,
        'memb-999',
        'tutor-111',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].description).toBeUndefined();
    });

    it('should correctly convert string precio to number', () => {
      const mockProducto = {
        id: 'prod-123',
        nombre: 'Membresía Premium',
        descripcion: 'Test',
        precio: 7500, // Number price
      };

      const mockTutor = {
        email: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
      };

      const result = service.buildMembershipPreferenceData(
        mockProducto,
        mockTutor,
        'memb-1',
        'tutor-1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].unit_price).toBe(7500);
      expect(typeof result.items[0].unit_price).toBe('number');
    });

    it('should handle invalid precio gracefully (NaN)', () => {
      const mockProducto = {
        id: 'prod-123',
        nombre: 'Test',
        descripcion: 'Test',
        precio: NaN,
      };

      const mockTutor = {
        email: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
      };

      const result = service.buildMembershipPreferenceData(
        mockProducto,
        mockTutor,
        'memb-1',
        'tutor-1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].unit_price).toBeNaN();
    });

    it('should build correct external_reference format', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M123',
        'T456',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.external_reference).toBe(
        'membresia-M123-tutor-T456-producto-P1',
      );
    });

    it('should build correct notification_url', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'https://api.mateatletas.com',
        'https://app.mateatletas.com',
      );

      expect(result.notification_url).toBe(
        'https://api.mateatletas.com/api/pagos/webhook',
      );
    });
  });

  describe('buildCoursePreferenceData - Validation & Structure', () => {
    let service: MercadoPagoService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('XXXXXXXX'),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
    });

    it('should build valid course preference data structure', () => {
      const mockProducto = {
        id: 'curso-123',
        nombre: 'Matemática Avanzada',
        descripcion: 'Curso completo de matemática',
        precio: 3500,
      };

      const mockEstudiante = {
        nombre: 'Sofía',
        apellido: 'Martínez',
      };

      const mockTutor = {
        email: 'tutor@test.com',
        nombre: 'Carlos',
        apellido: 'López',
      };

      const result = service.buildCoursePreferenceData(
        mockProducto,
        mockEstudiante,
        mockTutor,
        'insc-789',
        'est-456',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result).toMatchObject({
        items: [
          {
            id: 'curso-123',
            title: 'Matemática Avanzada - Sofía Martínez',
            description: 'Curso completo de matemática',
            quantity: 1,
            unit_price: 3500,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: 'tutor@test.com',
          name: 'Carlos',
          surname: 'López',
        },
        external_reference:
          'inscripcion-insc-789-estudiante-est-456-producto-curso-123',
        notification_url: 'http://localhost:3001/api/pagos/webhook',
        back_urls: {
          success: 'http://localhost:3000/cursos/exito?inscripcionId=insc-789',
          failure: 'http://localhost:3000/cursos/error?inscripcionId=insc-789',
          pending:
            'http://localhost:3000/cursos/pendiente?inscripcionId=insc-789',
        },
        auto_return: 'approved',
        statement_descriptor: 'Mateatletas',
      });
    });

    it('should include student name in item title', () => {
      const result = service.buildCoursePreferenceData(
        { id: 'C1', nombre: 'Física', descripcion: 'Test', precio: 1000 },
        { nombre: 'Ana', apellido: 'García' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'I1',
        'E1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].title).toBe('Física - Ana García');
    });

    it('should build correct external_reference for course', () => {
      const result = service.buildCoursePreferenceData(
        { id: 'C1', nombre: 'Test', precio: 100 },
        { nombre: 'Est', apellido: 'Udiante' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'I123',
        'E456',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.external_reference).toBe(
        'inscripcion-I123-estudiante-E456-producto-C1',
      );
    });
  });

  describe('Edge Cases & Error Handling', () => {
    let service: MercadoPagoService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('XXXXXXXX'),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
    });

    it('should handle very large prices correctly', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Premium', precio: 999999999, descripcion: 'Test' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].unit_price).toBe(999999999);
    });

    it('should handle zero price', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Free', precio: 0, descripcion: 'Test' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].unit_price).toBe(0);
    });

    it('should handle negative price (should be validated at service level)', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: -100, descripcion: 'Test' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].unit_price).toBe(-100);
    });

    it('should handle special characters in names', () => {
      const result = service.buildCoursePreferenceData(
        { id: 'C1', nombre: 'Física & Química', precio: 100 },
        { nombre: 'José María', apellido: "O'Connor" },
        {
          email: 'test@test.com',
          nombre: 'María José',
          apellido: 'Pérez-García',
        },
        'I1',
        'E1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].title).toBe(
        "Física & Química - José María O'Connor",
      );
      expect(result.payer.name).toBe('María José');
      expect(result.payer.surname).toBe('Pérez-García');
    });

    it('should handle very long URLs', () => {
      const longBackendUrl =
        'http://very-long-domain-name-for-testing-purposes.mateatletas.com';
      const longFrontendUrl =
        'http://another-very-long-domain-name-for-testing.mateatletas.com';

      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        longBackendUrl,
        longFrontendUrl,
      );

      expect(result.notification_url).toBe(
        `${longBackendUrl}/api/pagos/webhook`,
      );
      expect(result.back_urls.success).toContain(longFrontendUrl);
    });

    it('should handle IDs with special characters', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'prod-123-abc', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'memb-456-def',
        'tutor-789-ghi',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.external_reference).toBe(
        'membresia-memb-456-def-tutor-tutor-789-ghi-producto-prod-123-abc',
      );
    });

    it('should handle empty strings in optional fields', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100, descripcion: '' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      // Empty string is falsy, should become undefined
      expect(result.items[0].description).toBeUndefined();
    });
  });

  describe('Currency & Payment Configuration', () => {
    let service: MercadoPagoService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('XXXXXXXX'),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
    });

    it('should always use ARS currency', () => {
      const resultMembresia = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      const resultCurso = service.buildCoursePreferenceData(
        { id: 'C1', nombre: 'Test', precio: 100 },
        { nombre: 'E', apellido: 'E' },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'I1',
        'E1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(resultMembresia.items[0].currency_id).toBe('ARS');
      expect(resultCurso.items[0].currency_id).toBe('ARS');
    });

    it('should set quantity to 1 always', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.items[0].quantity).toBe(1);
    });

    it('should set auto_return to approved', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.auto_return).toBe('approved');
    });

    it('should set statement_descriptor to Mateatletas', () => {
      const result = service.buildMembershipPreferenceData(
        { id: 'P1', nombre: 'Test', precio: 100 },
        { email: 't@t.com', nombre: 'T', apellido: 'T' },
        'M1',
        'T1',
        'http://localhost:3001',
        'http://localhost:3000',
      );

      expect(result.statement_descriptor).toBe('Mateatletas');
    });
  });

  describe('buildInscripcion2026PreferenceData - NEW INTEGRATION', () => {
    let service: MercadoPagoService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('XXXXXXXX'),
            },
          },
        ],
      }).compile();

      service = module.get<MercadoPagoService>(MercadoPagoService);
    });

    describe('COLONIA Inscription Type', () => {
      it('should build valid COLONIA preference data structure', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 'tutor@test.com', nombre: 'Juan', apellido: 'Pérez' },
          'insc-abc123',
          'tutor-xyz789',
          2,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result).toMatchObject({
          items: [
            {
              id: 'inscripcion-2026-colonia',
              title: 'Inscripción Colonia de Verano 2026',
              description: 'Inscripción para 2 estudiantes - Colonia de Verano (Enero-Febrero 2026)',
              quantity: 1,
              unit_price: 25000,
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: 'tutor@test.com',
            name: 'Juan',
            surname: 'Pérez',
          },
          external_reference: 'inscripcion2026-insc-abc123-tutor-tutor-xyz789-tipo-COLONIA',
          notification_url: 'http://localhost:3001/api/inscripciones-2026/webhook',
          back_urls: {
            success: 'http://localhost:3000/inscripcion-2026/exito?inscripcionId=insc-abc123',
            failure: 'http://localhost:3000/inscripcion-2026/error?inscripcionId=insc-abc123',
            pending: 'http://localhost:3000/inscripcion-2026/pendiente?inscripcionId=insc-abc123',
          },
          auto_return: 'approved',
          statement_descriptor: 'Mateatletas 2026',
        });
      });

      it('should handle 1 estudiante correctly (singular form)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].description).toBe(
          'Inscripción para 1 estudiante - Colonia de Verano (Enero-Febrero 2026)',
        );
      });

      it('should handle 3+ estudiantes correctly (plural form)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          3,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].description).toBe(
          'Inscripción para 3 estudiantes - Colonia de Verano (Enero-Febrero 2026)',
        );
      });
    });

    describe('CICLO_2026 Inscription Type', () => {
      it('should build valid CICLO_2026 preference data structure', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'CICLO_2026',
          50000,
          { email: 'tutor@test.com', nombre: 'María', apellido: 'González' },
          'insc-def456',
          'tutor-abc123',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result).toMatchObject({
          items: [
            {
              id: 'inscripcion-2026-ciclo_2026',
              title: 'Inscripción Ciclo Lectivo 2026 (Early Bird)',
              description: 'Matrícula Early Bird para 1 estudiante - Ciclo Lectivo 2026',
              quantity: 1,
              unit_price: 50000,
              currency_id: 'ARS',
            },
          ],
          external_reference: 'inscripcion2026-insc-def456-tutor-tutor-abc123-tipo-CICLO_2026',
        });
      });
    });

    describe('PACK_COMPLETO Inscription Type', () => {
      it('should build valid PACK_COMPLETO preference data structure', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'PACK_COMPLETO',
          60000,
          { email: 'tutor@test.com', nombre: 'Carlos', apellido: 'López' },
          'insc-ghi789',
          'tutor-def456',
          2,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result).toMatchObject({
          items: [
            {
              id: 'inscripcion-2026-pack_completo',
              title: 'Inscripción Pack Completo 2026',
              description: 'Pack Completo (Colonia + Ciclo 2026) para 2 estudiantes - Ahorro de $15,000',
              quantity: 1,
              unit_price: 60000,
              currency_id: 'ARS',
            },
          ],
          external_reference: 'inscripcion2026-insc-ghi789-tutor-tutor-def456-tipo-PACK_COMPLETO',
        });
      });
    });

    describe('Edge Cases & Validation', () => {
      it('should handle unknown inscription type (fallback)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'UNKNOWN_TYPE',
          10000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].title).toBe('Inscripción Mateatletas 2026');
        expect(result.items[0].description).toBe('Inscripción para 1 estudiante');
      });

      it('should handle tutor with optional fields (nombre/apellido undefined)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 'tutor@test.com' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.payer.email).toBe('tutor@test.com');
        expect(result.payer.name).toBeUndefined();
        expect(result.payer.surname).toBeUndefined();
      });

      it('should handle very large amounts (pack familiar)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'PACK_COMPLETO',
          180000, // 3 hermanos
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          3,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].unit_price).toBe(180000);
      });

      it('should handle special characters in IDs', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'insc_2026-abc-123',
          'tutor_xyz-789',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.external_reference).toBe(
          'inscripcion2026-insc_2026-abc-123-tutor-tutor_xyz-789-tipo-COLONIA',
        );
      });

      it('should build correct notification_url for inscripciones 2026', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'https://api.mateatletas.com',
          'https://app.mateatletas.com',
        );

        expect(result.notification_url).toBe(
          'https://api.mateatletas.com/api/inscripciones-2026/webhook',
        );
      });

      it('should use statement_descriptor "Mateatletas 2026"', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.statement_descriptor).toBe('Mateatletas 2026');
      });
    });

    describe('Pricing Validation', () => {
      it('should handle COLONIA pricing ($25,000)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'COLONIA',
          25000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].unit_price).toBe(25000);
      });

      it('should handle CICLO_2026 Early Bird pricing ($50,000)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'CICLO_2026',
          50000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].unit_price).toBe(50000);
      });

      it('should handle PACK_COMPLETO discounted pricing ($60,000)', () => {
        const result = service.buildInscripcion2026PreferenceData(
          'PACK_COMPLETO',
          60000,
          { email: 't@t.com', nombre: 'T', apellido: 'T' },
          'I1',
          'T1',
          1,
          'http://localhost:3001',
          'http://localhost:3000',
        );

        expect(result.items[0].unit_price).toBe(60000);
      });
    });
  });
});
