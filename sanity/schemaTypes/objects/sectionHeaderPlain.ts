import { defineField, defineType } from 'sanity';

export const sectionHeaderPlain = defineType({
  name: 'sectionHeaderPlain',
  title: 'Section Header',
  type: 'object',
  fields: [
    defineField({ name: 'kicker', title: 'Kicker', type: 'string' }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
  ],
});
