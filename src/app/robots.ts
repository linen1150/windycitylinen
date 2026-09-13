import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /my-inspirations is intentionally NOT disallowed here — it carries a
      // noindex meta tag instead (see its page metadata), since a robots.txt
      // Disallow blocks crawling entirely, which means Google can't even
      // read that noindex tag. /admin has no such tag, so it stays blocked.
      disallow: ["/admin"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
