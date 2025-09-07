// eslint.config.mjs
// Flat ESLint (Next 15 + TS-ESLint v8) – functional-first, quality-safe
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import * as tseslint from 'typescript-eslint'
import next from 'eslint-config-next'

const compat = new FlatCompat()

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignoriši build/third-party foldere
  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'functions/.output/**'] },

  // JS recommended
  js.configs.recommended,

  // TS recommended (bez type-aware + bez project bindinga -> stabilnije i brže)
  ...tseslint.configs.recommended,

  // Next config (kompat sloj jer je paket još uvek eslintrc stil)
  ...compat.config(next),

  // Global rules
  {
    rules: {
      // Funkcionalno > strogo tipiziranje u ranoj fazi:
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',

      // Bug-prevent rules ostaju stroge:
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'error',
    }
  },

  // D.ts i shimovi – ovde dozvoljavamo "any" i labavost, da ne blokiraju app
  {
    files: ['**/*.d.ts', 'src/types/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    }
  },

  // UI generatori i flows (često rade s eksternim SDK-ovima) – labaviji any
  {
    files: ['src/ai/**', 'src/components/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  }
]