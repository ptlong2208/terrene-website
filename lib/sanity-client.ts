import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '@/sanity/env';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: { revalidate: 60 },
  });
}
