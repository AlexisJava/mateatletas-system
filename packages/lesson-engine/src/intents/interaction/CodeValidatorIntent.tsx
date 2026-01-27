'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  ChevronRight,
  Code2,
  Play,
  Check,
  X,
  RotateCcw,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';
import {
  executeInSandbox,
  validateSyntax,
  type TestCase,
  type TestResult,
  type SandboxResult,
} from './code-sandbox/js-sandbox';

// =============================================================================
// TYPES
// =============================================================================

export interface CodeTestCase {
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

export interface CodeValidatorIntentProps {
  /** Title of the challenge */
  title: string;
  /** Description of what to implement */
  description: string;
  /** Programming language (currently only JavaScript supported) */
  language: 'javascript' | 'python' | 'lua';
  /** Starter code to show in the editor */
  starterCode?: string;
  /** Test cases to run */
  testCases: CodeTestCase[];
  /** Maximum execution time in ms */
  timeout?: number;
  /** Feedback for passing all tests */
  correctFeedback?: string;
  /** Feedback for failing tests */
  incorrectFeedback?: string;
  /** Whether to show mascot */
  showMascot?: boolean;
  /** XP to award */
  xpReward?: number;
  /** Called when completed */
  onComplete?: (passed: boolean) => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const testResultVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: lessonSprings.card,
  },
};

const feedbackVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: lessonSprings.card,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CodeValidatorIntent - Code challenge with automated testing
 *
 * Students write code that is validated against test cases in a sandboxed environment.
 * Currently supports JavaScript execution via Web Workers.
 *
 * @example
 * ```tsx
 * <CodeValidatorIntent
 *   title="Suma de dos números"
 *   description="Escribe una función que sume dos números"
 *   language="javascript"
 *   starterCode="function suma(a, b) {\n  // Tu código aquí\n}"
 *   testCases={[
 *     { id: '1', name: 'Caso básico', input: '[2, 3]', expectedOutput: '5' },
 *     { id: '2', name: 'Negativos', input: '[-1, 1]', expectedOutput: '0' },
 *   ]}
 * />
 * ```
 */
export function CodeValidatorIntent({
  title,
  description,
  language,
  starterCode = '',
  testCases,
  timeout = 5000,
  correctFeedback = '¡Excelente! Tu código pasó todos los tests',
  incorrectFeedback = 'Algunos tests fallaron. Revisa tu código',
  showMascot = true,
  xpReward = 25,
  onComplete,
  className,
}: CodeValidatorIntentProps): React.ReactElement {
  const [code, setCode] = useState(starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  // Check if language is supported
  const isSupported = language === 'javascript';

  // Run the code against test cases
  const handleRun = useCallback(async () => {
    if (!isSupported) return;

    // Validate syntax first
    const syntaxCheck = validateSyntax(code);
    if (!syntaxCheck.valid) {
      setResult({
        success: false,
        results: [],
        totalTime: 0,
        syntaxError: syntaxCheck.error,
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    // Convert to sandbox test cases format
    const sandboxTests: TestCase[] = testCases.map((tc) => ({
      id: tc.id,
      name: tc.name,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      hidden: tc.hidden,
    }));

    const sandboxResult = await executeInSandbox(code, sandboxTests, timeout);
    setResult(sandboxResult);
    setIsRunning(false);
  }, [code, testCases, timeout, isSupported]);

  // Reset to starter code
  const handleReset = useCallback(() => {
    setCode(starterCode);
    setResult(null);
  }, [starterCode]);

  // Continue to next slide
  const handleContinue = useCallback(() => {
    onComplete?.(result?.success ?? false);
  }, [onComplete, result]);

  // Get visible and hidden test counts
  const visibleTests = testCases.filter((tc) => !tc.hidden);
  const hiddenTests = testCases.filter((tc) => tc.hidden);

  // Get test result by ID
  const getTestResult = (testId: string): TestResult | undefined => {
    return result?.results.find((r) => r.id === testId);
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" />
            Código
          </Badge>
          <Badge variant="xp" className="inline-flex items-center gap-1 opacity-70">
            {language.toUpperCase()}
          </Badge>
          {result?.success && (
            <Badge
              variant="xp"
              className="inline-flex items-center gap-1"
              style={{ background: 'var(--house-primary)', color: 'white' }}
            >
              +{xpReward} XP
            </Badge>
          )}
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
          {title}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/70 mt-2">
          {description}
        </motion.p>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex flex-col lg:flex-row gap-4 px-6 py-4 overflow-hidden">
        {/* Code editor panel */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: backgrounds.card,
            backdropFilter: `blur(${blur.md})`,
            border: `1px solid ${borders.subtle}`,
          }}
        >
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-sm text-white/50">Editor</span>
            <button
              onClick={handleReset}
              className="text-sm text-white/50 hover:text-white/80 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>

          {/* Code textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isRunning}
            className={clsx(
              'flex-1 w-full p-4 bg-transparent text-white font-mono text-sm',
              'resize-none focus:outline-none',
              'placeholder:text-white/30',
              isRunning && 'opacity-50',
            )}
            placeholder="// Escribe tu código aquí..."
            spellCheck={false}
          />

          {/* Syntax error display */}
          {result?.syntaxError && (
            <div className="px-4 py-2 bg-red-500/20 border-t border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-mono">{result.syntaxError}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Test cases panel */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-80 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: backgrounds.card,
            backdropFilter: `blur(${blur.md})`,
            border: `1px solid ${borders.subtle}`,
          }}
        >
          {/* Tests header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-sm text-white/50">Tests</span>
            {hiddenTests.length > 0 && (
              <button
                onClick={() => setShowHidden(!showHidden)}
                className="text-sm text-white/50 hover:text-white/80 flex items-center gap-1"
              >
                {showHidden ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    {hiddenTests.length} ocultos
                  </>
                )}
              </button>
            )}
          </div>

          {/* Test list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleTests.map((test) => {
                const testResult = getTestResult(test.id);
                return (
                  <motion.div
                    key={test.id}
                    variants={testResultVariants}
                    initial="hidden"
                    animate="visible"
                    className={clsx(
                      'p-3 rounded-xl border transition-colors',
                      !testResult && 'bg-white/5 border-white/10',
                      testResult?.passed && 'bg-green-500/10 border-green-500/30',
                      testResult && !testResult.passed && 'bg-red-500/10 border-red-500/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{test.name}</span>
                      {testResult && (
                        <div
                          className={clsx(
                            'w-5 h-5 rounded-full flex items-center justify-center',
                            testResult.passed ? 'bg-green-500' : 'bg-red-500',
                          )}
                        >
                          {testResult.passed ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-mono text-white/50">
                      Input: {test.input || 'ninguno'}
                    </div>
                    {testResult && !testResult.passed && testResult.error && (
                      <div className="mt-1 text-xs text-red-400">{testResult.error}</div>
                    )}
                    {testResult && !testResult.passed && !testResult.error && (
                      <div className="mt-1 text-xs text-white/50">
                        Esperado: {test.expectedOutput}, Obtenido: {testResult.actualOutput}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Hidden tests (shown only if toggled) */}
              {showHidden &&
                hiddenTests.map((test) => {
                  const testResult = getTestResult(test.id);
                  return (
                    <motion.div
                      key={test.id}
                      variants={testResultVariants}
                      initial="hidden"
                      animate="visible"
                      className={clsx(
                        'p-3 rounded-xl border transition-colors opacity-60',
                        !testResult && 'bg-white/5 border-white/10',
                        testResult?.passed && 'bg-green-500/10 border-green-500/30',
                        testResult && !testResult.passed && 'bg-red-500/10 border-red-500/30',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/70">
                          {test.name} (oculto)
                        </span>
                        {testResult && (
                          <div
                            className={clsx(
                              'w-5 h-5 rounded-full flex items-center justify-center',
                              testResult.passed ? 'bg-green-500' : 'bg-red-500',
                            )}
                          >
                            {testResult.passed ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <X className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Execution time */}
          {result && (
            <div className="px-4 py-2 border-t border-white/10 flex items-center gap-2 text-white/50 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{result.totalTime.toFixed(0)}ms</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {result && !result.syntaxError && (
          <motion.div
            variants={feedbackVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative z-10 px-6"
          >
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              {showMascot && (
                <BitMascot mood={result.success ? 'celebrating' : 'thinking'} size="sm" />
              )}
              <div
                className="flex-1 p-4 rounded-2xl"
                style={{
                  background: result.success
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${result.success ? '#22c55e' : '#ef4444'}`,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: result.success ? '#22c55e' : '#ef4444' }}
                >
                  {result.success ? correctFeedback : incorrectFeedback}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {result.results.filter((r) => r.passed).length} de {result.results.length} tests
                  pasaron
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language not supported warning */}
      {!isSupported && (
        <div className="relative z-10 px-6 pb-2">
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              <span>
                El lenguaje {language} aún no está soportado. Solo JavaScript está disponible.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="relative z-10 px-6 pb-6 flex justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRun}
          disabled={isRunning || !isSupported || !code.trim()}
        >
          <Play className="w-5 h-5 mr-2" />
          {isRunning ? 'Ejecutando...' : 'Ejecutar'}
        </Button>

        {result?.success && (
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

CodeValidatorIntent.displayName = 'CodeValidatorIntent';
