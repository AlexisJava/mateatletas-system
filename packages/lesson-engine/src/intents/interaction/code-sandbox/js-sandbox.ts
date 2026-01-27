/**
 * JavaScript Sandbox
 *
 * Executes untrusted JavaScript code in a Web Worker sandbox.
 * Uses Blob-based worker creation for Next.js compatibility.
 *
 * Security measures:
 * - Runs in separate thread (Web Worker)
 * - No DOM access
 * - No network access (fetch disabled)
 * - Timeout enforcement
 * - Limited memory (browser-enforced)
 *
 * NOTE: This module intentionally uses dynamic code evaluation (new Function)
 * because it's designed to execute student-submitted code in an isolated sandbox.
 * Security is provided by Web Worker isolation and blocked globals, not by
 * avoiding code execution.
 *
 * @see https://healeycodes.com/sandboxing-javascript-code
 */

export interface TestCase {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Input to pass to the function (as string, will be eval'd) */
  input: string;
  /** Expected output (as string for comparison) */
  expectedOutput: string;
  /** Whether to hide this test from the student */
  hidden?: boolean;
}

export interface TestResult {
  /** Test case ID */
  id: string;
  /** Whether the test passed */
  passed: boolean;
  /** Actual output received */
  actualOutput: string;
  /** Expected output */
  expectedOutput: string;
  /** Error message if any */
  error?: string;
  /** Execution time in ms */
  executionTime: number;
}

export interface SandboxResult {
  /** Whether all tests passed */
  success: boolean;
  /** Individual test results */
  results: TestResult[];
  /** Total execution time */
  totalTime: number;
  /** Syntax error if code couldn't be parsed */
  syntaxError?: string;
}

// Worker script as string (will be converted to Blob)
// Security: This runs in an isolated Web Worker with blocked globals
const workerScript = `
  // Disable dangerous globals in the worker
  const blockedGlobals = ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts'];
  blockedGlobals.forEach(name => {
    self[name] = undefined;
  });

  // Handle messages from main thread
  self.onmessage = function(e) {
    const { code, testCases, functionName } = e.data;
    const results = [];
    const startTotal = performance.now();

    try {
      // Create isolated function from code
      // This is intentional - we need to execute student code
      const fn = new Function('return ' + code)();

      // If functionName is provided, extract it from the returned object
      const testFn = functionName ? fn[functionName] || fn : fn;

      if (typeof testFn !== 'function') {
        self.postMessage({
          success: false,
          results: [],
          totalTime: 0,
          syntaxError: 'El código debe definir una función'
        });
        return;
      }

      // Run each test case
      for (const test of testCases) {
        const startTest = performance.now();
        let result = {
          id: test.id,
          passed: false,
          actualOutput: '',
          expectedOutput: test.expectedOutput,
          executionTime: 0
        };

        try {
          // Parse input and execute
          const input = test.input ? eval('(' + test.input + ')') : undefined;
          const output = Array.isArray(input) ? testFn(...input) : testFn(input);
          const outputStr = JSON.stringify(output);

          result.actualOutput = outputStr;
          result.passed = outputStr === test.expectedOutput;
          result.executionTime = performance.now() - startTest;
        } catch (err) {
          result.error = err.message;
          result.executionTime = performance.now() - startTest;
        }

        results.push(result);
      }

      const totalTime = performance.now() - startTotal;
      const success = results.every(r => r.passed);

      self.postMessage({ success, results, totalTime });

    } catch (err) {
      self.postMessage({
        success: false,
        results: [],
        totalTime: performance.now() - startTotal,
        syntaxError: err.message
      });
    }
  };
`;

/**
 * Execute JavaScript code in a sandboxed Web Worker
 *
 * This function intentionally executes arbitrary code - that's its purpose.
 * Security is provided by Web Worker isolation, not by avoiding execution.
 *
 * @param code - The JavaScript code to execute (should define a function)
 * @param testCases - Array of test cases to run
 * @param timeout - Maximum execution time in ms (default: 5000)
 * @param functionName - Optional name of function to extract from code
 * @returns Promise with sandbox execution results
 */
export async function executeInSandbox(
  code: string,
  testCases: TestCase[],
  timeout: number = 5000,
  functionName?: string,
): Promise<SandboxResult> {
  return new Promise((resolve) => {
    // Check if we're in a browser environment
    if (typeof Worker === 'undefined') {
      resolve({
        success: false,
        results: [],
        totalTime: 0,
        syntaxError: 'Web Workers no disponibles en este entorno',
      });
      return;
    }

    // Create worker from Blob
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // Timeout handler
    const timeoutId = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        success: false,
        results: testCases.map((tc) => ({
          id: tc.id,
          passed: false,
          actualOutput: '',
          expectedOutput: tc.expectedOutput,
          error: 'Tiempo de ejecución excedido',
          executionTime: timeout,
        })),
        totalTime: timeout,
        syntaxError: `El código excedió el tiempo límite de ${timeout}ms`,
      });
    }, timeout);

    // Message handler
    worker.onmessage = (e: MessageEvent<SandboxResult>) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(e.data);
    };

    // Error handler
    worker.onerror = (error) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        success: false,
        results: [],
        totalTime: 0,
        syntaxError: error.message || 'Error desconocido en el sandbox',
      });
    };

    // Send code and test cases to worker
    worker.postMessage({ code, testCases, functionName });
  });
}

/**
 * Validate code syntax without executing
 *
 * Uses Function constructor only for parsing, not execution.
 */
export function validateSyntax(code: string): { valid: boolean; error?: string } {
  try {
    // Use Function constructor to parse without executing
    new Function(code);
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Error de sintaxis',
    };
  }
}
