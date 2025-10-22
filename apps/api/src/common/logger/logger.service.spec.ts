import { LoggerService } from './logger.service';

describe('LoggerService metadata sanitization', () => {
  let service: LoggerService;
  let mockWinston: {
    debug: jest.Mock;
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    verbose: jest.Mock;
  };

  beforeEach(() => {
    service = new LoggerService();
    mockWinston = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
    };
    (service as unknown as { logger: typeof mockWinston }).logger = mockWinston;
  });

  it('normalizes primitive metadata values', () => {
    service.debug('testing detail', 'raw-detail');

    expect(mockWinston.debug).toHaveBeenCalledWith(
      'testing detail',
      expect.objectContaining({
        context: undefined,
        detail: 'raw-detail',
      }),
    );
  });

  it('extracts error information into metadata fields', () => {
    const error = new Error('unexpected failure');
    service.warn('warning with error', error);

    expect(mockWinston.warn).toHaveBeenCalledWith(
      'warning with error',
      expect.objectContaining({
        errorMessage: 'unexpected failure',
        errorName: 'Error',
      }),
    );
  });

  it('logs traces and structured metadata for errors', () => {
    service.error('critical path', 'trace-id', {
      statusCode: 500,
      alert: true,
      context: 'ignored-metadata-context',
    });

    expect(mockWinston.error).toHaveBeenCalledWith(
      'critical path',
      expect.objectContaining({
        trace: 'trace-id',
        statusCode: 500,
        alert: true,
      }),
    );
  });
});
