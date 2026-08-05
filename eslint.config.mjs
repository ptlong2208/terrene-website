import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...nextVitals,
  // recommendedTypeChecked = recommended + type-aware rules (replaces nextTs), scoped to TS only
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    // scope type-checking to TS files only — .mjs config files aren't in tsconfig
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // nextTs overrides restored
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      // async JSX event handlers return void, not Promise — suppress false positives
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      // allow numbers in template literals: `${count} items`
      '@typescript-eslint/restrict-template-expressions': ['warn', { allowNumber: true }],
      // external API responses (Haravan, PayOS) are untyped — warn until typed
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
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
      // intentional union returns (PendingOrderItem[] | Response) in error-handling helpers
      'sonarjs/function-return-type': 'off',
      // React component props don't need Readonly<> — enforced by React's own model
      'sonarjs/prefer-read-only-props': 'off',
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
