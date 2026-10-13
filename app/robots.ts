import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/structured-data";

// Search engines and AI assistants explicitly welcome; private areas closed to all.
const ALLOWED_BOTS = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "ClaudeBot",
  "Applebot",
  "Applebot-Extended",
];
const DISALLOW = ["/admin", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...ALLOWED_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
      { userAgent: "*", allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
