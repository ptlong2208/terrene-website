import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream text-dark font-sans flex flex-col items-center justify-center px-6 text-center">
      {/* Giant 404 */}
      <h1
        className="font-sans leading-none tracking-[-0.04em] text-matcha select-none"
        style={{ fontSize: "clamp(120px, 22vw, 320px)" }}
      >
        404
      </h1>

      {/* Divider */}
      <div className="w-12 h-px bg-dark opacity-20 my-8" />

      {/* Message */}
      <p className="text-[18px] sm:text-[20px] text-muted leading-relaxed max-w-sm mb-10">
        This page has wandered off the path. Let&apos;s get you back to solid ground.
      </p>

      {/* Back home link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-dark/20 text-[14px] tracking-[0.08em] uppercase font-medium hover:bg-dark hover:text-cream transition-colors duration-300"
      >
        <span>←</span>
        <span>Back to home</span>
      </Link>
    </main>
  );
}
