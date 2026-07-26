import type { MetadataRoute } from "next"

/**
 * Dynamic robots.txt (overrides public/robots.txt when present).
 * - Production: open crawl + client disallow + CCBot block + sitemap
 * - Preview (VERCEL_ENV=preview): disallow all
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/client/"],
      },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: "https://www.winningadventure.com.au/sitemap.xml",
  }
}
