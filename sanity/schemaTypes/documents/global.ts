import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

export const global = defineType({
  name: 'global',
  title: 'Global Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ name: 'site_name', title: 'Site Name', type: 'string' }),
    defineField({ name: 'site_description', title: 'Site Description', type: 'localizedText' }),
    defineField({ name: 'loader_quote', title: 'Loader Quote', type: 'string' }),
    defineField({
      name: 'ambient_audio',
      title: 'Ambient Audio',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({ name: 'music_consent_text', title: 'Music Consent Text', type: 'localizedText' }),
    defineField({ name: 'music_consent_accept', title: 'Music Consent Accept', type: 'localizedString' }),
    defineField({ name: 'music_consent_decline', title: 'Music Consent Decline', type: 'localizedString' }),
    defineField({
      name: 'nav_links',
      title: 'Nav Links',
      type: 'array',
      of: [{ type: 'navLink' }],
    }),
    defineField({ name: 'email', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'nav_shop_link', title: 'Nav Shop Link', type: 'navLink' }),
    defineField({ name: 'nav_cart_label', title: 'Nav Cart Label', type: 'localizedString' }),
    defineField({
      name: 'nav_overlay_image',
      title: 'Nav Overlay Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'social_links',
      title: 'Social Links',
      type: 'array',
      of: [{ type: 'socialLink' }],
    }),
    defineField({ name: 'footer_newsletter_label', title: 'Footer Newsletter Label', type: 'localizedString' }),
    defineField({ name: 'footer_newsletter_placeholder', title: 'Footer Newsletter Placeholder', type: 'localizedString' }),
    defineField({
      name: 'footer_legal_links',
      title: 'Footer Legal Links',
      type: 'array',
      of: [{ type: 'navLink' }],
    }),
    defineField({ name: 'cta_header', title: 'CTA Header', type: 'sectionHeader' }),
    defineField({ name: 'cta_link', title: 'CTA Link', type: 'navLink' }),
  ],
  preview: {
    select: { title: 'site_name' },
    prepare({ title }: { title?: string }) {
      return { title: title ?? 'Global Settings' }
    },
  },
})
