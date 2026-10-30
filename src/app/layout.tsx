import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics, JsonLd, SiteFooter, SiteHeader } from "@/components/layout";
import { site } from "@/lib/site";
import { organization, website } from "@/lib/structured-data";
import "./globals.css";

// Downloaded at build time and served from our own domain: no request to Google.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={[organization(), website()]} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
