import * as Sentry from '@sentry/nextjs';
import { type NextRequest } from 'next/server';

import logger from '@/lib/logger';
import { supabaseServerClient } from '@/lib/supabase-server';

const log = logger.child({ module: 'admin/reviews' });
const BUCKET = 'review-photos';

function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServerClient();

  const { error } = await supabase.from('reviews').update({ status: 'approved' }).eq('id', id);
  if (error) {
    log.error({ error, id }, 'Failed to approve review');
    Sentry.captureException(error, { tags: { id } });
    return Response.json({ error: 'server_error' }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServerClient();

  const { data: deleted, error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .select('photo_urls')
    .single();

  if (deleteError) {
    log.error({ deleteError, id }, 'Failed to delete review');
    Sentry.captureException(deleteError, { tags: { id } });
    return Response.json({ error: 'server_error' }, { status: 500 });
  }

  const paths = ((deleted?.photo_urls as string[] | undefined) ?? [])
    .map(storagePathFromUrl)
    .filter((p): p is string => p !== null);

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) {
      log.error({ storageError, id }, 'Failed to delete review photos from storage');
      Sentry.captureException(storageError, { tags: { id } });
    }
  }

  return Response.json({ success: true });
}
