import { redirect } from 'next/navigation';

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/coming-soon`);
}
