"use client";

import { UserButton, SignOutButton } from "@clerk/nextjs";
import { Menu, Search, Globe, LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type AppTopbarProps = {
  onMenuClick: () => void;
};

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { lang, toggleLanguage, t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-topbar shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 lg:px-container">
      <div className="flex w-full max-w-xl items-center gap-4 lg:gap-8">
        <button
          type="button"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          onClick={onMenuClick}
          aria-label={t("common.openNavigation")}
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <h2 className="hidden shrink-0 text-headline-sm font-bold text-on-surface sm:block">
          {t("common.appName")}
        </h2>
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 rtl:right-3 rtl:left-auto size-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <input
            type="search"
            placeholder={t("common.searchPlaceholder")}
            className="w-full rounded-lg border border-transparent bg-surface-container-low py-2 pr-4 pl-10 rtl:pl-4 rtl:pr-10 text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            aria-label={t("common.searchLabel")}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200"
        >
          <Globe className="size-4" aria-hidden />
          <span>{lang === "en" ? "العربية" : "English"}</span>
        </button>
        
        {/* Notifications bell omitted until a real Admin Web inbox is scoped */}
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <SignOutButton redirectUrl="/login">
            <button
              type="button"
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-destructive transition-colors duration-200"
              title={t("common.signOut")}
              aria-label={t("common.signOut")}
            >
              <LogOut className="size-5" aria-hidden />
            </button>
          </SignOutButton>
        </div>
      </div>
    </header>
  );
}
