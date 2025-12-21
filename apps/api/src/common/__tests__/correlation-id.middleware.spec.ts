/**
 * Tests TDD para CorrelationIdMiddleware
 *
 * REGLAS:
 * - Si request tiene X-Correlation-ID, usarlo
 * - Si no tiene, generar UUID
 * - Propagar a response headers
 * - Disponible via decorator @CorrelationId()
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';

import { CorrelationIdMiddleware } from '../middleware/correlation-id.middleware';
import {
  CORRELATION_ID_HEADER,
  getCorrelationId,
} from '../middleware/correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationIdMiddleware],
    }).compile();

    middleware = module.get<CorrelationIdMiddleware>(CorrelationIdMiddleware);
  });

  describe('use()', () => {
    it('should_generate_uuid_when_no_correlation_id_header', () => {
      // Arrange
      const req = {
        headers: {},
      } as Request;
      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;
      const next: NextFunction = jest.fn();

      // Act
      middleware.use(req, res, next);

      // Assert
      expect(req.headers[CORRELATION_ID_HEADER]).toBeDefined();
      expect(req.headers[CORRELATION_ID_HEADER]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(next).toHaveBeenCalled();
    });

    it('should_use_existing_correlation_id_from_header', () => {
      // Arrange
      const existingId = 'existing-correlation-123';
      const req = {
        headers: {
          [CORRELATION_ID_HEADER]: existingId,
        },
      } as unknown as Request;
      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;
      const next: NextFunction = jest.fn();

      // Act
      middleware.use(req, res, next);

      // Assert
      expect(req.headers[CORRELATION_ID_HEADER]).toBe(existingId);
      expect(next).toHaveBeenCalled();
    });

    it('should_set_correlation_id_on_response_headers', () => {
      // Arrange
      const req = {
        headers: {},
      } as Request;
      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;
      const next: NextFunction = jest.fn();

      // Act
      middleware.use(req, res, next);

      // Assert
      const generatedId = req.headers[CORRELATION_ID_HEADER];
      expect(res.setHeader).toHaveBeenCalledWith(
        CORRELATION_ID_HEADER,
        generatedId,
      );
    });

    it('should_call_next_function', () => {
      // Arrange
      const req = { headers: {} } as Request;
      const res = { setHeader: jest.fn() } as unknown as Response;
      const next: NextFunction = jest.fn();

      // Act
      middleware.use(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCorrelationId helper', () => {
    it('should_return_correlation_id_from_request', () => {
      // Arrange
      const correlationId = 'test-corr-id-123';
      const req = {
        headers: {
          [CORRELATION_ID_HEADER]: correlationId,
        },
      } as unknown as Request;

      // Act
      const result = getCorrelationId(req);

      // Assert
      expect(result).toBe(correlationId);
    });

    it('should_return_undefined_when_no_correlation_id', () => {
      // Arrange
      const req = {
        headers: {},
      } as Request;

      // Act
      const result = getCorrelationId(req);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Header name', () => {
    it('should_use_standard_X-Correlation-ID_header', () => {
      expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
    });
  });
});
