import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://bingo.benjidevelops.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/card/", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
