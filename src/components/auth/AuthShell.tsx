"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type AuthShellProps = {
  subtitleKey: string;
  children: ReactNode;
};

export function AuthShell({ subtitleKey, children }: AuthShellProps) {
  const { t, toggleLanguage, lang } = useTranslation();

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-4 end-4">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleLanguage}
          className="h-9 rounded-lg px-3 text-body-sm font-semibold text-on-surface-variant"
          aria-label={t("common.toggleLanguage")}
        >
          {t("common.toggleLanguage")}
        </Button>
      </div>
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt={t("auth.logoAlt")}
            className="size-full object-cover"
          />
        </div>
        <div>
          <p
            className="font-display text-headline-sm font-bold text-primary"
            lang={lang}
          >
            {t("auth.brand")}
          </p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t(subtitleKey)}
          </p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
