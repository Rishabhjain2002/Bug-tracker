import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ESLint core does not see variables used only in JSX; components start with a capital letter
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // The context files export their provider plus the matching hook
      'react-refresh/only-export-components': ['error', { allowExportNames: ['useAuth', 'useToast'] }],
    },
  },
]);
