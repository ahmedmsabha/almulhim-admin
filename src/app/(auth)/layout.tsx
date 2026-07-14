import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { translations, type Language } from "@/lib/i18n/translations";

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
  const cookieLang = cookieStore.get("lang")?.value;
  const lang: Language =
    cookieLang != null && cookieLang in translations
      ? (cookieLang as Language)
      : "en";

  return <LanguageProvider initialLang={lang}>{children}</LanguageProvider>;
}
