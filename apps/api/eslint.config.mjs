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
        // Object literal properties: camelCase o UPPER_CASE (para constantes/enums)
        // Excepciones para Prisma operators, compound keys, error codes, y APIs externas
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          filter: {
            // Excepciones:
            // - _count, _sum, _avg, _min, _max (Prisma aggregates)
            // - MercadoPago/external APIs: card_token_id, payer_email, unit_price, etc.
            // - Prisma operators: OR, AND, NOT
            // - Prisma error codes: P2000, P2001, etc.
            // - Prisma compound unique keys: *Id_*, *_* patterns
            // - Numeric keys: 1, 2, 3... for mappings
            // Regex que cubre:
            // - Prisma: _count, _sum, _avg, _min, _max, OR, AND, NOT, P2xxx
            // - Prisma compound keys: *Id_*, *_*Id, *Id_*Id_*
            // - Numeric keys for mappings
            // - MercadoPago API: todas las propiedades snake_case de su SDK
            regex:
              '^(_count|_sum|_avg|_min|_max|OR|AND|NOT|P[0-9]+|[0-9]+|[a-zA-Z]+Id_[a-zA-Z_]+|[a-zA-Z]+_[a-zA-Z]+Id|card_token_id|payer_email|payer_id|external_reference|live_mode|date_created|date_approved|api_version|mfa_token|totp_code|backup_code|unit_price|currency_id|back_urls|back_url|auto_return|notification_url|require_protocol|status_detail|transaction_amount|additional_info|category_id|statement_descriptor|error_type|in_process|charged_back|init_point|payment_status|auto_recurring|frequency_type|next_payment_date|last_modified|jwt_secret|webhook_secret)$',
            match: false,
          },
        },
      ],

      // ===== SONARJS: Desactivar regla duplicada =====
      // Usamos @typescript-eslint/no-unused-vars que tiene ignoreRestSiblings
      complexity: ['warn', 15],

      // ===== PRETTIER =====
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
