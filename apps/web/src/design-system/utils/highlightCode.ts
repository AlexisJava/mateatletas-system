/**
 * Mateatletas Design System - Code Highlighting Utility
 * Utilidad para resaltar sintaxis de código según el lenguaje
 */

import type { ThemeConfig } from '../types';

interface Token {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'variable' | 'text';
  value: string;
}

const keywords: Record<string, string[]> = {
  lua: [
    'and',
    'break',
    'do',
    'else',
    'elseif',
    'end',
    'false',
    'for',
    'function',
    'if',
    'in',
    'local',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'until',
    'while',
    'print',
  ],
  python: [
    'and',
    'as',
    'assert',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'False',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'None',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'True',
    'try',
    'while',
    'with',
    'yield',
    'print',
  ],
  javascript: [
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'null',
    'return',
    'static',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'undefined',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'console',
    'log',
  ],
  typescript: [
    'abstract',
    'any',
    'as',
    'async',
    'await',
    'boolean',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'constructor',
    'continue',
    'debugger',
    'declare',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'get',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'module',
    'namespace',
    'never',
    'new',
    'null',
    'number',
    'object',
    'of',
    'private',
    'protected',
    'public',
    'readonly',
    'require',
    'return',
    'set',
    'static',
    'string',
    'super',
    'switch',
    'symbol',
    'this',
    'throw',
    'true',
    'try',
    'type',
    'typeof',
    'undefined',
    'unknown',
    'var',
    'void',
    'while',
    'with',
    'yield',
  ],
};

export function tokenize(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  const langKeywords = keywords[language] ?? keywords.javascript ?? [];

  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    // Comments
    if (remaining.startsWith('--') && language === 'lua') {
      const endIndex = remaining.indexOf('\n');
      const value = endIndex === -1 ? remaining : remaining.substring(0, endIndex);
      tokens.push({ type: 'comment', value });
      remaining = remaining.substring(value.length);
      matched = true;
    } else if (remaining.startsWith('//')) {
      const endIndex = remaining.indexOf('\n');
      const value = endIndex === -1 ? remaining : remaining.substring(0, endIndex);
      tokens.push({ type: 'comment', value });
      remaining = remaining.substring(value.length);
      matched = true;
    } else if (remaining.startsWith('#') && language === 'python') {
      const endIndex = remaining.indexOf('\n');
      const value = endIndex === -1 ? remaining : remaining.substring(0, endIndex);
      tokens.push({ type: 'comment', value });
      remaining = remaining.substring(value.length);
      matched = true;
    }

    // Strings
    if (!matched && (remaining.startsWith('"') || remaining.startsWith("'"))) {
      const quote = remaining[0];
      let endIndex = 1;
      while (endIndex < remaining.length) {
        if (remaining[endIndex] === quote && remaining[endIndex - 1] !== '\\') {
          break;
        }
        endIndex++;
      }
      const value = remaining.substring(0, endIndex + 1);
      tokens.push({ type: 'string', value });
      remaining = remaining.substring(value.length);
      matched = true;
    }

    // Numbers
    if (!matched) {
      const numberMatch = remaining.match(/^-?\d+(\.\d+)?/);
      if (numberMatch) {
        tokens.push({ type: 'number', value: numberMatch[0] });
        remaining = remaining.substring(numberMatch[0].length);
        matched = true;
      }
    }

    // Operators
    if (!matched) {
      const operatorMatch = remaining.match(/^[+\-*/%=<>!&|^~?:]+/);
      if (operatorMatch) {
        tokens.push({ type: 'operator', value: operatorMatch[0] });
        remaining = remaining.substring(operatorMatch[0].length);
        matched = true;
      }
    }

    // Identifiers (keywords, functions, variables)
    if (!matched) {
      const identMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (identMatch) {
        const value = identMatch[0];
        const nextChar = remaining[value.length];

        if (langKeywords.includes(value)) {
          tokens.push({ type: 'keyword', value });
        } else if (nextChar === '(') {
          tokens.push({ type: 'function', value });
        } else {
          tokens.push({ type: 'variable', value });
        }
        remaining = remaining.substring(value.length);
        matched = true;
      }
    }

    // Other characters (whitespace, punctuation)
    if (!matched) {
      tokens.push({ type: 'text', value: remaining[0] ?? '' });
      remaining = remaining.substring(1);
    }
  }

  return tokens;
}

export function getTokenColor(token: Token, theme: ThemeConfig): string {
  switch (token.type) {
    case 'keyword':
      return theme.syntax.keyword;
    case 'string':
      return theme.syntax.string;
    case 'number':
      return theme.syntax.number;
    case 'comment':
      return theme.syntax.comment;
    case 'function':
      return theme.syntax.function;
    case 'operator':
      return theme.syntax.operator;
    case 'variable':
      return theme.syntax.variable;
    default:
      return theme.colors.textMain;
  }
}

export function highlightCode(
  code: string,
  language: string,
  theme: ThemeConfig,
): Array<{ value: string; color: string }> {
  const tokens = tokenize(code, language);
  return tokens.map((token) => ({
    value: token.value,
    color: getTokenColor(token, theme),
  }));
}

export default highlightCode;
