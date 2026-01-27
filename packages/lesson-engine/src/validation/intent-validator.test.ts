/**
 * Intent Validator Tests
 *
 * Unit tests for the main validation functions.
 */

import { describe, it, expect } from 'vitest';
import {
  validateIntentJson,
  validateIntentData,
  isValidJson,
  getValidIntentIds,
} from './intent-validator';

// =============================================================================
// validateIntentJson
// =============================================================================

describe('validateIntentJson', () => {
  describe('JSON parsing', () => {
    it('should return error for invalid JSON syntax', () => {
      const result = validateIntentJson('{ invalid json }');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('invalid_json');
        expect(result.intentId).toBeNull();
      }
    });

    it('should return error for empty string', () => {
      const result = validateIntentJson('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('invalid_json');
      }
    });

    it('should handle JSON with trailing comma', () => {
      const result = validateIntentJson('{"intent": "presentation:hero",}');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('invalid_json');
      }
    });
  });

  describe('legacy content (no intent field)', () => {
    it('should return success with empty intentId for object without intent', () => {
      const result = validateIntentJson('{"title": "Hello", "type": "text"}');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('');
        expect(result.data).toEqual({ title: 'Hello', type: 'text' });
      }
    });

    it('should handle array content as legacy', () => {
      const result = validateIntentJson('[{"block": "text"}, {"block": "image"}]');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('');
      }
    });

    it('should handle primitive values as legacy', () => {
      const result = validateIntentJson('"just a string"');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('');
      }
    });
  });

  describe('unknown intent handling', () => {
    it('should return error for unknown intent ID', () => {
      const result = validateIntentJson('{"intent": "unknown:type", "title": "Test"}');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('unknown_intent');
        expect(result.errors[0].path).toBe('intent');
        expect(result.intentId).toBe('unknown:type');
      }
    });

    it('should return error for malformed intent ID', () => {
      const result = validateIntentJson('{"intent": "not-valid-format", "title": "Test"}');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('unknown_intent');
      }
    });
  });

  describe('valid presentation intents', () => {
    it('should validate presentation:hero with required fields', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        title: 'Welcome!',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:hero');
        expect(result.data.title).toBe('Welcome!');
      }
    });

    it('should validate presentation:hero with all fields', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        title: 'Welcome!',
        subtitle: 'Learn math',
        variant: 'ambient',
        ctaText: 'Start',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:hero');
      }
    });

    it('should validate presentation:define with required fields', () => {
      const json = JSON.stringify({
        intent: 'presentation:define',
        term: 'Algebra',
        definition: 'A branch of mathematics',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:define');
      }
    });

    it('should validate presentation:explain with steps', () => {
      const json = JSON.stringify({
        intent: 'presentation:explain',
        title: 'How to solve equations',
        steps: [
          { title: 'Step 1', content: 'Identify variables' },
          { title: 'Step 2', content: 'Isolate x' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:explain');
      }
    });

    it('should validate presentation:showcase with items', () => {
      const json = JSON.stringify({
        intent: 'presentation:showcase',
        title: 'Examples',
        items: [
          { id: '1', title: 'Example 1' },
          { id: '2', title: 'Example 2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:showcase');
      }
    });

    it('should validate presentation:highlight', () => {
      const json = JSON.stringify({
        intent: 'presentation:highlight',
        type: 'tip',
        title: 'Pro tip',
        content: 'Always check your work',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('presentation:highlight');
      }
    });
  });

  describe('valid interaction intents', () => {
    it('should validate interaction:quiz-mc', () => {
      const json = JSON.stringify({
        intent: 'interaction:quiz-mc',
        question: 'What is 2+2?',
        options: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4' },
          { id: 'c', text: '5' },
        ],
        correctId: 'b',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:quiz-mc');
      }
    });

    it('should validate interaction:quiz-tf', () => {
      const json = JSON.stringify({
        intent: 'interaction:quiz-tf',
        statement: 'The sky is blue',
        correctAnswer: true,
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:quiz-tf');
      }
    });

    it('should validate interaction:drag-drop', () => {
      const json = JSON.stringify({
        intent: 'interaction:drag-drop',
        instruction: 'Order the items correctly',
        items: [
          { id: '1', content: 'First' },
          { id: '2', content: 'Second' },
        ],
        correctOrder: ['1', '2'],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:drag-drop');
      }
    });

    it('should validate interaction:matching', () => {
      const json = JSON.stringify({
        intent: 'interaction:matching',
        title: 'Match the pairs',
        pairs: [
          { id: '1', left: 'A', right: '1' },
          { id: '2', left: 'B', right: '2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:matching');
      }
    });

    it('should validate interaction:fill-blank', () => {
      const json = JSON.stringify({
        intent: 'interaction:fill-blank',
        text: 'The answer is {{blank}}',
        answers: ['42'],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:fill-blank');
      }
    });

    it('should validate interaction:sorting', () => {
      const json = JSON.stringify({
        intent: 'interaction:sorting',
        instruction: 'Sort in order',
        items: [
          { id: '1', label: 'First', value: 1 },
          { id: '2', label: 'Second', value: 2 },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('interaction:sorting');
      }
    });
  });

  describe('valid narrative intents', () => {
    it('should validate narrative:story', () => {
      const json = JSON.stringify({
        intent: 'narrative:story',
        title: 'A Math Adventure',
        segments: [{ text: 'Once upon a time...' }],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('narrative:story');
      }
    });

    it('should validate narrative:dialogue', () => {
      const json = JSON.stringify({
        intent: 'narrative:dialogue',
        title: 'A Conversation',
        turns: [
          { speaker: 'bit', message: 'Hello!' },
          { speaker: 'user', message: 'Hi!' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('narrative:dialogue');
      }
    });

    it('should validate narrative:mascot-speech', () => {
      const json = JSON.stringify({
        intent: 'narrative:mascot-speech',
        message: 'Great job!',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('narrative:mascot-speech');
      }
    });
  });

  describe('valid gamification intents', () => {
    it('should validate gamification:reward', () => {
      const json = JSON.stringify({
        intent: 'gamification:reward',
        title: 'Rewards Earned!',
        rewards: [{ type: 'xp', value: 100, label: '+100 XP' }],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('gamification:reward');
      }
    });

    it('should validate gamification:achievement', () => {
      const json = JSON.stringify({
        intent: 'gamification:achievement',
        title: 'Math Master',
        description: 'Completed all lessons',
        icon: '🏆',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('gamification:achievement');
      }
    });

    it('should validate gamification:challenge', () => {
      const json = JSON.stringify({
        intent: 'gamification:challenge',
        title: 'Speed Round',
        timeLimit: 60,
        questions: [
          { id: 'q1', question: 'What is 2+2?', options: ['3', '4', '5'], correctIndex: 1 },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('gamification:challenge');
      }
    });

    it('should validate gamification:leaderboard', () => {
      const json = JSON.stringify({
        intent: 'gamification:leaderboard',
        title: 'Top Students',
        entries: [
          { id: '1', name: 'Alice', score: 1000 },
          { id: '2', name: 'Bob', score: 950 },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('gamification:leaderboard');
      }
    });
  });

  describe('valid layout intents', () => {
    it('should validate layout:split', () => {
      const json = JSON.stringify({
        intent: 'layout:split',
        left: { content: 'Left side content' },
        right: { content: 'Right side content' },
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('layout:split');
      }
    });

    it('should validate layout:bento', () => {
      const json = JSON.stringify({
        intent: 'layout:bento',
        cells: [
          { id: 'c1', content: 'Content 1' },
          { id: 'c2', content: 'Content 2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('layout:bento');
      }
    });

    it('should validate layout:tabs', () => {
      const json = JSON.stringify({
        intent: 'layout:tabs',
        tabs: [
          { id: 't1', label: 'Tab 1', content: 'Content 1' },
          { id: 't2', label: 'Tab 2', content: 'Content 2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('layout:tabs');
      }
    });

    it('should validate layout:carousel', () => {
      const json = JSON.stringify({
        intent: 'layout:carousel',
        slides: [
          { id: 's1', content: 'Slide 1' },
          { id: 's2', content: 'Slide 2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('layout:carousel');
      }
    });
  });

  describe('valid closure intents', () => {
    it('should validate closure:summary', () => {
      const json = JSON.stringify({
        intent: 'closure:summary',
        title: 'Lesson Summary',
        points: [
          { id: '1', text: 'Point 1' },
          { id: '2', text: 'Point 2' },
        ],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('closure:summary');
      }
    });

    it('should validate closure:next-steps', () => {
      const json = JSON.stringify({
        intent: 'closure:next-steps',
        title: "What's Next",
        steps: [{ id: 's1', title: 'Practice' }],
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('closure:next-steps');
      }
    });

    it('should validate closure:certificate', () => {
      const json = JSON.stringify({
        intent: 'closure:certificate',
        studentName: 'Student Name',
        courseTitle: 'Algebra 101',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.intentId).toBe('closure:certificate');
      }
    });
  });

  describe('schema validation errors', () => {
    it('should return error when required field is missing', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        // title is missing
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.intentId).toBe('presentation:hero');
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should return error for invalid enum value', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        title: 'Hello',
        variant: 'invalid-variant',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should return error for empty required string', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        title: '',
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should return error for invalid type', () => {
      const json = JSON.stringify({
        intent: 'presentation:hero',
        title: 123, // should be string
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(false);
    });

    it('should return error for array with too few items', () => {
      const json = JSON.stringify({
        intent: 'presentation:explain',
        title: 'Steps',
        steps: [], // min is 1
      });
      const result = validateIntentJson(json);

      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// validateIntentData
// =============================================================================

describe('validateIntentData', () => {
  it('should validate parsed object directly', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Hello',
    };
    const result = validateIntentData(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intentId).toBe('presentation:hero');
    }
  });

  it('should handle legacy content', () => {
    const data = { title: 'Hello', type: 'text' };
    const result = validateIntentData(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intentId).toBe('');
    }
  });

  it('should handle unknown intent', () => {
    const data = { intent: 'unknown:intent', title: 'Test' };
    const result = validateIntentData(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('unknown_intent');
    }
  });
});

// =============================================================================
// isValidJson
// =============================================================================

describe('isValidJson', () => {
  it('should return true for valid JSON', () => {
    expect(isValidJson('{"key": "value"}')).toBe(true);
    expect(isValidJson('[]')).toBe(true);
    expect(isValidJson('"string"')).toBe(true);
    expect(isValidJson('123')).toBe(true);
    expect(isValidJson('null')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isValidJson('')).toBe(false);
    expect(isValidJson('{')).toBe(false);
    expect(isValidJson('undefined')).toBe(false);
    expect(isValidJson('{key: value}')).toBe(false);
  });
});

// =============================================================================
// getValidIntentIds
// =============================================================================

describe('getValidIntentIds', () => {
  it('should return array of all valid intent IDs', () => {
    const ids = getValidIntentIds();

    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBe(29); // 29 intents total (added code-validator)
  });

  it('should include all category prefixes', () => {
    const ids = getValidIntentIds();

    expect(ids.some((id) => id.startsWith('presentation:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('interaction:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('narrative:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('gamification:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('layout:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('closure:'))).toBe(true);
  });

  it('should include specific known intents', () => {
    const ids = getValidIntentIds();

    expect(ids).toContain('presentation:hero');
    expect(ids).toContain('interaction:quiz-mc');
    expect(ids).toContain('narrative:story');
    expect(ids).toContain('gamification:reward');
    expect(ids).toContain('layout:split');
    expect(ids).toContain('closure:summary');
  });
});
