import { defineField, defineType } from 'sanity';

export const benefitItem = defineType({
  name: 'benefitItem',
  title: 'Benefit Item',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title' },
  },
});
