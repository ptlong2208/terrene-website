import { FolderIcon } from '@sanity/icons/Folder';
import { defineField, defineType } from 'sanity';

export const shopCategory = defineType({
  name: 'shopCategory',
  title: 'Shop Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name.vi', subtitle: 'name.en' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title: title ?? subtitle ?? 'Untitled' };
    },
  },
});
