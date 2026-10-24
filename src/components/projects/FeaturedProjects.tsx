import { cookies } from 'next/headers';
import type { Project, ModelCard as ModelCardData } from '@/lib/validation/schemas';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { ModelCard } from './ModelCard';

interface FeaturedProjectsProps {
  projects: Project[];
}

// Server component: teks dari cookie locale (pola HeroSection), tanpa JS client.
export async function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  // Hanya proyek dengan model card; urutan dari card.order, bukan urutan file (dipakai tile hero).
  const cards = projects
    .filter((p): p is Project & { card: ModelCardData } => !!p.card)
    .sort((a, b) => a.card.order - b.card.order);

  // Nomor "Fig. N" mengikuti urutan gambar yang tampil.
  let fig = 0;
  const items = cards.map((project, i) => ({
    project,
    index: i + 1,
    figNumber: project.card.image ? ++fig : undefined,
    // card.featured tampil penuh lebar; sisanya baris.
    variant: project.card.featured ? ('featured' as const) : ('row' as const),
  }));
  const featured = items.filter((it) => it.variant === 'featured');
  const rows = items.filter((it) => it.variant === 'row');

  return (
    <section id="projects" className="section-y">
      <div className="max-w-content mx-auto px-5">
        <SectionHeading section="projects" label={t.nav.projects} title={t.projects.sectionTitle} description={t.projects.subtitle} />

        {featured.length > 0 && (
          <div className="flex flex-col gap-8">
            {featured.map((it) => (
              <ModelCard key={it.project.slug} {...it} lang={lang} t={t} />
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-12 border-b border-[var(--color-hairline)] md:mt-16">
            {rows.map((it) => (
              <ModelCard key={it.project.slug} {...it} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
