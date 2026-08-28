import { defineField, defineType } from 'sanity';

export const textItem = defineType({
  name: 'textItem',
  title: 'Text Item',
  type: 'object',
  fields: [defineField({ name: 'text', title: 'Text', type: 'string' })],
  preview: {
    select: { title: 'text' },
  },
});
