import { fetchProvinces } from '@/lib/addressData';

import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage() {
  const provinces = await fetchProvinces();
  return <CheckoutForm initialProvinces={provinces.map((p) => ({ id: p.code, name: p.name }))} />;
}
