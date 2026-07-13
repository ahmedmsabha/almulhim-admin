"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/query/get-query-client";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

type DashboardProvidersProps = {
  children: React.ReactNode;
  initialLang: Language;
};

export function DashboardProviders({ children, initialLang }: DashboardProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <LanguageProvider initialLang={initialLang}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </LanguageProvider>
  );
}
