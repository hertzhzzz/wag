import { GeoBenchmarkJsonError } from "./types";

const HEX_DIGITS = /^[0-9A-Fa-f]{4}$/;

/**
 * A small JSON parser used at the benchmark input boundary. JSON.parse cannot
 * tell us whether an object contained duplicate keys because it silently
 * keeps the last value. This parser rejects that ambiguity instead.
 */
class StrictJsonParser {
  private readonly source: string;
  private index = 0;

  constructor(source: string) {
    this.source = source;
  }

  parse(): unknown {
    if (this.source.charCodeAt(0) === 0xfeff) {
      throw new GeoBenchmarkJsonError(
        "A UTF-8 BOM is not allowed at the benchmark JSON boundary.",
        "bom_not_allowed",
      );
    }

    this.skipWhitespace();
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.index !== this.source.length) {
      this.fail("Trailing content is not valid JSON.");
    }
    return value;
  }

  private parseValue(): unknown {
    const character = this.source[this.index];
    if (character === "{") return this.parseObject();
    if (character === "[") return this.parseArray();
    if (character === '"') return this.parseString();
    if (character === "t" && this.consumeLiteral("true")) return true;
    if (character === "f" && this.consumeLiteral("false")) return false;
    if (character === "n" && this.consumeLiteral("null")) return null;
    if (character === "-" || this.isDigit(character)) {
      return this.parseNumber();
    }
    this.fail("Expected a JSON value.");
  }

  private parseObject(): Record<string, unknown> {
    this.index += 1;
    this.skipWhitespace();
    const object = Object.create(null) as Record<string, unknown>;
    const keys = new Set<string>();

    if (this.consume("}")) return object;

    while (true) {
      if (this.source[this.index] !== '"') {
        this.fail("Object keys must be JSON strings.");
      }
      const key = this.parseString();
      if (keys.has(key)) {
        throw new GeoBenchmarkJsonError(
          `Duplicate JSON object key at offset ${this.index}.`,
          "duplicate_json_key",
        );
      }
      keys.add(key);
      this.skipWhitespace();
      if (!this.consume(":")) {
        this.fail("Expected ':' after an object key.");
      }
      this.skipWhitespace();
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value: this.parseValue(),
        writable: true,
      });
      this.skipWhitespace();
      if (this.consume("}")) return object;
      if (!this.consume(",")) {
        this.fail("Expected ',' or '}' in an object.");
      }
      this.skipWhitespace();
    }
  }

  private parseArray(): unknown[] {
    this.index += 1;
    this.skipWhitespace();
    const array: unknown[] = [];
    if (this.consume("]")) return array;

    while (true) {
      array.push(this.parseValue());
      this.skipWhitespace();
      if (this.consume("]")) return array;
      if (!this.consume(",")) {
        this.fail("Expected ',' or ']' in an array.");
      }
      this.skipWhitespace();
    }
  }

  private parseString(): string {
    if (!this.consume('"')) {
      this.fail("Expected a JSON string.");
    }

    let value = "";
    while (this.index < this.source.length) {
      const character = this.source[this.index];
      const code = this.source.charCodeAt(this.index);
      this.index += 1;

      if (character === '"') return value;
      if (character === "\\") {
        value += this.parseEscape();
        continue;
      }
      if (code <= 0x1f) {
        this.fail("Control characters must be escaped in JSON strings.");
      }
      value += character;
    }

    this.fail("Unterminated JSON string.");
  }

  private parseEscape(): string {
    const escape = this.source[this.index];
    this.index += 1;
    switch (escape) {
      case '"':
      case "\\":
      case "/":
        return escape;
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "u": {
        const digits = this.source.slice(this.index, this.index + 4);
        if (!HEX_DIGITS.test(digits)) {
          this.fail("Invalid Unicode escape in JSON string.");
        }
        this.index += 4;
        return String.fromCharCode(Number.parseInt(digits, 16));
      }
      default:
        this.fail("Invalid escape sequence in JSON string.");
    }
  }

  private parseNumber(): number {
    const start = this.index;
    this.consume("-");

    if (this.consume("0")) {
      if (this.isDigit(this.source[this.index])) {
        this.fail("JSON numbers may not contain leading zeroes.");
      }
    } else {
      if (!this.isNonZeroDigit(this.source[this.index])) {
        this.fail("Invalid JSON number.");
      }
      while (this.isDigit(this.source[this.index])) this.index += 1;
    }

    if (this.consume(".")) {
      if (!this.isDigit(this.source[this.index])) {
        this.fail("A JSON fraction must contain at least one digit.");
      }
      while (this.isDigit(this.source[this.index])) this.index += 1;
    }

    if (this.source[this.index] === "e" || this.source[this.index] === "E") {
      this.index += 1;
      if (this.source[this.index] === "+" || this.source[this.index] === "-") {
        this.index += 1;
      }
      if (!this.isDigit(this.source[this.index])) {
        this.fail("A JSON exponent must contain at least one digit.");
      }
      while (this.isDigit(this.source[this.index])) this.index += 1;
    }

    const token = this.source.slice(start, this.index);
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new GeoBenchmarkJsonError(
        `JSON number at offset ${start} is not finite.`,
        "invalid_json_value",
      );
    }
    return value;
  }

  private consume(expected: string): boolean {
    if (this.source.startsWith(expected, this.index)) {
      this.index += expected.length;
      return true;
    }
    return false;
  }

  private consumeLiteral(expected: string): boolean {
    if (!this.source.startsWith(expected, this.index)) return false;
    this.index += expected.length;
    return true;
  }

  private skipWhitespace(): void {
    while (/[\u0020\u0009\u000a\u000d]/.test(this.source[this.index] ?? "")) {
      this.index += 1;
    }
  }

  private isDigit(character: string | undefined): boolean {
    return character !== undefined && character >= "0" && character <= "9";
  }

  private isNonZeroDigit(character: string | undefined): boolean {
    return character !== undefined && character >= "1" && character <= "9";
  }

  private fail(message: string): never {
    throw new GeoBenchmarkJsonError(
      `${message} (offset ${this.index}).`,
      "invalid_json",
    );
  }
}

export function parseStrictGeoBenchmarkJson(source: string): unknown {
  if (typeof source !== "string") {
    throw new GeoBenchmarkJsonError(
      "Benchmark JSON input must be a UTF-8 text string.",
      "invalid_json",
    );
  }
  return new StrictJsonParser(source).parse();
}
