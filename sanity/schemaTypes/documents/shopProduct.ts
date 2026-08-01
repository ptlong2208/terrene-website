import { PackageIcon } from '@sanity/icons/Package';
import { defineField, defineType } from 'sanity';

export const shopProduct = defineType({
  name: 'shopProduct',
  title: 'Shop Product',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'shopCategory' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'shopTag' }] }],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'taste_notes',
      title: 'Taste Notes',
      type: 'array',
      of: [{ type: 'tasteNote' }],
    }),
    defineField({
      name: 'product_info',
      title: 'Product Info',
      type: 'array',
      of: [{ type: 'productInfoItem' }],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'story', title: 'Story', type: 'productStory' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'language', media: 'image' },
  },
});
