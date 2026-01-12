// @ts-check
/**
 * ESLint Config - Web (Next.js)
 *
 * Hereda de la config maestra del monorepo + reglas específicas para Next.js/React
 */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import sonarjs from 'eslint-plugin-sonarjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ============================================================================
  // NEXT.JS CONFIG BASE
  // ============================================================================
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // ============================================================================
  // SONARJS
  // ============================================================================
  sonarjs.configs.recommended,

  // ============================================================================
  // IGNORES
  // ============================================================================
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'tests/**',
      'types/**',
      '**/*.d.ts',
    ],
  },

  // ============================================================================
  // REGLAS ESTRICTAS
  // ============================================================================
  {
    rules: {
      // ===== 🚫 PROHIBIDO: any =====
      '@typescript-eslint/no-explicit-any': 'error',

      // ===== 🚫 PROHIBIDO: @ts-ignore, @ts-nocheck =====
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],

      // ===== 🚫 PROHIBIDO: console.* en producción =====
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ===== 🚫 PROHIBIDO: variables sin usar =====
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],

      // ===== CÓDIGO LIMPIO =====
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // ===== HOOKS DE REACT =====
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
