import { TagsIcon } from '@sanity/icons/Tags';
import { defineField, defineType } from 'sanity';

export const shopTag = defineType({
  name: 'shopTag',
  title: 'Shop Tag',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'label.vi', subtitle: 'label.en' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title: title ?? subtitle ?? 'Untitled' };
    },
  },
});
