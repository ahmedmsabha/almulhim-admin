import { translations } from "./translations";
import type { Language } from "./translations";

export function getTranslation(lang: Language) {
  const t = (key: string): string => {
    const dict = translations[lang] || translations.en;
    const parts = key.split(".");
    let current: unknown = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof current === "string" ? current : key;
  };

  return { t, lang };
}
