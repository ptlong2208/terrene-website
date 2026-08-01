import { defineField, defineType } from 'sanity'

export const navLink = defineType({
  name: 'navLink',
  title: 'Nav Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'localizedString' }),
    defineField({ name: 'href', title: 'URL', type: 'string' }),
  ],
  preview: {
    select: { title: 'label.vi', subtitle: 'href' },
  },
})
