"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Search } from "lucide-react";

type AppTopbarProps = {
  onMenuClick: () => void;
};

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-topbar shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 lg:px-container">
      <div className="flex w-full max-w-xl items-center gap-4 lg:gap-8">
        <button
          type="button"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <h2 className="hidden shrink-0 text-headline-sm font-bold text-on-surface sm:block">
          Mulhim Admin
        </h2>
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search students, subscriptions, or content..."
            className="w-full rounded-lg border border-transparent bg-surface-container-low py-2 pr-4 pl-10 text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            aria-label="Search dashboard"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications bell omitted until a real Admin Web inbox is scoped */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </div>
    </header>
  );
}
