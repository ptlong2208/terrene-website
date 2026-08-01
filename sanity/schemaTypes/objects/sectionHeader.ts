import { defineField, defineType } from 'sanity'

export const sectionHeader = defineType({
  name: 'sectionHeader',
  title: 'Section Header',
  type: 'object',
  fields: [
    defineField({ name: 'kicker', title: 'Kicker', type: 'localizedString' }),
    defineField({ name: 'title', title: 'Title', type: 'localizedString' }),
  ],
})
