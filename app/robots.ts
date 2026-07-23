import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Client portals and the freelancer app are private surfaces. `/p/`
      // especially: a portal slug is guessable enough without help from search.
      disallow: ["/p/", "/app/", "/auth/", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
