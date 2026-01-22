// @ts-check
/**
 * ESLint Config - API (NestJS)
 *
 * Hereda de la config maestra del monorepo + reglas específicas para NestJS
 */
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
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
      // Archivos de test fuera del tsconfig
      'test/**',
      'prisma/seeds/**',
    ],
  },

  // ============================================================================
  // CONFIGURACIONES BASE
  // ============================================================================
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // sonarjs.configs.recommended, // Deshabilitado - demasiado ruidoso
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

      // ===== 🐫 NAMING CONVENTIONS: camelCase obligatorio =====
      // Previene crear propiedades en snake_case (ej: fecha_inicio)
      // La base de datos usa snake_case pero el código debe usar camelCase
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables y funciones: camelCase o UPPER_CASE para constantes
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Propiedades de clase/interface: camelCase
        {
          selector: 'classProperty',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          // Excepciones para:
          // - Constantes estáticas readonly en UPPER_CASE
          // - APIs externas (MercadoPago, MFA) que requieren snake_case
          filter: {
            regex:
              '^([A-Z][A-Z0-9_]*|mfa_token|totp_code|backup_code|live_mode|date_created|api_version|card_token_id|payer_email|external_reference)$',
            match: false,
          },
        },
        // Parámetros: camelCase
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Constantes globales: camelCase o UPPER_CASE
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        // Tipos e interfaces: PascalCase (permitir underscore para tipos internos)
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Enum members: UPPER_CASE o PascalCase (Prisma genera ambos formatos)
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        // Object literal properties: NO se valida formato
        // Razón: El CamelCaseResponseInterceptor transforma todo a camelCase
        // antes de enviar al frontend. Validar esto sería redundante y
        // generaría falsos positivos con Prisma queries y APIs externas.
      ],

      // ===== SONARJS: Desactivar regla duplicada =====
      // Usamos @typescript-eslint/no-unused-vars que tiene ignoreRestSiblings
      complexity: ['warn', 15],

      // ===== PRETTIER =====
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
