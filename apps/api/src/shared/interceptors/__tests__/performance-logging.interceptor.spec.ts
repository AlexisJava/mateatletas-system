import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { PerformanceLoggingInterceptor } from '../performance-logging.interceptor';

describe('PerformanceLoggingInterceptor', () => {
  let interceptor: PerformanceLoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceLoggingInterceptor],
    }).compile();

    interceptor = module.get<PerformanceLoggingInterceptor>(PerformanceLoggingInterceptor);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/api/test',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Latency Measurement', () => {
    it('should measure and log request latency', (done) => {
      // Mock handle to return observable
      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));

      // Spy on logger
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      // Execute interceptor
      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalled();
          const logMessage = logSpy.mock.calls[0][0];
          expect(logMessage).toMatch(/GET \/api\/test - \d+ms - 200/);
          done();
        },
      });
    });

    it('should track fast requests (<1000ms) with LOG level', (done) => {
      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalled();
          const logMessage = logSpy.mock.calls[0][0];
          expect(logMessage).toContain('✅');
          done();
        },
      });
    });

    it('should warn on slow requests (>1000ms)', (done) => {
      // Mock Date.now to simulate slow request
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        // First call (start), second call (end after 1500ms)
        return callCount === 1 ? 1000 : 2500;
      });

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const warnSpy = jest.spyOn(interceptor['logger'], 'warn');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(warnSpy).toHaveBeenCalled();
          const logMessage = warnSpy.mock.calls[0][0];
          expect(logMessage).toContain('⚠️ SLOW REQUEST');
          expect(logMessage).toMatch(/1500ms/);

          // Restore
          Date.now = originalDateNow;
          done();
        },
      });
    });

    it('should error on critical latency (>3000ms)', (done) => {
      // Mock Date.now to simulate critical slow request
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        // First call (start), second call (end after 3500ms)
        return callCount === 1 ? 1000 : 4500;
      });

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const errorSpy = jest.spyOn(interceptor['logger'], 'error');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(errorSpy).toHaveBeenCalled();
          const logMessage = errorSpy.mock.calls[0][0];
          expect(logMessage).toContain('🔴 CRITICAL LATENCY');
          expect(logMessage).toMatch(/3500ms/);

          // Restore
          Date.now = originalDateNow;
          done();
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should log errors with latency', (done) => {
      const testError = new Error('Test error');
      (testError as any).status = 500;

      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));
      const errorSpy = jest.spyOn(interceptor['logger'], 'error');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalled();
          const logMessage = errorSpy.mock.calls[0][0];
          expect(logMessage).toContain('❌');
          expect(logMessage).toContain('GET /api/test');
          expect(logMessage).toContain('500');
          expect(logMessage).toContain('Error: Test error');
          done();
        },
      });
    });

    it('should default to 500 status for errors without status', (done) => {
      const testError = new Error('Unknown error');

      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));
      const errorSpy = jest.spyOn(interceptor['logger'], 'error');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalled();
          const logMessage = errorSpy.mock.calls[0][0];
          expect(logMessage).toContain('500');
          done();
        },
      });
    });
  });

  describe('Metrics Emission', () => {
    it('should emit structured metrics in production', (done) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const debugSpy = jest.spyOn(interceptor['logger'], 'debug');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(debugSpy).toHaveBeenCalled();
          const metricsJson = debugSpy.mock.calls[0][0];
          const metrics = JSON.parse(metricsJson);

          expect(metrics).toHaveProperty('type', 'http_request');
          expect(metrics).toHaveProperty('method', 'GET');
          expect(metrics).toHaveProperty('url', '/api/test');
          expect(metrics).toHaveProperty('latency');
          expect(metrics).toHaveProperty('statusCode', 200);
          expect(metrics).toHaveProperty('timestamp');

          // Restore
          process.env.NODE_ENV = originalEnv;
          done();
        },
      });
    });

    it('should not emit structured metrics in development', (done) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const debugSpy = jest.spyOn(interceptor['logger'], 'debug');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(debugSpy).not.toHaveBeenCalled();

          // Restore
          process.env.NODE_ENV = originalEnv;
          done();
        },
      });
    });

    it('should include error in metrics when request fails', (done) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const testError = new Error('Request failed');
      (testError as any).status = 400;

      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));
      const debugSpy = jest.spyOn(interceptor['logger'], 'debug');

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(debugSpy).toHaveBeenCalled();
          const metricsJson = debugSpy.mock.calls[0][0];
          const metrics = JSON.parse(metricsJson);

          expect(metrics).toHaveProperty('error', 'Request failed');
          expect(metrics).toHaveProperty('statusCode', 400);

          // Restore
          process.env.NODE_ENV = originalEnv;
          done();
        },
      });
    });
  });

  describe('HTTP Method and URL Capture', () => {
    it('should capture POST requests correctly', (done) => {
      const postContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'POST',
            url: '/api/inscripciones-2026',
          }),
          getResponse: jest.fn().mockReturnValue({
            statusCode: 201,
          }),
        }),
      } as any;

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      const result$ = interceptor.intercept(postContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalled();
          const logMessage = logSpy.mock.calls[0][0];
          expect(logMessage).toContain('POST /api/inscripciones-2026');
          expect(logMessage).toContain('201');
          done();
        },
      });
    });

    it('should handle different status codes', (done) => {
      const notFoundContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/api/not-found',
          }),
          getResponse: jest.fn().mockReturnValue({
            statusCode: 404,
          }),
        }),
      } as any;

      mockCallHandler.handle = jest.fn().mockReturnValue(of('response'));
      const logSpy = jest.spyOn(interceptor['logger'], 'log');

      const result$ = interceptor.intercept(notFoundContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalled();
          const logMessage = logSpy.mock.calls[0][0];
          expect(logMessage).toContain('404');
          done();
        },
      });
    });
  });
});
