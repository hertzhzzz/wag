import type { OpportunityRawValue } from "./types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function compareUnicodeCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index += 1) {
    const leftPoint = leftPoints[index].codePointAt(0);
    const rightPoint = rightPoints[index].codePointAt(0);
    if (leftPoint === undefined || rightPoint === undefined) {
      throw new TypeError("Invalid Unicode code point.");
    }
    if (leftPoint < rightPoint) return -1;
    if (leftPoint > rightPoint) return 1;
  }

  return leftPoints.length - rightPoints.length;
}

export function sortCodePoints<T extends string>(values: readonly T[]): T[] {
  return [...values].sort(compareUnicodeCodePoints);
}

export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

export function cloneRawValue(value: OpportunityRawValue): OpportunityRawValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Opportunity raw values must use finite numbers.");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneRawValue(item));
  }
  if (typeof value === "object") {
    const record = value as { readonly [key: string]: OpportunityRawValue };
    return Object.fromEntries(
      sortCodePoints(Object.keys(record)).map((key) => [
        key,
        cloneRawValue(record[key]),
      ]),
    );
  }
  throw new TypeError("Opportunity raw values must be JSON-compatible.");
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return days[month - 1] ?? 0;
}

function parseIsoDate(value: string): {
  readonly year: number;
  readonly month: number;
  readonly day: number;
} {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new TypeError(`Expected YYYY-MM-DD date, received "${value}".`);
  }

  const [year, month, day] = value.split("-").map(Number);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new TypeError(`Invalid calendar date "${value}".`);
  }

  return { year, month, day };
}

function civilDayNumber(value: string): number {
  const parsed = parseIsoDate(value);
  let adjustedYear = parsed.year;
  if (parsed.month <= 2) adjustedYear -= 1;
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const shiftedMonth = parsed.month + (parsed.month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + parsed.day - 1;
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;
  return era * 146097 + dayOfEra;
}

export function assertIsoDate(value: string): void {
  parseIsoDate(value);
}

export function differenceInCalendarDays(
  earlier: string,
  later: string,
): number {
  return civilDayNumber(later) - civilDayNumber(earlier);
}

export function roundDeterministic(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}
