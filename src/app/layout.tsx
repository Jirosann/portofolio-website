import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { getContacts, getContactUrl } from "@/lib/content/contact";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ScrollToTop } from "@/components/atoms/ScrollToTop";
import { DelightRoot } from "@/components/delight/DelightRoot";
import { delightCopy, siteRepoUrl } from "@/lib/delight/copy";
import { dictionaries, resolveLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/constants";
import localFont from 'next/font/local';
import { Newsreader } from 'next/font/google';
import "./globals.css";

const inter = localFont({
  src: '../fonts/InterVariable.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
});

// Serif hanya untuk nama di hero: satu bobot, subset latin, di-host sendiri saat build.
// Tanpa preload: diukur, LCP mobile lebih baik daripada dipreload bersama Inter.
const newsreader = Newsreader({
  weight: '600',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const { meta } = dictionaries[lang];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: meta.title,
      template: "%s | Muhammad Nabil Al Qadri"
    },
    description: meta.description,
    openGraph: {
      title: {
        default: meta.title,
        template: "%s | Muhammad Nabil Al Qadri"
      },
      description: meta.description,
      locale: meta.ogLocale,
      type: 'website',
    },
    alternates: {
      canonical: '/',
    }
  };
}

function buildJsonLd(lang: 'en' | 'id') {
  const siteUrl = getSiteUrl();
  const { meta } = dictionaries[lang];
  const sameAs = getContacts()
    .filter((c) => c.type === 'linkedin' || c.type === 'github')
    .map((c) => getContactUrl(c));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: 'Muhammad Nabil Al Qadri',
        jobTitle: 'Software Engineering Student',
        description: meta.description,
        url: siteUrl,
        affiliation: { '@type': 'CollegeOrUniversity', name: 'BINUS University' },
        address: { '@type': 'PostalAddress', addressLocality: 'Bekasi', addressRegion: 'West Java', addressCountry: 'ID' },
        sameAs,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Muhammad Nabil Al Qadri',
        inLanguage: lang,
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  };
}

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
  const contacts = getContacts();
  const email = contacts.find((c) => c.type === 'email')?.value;
  const github = contacts.find((c) => c.type === 'github');
  const dc = delightCopy[lang];

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col font-sans ${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(lang)).replace(/</g, '\\u003c') }}
        />
        <ScrollToTop />
        {email && (
          <DelightRoot
            hire={{ email, copied: dc.hireCopied, fallback: dc.hireFallback }}
            githubUrl={github ? getContactUrl(github) : undefined}
            repoUrl={siteRepoUrl}
          />
        )}
        <LanguageProvider lang={lang}>
          <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="theme">
            {/* Ambient Glow Background - Cinematic Lighting Effect */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" aria-hidden="true">
              {/* Massive center glow, matching the picture's lighting behind the hero */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[80vw] h-[800px] rounded-[100%] scale-[1.75] opacity-[0.14] md:scale-125 md:opacity-[0.29]" 
                   style={{ 
                     background: 'radial-gradient(ellipse closest-side at center, var(--color-burgundy-accent) 0%, transparent 100%)',
                   }} />
              
              {/* Subtle secondary glow at bottom right */}
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full scale-[1.75] opacity-[0.105] md:scale-125 md:opacity-[0.22]" 
                   style={{ background: 'radial-gradient(circle closest-side at center, var(--color-highlight) 0%, transparent 100%)' }} />
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
