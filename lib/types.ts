export interface MediaAsset {
  url: string;
  alternativeText: string | null;
}

export interface NavLink {
  id?: string;
  label: string;
  href: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
}

export interface TextItem {
  id: string;
  text: string;
}

export interface GlobalData {
  id: string;
  documentId: string;

  site_name: string;
  site_description: string | null;

  loader_quote: string | null;
  ambient_audio: MediaAsset | null;
  music_consent_text: string | null;
  music_consent_accept: string | null;
  music_consent_decline: string | null;

  nav_links: NavLink[];
  email: string | null;
  nav_shop_link: NavLink | null;
  nav_cart_label: string | null;
  nav_overlay_image: MediaAsset | null;

  social_links: SocialLink[];

  footer_newsletter_label: string | null;
  footer_newsletter_placeholder: string | null;
  footer_legal_links: NavLink[];

  cta_header: SectionHeaderData | null;
  cta_link: NavLink | null;
}

export interface Tag {
  id: string;
  documentId: string;
  label: string;
}

export interface ShopCategory {
  id: string;
  documentId: string;
  name: string;
}

export interface JournalCategory {
  id: string;
  documentId: string;
  name: string;
}

export interface TasteNote {
  id: string;
  label: string;
  value: number;
}

export interface ProductInfoItem {
  id: string;
  title: string;
  body: string | null;
}

export interface ProductStory {
  button_label: string;
  title: string;
  content: string;
  images: MediaAsset[];
}

export interface ShopProduct {
  id: string;
  documentId: string;
  createdAt: string;
  title: string;
  slug: string;
  category: ShopCategory | null;
  description: string | null;
  tags: Tag[];
  image: MediaAsset | null;
  gallery: MediaAsset[];
  taste_notes: TasteNote[];
  product_info: ProductInfoItem[];
  story: ProductStory | null;
}

export interface JournalPost {
  id: string;
  documentId: string;
  title: string;
  slug: string;
  cover_image: MediaAsset | null;
  published_date: string | null;
  excerpt: string | null;
  category: JournalCategory | null;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  image: MediaAsset | null;
}

export interface PartnerItem {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
}

export interface ProcessStep {
  id: string;
  name: string;
  description: string | null;
  image: MediaAsset | null;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string | null;
}

export interface SectionHeaderData {
  kicker: string | null;
  title: string | null;
}

export interface HomepageData {
  id: string;
  documentId: string;
  hero_title: string | null;
  hero_description: string | null;
  hero_background_video: MediaAsset | null;
  hero_video_poster: MediaAsset | null;
  story_header: SectionHeaderData | null;
  story_image: MediaAsset | null;
  story_side_label: string | null;
  story_body: string | null;
  story_cta: NavLink | null;
  shop_header: SectionHeaderData | null;
  shop_products: ShopProduct[];
  benefits_header: SectionHeaderData | null;
  benefits_items: BenefitItem[];
  process_header: SectionHeaderData | null;
  process_steps: ProcessStep[];
  process_cta: NavLink | null;
  quote_text: string | null;
  quote_attribution: string | null;
  partners_header: SectionHeaderData | null;
  partners_items: PartnerItem[];
  testimonials_header: SectionHeaderData | null;
  testimonials_items: TestimonialItem[];
  journal_header: SectionHeaderData | null;
  journal_view_all: NavLink | null;
  journal_posts: JournalPost[];
}

export interface ComingSoonData {
  id: string;
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
