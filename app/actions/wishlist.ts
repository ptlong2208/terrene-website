'use server';

// Requires a `WaitlistEntry` collection type in Strapi with:
//   - email (string, required, unique)
// And public `create` permission enabled on the collection.

export type WishlistState =
  | { success: true }
  | { error: string }
  | null;

export async function subscribeToWishlist(
  _prevState: WishlistState,
  formData: FormData,
): Promise<WishlistState> {
  const email = (formData.get('email') as string | null)?.trim();
  if (!email) return { error: 'Email is required.' };

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? '';

  try {
    const res = await fetch(`${STRAPI_URL}/api/waitlist-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { email } }),
      cache: 'no-store',
    });

    if (!res.ok) {
      // Strapi returns 400 when unique constraint is violated
      if (res.status === 400) return { error: 'This email is already on the list.' };
      return { error: 'Something went wrong. Please try again.' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}
