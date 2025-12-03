import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': typescript,
      import: importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {}
      }
    },
    rules: {
      // Regras básicas
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // 🚫 REGRA PERSONALIZADA: Bloquear cores hardcoded
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^bg-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-/], Literal[value=/^text-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-/], Literal[value=/^border-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-/]',
          message: '❌ Uso de cores hardcoded proibido. Use variáveis do design system: bg-primary, text-success, border-destructive, etc.'
        },
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,6}$/]',
          message: '❌ Cores hexadecimais hardcoded proibidas. Use variáveis do design system.'
        },
        {
          selector: 'Literal[value=/^rgb\\(/]',
          message: '❌ Cores RGB hardcoded proibidas. Use variáveis do design system.'
        },
        {
          selector: 'Literal[value=/^hsl\\(/]',
          message: '❌ Cores HSL hardcoded proibidas (exceto variáveis CSS). Use variáveis do design system.'
        }
      ],

      // ⚠️ REGRA PERSONALIZADA: Incentivar uso de componentes padronizados
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '../../lib/color-utils',
              message: '⚠️ Funções getStatusColor() e getPrioridadeColor() são deprecated. Use StatusBadge e PriorityBadge components.'
            }
          ]
        }
      ],

      // ⚠️ REGRA PERSONALIZADA: Detectar uso de funções deprecated
      'no-restricted-properties': [
        'warn',
        {
          object: 'colorUtils',
          property: 'getStatusColor',
          message: '⚠️ getStatusColor() é deprecated. Use <StatusBadge> component.'
        },
        {
          object: 'colorUtils',
          property: 'getPrioridadeColor',
          message: '⚠️ getPrioridadeColor() é deprecated. Use <PriorityBadge> component.'
        }
      ]
    }
  },
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
      'tailwind.config.js',
      'eslint.config.js'
    ]
  }
];