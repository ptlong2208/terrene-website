export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-svh px-gutter py-[clamp(100px,14vh,160px)]">
      {slug}
    </div>
  );
}
