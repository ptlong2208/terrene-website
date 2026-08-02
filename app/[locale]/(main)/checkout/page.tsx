import { fetchGhnDistricts } from '@/lib/ghn';

import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage() {
  const districts = await fetchGhnDistricts();
  return <CheckoutForm initialDistricts={districts} />;
}
