import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // admin image uploads (5 MB cap enforced server-side) + multipart overhead
    serverActions: { bodySizeLimit: "6mb" },
  },
  cacheComponents: true,
  // Serve fully resolved <head> metadata (no streamed metadata) to search + AI crawlers.
  htmlLimitedBots:
    /Googlebot|Google-Extended|Google-InspectionTool|Bingbot|bingbot|BingPreview|DuckDuckBot|YandexBot|Baiduspider|Slurp|Applebot|OAI-SearchBot|ChatGPT-User|GPTBot|PerplexityBot|Perplexity-User|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|CCBot|Amazonbot|meta-externalagent|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|redditbot|embedly|Iframely/i,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
