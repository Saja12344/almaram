import { ar } from "./ar";
import { en, type TranslationKeys } from "./en";

export type Locale = "en" | "ar";

export const translations: Record<Locale, TranslationKeys> = { en, ar };

export function getDir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export { en, ar };
export type { TranslationKeys };
