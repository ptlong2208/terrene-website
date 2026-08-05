import { sanityFetch } from '@/lib/sanity-client';
import type { ComingSoonData, GlobalData } from '@/lib/types';

export async function getGlobalMinimal(
  locale: string
): Promise<Pick<GlobalData, 'site_name' | 'loader_quote'>> {
  return sanityFetch(`*[_type == "global"][0]{ site_name, loader_quote }`, { locale });
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
