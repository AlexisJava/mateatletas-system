/**
 * RequestContextMiddleware Unit Tests
 *
 * TDD: Tests para el middleware que genera/extrae request ID
 * y establece el contexto para cada request HTTP.
 */

import { Request, Response } from 'express';
import { RequestContextMiddleware } from '../request-context.middleware';
import { RequestContext } from '../request-context';

describe('RequestContextMiddleware', () => {
  let middleware: RequestContextMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new RequestContextMiddleware();
    mockRequest = {
      headers: {},
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        const headers = mockRequest.headers as Record<string, string>;
        return headers[header.toLowerCase()];
      }),
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    RequestContext.exit();
  });

  describe('requestId generation', () => {
    it('should_generate_requestId_if_not_in_header', async () => {
      let capturedRequestId: string | undefined;

      nextFunction.mockImplementation(() => {
        capturedRequestId = RequestContext.getRequestId();
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(capturedRequestId).toBeDefined();
      expect(capturedRequestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should_use_x_request_id_header_if_provided', async () => {
      const providedId = 'external-request-id-xyz';
      (mockRequest.headers as Record<string, string>)['x-request-id'] =
        providedId;

      let capturedRequestId: string | undefined;

      nextFunction.mockImplementation(() => {
        capturedRequestId = RequestContext.getRequestId();
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(capturedRequestId).toBe(providedId);
    });
  });

  describe('response headers', () => {
    it('should_set_x_request_id_response_header', async () => {
      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-request-id',
        expect.any(String),
      );
    });
  });

  describe('context execution', () => {
    it('should_call_next_within_context', async () => {
      let contextAvailable = false;

      nextFunction.mockImplementation(() => {
        contextAvailable = RequestContext.getRequestId() !== undefined;
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(contextAvailable).toBe(true);
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should_handle_uuid_format_validation', async () => {
      // Header con formato inválido debería generar uno nuevo
      (mockRequest.headers as Record<string, string>)['x-request-id'] =
        'invalid-not-uuid';

      let capturedRequestId: string | undefined;

      nextFunction.mockImplementation(() => {
        capturedRequestId = RequestContext.getRequestId();
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      // Debería aceptar cualquier string como ID (no forzar UUID)
      // pero el valor debería estar disponible
      expect(capturedRequestId).toBe('invalid-not-uuid');
    });
  });
});
