"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { translations } from "./translations";
import type { Language } from "./translations";

type LanguageContextProps = {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextProps | null>(null);

function getNestedValue(obj: unknown, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const setLanguage = (newLang: Language) => {
    if (newLang === lang) return;

    // Set cookie
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    setLangState(newLang);

    // Refresh the router to reload server components in the background
    startTransition(() => {
      router.refresh();
    });
  };

  const toggleLanguage = () => {
    setLanguage(lang === "en" ? "ar" : "en");
  };

  const t = (key: string): string => {
    const dict = translations[lang] || translations.en;
    return getNestedValue(dict, key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
