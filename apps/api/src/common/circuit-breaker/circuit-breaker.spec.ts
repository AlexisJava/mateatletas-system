import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerOpenError,
} from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      name: 'TestCircuit',
      failureThreshold: 3,
      resetTimeout: 1000, // 1 segundo para tests rápidos
    });
  });

  describe('CLOSED state', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should execute function successfully when CLOSED', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should pass arguments to the function', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');

      await circuitBreaker.execute(mockFn, 'arg1', 'arg2', 'arg3');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('Failure handling', () => {
    it('should stay CLOSED on single failure', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Fail');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should open circuit after threshold failures', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));

      // Fail 3 times (threshold)
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should reset failure count on success', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success'); // Success resets count

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Fail 1');
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Fail 2');
      await circuitBreaker.execute(mockFn); // Success

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getMetrics().failureCount).toBe(0);
    });
  });

  describe('OPEN state', () => {
    beforeEach(async () => {
      // Open the circuit by failing 3 times
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    });

    it('should throw CircuitBreakerOpenError when circuit is OPEN', async () => {
      const mockFn = jest.fn();

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(
        CircuitBreakerOpenError,
      );
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should use fallback when circuit is OPEN', async () => {
      const fallbackCB = new CircuitBreaker({
        name: 'FallbackCircuit',
        failureThreshold: 2,
        fallback: () => 'fallback-value',
      });

      // Open circuit
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(fallbackCB.execute(mockFn)).rejects.toThrow();
      await expect(fallbackCB.execute(mockFn)).rejects.toThrow();

      // Circuit OPEN, should use fallback
      const result = await fallbackCB.execute(mockFn);
      expect(result).toBe('fallback-value');
      expect(mockFn).not.toHaveBeenCalledTimes(3); // Only called 2 times
    });
  });

  describe('HALF_OPEN state', () => {
    beforeEach(async () => {
      // Open the circuit
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      // Wait for reset timeout (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const mockFn = jest.fn().mockResolvedValue('success');

      // This should trigger HALF_OPEN
      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED); // Success in HALF_OPEN closes it
    });

    it('should reopen circuit if request fails in HALF_OPEN', async () => {
      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const mockFn = jest.fn().mockRejectedValue(new Error('Still failing'));

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(
        'Still failing',
      );
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Metrics', () => {
    it('should return correct metrics', () => {
      const metrics = circuitBreaker.getMetrics();

      expect(metrics).toHaveProperty('state');
      expect(metrics).toHaveProperty('failureCount');
      expect(metrics).toHaveProperty('failureThreshold');
      expect(metrics).toHaveProperty('nextAttempt');
    });

    it('should show nextAttempt when OPEN', async () => {
      // Open circuit
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.state).toBe(CircuitState.OPEN);
      expect(metrics.nextAttempt).not.toBeNull();
      expect(typeof metrics.nextAttempt).toBe('string');
    });
  });

  describe('Manual reset', () => {
    it('should reset circuit to CLOSED state', async () => {
      // Open circuit
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Manual reset
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getMetrics().failureCount).toBe(0);
    });
  });
});
