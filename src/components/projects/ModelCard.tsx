import type { ReactNode } from 'react';
import type { Project, ModelCard as ModelCardData, ModelCardChip } from '@/lib/validation/schemas';
import type { Dictionary, Language } from '@/lib/i18n';
import { cn } from '@/lib/utils/cn';
import { activeDemoUrl } from '@/lib/content/projects';
import { tryModelCopy } from '@/lib/fake-news/copy';
import { TryModel } from './TryModel';

type CardProject = Project & { card: ModelCardData };
type Field = { key: string; label: string; value: ReactNode };

interface ModelCardProps {
  project: CardProject;
  variant: 'featured' | 'row';
  index: number;          // nomor P-NN, urutan di section
  figNumber?: number;     // nomor "Fig. N", hanya bila ada gambar
  lang: Language;
  t: Dictionary;
}

// Gaya yang berulang per baris/chip/tautan ada di globals.css (.mc-*), bukan string utilitas:
// komponen server ini ikut terserialisasi di HTML dan payload RSC, jadi string panjang terbayar dua kali.

// `sizes` mengikuti lebar kolom gambar: featured 7/12 kartu di ≥1280 (di bawahnya selebar kartu),
// row 4/12 di ≥1024 (di bawahnya selebar kontainer).
const SIZES = {
  featured: '(min-width: 1280px) 580px, (min-width: 768px) calc(100vw - 104px), calc(100vw - 80px)',
  row: '(min-width: 1200px) 360px, (min-width: 1024px) 31vw, calc(100vw - 40px)',
};

function Chip({ chip, label }: { chip: ModelCardChip; label: string }) {
  return <span className={chip === 'live' ? 'mc-chip mc-chip--live' : 'mc-chip'}>{label}</span>;
}

function Figure({ project, variant, figNumber, lang, t }: Omit<ModelCardProps, 'index'>) {
  const image = project.card.image;
  if (!image) return null;
  const srcSet = (ext: 'avif' | 'webp') => image.widths.map((w) => `${image.src}-${w}.${ext} ${w}w`).join(', ');
  const largest = Math.max(...image.widths);

  return (
    <figure className="reveal">
      <div className="model-card-frame overflow-hidden rounded-xl border border-[var(--color-hairline)]">
        <picture>
          <source type="image/avif" srcSet={srcSet('avif')} sizes={SIZES[variant]} />
          <source type="image/webp" srcSet={srcSet('webp')} sizes={SIZES[variant]} />
          <img
            src={`${image.src}-${largest}.webp`}
            width={image.width}
            height={image.height}
            alt={image.alt[lang]}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </div>
      <figcaption className="mt-3 font-mono text-xs leading-5 text-[var(--color-text-secondary)]">
        {t.modelCard.fig} {figNumber} — {image.caption[lang]}
      </figcaption>
    </figure>
  );
}

export function ModelCard({ project, variant, index, figNumber, lang, t }: ModelCardProps) {
  const { card } = project;
  const titleId = `project-${project.slug}-title`;
  const featured = variant === 'featured';
  const hasImage = !!card.image;
  const tm = tryModelCopy[lang];

  const candidates: (Field | undefined)[] = [
    card.data && { key: 'data', label: t.modelCard.fields.data, value: card.data[lang] },
    card.approach && { key: 'approach', label: t.modelCard.fields.approach, value: card.approach[lang] },
    card.result && {
      key: 'result',
      label: t.modelCard.fields.result,
      value: (
        <>
          <span className="block">
            <span className="font-serif text-4xl font-semibold leading-none tracking-tight text-[var(--color-text)]">
              {card.result.value[lang]}
            </span>{' '}
            <span className="text-[var(--color-text)]">{card.result.label[lang]}</span>
          </span>
          <span className="mt-1.5 block text-sm text-[var(--color-text-secondary)]">{card.result.context[lang]}</span>
        </>
      ),
    },
    card.role && { key: 'role', label: t.modelCard.fields.role, value: card.role[lang] },
    card.stack && { key: 'stack', label: t.modelCard.fields.stack, value: card.stack.items.join(' · ') },
  ];
  const fields = candidates.filter((f): f is Field => !!f);

  const header = (
    <header>
      <p className="flex flex-wrap items-center gap-2">
        <span className="mc-id">P-{String(index).padStart(2, '0')}</span>
        {card.chips.map((chip) => (
          <Chip key={chip} chip={chip} label={t.modelCard.chips[chip]} />
        ))}
      </p>
      <h3
        id={titleId}
        className={cn(
          'mt-3 font-serif font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] [text-wrap:balance]',
          featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
        )}
      >
        {project.title}
      </h3>
      {card.problem && (
        <p className="mt-3 max-w-prose text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
          {card.problem[lang]}
        </p>
      )}
    </header>
  );

  const specs = fields.length > 0 && (
    <dl className="mc-specs">
      {fields.map((f) => (
        <div key={f.key}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );

  const demoUrl = activeDemoUrl(project);
  const linkItems = (
    <>
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.projects.liveDemoFor.replace('{title}', project.title)}
          className="mc-link mc-link--primary"
        >
          {t.projects.liveDemo}
          <span aria-hidden="true">↗</span>
        </a>
      )}
      <a
        href={project.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.projects.viewCodeFor.replace('{title}', project.title)}
        className="mc-link"
      >
        {t.projects.viewCode}
        <span aria-hidden="true">↗</span>
      </a>
    </>
  );
  const links = <div className="flex flex-wrap gap-3">{linkItems}</div>;

  const figure = <Figure project={project} variant={variant} figNumber={figNumber} lang={lang} t={t} />;

  if (featured) {
    // Judul selebar kartu; di ≥1280 gambar kiri dan spesifikasi kanan di bawahnya. Di bawah 1280 bertumpuk:
    // kolom spesifikasi 5/12 terlalu sempit sehingga selalu jauh lebih tinggi dari gambar (QA bagian 10).
    return (
      <article
        id={`project-${project.slug}`}
        aria-labelledby={titleId}
        className={cn(
          'model-card grid gap-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-8 lg:p-10 xl:gap-x-10',
          hasImage && 'xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
        )}
      >
        <div className={cn(hasImage && 'xl:col-span-2')}>{header}</div>
        {figure}
        <div className="flex flex-col gap-6">
          {specs}
          {links}
        </div>
      </article>
    );
  }

  // Baris: dipisah hairline. Dengan gambar (≥1024): judul selebar baris, lalu spesifikasi 8/12 + gambar 4/12;
  // di bawahnya bertumpuk. Tanpa gambar (≥768): judul 5/12 + spesifikasi 7/12.
  return (
    <article
      id={`project-${project.slug}`}
      aria-labelledby={titleId}
      className={cn(
        'model-card grid content-start gap-6 border-t border-[var(--color-hairline)] py-10 md:py-12',
        hasImage ? 'lg:grid-cols-12 lg:gap-x-10' : 'md:grid-cols-12 md:gap-x-10'
      )}
    >
      {hasImage ? (
        // Urutan DOM = urutan mobile (judul, gambar, spesifikasi, tautan).
        <>
          <div className="lg:col-span-12">{header}</div>
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-2">{figure}</div>
          <div className="flex flex-col gap-6 lg:col-span-8 lg:col-start-1 lg:row-start-2">
            {specs}
            {links}
          </div>
        </>
      ) : (
        <>
          <div className="md:col-span-5">{header}</div>
          <div className="md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1">{specs}</div>
          {card.tryModel ? (
            // Tombol di baris tautan; panel (dimuat saat klik) selebar baris di bawahnya.
            <TryModel lang={lang} labels={{ button: tm.button, loading: tm.loading, error: tm.error }}>
              {linkItems}
            </TryModel>
          ) : (
            <div className="md:col-span-5 md:self-start">{links}</div>
          )}
        </>
      )}
    </article>
  );
}
