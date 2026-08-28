'use server';

import { emailSchema } from '@/lib/validateEmail';

export type WishlistState = { success: true } | { error: string } | null;

export async function subscribeToWishlist(
  _prevState: WishlistState,
  formData: FormData
): Promise<WishlistState> {
  const result = emailSchema.safeParse({ email: formData.get('email') });
  if (!result.success) return { error: result.error.issues[0].message };
  const { email } = result.data;

  const apiKey = process.env.BREVO_API_KEY ?? '';
  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
  console.log(listId);

  try {
    const res = await fetch(process.env.BREVO_API_URL ?? 'https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        ...(listId ? { listIds: [listId] } : {}),
        updateEnabled: false,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.log('Brevo API error:', res.status, await res.text());
      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));

        if (body?.code === 'duplicate_parameter') return { error: 'alreadySubscribed' };
      }
      return { error: 'serverError' };
    }

    return { success: true };
  } catch {
    return { error: 'networkError' };
  }
}
