'use client';
import { documentInternationalization } from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schema } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

const supportedLanguages = [
  { id: 'vi', title: 'Tiếng Việt' },
  { id: 'en', title: 'English' },
];

const secondaryLocales = supportedLanguages.filter((l) => l.id !== 'vi').map((l) => l.id);
const i18nTypes = ['comingSoon', 'homepage', 'journalPost', 'shopProduct'];

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  document: {
    newDocumentOptions: (prev) =>
      prev.filter(
        (tpl) =>
          tpl.templateId !== 'translation.metadata' &&
          !i18nTypes.includes(tpl.templateId) &&
          !secondaryLocales.some((locale) => tpl.templateId.endsWith(`-${locale}`))
      ),
  },
  plugins: [
    structureTool({ structure }),
    documentInternationalization({
      supportedLanguages,
      schemaTypes: ['comingSoon', 'homepage', 'journalPost', 'shopProduct'],
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
