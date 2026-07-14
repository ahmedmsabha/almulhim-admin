import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Hanken_Grotesk, Inter, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { OnlineGuard } from "@/components/layout/OnlineGuard";
import { PostHogBootstrap } from "@/components/layout/PostHogBootstrap";
import { PostHogSessionReset } from "@/components/layout/PostHogSessionReset";
import type { Language } from "@/lib/i18n/translations";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mulhim Admin",
  description: "Teacher operations dashboard for the Mulhim learning platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/login"
      signInFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/login"
    >
      <html
        lang={lang}
        dir={dir}
        className={`${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSansArabic.variable} h-full`}
      >
        <body className="min-h-full">
          <OnlineGuard>
            <PostHogBootstrap />
            <PostHogSessionReset />
            {children}
          </OnlineGuard>
        </body>
      </html>
    </ClerkProvider>
  );
}
