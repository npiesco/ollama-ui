import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
      'import': importPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-duplicate-imports': 'error',
      'import/no-duplicates': ['error', {
        'considerQueryString': true,
        'prefer-inline': true
      }]
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/setupTests.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  }
]; 