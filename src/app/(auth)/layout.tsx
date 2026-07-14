import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session.userId) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as Language;

  return <LanguageProvider initialLang={lang}>{children}</LanguageProvider>;
}
