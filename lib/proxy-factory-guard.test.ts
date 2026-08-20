import { NextRequest } from "next/server"

import { proxy } from "@/proxy"

/**
 * Regression guard for a production-only 404.
 *
 * proxy.ts blocks the not-yet-public factory wiki outside local dev. It used
 * `pathname.startsWith("/factory")`, which also swallowed sibling routes —
 * `/factory-audit-china` returned 404 in production for weeks while working
 * fine on localhost (localhost is exempt from the block), so local testing
 * could never reproduce it. An external SEO audit surfaced it as 16 separate
 * "broken internal link" findings.
 */

const PROD_HOST = "www.winningadventure.com.au"

function request(pathname: string, host = PROD_HOST) {
  return new NextRequest(new URL(pathname, `https://${host}`))
}

describe("factory wiki production block", () => {
  it("still blocks the factory wiki itself in production", () => {
    expect(proxy(request("/factory")).status).toBe(404)
    expect(proxy(request("/factory/some-supplier")).status).toBe(404)
  })

  it("does not block sibling routes that merely start with /factory", () => {
    // The actual regression: this is a live service landing page.
    expect(proxy(request("/factory-audit-china")).status).not.toBe(404)
  })

  it("leaves the factory wiki reachable on localhost", () => {
    expect(proxy(request("/factory", "localhost")).status).not.toBe(404)
  })
})
