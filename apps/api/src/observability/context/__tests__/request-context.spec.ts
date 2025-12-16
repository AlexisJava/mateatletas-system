/**
 * RequestContext Unit Tests
 *
 * TDD: Tests para AsyncLocalStorage-based request context.
 * Permite propagar requestId y metadata a través de async operations.
 */

import { RequestContext, RequestContextData } from '../request-context';

describe('RequestContext', () => {
  afterEach(() => {
    // Limpiar cualquier contexto residual
    RequestContext.exit();
  });

  describe('requestId management', () => {
    it('should_create_new_context_with_generated_requestId', async () => {
      let capturedRequestId: string | undefined;

      await RequestContext.run(() => {
        capturedRequestId = RequestContext.getRequestId();
      });

      expect(capturedRequestId).toBeDefined();
      expect(capturedRequestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should_use_provided_requestId_if_exists', async () => {
      const providedId = 'custom-request-id-123';
      let capturedRequestId: string | undefined;

      await RequestContext.run(
        () => {
          capturedRequestId = RequestContext.getRequestId();
        },
        { requestId: providedId },
      );

      expect(capturedRequestId).toBe(providedId);
    });

    it('should_return_undefined_when_outside_context', () => {
      const requestId = RequestContext.getRequestId();

      expect(requestId).toBeUndefined();
    });
  });

  describe('context propagation', () => {
    it('should_propagate_context_through_async_operations', async () => {
      const providedId = 'async-test-id';
      const results: string[] = [];

      await RequestContext.run(
        async () => {
          results.push(RequestContext.getRequestId() ?? 'none');

          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push(RequestContext.getRequestId() ?? 'none');

          await Promise.resolve().then(() => {
            results.push(RequestContext.getRequestId() ?? 'none');
          });
        },
        { requestId: providedId },
      );

      expect(results).toEqual([providedId, providedId, providedId]);
    });

    it('should_isolate_context_between_concurrent_requests', async () => {
      const results: Map<string, string[]> = new Map();

      const request1 = RequestContext.run(
        async () => {
          const id = RequestContext.getRequestId()!;
          results.set(id, []);
          results.get(id)!.push(`start-${id}`);

          await new Promise((resolve) => setTimeout(resolve, 20));
          results.get(id)!.push(`end-${RequestContext.getRequestId()}`);
        },
        { requestId: 'request-1' },
      );

      const request2 = RequestContext.run(
        async () => {
          const id = RequestContext.getRequestId()!;
          results.set(id, []);
          results.get(id)!.push(`start-${id}`);

          await new Promise((resolve) => setTimeout(resolve, 10));
          results.get(id)!.push(`end-${RequestContext.getRequestId()}`);
        },
        { requestId: 'request-2' },
      );

      await Promise.all([request1, request2]);

      expect(results.get('request-1')).toEqual([
        'start-request-1',
        'end-request-1',
      ]);
      expect(results.get('request-2')).toEqual([
        'start-request-2',
        'end-request-2',
      ]);
    });
  });

  describe('metadata storage', () => {
    it('should_store_additional_metadata_in_context', async () => {
      let capturedContext: RequestContextData | undefined;

      await RequestContext.run(
        () => {
          RequestContext.set('ip', '192.168.1.1');
          RequestContext.set('userAgent', 'Mozilla/5.0');
          capturedContext = RequestContext.getContext();
        },
        { requestId: 'meta-test' },
      );

      expect(capturedContext?.ip).toBe('192.168.1.1');
      expect(capturedContext?.userAgent).toBe('Mozilla/5.0');
    });

    it('should_get_userId_from_context', async () => {
      let capturedUserId: string | undefined;

      await RequestContext.run(
        () => {
          RequestContext.setUserId('user-123');
          capturedUserId = RequestContext.getUserId();
        },
        { requestId: 'user-test' },
      );

      expect(capturedUserId).toBe('user-123');
    });

    it('should_get_full_context_object', async () => {
      let capturedContext: RequestContextData | undefined;

      await RequestContext.run(
        () => {
          RequestContext.setUserId('user-456');
          RequestContext.set('method', 'GET');
          RequestContext.set('path', '/api/test');
          capturedContext = RequestContext.getContext();
        },
        { requestId: 'full-context-test' },
      );

      expect(capturedContext).toEqual({
        requestId: 'full-context-test',
        userId: 'user-456',
        method: 'GET',
        path: '/api/test',
      });
    });
  });
});
