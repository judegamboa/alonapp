import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/urls";

// Public surfaces only — client portals never belong in here.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/signup`, priority: 0.8 },
    { url: `${base}/login`, priority: 0.5 },
    { url: `${base}/privacy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 },
  ];
}
