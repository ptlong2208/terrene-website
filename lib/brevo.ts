/** Checks whether an email is already a contact on the wishlist list (BREVO_LIST_ID). */
export async function isEmailOnWishlist(email: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
  if (!apiKey || !listId) return false;

  const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    headers: { 'api-key': apiKey, Accept: 'application/json' },
    cache: 'no-store',
  });

  if (res.status === 404) return false;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo contact lookup failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const listIds = (data.listIds ?? []) as number[];
  return listIds.includes(listId);
}
