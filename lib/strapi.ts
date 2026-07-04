const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/**
 * Fetch a single-type entry from Strapi.
 * @param path  e.g. "/api/global"
 * @param params  query-string params, e.g. { populate: "*", locale: "vi" }
 */
export async function fetchStrapiSingle<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const url = `${STRAPI_URL}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  const json = await res.json();
  return json.data as T;
}

/**
 * Fetch a collection from Strapi.
 * @param path  e.g. "/api/blog-posts"
 * @param params  query-string params
 */
export async function fetchStrapiCollection<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const qs = new URLSearchParams(params).toString();
  const url = `${STRAPI_URL}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  const json = await res.json();
  return json.data as T[];
}

/**
 * Fetch a single item from a collection via a custom slug endpoint.
 * Expects the CMS to expose GET {path}/slug/:slug returning { data: item }.
 * Returns null when the CMS responds with 404.
 */
export async function fetchStrapiBySlug<T>(
  path: string,
  slug: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const qs = new URLSearchParams(params).toString();
  const url = `${STRAPI_URL}${path}/slug/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  const json = await res.json();
  return json.data as T;
}

/** Resolve a Strapi media URL to an absolute URL. */
export function strapiMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}
