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

// ---------------------------------------------------------------------------
// Global (single type)
// ---------------------------------------------------------------------------

export interface GlobalData {
  id: number;
  documentId: string;
  site_name: string;
  site_description: string | null;
  favicon: StrapiMedia | null;
  logo: StrapiMedia | null;
  nav_links: NavLink[];
  nav_email: string | null;
  social_links: SocialLink[];
  footer_copyright: string | null;
  ambient_audio: StrapiMedia | null;
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

export interface HeroComponent {
  brand_text: string;
  background_video: StrapiMedia | null;
}

export interface HomepageData {
  id: number;
  documentId: string;
  hero: HeroComponent | null;
  intro_text: string | null;
  quote_text: string | null;
  quote_background: StrapiMedia | null;
  timeline_heading_left: string | null;
  timeline_heading_right: string | null;
  timeline_steps: TimelineStep[];
  shop_kicker: string | null;
  shop_title: string | null;
  shop_description: string | null;
  shop_view_all_url: string | null;
  shop_view_all_label: string | null;
  shop_products: ShopProduct[];
  blog_badge: string | null;
  blog_title: string | null;
  blog_description: string | null;
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
