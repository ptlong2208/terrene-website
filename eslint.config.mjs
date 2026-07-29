import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    rules: {
      // Math.random() is safe for UI animations and physics — not a cryptographic context
      'sonarjs/pseudo-random': 'off',
      // Tailwind className composition with clsx/cn commonly uses nested template literals
      'sonarjs/no-nested-template-literals': 'off',
      // Physics simulations and GSAP callbacks naturally exceed 4 nesting levels
      'sonarjs/no-nested-functions': 'off',
      // Flags any obj[variable] access — too broad for React (array index access, backend UUIDs)
      // Real injection risk (obj[req.body.key]) must be reviewed manually in API routes
      'security/detect-object-injection': 'off',
    },
  },
  prettierPlugin,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
