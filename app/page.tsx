import { fetchStrapiSingle, fetchStrapiCollection, strapiMediaUrl } from "@/lib/strapi";
import type { GlobalData, HomepageData, BlogPost } from "@/lib/types";
import Image from "next/image";
import Header from "@/app/components/Header";

export default async function Home() {
  const [global, homepage, blogPosts] = await Promise.all([
    fetchStrapiSingle<GlobalData>("/api/global", { populate: "*" }),
    fetchStrapiSingle<HomepageData>("/api/homepage", { populate: "*" }),
    fetchStrapiCollection<BlogPost>("/api/blog-posts", {
      populate: "*",
      "sort[0]": "publishedAt:desc",
      "pagination[limit]": "3",
    }),
  ]);

  return (
    <main className="bg-cream text-dark font-sans overflow-x-hidden">
      <Header
        siteName={global.site_name}
        logo={global.logo}
        navEmail={global.nav_email ?? undefined}
        navLinks={global.nav_links}
        cartCount={0}
      />

      {/* <section className="relative pt-32 bg-cream">
        <h1
          className="w-full text-center text-[24vw] font-extrabold text-dark leading-[0.72] uppercase tracking-tighter"
          style={{ fontFamily: "'Faculty Glyphic', serif" }}
        >
          {global.site_name ?? "TERRENE"}
        </h1>

        {homepage.hero && (
          <div className="relative w-full h-screen mt-4 overflow-hidden bg-[#D9D9D9]">
            <Image
              src={strapiMediaUrl(homepage.hero.url)}
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {homepage.intro_text && (
        <section className="bg-cream flex items-center justify-center min-h-screen px-8">
          <p className="text-[32px] font-normal leading-[1.3] tracking-[-0.04em] text-center max-w-212.5 text-dark">
            {homepage.intro_text}
          </p>
        </section>
      )}

      {homepage.quote_text && (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          {homepage.quote_background ? (
            <Image
              src={strapiMediaUrl(homepage.quote_background.url)}
              alt="Quote background"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#D9D9D9]" />
          )}
          <div className="relative z-10 px-16 text-center text-white mix-blend-difference">
            <blockquote
              className="text-[3.5vw] font-medium leading-[1.2] tracking-[-0.03em] max-w-250"
            >
              {homepage.quote_text}
            </blockquote>
          </div>
        </section>
      )}

      {homepage.timeline_steps?.length > 0 && (
        <section className="bg-cream px-16 py-40 z-12 relative">
          <div className="flex flex-col gap-6 mb-16 overflow-hidden">
            {homepage.timeline_heading_left && (
              <p className="text-[7.5vw] font-normal tracking-[-0.04em] leading-none uppercase text-dark text-left whitespace-nowrap">
                {homepage.timeline_heading_left}
              </p>
            )}
            {homepage.timeline_heading_right && (
              <p className="text-[7.5vw] font-normal tracking-[-0.04em] leading-none uppercase text-dark text-right whitespace-nowrap">
                {homepage.timeline_heading_right}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            {homepage.timeline_steps.map((step, i) => {
              const layerColors = [
                { bg: "#DFDDD1", color: "#1A1A1A" },
                { bg: "#9FB878", color: "#1A1A1A" },
                { bg: "#799851", color: "#ffffff" },
                { bg: "#47622A", color: "#ffffff" },
                { bg: "#374426", color: "#ffffff" },
              ];
              const layer = layerColors[i % layerColors.length];
              return (
                <div
                  key={step.id}
                  className="relative flex gap-4 p-4 h-screen"
                  style={{ backgroundColor: layer.bg, color: layer.color }}
                >
                  <div className="relative flex-1 h-full">
                    <div className="absolute top-0 left-0 flex items-center gap-2">
                      <span
                        className="text-2xl tracking-[-0.01em] leading-none"
                        style={{ fontFamily: "'Faculty Glyphic', serif" }}
                      >
                        {global.site_name}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center pr-8">
                      <p className="text-[18px] leading-normal max-w-112.5 opacity-80">
                        {step.description}
                      </p>
                    </div>
                    <h3
                      className="absolute bottom-0 left-0 text-[5vw] font-extrabold leading-none uppercase tracking-[-0.02em]"
                    >
                      {step.title}
                    </h3>
                  </div>

                  <div className="flex-1 h-full rounded-sm overflow-hidden relative bg-[#D9D9D9]">
                    {step.image && (
                      <Image
                        src={strapiMediaUrl(step.image.url)}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {homepage.shop_products?.length > 0 && (
        <section className="relative bg-cream z-20 p-10">
          <div className="border border-[rgba(26,26,26,0.15)] overflow-x-auto">
            <div className="flex" style={{ width: "max-content" }}>
              {homepage.shop_products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col shrink-0 border-r border-[rgba(26,26,26,0.15)]"
                  style={{ width: "calc((100vw - 80px) / 3)" }}
                >
                  <div className="relative flex-1 bg-[#EBEBE6]" style={{ minHeight: "55vh" }}>
                    {product.image && (
                      <Image
                        src={strapiMediaUrl(product.image.url)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {product.is_new && (
                      <span className="absolute top-6 right-6 bg-[#E2E892] text-dark text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="p-8 bg-cream border-t border-[rgba(26,26,26,0.15)] flex flex-col min-h-[25vh]">
                    {product.category && (
                      <p className="text-[11px] text-muted font-medium uppercase tracking-[0.1em] mb-4">
                        {product.category}
                      </p>
                    )}
                    <h3 className="text-[1.8vw] font-semibold uppercase tracking-[0.05em] text-dark mb-8">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-4 text-[13px] font-semibold text-dark uppercase mt-auto">
                      <span className="border border-dark px-3 py-1.5 tracking-[0.05em]">
                        {Number(product.price).toLocaleString()} ₫
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="flex items-center justify-center shrink-0 border-r border-[rgba(26,26,26,0.15)]"
                style={{ width: "calc((100vw - 80px) / 3)" }}
              >
                <div className="text-center text-dark">
                  <h3 className="text-[2vw] font-semibold uppercase tracking-[0.05em] mb-4">
                    View All
                  </h3>
                  <span className="text-[2vw] inline-block transition-transform duration-300 hover:translate-x-3">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="bg-cream px-16 py-32 relative z-10">
          <div className="text-center mb-16 flex flex-col items-center">
            {homepage.blog_badge && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] px-5 py-1.5 border border-[rgba(26,26,26,0.2)] rounded-full mb-6">
                {homepage.blog_badge}
              </span>
            )}
            {homepage.blog_title && (
              <h2
                className="text-[4.5vw] font-normal tracking-[-0.02em] text-dark mb-4"
                style={{ fontFamily: "'Faculty Glyphic', serif" }}
              >
                {homepage.blog_title}
              </h2>
            )}
            {homepage.blog_description && (
              <p className="text-[18px] text-dark opacity-80 max-w-150">
                {homepage.blog_description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-8 mb-16">
            {blogPosts.map((post) => (
              <article key={post.id} className="flex flex-col cursor-pointer group">
                <div className="w-full aspect-[1/1.1] rounded-xl overflow-hidden mb-6 bg-[#EBEBE6]">
                  {post.cover && (
                    <Image
                      src={strapiMediaUrl(post.cover.url)}
                      alt={post.title}
                      width={600}
                      height={660}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                {post.publishedAt && (
                  <time className="font-mono text-[12px] uppercase tracking-[0.05em] text-dark mb-3">
                    {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                  </time>
                )}
                <h3 className="text-[22px] font-medium leading-[1.3] text-dark tracking-[-0.01em] transition-opacity duration-300 group-hover:opacity-70">
                  {post.title}
                </h3>
              </article>
            ))}
          </div>

          <div className="text-center">
            <a
              href="/blog"
              className="inline-block px-12 py-4 border border-dark rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] text-dark transition-all duration-300 hover:bg-dark hover:text-cream"
            >
              Xem thêm
            </a>
          </div>
        </section>
      )}

      <footer
        className="relative z-10 bg-matcha text-cream px-16 pt-20 pb-8 -mt-8"
        style={{ borderRadius: "32px 32px 0 0" }}
      >
        <div className="flex justify-between items-start mb-16 flex-wrap gap-12">
          <div className="flex gap-8">
            {global.social_links?.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-bold uppercase tracking-[0.05em] text-cream"
              >
                {s.platform}
              </a>
            ))}
          </div>

          <div className="flex items-center border-b border-cream/40 pb-2 w-80 gap-4">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="bg-transparent border-none outline-none text-cream text-[14px] placeholder-cream/60 flex-1 font-sans"
            />
            <button className="text-[12px] font-bold uppercase tracking-[0.05em] text-cream font-sans">
              Đăng ký
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end flex-wrap gap-6">
          <span
            className="text-[3.5rem] leading-none tracking-[-0.02em] text-cream"
            style={{ fontFamily: "'Faculty Glyphic', serif" }}
          >
            {global.site_name}
          </span>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-6">
              <a href="/privacy" className="text-[11px] font-medium text-cream/60 uppercase tracking-[0.05em]">
                Privacy
              </a>
              <a href="/terms" className="text-[11px] font-medium text-cream/60 uppercase tracking-[0.05em]">
                Terms
              </a>
            </div>
            {global.footer_copyright && (
              <p className="text-[11px] font-medium text-cream/60 uppercase tracking-[0.05em]">
                {global.footer_copyright}
              </p>
            )}
          </div>
        </div>
      </footer> */}
    </main>
  );
}
