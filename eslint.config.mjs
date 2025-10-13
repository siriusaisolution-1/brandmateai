// eslint.config.mjs
// Flat ESLint (Next 15 + TS-ESLint v8) – functional-first, quality-safe

import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import globalsPackage from 'globals';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

// TS preporuke bez vezivanja na projects (stabilnije u CI)
const typescriptConfigs = tseslint.configs.recommended.map((config, index) => {
  const files = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.d.ts'];
  return index === 0 ? { ...config, files } : (config.files ? config : { ...config, files });
});

const combinedRules = {
  ...reactPlugin.configs.flat.recommended.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  ...jsxA11yPlugin.configs.recommended.rules,
  ...nextPlugin.configs.recommended.rules,
};

const { browser: browserGlobals, node: nodeGlobals } = globalsPackage;

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Ignorisani build/3rd-party direktorijumi
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'functions/.output/**'],
  },

  // JS recommended
  js.configs.recommended,

  // TS recommended (flat)
  ...typescriptConfigs,

  // Next.js + React + A11y + Hooks + import pravila (bez compat/patch)
  {
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...browserGlobals, ...nodeGlobals },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        typescript: { alwaysTryTypes: true, project: ['tsconfig.json', 'functions/tsconfig.json'] },
      },
    },
    rules: {
      ...combinedRules,

      // Next baseline prilagodbe (u skladu sa eslint-config-next)
      'import/no-anonymous-default-export': 'off',
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-target-blank': 'off',

      // A11y – nežni warn signal umesto error
      'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/html-has-lang': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/media-has-caption': 'warn',

      // Funkcionalno > strogo tipiziranje (rana faza)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // Bug-prevent i ergonomija
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'warn',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'import/no-unresolved': 'off', // rešava TS + Next aliasi
    },
  },

  // D.ts i lokalni tipovi – ne blokirati
  {
    files: ['**/*.d.ts', 'src/types/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // UI i AI delovi – malo mekši "any"
  {
    files: ['src/ai/**', 'src/components/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default config;