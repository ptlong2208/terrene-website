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
      type: 'string',
      description:
        'Copy from Haravan admin → Products → [product] → "Handle" field (e.g. terrene-jasmine-tea). Must match exactly.',
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          if (!slug) return true;
          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2024-01-01' });
          const currentId = (document?._id as string).replace('drafts.', '');
          const language = document?.language as string | undefined;
          const count = await client.fetch<number>(
            `count(*[_type == "shopProduct" && slug == $slug && language == $language && _id != $id && !(_id in path("drafts.**"))])`,
            { slug, language, id: currentId }
          );
          if (count > 0) return `A "${language}" product with slug "${slug}" already exists`;

          try {
            const res = await fetch(`/api/haravan/check-handle?slug=${encodeURIComponent(slug)}`);
            const { exists } = (await res.json()) as { exists: boolean };
            if (!exists) {
              return `No Haravan product found with handle "${slug}" — check it matches exactly`;
            }
          } catch {
            // Haravan check unreachable — don't block publishing on a network blip
          }

          return true;
        }),
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
