/**
 * Presentation Schema Tests
 *
 * Unit tests for presentation intent schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  heroIntentSchema,
  defineIntentSchema,
  explainIntentSchema,
  showcaseIntentSchema,
  highlightIntentSchema,
  presentationIntentSchema,
} from './presentation.schema';

// =============================================================================
// HERO INTENT
// =============================================================================

describe('heroIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Welcome to the lesson',
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Welcome',
    };

    const result = heroIntentSchema.parse(data);
    expect(result.variant).toBe('gradient');
    expect(result.ctaText).toBe('¡Empezar!');
  });

  it('should accept all valid variants', () => {
    const variants = ['gradient', 'ambient', 'minimal'] as const;

    for (const variant of variants) {
      const data = {
        intent: 'presentation:hero',
        title: 'Test',
        variant,
      };
      const result = heroIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid variant', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Test',
      variant: 'invalid',
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const data = {
      intent: 'presentation:hero',
      title: '',
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject wrong intent literal', () => {
    const data = {
      intent: 'presentation:define',
      title: 'Test',
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional subtitle', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Welcome',
      subtitle: 'Learn something new',
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subtitle).toBe('Learn something new');
    }
  });

  it('should accept icon as unknown type', () => {
    const data = {
      intent: 'presentation:hero',
      title: 'Welcome',
      icon: { type: 'lucide', name: 'star' },
    };

    const result = heroIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// DEFINE INTENT
// =============================================================================

describe('defineIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'presentation:define',
      term: 'Polynomial',
      definition: 'An expression with multiple terms',
    };

    const result = defineIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply defaults', () => {
    const data = {
      intent: 'presentation:define',
      term: 'Test',
      definition: 'Test definition',
    };

    const result = defineIntentSchema.parse(data);
    expect(result.category).toBe('Definición');
    expect(result.enableAudio).toBe(false);
  });

  it('should reject empty term', () => {
    const data = {
      intent: 'presentation:define',
      term: '',
      definition: 'Valid definition',
    };

    const result = defineIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty definition', () => {
    const data = {
      intent: 'presentation:define',
      term: 'Valid term',
      definition: '',
    };

    const result = defineIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const data = {
      intent: 'presentation:define',
      term: 'Variable',
      definition: 'A symbol representing a value',
      pronunciation: 'VAR-ee-uh-bul',
      example: 'x = 5',
      category: 'Algebra',
      enableAudio: true,
    };

    const result = defineIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pronunciation).toBe('VAR-ee-uh-bul');
      expect(result.data.example).toBe('x = 5');
      expect(result.data.enableAudio).toBe(true);
    }
  });
});

// =============================================================================
// EXPLAIN INTENT
// =============================================================================

describe('explainIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'How to solve equations',
      steps: [{ title: 'Step 1', content: 'First, do this' }],
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty steps array', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'How to solve',
      steps: [],
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 8 steps', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'Many steps',
      steps: Array(9)
        .fill(null)
        .map((_, i) => ({ title: `Step ${i + 1}`, content: 'Content' })),
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept up to 8 steps', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'Eight steps',
      steps: Array(8)
        .fill(null)
        .map((_, i) => ({ title: `Step ${i + 1}`, content: 'Content' })),
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject steps with empty content', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'Steps',
      steps: [{ title: 'Step 1', content: '' }],
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional subtitle and category', () => {
    const data = {
      intent: 'presentation:explain',
      title: 'Process',
      subtitle: 'A detailed explanation',
      category: 'Tutorial',
      steps: [{ title: 'Step 1', content: 'Content' }],
    };

    const result = explainIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// SHOWCASE INTENT
// =============================================================================

describe('showcaseIntentSchema', () => {
  it('should validate with minimal required fields', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Examples',
      items: [{ id: '1', title: 'Example 1' }],
    };

    const result = showcaseIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should apply default variant', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Examples',
      items: [{ id: '1', title: 'Example 1' }],
    };

    const result = showcaseIntentSchema.parse(data);
    expect(result.variant).toBe('carousel');
  });

  it('should accept all valid variants', () => {
    const variants = ['grid', 'carousel', 'list'] as const;

    for (const variant of variants) {
      const data = {
        intent: 'presentation:showcase',
        title: 'Examples',
        variant,
        items: [{ id: '1', title: 'Item' }],
      };
      const result = showcaseIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject empty items array', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Examples',
      items: [],
    };

    const result = showcaseIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject more than 12 items', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Many items',
      items: Array(13)
        .fill(null)
        .map((_, i) => ({ id: String(i), title: `Item ${i}` })),
    };

    const result = showcaseIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept up to 12 items', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Twelve items',
      items: Array(12)
        .fill(null)
        .map((_, i) => ({ id: String(i), title: `Item ${i}` })),
    };

    const result = showcaseIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept items with optional fields', () => {
    const data = {
      intent: 'presentation:showcase',
      title: 'Items',
      items: [
        {
          id: '1',
          title: 'Item 1',
          description: 'Description here',
          image: '/images/item1.png',
        },
      ],
    };

    const result = showcaseIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// HIGHLIGHT INTENT
// =============================================================================

describe('highlightIntentSchema', () => {
  it('should validate with required fields', () => {
    const data = {
      intent: 'presentation:highlight',
      type: 'tip',
      title: 'Pro Tip',
      content: 'Always check your work',
    };

    const result = highlightIntentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept all valid types', () => {
    const types = ['tip', 'warning', 'formula', 'example', 'important'] as const;

    for (const type of types) {
      const data = {
        intent: 'presentation:highlight',
        type,
        title: 'Title',
        content: 'Content',
      };
      const result = highlightIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid type', () => {
    const data = {
      intent: 'presentation:highlight',
      type: 'invalid',
      title: 'Title',
      content: 'Content',
    };

    const result = highlightIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const data = {
      intent: 'presentation:highlight',
      type: 'tip',
      title: 'Title',
      content: '',
    };

    const result = highlightIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// PRESENTATION UNION
// =============================================================================

describe('presentationIntentSchema (union)', () => {
  it('should discriminate based on intent field', () => {
    const heroData = {
      intent: 'presentation:hero',
      title: 'Welcome',
    };

    const defineData = {
      intent: 'presentation:define',
      term: 'Term',
      definition: 'Definition',
    };

    expect(presentationIntentSchema.safeParse(heroData).success).toBe(true);
    expect(presentationIntentSchema.safeParse(defineData).success).toBe(true);
  });

  it('should reject non-presentation intents', () => {
    const data = {
      intent: 'interaction:quiz-mc',
      question: 'Test?',
    };

    const result = presentationIntentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate all 5 presentation intents', () => {
    const testCases = [
      { intent: 'presentation:hero', title: 'Test' },
      { intent: 'presentation:define', term: 'Term', definition: 'Def' },
      { intent: 'presentation:explain', title: 'Test', steps: [{ title: 'S', content: 'C' }] },
      { intent: 'presentation:showcase', title: 'Test', items: [{ id: '1', title: 'I' }] },
      { intent: 'presentation:highlight', type: 'tip', title: 'T', content: 'C' },
    ];

    for (const data of testCases) {
      const result = presentationIntentSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });
});
