import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { getSiteSettings } from "@/lib/content/site";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ScrollToTop } from "@/components/atoms/ScrollToTop";
import { resolveLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/constants";
import localFont from 'next/font/local';
import "./globals.css";

const inter = localFont({
  src: '../fonts/InterVariable.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
});

const settings = getSiteSettings();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: settings.title,
    template: "%s | Muhammad Nabil Al Qadri"
  },
  description: settings.description,
  keywords: ["Data Analytics", "AI Applications", "Intelligent Systems", "Software Development", "Full-Stack", "Machine Learning", "Golang", "Next.js"],
  openGraph: {
    title: {
      default: settings.title,
      template: "%s | Muhammad Nabil Al Qadri"
    },
    description: settings.description,
    locale: settings.language,
    type: 'website',
  },
  alternates: {
    canonical: '/',
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F1ED' },
    { media: '(prefers-color-scheme: dark)', color: '#0D090A' },
  ]
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`min-h-screen flex flex-col font-sans ${inter.variable}`} suppressHydrationWarning>
        <ScrollToTop />
        <LanguageProvider lang={lang}>
          <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="theme">
            {/* Ambient Glow Background - Cinematic Lighting Effect */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" aria-hidden="true">
              {/* Massive center glow, matching the picture's lighting behind the hero */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[80vw] h-[800px] rounded-[100%] opacity-40 dark:opacity-20 blur-[120px] mix-blend-normal" 
                   style={{ 
                     background: 'radial-gradient(ellipse at center, var(--color-burgundy-accent) 0%, transparent 70%)',
                   }} />
              
              {/* Subtle secondary glow at bottom right */}
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 dark:opacity-10 blur-[140px]" 
                   style={{ background: 'radial-gradient(circle, var(--color-highlight) 0%, transparent 70%)' }} />
            </div>
            <div className="flex-1 flex flex-col mx-auto w-full relative z-0">
              {children}
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
