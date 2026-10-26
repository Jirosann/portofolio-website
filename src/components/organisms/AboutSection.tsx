import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { Profile } from '@/types';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface AboutSectionProps {
  profile: Profile;
}

// Lebar potret: 192 px di ≥1024, 160 px di bawahnya (kolom 10rem/12rem, w-40 di HP).
const PORTRAIT_SIZES = '(min-width: 1024px) 192px, 160px';
const portraitSrcSet = (ext: 'avif' | 'webp') =>
  [320, 640].map((w) => `/about/portrait-${w}.${ext} ${w}w`).join(', ');

export async function AboutSection({ profile }: AboutSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  return (
    <section id="about" className="section-y">
      <Container>
        <SectionHeading section="about" label={t.nav.about} title={t.about.title} className="mb-8" />

        {/* Potret 4:5 di kiri teks (≥768), di atas paragraf di HP. Bingkai mengikuti kartu (radius, border, tanpa bayangan).
            Lazy dan di bawah hero, jadi bukan kandidat LCP. aspect-[4/5] berlaku ke border box (rasio dari atribut width/height
            hanya ke content box), jadi tingginya bulat 200/240 px dan section di bawahnya tidak bergeser setengah piksel. */}
        <div className="grid max-w-4xl gap-8 md:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
          <figure className="w-40 md:w-auto md:self-start">
            <picture>
              <source type="image/avif" srcSet={portraitSrcSet('avif')} sizes={PORTRAIT_SIZES} />
              <source type="image/webp" srcSet={portraitSrcSet('webp')} sizes={PORTRAIT_SIZES} />
              <img
                src="/about/portrait-640.webp"
                width={640}
                height={800}
                alt={t.about.photo.alt}
                loading="lazy"
                decoding="async"
                className="block aspect-[4/5] h-auto w-full rounded-[var(--radius-card)] border border-[var(--color-border)] object-cover"
              />
            </picture>
            <figcaption className="mt-3 font-mono text-xs leading-5 text-[var(--color-text-secondary)]">
              {t.modelCard.fig} 0 — {t.about.photo.caption}
            </figcaption>
          </figure>

          <div>
            <p className="text-lg md:text-xl leading-relaxed text-[var(--color-text-secondary)]">
              {t.about.description || (lang === 'id' && profile.aboutId) || profile.about}
            </p>

            {/* Fakta bersumber CV (lokasi, studi, bahasa); label dan nilai dari locale.
                Rentang tahun tidak dipotong; " ·" menempel ke kata sebelumnya (NBSP) agar baris baru tidak diawali pemisah. */}
            <dl className="mc-specs mt-8">
              {t.about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.value}
                    {'period' in fact && (
                      <>
                        {' · '}
                        <span className="whitespace-nowrap">{fact.period}</span>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
