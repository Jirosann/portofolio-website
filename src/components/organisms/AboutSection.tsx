import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { Profile } from '@/types';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface AboutSectionProps {
  profile: Profile;
}

export async function AboutSection({ profile }: AboutSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  return (
    <section id="about" className="section-y">
      <Container>
        <SectionHeading section="about" label={t.nav.about} title={t.about.title} className="mb-8" />

        <div className="max-w-3xl">
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
                      {' · '}
                      <span className="whitespace-nowrap">{fact.period}</span>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
