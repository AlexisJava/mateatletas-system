/**
 * LoggerService Integration Tests
 *
 * TDD: Tests para verificar que LoggerService incluye requestId
 * automáticamente cuando está disponible en el contexto.
 */

import { LoggerService } from '../../../common/logger/logger.service';
import { RequestContext } from '../request-context';

describe('LoggerService RequestContext Integration', () => {
  let logger: LoggerService;
  let mockWinstonLogger: {
    info: jest.Mock;
    debug: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    verbose: jest.Mock;
  };

  beforeEach(() => {
    logger = new LoggerService('TestContext');
    mockWinstonLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
    };

    // Reemplazar el logger interno directamente
    Object.defineProperty(logger, 'logger', {
      value: mockWinstonLogger,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    RequestContext.exit();
  });

  describe('requestId inclusion', () => {
    it('should_include_requestId_in_log_output', async () => {
      await RequestContext.run(
        () => {
          logger.log('Test message');
        },
        { requestId: 'test-request-id-123' },
      );

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          requestId: 'test-request-id-123',
        }),
      );
    });

    it('should_handle_missing_requestId_gracefully', () => {
      // Sin contexto activo
      logger.log('Message without context');

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Message without context',
        expect.objectContaining({
          context: 'TestContext',
        }),
      );

      // No debería incluir requestId si no hay contexto
      const callArgs = mockWinstonLogger.info.mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(callArgs.requestId).toBeUndefined();
    });

    it('should_include_requestId_in_all_log_levels', async () => {
      await RequestContext.run(
        () => {
          logger.debug('Debug message');
          logger.log('Info message');
          logger.warn('Warn message');
          logger.error('Error message');
          logger.verbose('Verbose message');
        },
        { requestId: 'multi-level-test' },
      );

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        'Debug message',
        expect.objectContaining({ requestId: 'multi-level-test' }),
      );

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({ requestId: 'multi-level-test' }),
      );

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
        'Warn message',
        expect.objectContaining({ requestId: 'multi-level-test' }),
      );

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({ requestId: 'multi-level-test' }),
      );

      expect(mockWinstonLogger.verbose).toHaveBeenCalledWith(
        'Verbose message',
        expect.objectContaining({ requestId: 'multi-level-test' }),
      );
    });
  });
});
