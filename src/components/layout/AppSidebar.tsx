"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { X, LogOut } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type AppSidebarProps = {
  mobileOpen: boolean;
  onNavigate: () => void;
  onClose: () => void;
};

export function AppSidebar({
  mobileOpen,
  onNavigate,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();
  
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || t("common.admin");
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || t("common.teacherAdmin");

  const getTranslationKey = (href: string) => {
    if (href.startsWith("/dev/")) return "nav.testCheckout";
    const path = href.split("/")[1];
    return `nav.${path}`;
  };

  return (
    <aside
      className={[
        "fixed top-0 left-0 rtl:right-0 rtl:left-auto z-50 flex h-full w-sidebar flex-col border-r rtl:border-l rtl:border-r-0 border-outline-variant bg-surface-container-lowest px-4 py-6 transition-transform duration-200",
        "lg:translate-x-0 rtl:lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0 rtl:lg:translate-x-0",
      ].join(" ")}
      aria-label={t("common.openNavigation")}
    >
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt={t("common.appName")} className="size-full object-cover" />
          </div>
          <div>
            <p className="text-headline-sm font-bold text-primary leading-none">
              {t("common.appName")}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              {t("common.subName")}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          onClick={onClose}
          aria-label={t("common.closeNavigation")}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md transition-colors duration-200",
                isActive
                  ? "border-r-2 rtl:border-r-0 rtl:border-l-2 border-primary bg-surface-container-low font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{t(getTranslationKey(item.href))}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-6">
        <div className="flex items-center gap-3 px-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-10",
              },
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-bold text-on-surface">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-on-surface-variant">
              {displayEmail}
            </p>
          </div>
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
    </aside>
  );
}
