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

/** Resolve a Strapi media URL to an absolute URL. */
export function strapiMediaUrl(url: string | null | undefined): string {
    console.log(url);
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}
