// @ts-check
/**
 * ESLint Config - API (NestJS)
 *
 * Hereda de la config maestra del monorepo + reglas específicas para NestJS
 */
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ============================================================================
  // IGNORES
  // ============================================================================
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      // Tests (tienen reglas más permisivas)
      '**/__tests__/**',
      '**/*.spec.ts',
      '**/*.e2e-spec.ts',
    ],
  },

  // ============================================================================
  // CONFIGURACIONES BASE
  // ============================================================================
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  // ============================================================================
  // CONFIGURACIÓN DE LENGUAJE
  // ============================================================================
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
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

      // ===== 🚫 PROHIBIDO: console.* (usar Logger de NestJS) =====
      'no-console': 'error',

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

      // ===== REGLAS TYPE-CHECKED (warn para código legacy, arreglar gradualmente) =====
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // ===== CÓDIGO LIMPIO =====
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // ===== PRETTIER =====
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
