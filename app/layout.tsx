import type { Metadata } from "next";
import { Faculty_Glyphic } from "next/font/google";
import "@fontsource-variable/mona-sans/index.css";
import SmoothScroll from "@/app/components/SmoothScroll";
import "./globals.css";

const facultyGlyphic = Faculty_Glyphic({
  variable: "--font-faculty-glyphic",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terrene | The Ritual of Matcha",
  description: "The Ritual of Matcha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${facultyGlyphic.variable} antialiased`}>
      <body className="min-h-screen">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
