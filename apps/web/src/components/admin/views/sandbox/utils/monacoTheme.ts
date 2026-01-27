import type { editor } from 'monaco-editor';

/**
 * Custom Monaco theme for Sandbox Editor
 * Matches the Dark Glassmorphism Gaming Premium style
 */
export const sandboxDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // JSON syntax highlighting
    { token: 'string.key.json', foreground: '06b6d4' }, // Cyan for keys
    { token: 'string.value.json', foreground: 'a5d6ff' }, // Light blue for string values
    { token: 'number.json', foreground: 'c4b5fd' }, // Violet for numbers
    { token: 'keyword.json', foreground: 'c4b5fd' }, // Violet for keywords (true, false, null)

    // General syntax
    { token: 'comment', foreground: '606078', fontStyle: 'italic' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: 'c4b5fd' },
    { token: 'keyword', foreground: '8b5cf6' },
    { token: 'delimiter', foreground: 'a0a0b8' },
    { token: 'delimiter.bracket', foreground: 'a0a0b8' },

    // JavaScript/TypeScript
    { token: 'identifier', foreground: 'ffffff' },
    { token: 'type.identifier', foreground: '06b6d4' },
    { token: 'function', foreground: '22c55e' },
  ],
  colors: {
    // Editor background
    'editor.background': '#0a0a10',
    'editor.foreground': '#ffffff',

    // Line numbers
    'editorLineNumber.foreground': '#606078',
    'editorLineNumber.activeForeground': '#8b5cf6',

    // Cursor
    'editorCursor.foreground': '#8b5cf6',

    // Selection
    'editor.selectionBackground': '#8b5cf630',
    'editor.inactiveSelectionBackground': '#8b5cf615',

    // Current line
    'editor.lineHighlightBackground': '#8b5cf608',
    'editor.lineHighlightBorder': '#8b5cf615',

    // Bracket matching
    'editorBracketMatch.background': '#06b6d420',
    'editorBracketMatch.border': '#06b6d450',

    // Scrollbar
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#2a2a3a80',
    'scrollbarSlider.hoverBackground': '#606078',
    'scrollbarSlider.activeBackground': '#8b5cf6',

    // Widget (autocomplete, hover)
    'editorWidget.background': '#14141c',
    'editorWidget.border': '#ffffff10',
    'editorHoverWidget.background': '#14141c',
    'editorHoverWidget.border': '#ffffff10',
    'editorSuggestWidget.background': '#14141c',
    'editorSuggestWidget.border': '#ffffff10',
    'editorSuggestWidget.selectedBackground': '#8b5cf620',

    // Gutter
    'editorGutter.background': '#0a0a10',

    // Minimap
    'minimap.background': '#0a0a0f80',
    'minimapSlider.background': '#8b5cf615',
    'minimapSlider.hoverBackground': '#8b5cf630',
    'minimapSlider.activeBackground': '#8b5cf640',

    // Error/Warning
    'editorError.foreground': '#ef4444',
    'editorWarning.foreground': '#f59e0b',
    'editorInfo.foreground': '#06b6d4',
  },
};

export const THEME_NAME = 'sandbox-dark';
