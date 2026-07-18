import {
  canonicalSerialize,
  compareUnicodeCodePoints,
  hashCanonical,
  hashUtf8Text,
  normalizeRepositoryRelativePosixPath,
} from "./index";

describe("GEO canonical serialization and hashing", () => {
  it("orders keys by Unicode code point rather than locale or UTF-16 order", () => {
    expect(compareUnicodeCodePoints("\uE000", "😀")).toBeLessThan(0);

    const canonical = canonicalSerialize({
      "😀": 4,
      "\uE000": 3,
      z: { b: 2, a: 1 },
      evidencePath: ".\\lib\\seo\\geo\\fixtures\\snapshot.txt",
    });

    expect(canonical).toBe(
      "{\n" +
        '  "evidencePath": "lib/seo/geo/fixtures/snapshot.txt",\n' +
        '  "z": {\n' +
        '    "a": 1,\n' +
        '    "b": 2\n' +
        "  },\n" +
        '  "": 3,\n' +
        '  "😀": 4\n' +
        "}\n",
    );
  });

  it("normalizes repository-relative POSIX paths without consulting cwd or OS", () => {
    expect(
      normalizeRepositoryRelativePosixPath(
        ".\\lib\\seo//geo/./fixtures/snapshot.txt",
      ),
    ).toBe("lib/seo/geo/fixtures/snapshot.txt");

    for (const invalid of [
      "/tmp/snapshot.txt",
      "C:\\snapshot.txt",
      "../snapshot.txt",
      "lib/../../snapshot.txt",
      "https://example.com/snapshot.txt",
    ]) {
      expect(() => normalizeRepositoryRelativePosixPath(invalid)).toThrow();
    }
  });

  it("uses LF and UTF-8 for stable text and object hashes", () => {
    expect(hashUtf8Text("line one\r\nline two\r")).toBe(
      "sha256:e9024f1a07d29d52ad3aa5e1a18e94db1f3a9fd32b89e39d47c472cd99071e13",
    );
    expect(hashCanonical({ b: 2, a: 1 })).toBe(
      "sha256:080d51f49b27c73d17f51f3b808515a425d16218aa40021eed2ca1d204e59224",
    );
    expect(canonicalSerialize({ text: "line one\r\nline two\r" })).toBe(
      canonicalSerialize({ text: "line one\nline two\n" }),
    );
    expect(hashCanonical({ text: "line one\r\nline two\r" })).toBe(
      hashCanonical({ text: "line one\nline two\n" }),
    );
  });
});
