import { RocketIcon } from '@sanity/icons/Rocket';
import { defineField, defineType } from 'sanity';

export const comingSoon = defineType({
  name: 'comingSoon',
  title: 'Coming Soon',
  type: 'document',
  icon: RocketIcon,
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
            `count(*[_type == "comingSoon" && language == $language && _id != $id && !(_id in path("drafts.**"))])`,
            { language, id: currentId }
          );
          return count > 0
            ? `A "${language}" Coming Soon already exists — delete the duplicate before publishing`
            : true;
        }),
    }),
    defineField({ name: 'seo_title', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seo_description', title: 'SEO Description', type: 'text', rows: 3 }),
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
    defineField({
      name: 'words',
      title: 'Animated Words',
      type: 'array',
      of: [{ type: 'textItem' }],
    }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'form_heading', title: 'Form Heading', type: 'string' }),
    defineField({ name: 'submit_label', title: 'Submit Label', type: 'string' }),
    defineField({ name: 'email_placeholder', title: 'Email Placeholder', type: 'string' }),
    defineField({ name: 'success_message', title: 'Success Message', type: 'string' }),
  ],
  preview: {
    select: { title: 'seo_title', language: 'language' },
    prepare({ title, language }: { title?: string; language?: string }) {
      return { title: `Coming Soon (${language ?? '?'})`, subtitle: title };
    },
  },
});
