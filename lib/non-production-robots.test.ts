import { describe, expect, it } from "vitest"
import {
  isNonProductionDeployEnv,
  isNonProductionHostname,
  NOINDEX_ROBOTS_TAG,
  shouldNoindexAtBuildTime,
  shouldSendNoIndexRobotsTag,
} from "./non-production-robots"

describe("non-production robots guards", () => {
  it("treats preview and development as non-production; production is not", () => {
    expect(isNonProductionDeployEnv("preview")).toBe(true)
    expect(isNonProductionDeployEnv("development")).toBe(true)
    expect(isNonProductionDeployEnv("production")).toBe(false)
    expect(isNonProductionDeployEnv(undefined)).toBe(false)
    expect(isNonProductionDeployEnv(null)).toBe(false)
    expect(isNonProductionDeployEnv("")).toBe(false)
  })

  it("flags vercel.app and localhost hosts; never brand production host", () => {
    expect(isNonProductionHostname("wag-frontend-git-main-xxx.vercel.app")).toBe(true)
    expect(isNonProductionHostname("vercel.app")).toBe(true)
    expect(isNonProductionHostname("localhost")).toBe(true)
    expect(isNonProductionHostname("127.0.0.1")).toBe(true)
    expect(isNonProductionHostname("www.winningadventure.com.au")).toBe(false)
    expect(isNonProductionHostname("winningadventure.com.au")).toBe(false)
    // Suffix trap: must not match evil-vercel.app.example.com
    expect(isNonProductionHostname("evil-vercel.app.example.com")).toBe(false)
  })

  it("never noindexes production host with production env", () => {
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "production",
        hostname: "www.winningadventure.com.au",
      }),
    ).toBe(false)
  })

  it("noindexes preview/dev env even on brand host (misconfig safety)", () => {
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "preview",
        hostname: "www.winningadventure.com.au",
      }),
    ).toBe(true)
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "development",
        hostname: "www.winningadventure.com.au",
      }),
    ).toBe(true)
  })

  it("noindexes vercel.app even when env says production", () => {
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "production",
        hostname: "wag-frontend-abc123.vercel.app",
      }),
    ).toBe(true)
  })

  it("build-time helper only looks at env (production stays indexable)", () => {
    expect(shouldNoindexAtBuildTime("production")).toBe(false)
    expect(shouldNoindexAtBuildTime("preview")).toBe(true)
    expect(shouldNoindexAtBuildTime(undefined)).toBe(false)
  })

  it("exports standard robots tag", () => {
    expect(NOINDEX_ROBOTS_TAG).toBe("noindex, nofollow")
  })
})
