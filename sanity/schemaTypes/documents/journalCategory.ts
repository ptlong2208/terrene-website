import { defineField, defineType } from 'sanity';

export const journalCategory = defineType({
  name: 'journalCategory',
  title: 'Journal Category',
  type: 'document',
  fields: [defineField({ name: 'name', title: 'Name', type: 'localizedString' })],
  preview: {
    select: { title: 'name.vi', subtitle: 'name.en' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title: title ?? subtitle ?? 'Untitled' };
    },
  },
});
