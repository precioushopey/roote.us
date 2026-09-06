import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', '.worktrees', '.superpowers'] },

  // App + test source
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Vite HMR: a module should export only components (roote allows constant sibling exports
      // like the i18n-key arrays next to a component).
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // The repo uses `_`-prefixed args for deliberately-unused params (stub signatures).
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // `as never` / `as MessageKey` dynamic-key casts are an established pattern here.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Vitest test files: relax a couple of rules that don't matter in tests
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // Context modules: the repo deliberately colocates a Provider component with its consumer
  // hook(s) in one file. That trips react-refresh's "components-only" check, but it's the
  // intended pattern here.
  {
    files: ['src/store/*.tsx', 'src/i18n/LocaleProvider.tsx', 'src/app/components/roote/Toast.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Root config files (Node context, plain JS/TS)
  {
    files: ['*.{js,ts}', 'vite.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
