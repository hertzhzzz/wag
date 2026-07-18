const PROHIBITED_BRAND_ABBREVIATION = /\bW(?:AG|A)\b/;
const CJK_SCRIPT =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const EXTENDED_PICTOGRAPHIC = /\p{Extended_Pictographic}/u;
const LETTER = /\p{Letter}/u;
const LATIN_LETTER = /\p{Script=Latin}/u;

export function isPublicEnglishCopy(value: string): boolean {
  if (
    PROHIBITED_BRAND_ABBREVIATION.test(value) ||
    CJK_SCRIPT.test(value) ||
    EXTENDED_PICTOGRAPHIC.test(value)
  ) {
    return false;
  }

  return Array.from(value).every(
    (character) => !LETTER.test(character) || LATIN_LETTER.test(character),
  );
}
