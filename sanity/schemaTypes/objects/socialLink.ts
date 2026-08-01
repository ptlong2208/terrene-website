import { defineField, defineType } from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: ['instagram', 'facebook', 'tiktok', 'youtube', 'twitter', 'pinterest'],
      },
    }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
})
