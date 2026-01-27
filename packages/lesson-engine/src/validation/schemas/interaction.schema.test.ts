/**
 * Interaction Schema Tests
 *
 * Unit tests for interaction intent schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  quizMCIntentSchema,
  quizTFIntentSchema,
  dragDropIntentSchema,
  matchingIntentSchema,
  fillBlankIntentSchema,
  sortingIntentSchema,
  interactionIntentSchema,
} from './interaction.schema';

// =============================================================================
// QUIZ MC INTENT
// =============================================================================

describe('quizMCIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'What is 2+2?',
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
      ],
      correctId: 'b',
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctId: 'a',
    };

    const result = quizMCIntentSchema.parse(data);
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(10);
  });

  it('should reject less than 2 options', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: [{ id: 'a', text: 'Only one' }],
      correctId: 'a',
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 6 options', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: Array(7)
        .fill(null)
        .map((_, i) => ({ id: String(i), text: `Option ${i}` })),
      correctId: '0',
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept up to 6 options', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: Array(6)
        .fill(null)
        .map((_, i) => ({ id: String(i), text: `Option ${i}` })),
      correctId: '0',
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty question', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: '',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctId: 'a',
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional feedback', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctId: 'a',
      explanation: 'Because...',
      feedback: {
        correct: '¡Muy bien!',
        incorrect: 'Intenta de nuevo',
      },
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept combo for streaks', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctId: 'a',
      combo: 5,
    };

    const result = quizMCIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.combo).toBe(5);
    }
  });
});

// =============================================================================
// QUIZ TF INTENT
// =============================================================================

describe('quizTFIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:quiz-tf',
      statement: 'The sky is blue',
      correctAnswer: true,
    };

    const result = quizTFIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:quiz-tf',
      statement: 'Test statement',
      correctAnswer: false,
    };

    const result = quizTFIntentSchema.parse(data);
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(10);
  });

  it('should reject empty statement', () => {
    const data = {
      intent: 'interaction:quiz-tf',
      statement: '',
      correctAnswer: true,
    };

    const result = quizTFIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept both true and false answers', () => {
    const trueData = {
      intent: 'interaction:quiz-tf',
      statement: 'Test',
      correctAnswer: true,
    };
    const falseData = {
      intent: 'interaction:quiz-tf',
      statement: 'Test',
      correctAnswer: false,
    };

    expect(quizTFIntentSchema.safeParse(trueData).success).toBe(true);
    expect(quizTFIntentSchema.safeParse(falseData).success).toBe(true);
  });

  it('should accept optional feedback strings', () => {
    const data = {
      intent: 'interaction:quiz-tf',
      statement: 'Test',
      correctAnswer: true,
      correctFeedback: 'Right!',
      incorrectFeedback: 'Wrong!',
      explanation: 'Because science',
    };

    const result = quizTFIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// DRAG DROP INTENT
// =============================================================================

describe('dragDropIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:drag-drop',
      instruction: 'Order the items',
      items: [
        { id: '1', content: 'First' },
        { id: '2', content: 'Second' },
      ],
      correctOrder: ['1', '2'],
    };

    const result = dragDropIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:drag-drop',
      instruction: 'Order items',
      items: [
        { id: '1', content: 'A' },
        { id: '2', content: 'B' },
      ],
      correctOrder: ['1', '2'],
    };

    const result = dragDropIntentSchema.parse(data);
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(15);
  });

  it('should reject less than 2 items', () => {
    const data = {
      intent: 'interaction:drag-drop',
      instruction: 'Order',
      items: [{ id: '1', content: 'Only one' }],
      correctOrder: ['1'],
    };

    const result = dragDropIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 items', () => {
    const data = {
      intent: 'interaction:drag-drop',
      instruction: 'Order',
      items: Array(11)
        .fill(null)
        .map((_, i) => ({ id: String(i), content: `Item ${i}` })),
      correctOrder: Array(11)
        .fill(null)
        .map((_, i) => String(i)),
    };

    const result = dragDropIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept items with optional image', () => {
    const data = {
      intent: 'interaction:drag-drop',
      instruction: 'Order by size',
      items: [
        { id: '1', content: 'Small', image: '/small.png' },
        { id: '2', content: 'Large', image: '/large.png' },
      ],
      correctOrder: ['1', '2'],
    };

    const result = dragDropIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// MATCHING INTENT
// =============================================================================

describe('matchingIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:matching',
      pairs: [
        { id: '1', left: 'A', right: '1' },
        { id: '2', left: 'B', right: '2' },
      ],
    };

    const result = matchingIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:matching',
      pairs: [
        { id: '1', left: 'A', right: '1' },
        { id: '2', left: 'B', right: '2' },
      ],
    };

    const result = matchingIntentSchema.parse(data);
    expect(result.shuffle).toBe(true);
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(20);
  });

  it('should reject less than 2 pairs', () => {
    const data = {
      intent: 'interaction:matching',
      pairs: [{ id: '1', left: 'A', right: '1' }],
    };

    const result = matchingIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 8 pairs', () => {
    const data = {
      intent: 'interaction:matching',
      pairs: Array(9)
        .fill(null)
        .map((_, i) => ({ id: String(i), left: `L${i}`, right: `R${i}` })),
    };

    const result = matchingIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional title and instruction', () => {
    const data = {
      intent: 'interaction:matching',
      title: 'Match the Pairs',
      instruction: 'Connect related items',
      pairs: [
        { id: '1', left: 'A', right: '1' },
        { id: '2', left: 'B', right: '2' },
      ],
    };

    const result = matchingIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// FILL BLANK INTENT
// =============================================================================

describe('fillBlankIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: 'The capital of France is {{blank}}',
      answers: ['Paris'],
    };

    const result = fillBlankIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: 'Complete: {{blank}}',
      answers: ['answer'],
    };

    const result = fillBlankIntentSchema.parse(data);
    expect(result.caseSensitive).toBe(false);
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(10);
  });

  it('should reject empty text', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: '',
      answers: ['answer'],
    };

    const result = fillBlankIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty answers array', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: 'The answer is {{blank}}',
      answers: [],
    };

    const result = fillBlankIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept multiple answers for multiple blanks', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: '{{blank1}} + {{blank2}} = 5',
      answers: ['2', '3'],
    };

    const result = fillBlankIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept caseSensitive flag', () => {
    const data = {
      intent: 'interaction:fill-blank',
      text: 'Type the word: {{blank}}',
      answers: ['JavaScript'],
      caseSensitive: true,
    };

    const result = fillBlankIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caseSensitive).toBe(true);
    }
  });
});

// =============================================================================
// SORTING INTENT
// =============================================================================

describe('sortingIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'interaction:sorting',
      instruction: 'Sort from smallest to largest',
      items: [
        { id: '1', label: 'Five', value: 5 },
        { id: '2', label: 'Three', value: 3 },
      ],
    };

    const result = sortingIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'interaction:sorting',
      instruction: 'Sort items',
      items: [
        { id: '1', label: 'A', value: 1 },
        { id: '2', label: 'B', value: 2 },
      ],
    };

    const result = sortingIntentSchema.parse(data);
    expect(result.direction).toBe('asc');
    expect(result.criterion).toBe('numeric');
    expect(result.showMascot).toBe(true);
    expect(result.xpReward).toBe(15);
  });

  it('should accept all direction values', () => {
    const directions = ['asc', 'desc'] as const;

    for (const direction of directions) {
      const data = {
        intent: 'interaction:sorting',
        instruction: 'Sort',
        items: [
          { id: '1', label: 'A', value: 1 },
          { id: '2', label: 'B', value: 2 },
        ],
        direction,
      };
      const result = sortingIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should accept all criterion values', () => {
    const criteria = ['numeric', 'alphabetic', 'custom'] as const;

    for (const criterion of criteria) {
      const data = {
        intent: 'interaction:sorting',
        instruction: 'Sort',
        items: [
          { id: '1', label: 'A', value: 1 },
          { id: '2', label: 'B', value: 2 },
        ],
        criterion,
      };
      const result = sortingIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should accept string values for alphabetic sorting', () => {
    const data = {
      intent: 'interaction:sorting',
      instruction: 'Sort alphabetically',
      items: [
        { id: '1', label: 'Apple', value: 'apple' },
        { id: '2', label: 'Banana', value: 'banana' },
      ],
      criterion: 'alphabetic',
    };

    const result = sortingIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject less than 2 items', () => {
    const data = {
      intent: 'interaction:sorting',
      instruction: 'Sort',
      items: [{ id: '1', label: 'Only', value: 1 }],
    };

    const result = sortingIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 items', () => {
    const data = {
      intent: 'interaction:sorting',
      instruction: 'Sort',
      items: Array(11)
        .fill(null)
        .map((_, i) => ({ id: String(i), label: `Item ${i}`, value: i })),
    };

    const result = sortingIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// INTERACTION UNION
// =============================================================================

describe('interactionIntentSchema (union)', () => {
  it('should validate all 6 interaction intents', () => {
    const testCases = [
      {
        intent: 'interaction:quiz-mc',
        question: 'Q?',
        options: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
        correctId: 'a',
      },
      { intent: 'interaction:quiz-tf', statement: 'S', correctAnswer: true },
      {
        intent: 'interaction:drag-drop',
        instruction: 'I',
        items: [
          { id: '1', content: 'A' },
          { id: '2', content: 'B' },
        ],
        correctOrder: ['1', '2'],
      },
      {
        intent: 'interaction:matching',
        pairs: [
          { id: '1', left: 'L', right: 'R' },
          { id: '2', left: 'L2', right: 'R2' },
        ],
      },
      { intent: 'interaction:fill-blank', text: 'T', answers: ['A'] },
      {
        intent: 'interaction:sorting',
        instruction: 'I',
        items: [
          { id: '1', label: 'A', value: 1 },
          { id: '2', label: 'B', value: 2 },
        ],
      },
    ];

    for (const data of testCases) {
      const result = interactionIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject non-interaction intents', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Hello',
    };

    const result = interactionIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
