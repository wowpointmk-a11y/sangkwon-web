import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

// /report/* 는 막지 않는다. 막으면 검색봇이 noindex 를 못 읽고 URL 만 색인될 수 있음.
export default function robots(): MetadataRoute.Robots {
  const origin = new URL(brand.siteUrl).origin;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
