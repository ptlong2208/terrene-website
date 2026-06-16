// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  mime: string;
}

export interface NavLink {
  id: number;
  label: string;
  href: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

export interface TextItem {
  id: number;
  text: string;
}

// ---------------------------------------------------------------------------
// Global (single type)
// ---------------------------------------------------------------------------

export interface GlobalData {
  id: number;
  documentId: string;

  // Site
  site_name: string;
  site_description: string | null;
  favicon: StrapiMedia | null;
  logo: StrapiMedia | null;

  // Loader / Audio
  loader_quote: string | null;
  ambient_audio: StrapiMedia | null;
  music_consent_text: string | null;
  music_consent_accept: string | null;
  music_consent_decline: string | null;

  // Nav
  nav_links: NavLink[];
  nav_email: string | null;
  nav_shop_link: NavLink | null;
  nav_cart_label: string | null;

  // Social
  social_links: SocialLink[];

  // Footer
  footer_copyright: string | null;
  footer_newsletter_label: string | null;
  footer_newsletter_placeholder: string | null;
  footer_legal_links: NavLink[];
}

// ---------------------------------------------------------------------------
// Homepage (single type)
// ---------------------------------------------------------------------------

export interface TimelineStep {
  id: number;
  step_number: number;
  title: string;
  description: string | null;
  image: StrapiMedia | null;
}

// ---------------------------------------------------------------------------
// Tag (collection type — reusable across products)
// ---------------------------------------------------------------------------

export interface Tag {
  id: number;
  documentId: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Shop Category (collection type)
// ---------------------------------------------------------------------------

export interface ShopCategory {
  id: number;
  documentId: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Shop Product (collection type)
// ---------------------------------------------------------------------------

export interface ShopProduct {
  id: number;
  documentId: string;
  createdAt: string;
  title: string;
  category: ShopCategory | null;
  description: string | null;
  price: number;
  original_price: number | null;
  attribute: string | null;
  tags: Tag[];
  image: StrapiMedia | null;
}

export interface HomepageData {
  id: number;
  documentId: string;
  hero_title: string | null;
  hero_description: string | null;
  hero_background_video: StrapiMedia | null;
  hero_video_poster: StrapiMedia | null;
}

// ---------------------------------------------------------------------------
// Coming Soon (single type)
// ---------------------------------------------------------------------------

export interface ComingSoonData {
  id: number;
  documentId: string;
  seo_title: string | null;
  seo_description: string | null;
  quote: string | null;
  words: TextItem[];
  label: string | null;
  form_heading: string | null;
  submit_label: string | null;
  email_placeholder: string | null;
  success_message: string | null;
}

// ---------------------------------------------------------------------------
// Blog Post (collection type)
// ---------------------------------------------------------------------------

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover: StrapiMedia | null;
  category: string | null;
  read_time: number | null;
  publishedAt: string;
  locale: string;
}
