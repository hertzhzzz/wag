import { describe, expect, it } from "vitest"
import {
  isNonProductionHostname,
  isPreviewDeployEnv,
  shouldSendNoIndexRobotsTag,
} from "./non-production-robots"

describe("non-production robots guards", () => {
  it("treats Vercel preview env as noindex", () => {
    expect(isPreviewDeployEnv("preview")).toBe(true)
    expect(isPreviewDeployEnv("production")).toBe(false)
    expect(isPreviewDeployEnv(undefined)).toBe(false)
  })

  it("flags vercel.app and localhost hosts", () => {
    expect(isNonProductionHostname("wag-frontend-git-main-xxx.vercel.app")).toBe(true)
    expect(isNonProductionHostname("localhost")).toBe(true)
    expect(isNonProductionHostname("www.winningadventure.com.au")).toBe(false)
    expect(isNonProductionHostname("winningadventure.com.au")).toBe(false)
  })

  it("never noindexes production host with production env", () => {
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "production",
        hostname: "www.winningadventure.com.au",
      }),
    ).toBe(false)
  })

  it("noindexes preview env even on brand host (misconfig safety)", () => {
    expect(
      shouldSendNoIndexRobotsTag({
        vercelEnv: "preview",
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
})
