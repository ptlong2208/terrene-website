import { defineField, defineType } from 'sanity';

export const tasteNote = defineType({
  name: 'tasteNote',
  title: 'Taste Note',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).max(5),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'value' },
  },
});
