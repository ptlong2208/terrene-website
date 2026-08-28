import { defineField, defineType } from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    defineField({ name: 'vi', title: 'Tiếng Việt', type: 'string' }),
    defineField({ name: 'en', title: 'English', type: 'string' }),
  ],
});

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({ name: 'vi', title: 'Tiếng Việt', type: 'text' }),
    defineField({ name: 'en', title: 'English', type: 'text' }),
  ],
});
