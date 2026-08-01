import { defineField, defineType } from 'sanity';

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      validation: (Rule) =>
        Rule.custom(async (language, context) => {
          if (!language) return true;
          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2024-01-01' });
          const currentId = (document?._id as string).replace('drafts.', '');
          const count = await client.fetch<number>(
            `count(*[_type == "homepage" && language == $language && _id != $id && !(_id in path("drafts.**"))])`,
            { language, id: currentId }
          );
          return count > 0
            ? `A "${language}" Homepage already exists — delete the duplicate before publishing`
            : true;
        }),
    }),
    defineField({ name: 'hero_title', title: 'Hero Title', type: 'string' }),
    defineField({ name: 'hero_description', title: 'Hero Description', type: 'text', rows: 3 }),
    defineField({
      name: 'hero_background_video',
      title: 'Hero Background Video',
      type: 'file',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'hero_video_poster',
      title: 'Hero Video Poster',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'story_header', title: 'Story Header', type: 'sectionHeaderPlain' }),
    defineField({
      name: 'story_image',
      title: 'Story Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'story_side_label', title: 'Story Side Label', type: 'string' }),
    defineField({
      name: 'story_body',
      title: 'Story Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'story_cta',
      title: 'Story CTA',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({ name: 'shop_header', title: 'Shop Header', type: 'sectionHeaderPlain' }),
    defineField({ name: 'benefits_header', title: 'Benefits Header', type: 'sectionHeaderPlain' }),
    defineField({
      name: 'benefits_items',
      title: 'Benefits Items',
      type: 'array',
      of: [{ type: 'benefitItem' }],
    }),
    defineField({ name: 'process_header', title: 'Process Header', type: 'sectionHeaderPlain' }),
    defineField({
      name: 'process_steps',
      title: 'Process Steps',
      type: 'array',
      of: [{ type: 'processStep' }],
    }),
    defineField({
      name: 'process_cta',
      title: 'Process CTA',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({ name: 'quote_text', title: 'Quote Text', type: 'text', rows: 3 }),
    defineField({ name: 'quote_attribution', title: 'Quote Attribution', type: 'string' }),
    defineField({ name: 'partners_header', title: 'Partners Header', type: 'sectionHeaderPlain' }),
    defineField({
      name: 'partners_items',
      title: 'Partners Items',
      type: 'array',
      of: [{ type: 'partnerItem' }],
    }),
    defineField({
      name: 'testimonials_header',
      title: 'Testimonials Header',
      type: 'sectionHeaderPlain',
    }),
    defineField({
      name: 'testimonials_items',
      title: 'Testimonials Items',
      type: 'array',
      of: [{ type: 'testimonialItem' }],
    }),
    defineField({ name: 'journal_header', title: 'Journal Header', type: 'sectionHeaderPlain' }),
    defineField({
      name: 'journal_view_all',
      title: 'Journal View All',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }: { language?: string }) {
      return { title: `Homepage (${language ?? '?'})` };
    },
  },
});
