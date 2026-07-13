import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { OnlineGuard } from "@/components/layout/OnlineGuard";
import { PostHogBootstrap } from "@/components/layout/PostHogBootstrap";
import { PostHogSessionReset } from "@/components/layout/PostHogSessionReset";
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

export const metadata: Metadata = {
  title: "Mulhim Admin",
  description: "Teacher operations dashboard for the Mulhim learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/register"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/login"
      signUpForceRedirectUrl="/login"
      afterSignOutUrl="/login"
    >
      <html
        lang="en"
        className={`${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
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
