import { fetchStrapiSingle, fetchStrapiCollection, strapiMediaUrl } from "@/lib/strapi";
import type { GlobalData, HomepageData, BlogPost } from "@/lib/types";
import Image from "next/image";

export default async function Home() {
  const [global, homepage, blogPosts] = await Promise.all([
    fetchStrapiSingle<GlobalData>("/api/global", { populate: "deep" }),
    fetchStrapiSingle<HomepageData>("/api/homepage", { populate: "deep" }),
    fetchStrapiCollection<BlogPost>("/api/blog-posts", {
      populate: "*",
      sort: "publishedAt:desc",
      "pagination[limit]": "3",
    }),
  ]);

  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-100">
        <span className="text-xl font-semibold tracking-tight">{global.site_name}</span>
        <nav className="flex gap-6 text-sm">
          {global.nav_links?.map((link) => (
            <a key={link.id} href={link.hre            <a key={link.id} href={link.hre            <a key={link.id} href={link.hr ))}            <a key={link.id} href={link.hre            <a key={link.i              <a key={link.id} <sec            <a key={link.id} hreh-[60vh            <a key={link.id} href={link.hre            <a pi            <a key={link.id} href={link.hre            <a key={link.id           className="object-cover"
            priority
          />
                                                             }
                 ntro_t                 ntro_t      ssN                 ntro_t     py-1      -center">                            ntro_t                 ntro_t      ssN       /p>
        </section>
      )}

                                                                                              relative w-full py-24 flex items-center justify-center overflow-hidden bg-zinc-900 text-white">
          {homepage.quote_background && (
            <Image
              src={strapiMediaUrl(homepage.quote_background.url)}
              alt="Quote background"
              fill
              className="object-cover opacity-40"
            />
          )}
          <blockquote className="relative z-10 max-w-xl text-center text-2xl italic px-8">
            {homepage.quote_text}
          </blockquote>
        </section>
      )}

      {/* ── Timeline ── */}
      {homepage.timeline_steps?.length > 0 && (
        <section className        <se m        <section className        <se m        <section cy-betw        <section className        <se m        <section className        <se m        <section cy-betw        <section className        <se m        <section className        <st}        <sect   </div>
                                                                                                                                                                                                  -8 flex items-center justify-center rounded-         inc-900 text-white text-sm font-bold shrink-0">
                  {step.step_number}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.description && (
                    <p className="text-sm text-zinc-500 mt-1">{step.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
                                                 p ── */}
      {homepage.shop_products?.length > 0 && (
        <section className="max-w-5xl mx-auto px-8 py-16">
          <h2 className="text-2xl font-semibold mb-8">Shop</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.shop_products.map((prod            {homepage.se.            {homepage.shop_produ{prod            {homepage.          fill
                                                                                        </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-zinc-100" />
                )}
                <p className="text                <pproduct.name}</p>
                <p className="text-xs text-zinc-400">{product.category}</p>
                <p className="text-sm">{product.p                <p className="text-sm">{product.p                          <p className="text-sm">{product.p            {/*                <p className="text-sm">{product.p                <p classNamassNa                <p className="text-sm">{product.p                <p className="text-sm">{product.p                          <p className="text-sm">{product.p            {/*                <p className="text-sm">{product.p                <p classNamassNa                <p className="text-sm">{product.p                <p className="text-sm">{product.p                          <p className="text-sm">{product.p   className="text-zinc-500 mb-8">{homepage.blog_description}</p>
          )}
          <div className="grid grid-cols-1          <div className="grid grid-cols-1          <div className="grt) =>          <div cl<a          <div className="grid grid-cols-1          <div className="  {post.cover && (
                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <div className="relative aspect-video rou                  <           </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6 max-w-5xl mx-auto">
          <div>
            <p className="font-semibold">{global.site_name}</p>
            <div className="flex gap-4 mt-3">
              {global.social_links?.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
          {global.footer_copyright && (
            <p className="text-xs text-zinc-400 self-end">{global.footer_copyright}</p>
          )}
        </div>
      </footer>
    </main>
  );
}
