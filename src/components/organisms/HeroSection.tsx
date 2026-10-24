import { cookies } from 'next/headers';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ContactIcon, quickContactTypes } from '@/components/atoms/ContactIcon';
import { getContacts, getContactUrl } from '@/lib/content/contact';
import { getFeaturedProjects } from '@/lib/content/projects';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import type { Profile } from '@/types';

interface HeroSectionProps {
  profile: Profile;
}

const contactLabels: Record<(typeof quickContactTypes)[number], string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  whatsapp: 'WhatsApp',
};

const card = 'rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)]';

export async function HeroSection({ profile }: HeroSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  const contacts = getContacts().filter(
    (c): c is typeof c & { type: (typeof quickContactTypes)[number] } =>
      (quickContactTypes as readonly string[]).includes(c.type)
  );

  // Bukti kerja: proyek selesai, yang punya live demo di depan (sort stabil, urutan file tetap).
  const proof = getFeaturedProjects()
    .filter((p) => p.status === 'completed')
    .sort((a, b) => Number(!!b.liveUrl) - Number(!!a.liveUrl))
    .slice(0, 3);

  // Kalimat pertama contact.description (teks yang sudah ada di locale), bukan salinan baru.
  const availability = t.contact.description.split(/(?<=\.)\s/)[0];

  return (
    <Section className="pt-8 md:pt-14 lg:pt-10 pb-12 md:pb-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
          <div className={`${card} lg:col-span-8 p-6 md:p-10 lg:p-12`}>
            <hgroup>
              <p className="text-sm font-semibold tracking-wide uppercase mb-3 md:mb-4 text-[var(--color-eyebrow)]">
                {t.hero.position || profile.position}
              </p>
              <h1 className="font-serif font-semibold text-5xl md:text-7xl leading-[1.04] tracking-tight mb-4 text-[var(--color-text)] [text-wrap:balance]">
                {profile.name.replace('Al Qadri', '')}
                <span className="whitespace-nowrap">Al Qadri</span>
              </h1>
            </hgroup>

            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              {t.hero.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="group relative px-8 py-4 rounded-xl font-bold transition-all duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-95 motion-reduce:transition-none motion-reduce:transform-none bg-[var(--color-burgundy-accent)] text-[var(--color-on-primary)] hover:bg-[var(--color-burgundy)] dark:hover:bg-[color-mix(in_srgb,var(--color-burgundy-accent)_80%,var(--color-highlight)_20%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] flex items-center gap-2"
              >
                {t.hero.viewProjects}
                <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href={profile.cv || '#'}
                download={profile.cv ? "MUHAMMAD NABIL AL QADRI - CV.pdf" : undefined}
                className="group px-8 py-4 rounded-xl font-bold transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] border border-[color-mix(in_srgb,var(--color-text)_30%,transparent)] hover:border-[color-mix(in_srgb,var(--color-text)_50%,transparent)]"
                style={{
                  background: 'transparent',
                  color: 'var(--color-text)',
                }}
              >
                {t.hero.downloadCV}
                <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:-translate-y-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>

              <a
                href="#contact"
                className="group px-4 py-4 font-bold transition-all duration-200 ease-out motion-reduce:transition-none text-[var(--color-eyebrow)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] flex items-center gap-2 flex-[1_0_100%] md:flex-none -ml-4 md:ml-0"
              >
                {t.hero.contactMe}
                <svg className="w-4 h-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Status + kanal kontak: di bawah lg hanya ikon 44 px; di lg ikon + label + alamat, daftar rata bawah */}
          <div className={`${card} lg:col-span-4 p-5 md:p-6 flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-6 lg:flex-col lg:items-stretch lg:gap-5`}>
            <div className="md:flex-1 md:min-w-0">
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                <span className="w-2 h-2 rounded-full motion-safe:animate-pulse" style={{ background: 'var(--color-highlight)' }} aria-hidden="true"></span>
                <span className="text-sm font-semibold tracking-wide uppercase text-[var(--color-eyebrow)]">
                  {t.hero.available}
                </span>
              </p>
              <p className="hidden md:block mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {availability}
              </p>
            </div>

            <ul aria-label={t.nav.contact} className="flex gap-2 shrink-0 lg:flex-col lg:gap-3">
              {contacts.map((contact) => {
                const external = contact.type !== 'email';
                const label = contactLabels[contact.type];
                return (
                  <li key={contact.type}>
                    <a
                      href={getContactUrl(contact)}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      aria-label={`${label} ${contact.value}${external ? ` ${t.contactLabel.opensInNewTab}` : ''}`}
                      className={`group flex items-center justify-center lg:justify-start gap-3 w-11 h-11 lg:w-auto lg:h-auto lg:min-h-11 lg:px-3 lg:py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:border-[var(--color-eyebrow)] ${focusRing}`}
                    >
                      <ContactIcon type={contact.type} className="w-5 h-5 shrink-0 text-[var(--color-eyebrow)]" />
                      <span className="hidden lg:flex lg:flex-col lg:min-w-0">
                        <span className="text-sm font-semibold leading-tight">{label}</span>
                        <span className="text-sm leading-tight truncate" style={{ color: 'var(--color-text-secondary)' }}>{contact.value}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {proof.length > 0 && (
            <div className="lg:col-span-12 mt-2 md:mt-4">
              <p id="hero-proof" className="text-sm font-semibold tracking-wide uppercase mb-3 text-[var(--color-eyebrow)]">
                {t.projects.title}
              </p>
              {/* HP: satu proyek per baris (nama kiri, aksi kanan); md ke atas: 3 tile */}
              <ul aria-labelledby="hero-proof" className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-4">
                {proof.map((project) => {
                  const href = project.liveUrl ?? project.repoUrl;
                  return (
                    <li key={project.slug}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center justify-between gap-3 min-h-11 rounded-xl md:rounded-2xl border bg-[var(--color-surface)] px-4 py-2.5 md:flex-col md:items-start md:justify-start md:h-full md:p-5 transition-colors hover:border-[var(--color-eyebrow)] ${project.liveUrl ? 'border-[var(--color-eyebrow)]' : 'border-[var(--color-border)]'} ${focusRing}`}
                      >
                        <span className="min-w-0">
                          <span className="block text-base md:text-lg font-bold leading-snug text-[var(--color-text)]">
                            {project.title}
                          </span>
                          <span className="hidden md:block mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }} aria-hidden="true">
                            {project.tags.slice(0, 3).join(' · ')}
                          </span>
                        </span>
                        <span className="shrink-0 md:mt-auto md:pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-eyebrow)] group-hover:underline">
                          {project.liveUrl ? (
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          ) : (
                            <ContactIcon type="github" className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {project.liveUrl ? t.projects.liveDemo : t.projects.viewCode}
                        </span>
                        <span className="sr-only">{t.contactLabel.opensInNewTab}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
