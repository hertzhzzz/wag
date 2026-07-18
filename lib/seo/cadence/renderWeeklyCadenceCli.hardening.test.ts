import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  MAX_CADENCE_INPUT_BYTES,
  parseCadenceCliArgs,
  readSafeCadenceInput,
  renderCadenceCliOutput,
} from "../../../scripts/seo/render-weekly-cadence";

function captureError(action: () => unknown): Error {
  try {
    action();
  } catch (error) {
    if (error instanceof Error) return error;
  }
  throw new Error("Expected action to fail");
}

describe("weekly cadence renderer CLI hardening", () => {
  let allowedRoot: string;
  let outsideRoot: string;

  beforeEach(() => {
    allowedRoot = mkdtempSync(join(tmpdir(), "cadence-cli-allowed-"));
    outsideRoot = mkdtempSync(join(tmpdir(), "cadence-cli-outside-"));
  });

  afterEach(() => {
    rmSync(allowedRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  });

  it("reads only a regular JSON file inside the configured root", () => {
    const nestedDirectory = join(allowedRoot, "reports");
    mkdirSync(nestedDirectory);
    writeFileSync(join(nestedDirectory, "input.json"), '{"safe":true}');

    expect(readSafeCadenceInput("reports/input.json", { allowedRoot })).toEqual(
      { safe: true },
    );
    expect(
      parseCadenceCliArgs(["reports/input.json", "--format", "json"]),
    ).toEqual({ inputPath: "reports/input.json", format: "json" });
  });

  it("rejects an out-of-root path without disclosing filesystem paths", () => {
    const outsidePath = join(outsideRoot, "private-input.json");
    writeFileSync(outsidePath, '{"secret":"outside-secret"}');

    const error = captureError(() =>
      readSafeCadenceInput(outsidePath, { allowedRoot }),
    );

    expect(error.message).toBe("Cadence input is outside the allowed root.");
    expect(error.message).not.toContain(outsidePath);
    expect(error.message).not.toContain("outside-secret");
  });

  it("rejects a final-component symbolic link", () => {
    const targetPath = join(allowedRoot, "target.json");
    const linkPath = join(allowedRoot, "linked.json");
    writeFileSync(targetPath, '{"safe":true}');
    symlinkSync(targetPath, linkPath);

    expect(() => readSafeCadenceInput("linked.json", { allowedRoot })).toThrow(
      "Cadence input must not traverse symbolic links.",
    );
  });

  it("rejects a symbolic-link parent even when it points outside the root", () => {
    const outsidePath = join(outsideRoot, "input.json");
    writeFileSync(outsidePath, '{"secret":"parent-link-secret"}');
    symlinkSync(outsideRoot, join(allowedRoot, "linked-directory"));

    const error = captureError(() =>
      readSafeCadenceInput("linked-directory/input.json", { allowedRoot }),
    );

    expect(error.message).toBe(
      "Cadence input must not traverse symbolic links.",
    );
    expect(error.message).not.toContain(outsidePath);
    expect(error.message).not.toContain("parent-link-secret");
  });

  it("rejects directories and other non-regular inputs", () => {
    mkdirSync(join(allowedRoot, "directory-input"));

    expect(() =>
      readSafeCadenceInput("directory-input", { allowedRoot }),
    ).toThrow("Cadence input must be a regular non-symlink file.");
  });

  it("rejects files larger than the bounded input policy", () => {
    writeFileSync(
      join(allowedRoot, "oversize.json"),
      Buffer.alloc(MAX_CADENCE_INPUT_BYTES + 1, 0x20),
    );

    expect(() =>
      readSafeCadenceInput("oversize.json", { allowedRoot }),
    ).toThrow("Cadence input exceeds the maximum allowed size.");
  });

  it("rejects an invalid size policy before reading", () => {
    writeFileSync(join(allowedRoot, "input.json"), "{}");

    expect(() =>
      readSafeCadenceInput("input.json", { allowedRoot, maxBytes: 0 }),
    ).toThrow("Cadence input size policy is invalid.");
  });

  it("returns a fixed JSON parse error without leaking input content or paths", () => {
    const inputPath = join(allowedRoot, "invalid.json");
    writeFileSync(inputPath, '{"secret":"parse-secret"');

    const error = captureError(() =>
      readSafeCadenceInput("invalid.json", { allowedRoot }),
    );

    expect(error.message).toBe("Cadence input must contain valid JSON.");
    expect(error.message).not.toContain(inputPath);
    expect(error.message).not.toContain("parse-secret");
  });

  it("returns a fixed contract error without leaking validated content or paths", () => {
    const inputPath = join(allowedRoot, "invalid-contract.json");
    writeFileSync(
      inputPath,
      '{"secret":"contract-secret","dataMode":"actual"}',
    );

    const error = captureError(() =>
      renderCadenceCliOutput(["invalid-contract.json"], { allowedRoot }),
    );

    expect(error.message).toBe("Cadence input failed contract validation.");
    expect(error.message).not.toContain(inputPath);
    expect(error.message).not.toContain("contract-secret");
  });
});
