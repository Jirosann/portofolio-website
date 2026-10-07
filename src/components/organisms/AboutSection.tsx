import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { AnimatedUnderline } from '@/components/atoms/AnimatedUnderline';
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
    <Section id="about" className="relative">
      <Container>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main About Card */}
          <div className="flex-[2] group relative p-8 md:p-12 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none"
               style={{
                 background: 'var(--color-surface)',
                 borderColor: 'var(--color-border)',
                 borderWidth: '1px',
               }}>
            {/* Glowing orb behind text */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[60px] pointer-events-none"
                 style={{ background: 'var(--color-highlight)' }} />
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight"
                style={{ color: 'var(--color-text)' }}>
              {t.about.title}
            </h2>
            <AnimatedUnderline className="w-16 h-1 mb-8 rounded-full bg-accent dark:bg-highlight" />
            
            <p className="text-lg md:text-xl leading-relaxed relative z-10 whitespace-pre-line"
               style={{ color: 'var(--color-text-secondary)' }}>
              {t.about.description || profile.about}
            </p>
          </div>

          {/* Stats Bento Column */}
          <div className="flex-[1] flex flex-col gap-6">
            {/* Stat 1 */}
            <div className="flex-1 group relative p-8 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none flex flex-col justify-center items-center text-center"
                 style={{
                   background: 'var(--color-surface)',
                   borderColor: 'var(--color-border)',
                   borderWidth: '1px',
                 }}>
              <div className="text-5xl md:text-6xl font-black mb-2 tracking-tighter" style={{ color: 'var(--color-highlight)' }}>
                10+
              </div>
              <div className="text-sm font-bold tracking-widest uppercase text-[var(--color-eyebrow)]">
                Technologies
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex-1 group relative p-8 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none flex flex-col justify-center items-center text-center"
                 style={{
                   background: 'var(--color-surface)',
                   borderColor: 'var(--color-border)',
                   borderWidth: '1px',
                 }}>
              <div className="text-5xl md:text-6xl font-black mb-2 tracking-tighter" style={{ color: 'var(--color-highlight)' }}>
                2028
              </div>
              <div className="text-sm font-bold tracking-widest uppercase text-[var(--color-eyebrow)]">
                Expected Graduation
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
