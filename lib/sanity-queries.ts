import { sanityFetch } from '@/lib/sanity-client';
import type {
  ComingSoonData,
  GlobalData,
  HomepageData,
  JournalPost,
  ShopCategory,
  ShopProduct,
} from '@/lib/types';

type PortableTextBlock = {
  _type: string;
  children?: { text?: string }[];
};

function blocksToPlainText(blocks: PortableTextBlock[] | null | undefined): string | null {
  if (!blocks?.length) return null;
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join(''))
    .join('\n\n');
}

const shopProductProjection = `{
  "id": _id,
  "documentId": _id,
  "createdAt": _createdAt,
  title,
  slug,
  "category": category->{"id": _id, "documentId": _id, "name": coalesce(name[$locale], name.vi)},
  description,
  "tags": coalesce(tags[]->{"id": _id, "documentId": _id, "label": coalesce(label[$locale], label.vi)}, []),
  "image": image{"url": asset->url, "alternativeText": alt},
  "gallery": coalesce(gallery[]{"url": asset->url, "alternativeText": alt}, []),
  "taste_notes": coalesce(taste_notes[]{"id": _key, label, value}, []),
  "product_info": coalesce(product_info[]{"id": _key, title, body}, []),
  "story": story{
    button_label,
    title,
    content,
    "images": coalesce(images[]{"url": asset->url, "alternativeText": alt}, [])
  }
}`;

const journalPostProjection = `{
  "id": _id,
  "documentId": _id,
  title,
  "slug": slug.current,
  "cover_image": cover_image{"url": asset->url, "alternativeText": alt},
  published_date,
  excerpt,
  "category": category->{"id": _id, "documentId": _id, "name": coalesce(name[$locale], name.vi)}
}`;

export async function getGlobal(locale: string): Promise<GlobalData> {
  return sanityFetch<GlobalData>(
    `*[_type == "global"][0]{
      "id": _id,
      "documentId": _id,
      site_name,
      "site_description": coalesce(site_description[$locale], site_description.vi),
      loader_quote,
      "ambient_audio": ambient_audio{"url": asset->url},
      "music_consent_text": coalesce(music_consent_text[$locale], music_consent_text.vi),
      "music_consent_accept": coalesce(music_consent_accept[$locale], music_consent_accept.vi),
      "music_consent_decline": coalesce(music_consent_decline[$locale], music_consent_decline.vi),
      "nav_links": coalesce(nav_links[]{"id": _key, "label": coalesce(label[$locale], label.vi), href}, []),
      email,
      "nav_shop_link": nav_shop_link{"label": coalesce(label[$locale], label.vi), href},
      "nav_cart_label": coalesce(nav_cart_label[$locale], nav_cart_label.vi),
      "nav_overlay_image": nav_overlay_image{"url": asset->url, "alternativeText": alt},
      "social_links": coalesce(social_links[]{"id": _key, platform, url, label}, []),
      "footer_newsletter_label": coalesce(footer_newsletter_label[$locale], footer_newsletter_label.vi),
      "footer_newsletter_placeholder": coalesce(footer_newsletter_placeholder[$locale], footer_newsletter_placeholder.vi),
      "footer_legal_links": coalesce(footer_legal_links[]{"id": _key, "label": coalesce(label[$locale], label.vi), href}, []),
      "cta_header": {
        "kicker": coalesce(cta_header.kicker[$locale], cta_header.kicker.vi),
        "title": coalesce(cta_header.title[$locale], cta_header.title.vi)
      },
      "cta_link": cta_link{"label": coalesce(label[$locale], label.vi), href}
    }`,
    { locale }
  );
}

export async function getGlobalMinimal(
  locale: string
): Promise<Pick<GlobalData, 'site_name' | 'loader_quote'>> {
  return sanityFetch(`*[_type == "global"][0]{ site_name, loader_quote }`, { locale });
}

type RawHomepageData = Omit<HomepageData, 'story_body'> & {
  story_body: PortableTextBlock[] | null;
};

export async function getHomepage(locale: string): Promise<HomepageData | null> {
  const data = await sanityFetch<RawHomepageData | null>(
    `*[_type == "homepage" && language == $locale][0]{
      "id": _id,
      "documentId": _id,
      hero_title,
      hero_description,
      "hero_background_video": hero_background_video{"url": asset->url},
      "hero_video_poster": hero_video_poster{"url": asset->url, "alternativeText": alt},
      story_header,
      "story_image": story_image{"url": asset->url, "alternativeText": alt},
      story_side_label,
      story_body,
      story_cta,
      shop_header,
      "shop_products": coalesce(shop_products[]->${shopProductProjection}, []),
      benefits_header,
      "benefits_items": coalesce(benefits_items[]{"id": _key, title, description}, []),
      process_header,
      "process_steps": coalesce(process_steps[]{"id": _key, name, description, "image": image{"url": asset->url, "alternativeText": alt}}, []),
      process_cta,
      quote_text,
      quote_attribution,
      partners_header,
      "partners_items": coalesce(partners_items[]{"id": _key, name, description, url}, []),
      testimonials_header,
      "testimonials_items": coalesce(testimonials_items[]{"id": _key, quote, name, role, "image": image{"url": asset->url, "alternativeText": alt}}, []),
      journal_header,
      journal_view_all,
      "journal_posts": coalesce(journal_posts[]->${journalPostProjection}, [])
    }`,
    { locale }
  );

  if (!data) return null;

  return { ...data, story_body: blocksToPlainText(data.story_body) };
}

export async function getComingSoon(locale: string): Promise<ComingSoonData | null> {
  return sanityFetch<ComingSoonData | null>(
    `*[_type == "comingSoon" && language == $locale][0]{
      "id": _id,
      "documentId": _id,
      seo_title,
      seo_description,
      quote,
      "words": coalesce(words[]{"id": _key, text}, []),
      label,
      form_heading,
      submit_label,
      email_placeholder,
      success_message
    }`,
    { locale }
  );
}

export async function getShopProducts(locale: string): Promise<ShopProduct[]> {
  return sanityFetch<ShopProduct[]>(
    `*[_type == "shopProduct" && language == $locale]${shopProductProjection}`,
    { locale }
  );
}

export async function getShopProductBySlug(
  slug: string,
  locale: string
): Promise<ShopProduct | null> {
  return sanityFetch<ShopProduct | null>(
    `*[_type == "shopProduct" && language == $locale && slug == $slug][0]${shopProductProjection}`,
    { slug, locale }
  );
}

export async function getShopCategories(locale: string): Promise<ShopCategory[]> {
  return sanityFetch<ShopCategory[]>(
    `*[_type == "shopCategory"]{
      "id": _id,
      "documentId": _id,
      "name": coalesce(name[$locale], name.vi)
    }`,
    { locale }
  );
}

export async function getSitemapProducts(): Promise<Pick<ShopProduct, 'slug' | 'createdAt'>[]> {
  return sanityFetch(
    `*[_type == "shopProduct" && language == "vi"]{ slug, "createdAt": _createdAt }`
  );
}

export async function getJournalPosts(locale: string): Promise<JournalPost[]> {
  return sanityFetch<JournalPost[]>(
    `*[_type == "journalPost" && language == $locale] | order(published_date desc)${journalPostProjection}`,
    { locale }
  );
}
