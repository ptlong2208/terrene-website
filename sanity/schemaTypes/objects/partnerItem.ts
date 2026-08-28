import { defineField, defineType } from 'sanity';

export const partnerItem = defineType({
  name: 'partnerItem',
  title: 'Partner Item',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'url', title: 'URL', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'url' },
  },
});
