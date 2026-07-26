import type { MetadataRoute } from "next"
import { isNonProductionDeployEnv } from "@/lib/non-production-robots"

/**
 * Dynamic robots.txt (replaces static public/robots.txt).
 * - Production: open crawl + /client/ disallow + CCBot block + sitemap
 * - Non-production Vercel deploys: disallow all (preview/dev safety)
 * - Does NOT include /factory in sitemap (factory stays out of sitemap elsewhere)
 */
export default function robots(): MetadataRoute.Robots {
  if (isNonProductionDeployEnv(process.env.VERCEL_ENV)) {
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
