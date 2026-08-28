import { defineField, defineType } from 'sanity';

export const productInfoItem = defineType({
  name: 'productInfoItem',
  title: 'Product Info Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title' },
  },
});
