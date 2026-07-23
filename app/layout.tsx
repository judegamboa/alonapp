import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/urls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const title = "Alon — branded client portals for freelancers";
const description =
  "Give every client a branded portal with project status, files, messages, and payment requests.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  alternates: { canonical: "/" },
  // Alon's own surfaces are indexable; client portals opt out individually in
  // app/p/[portal_slug] and are disallowed in robots.ts.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Alon",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
