import { cookies } from 'next/headers';
import type { Project } from '@/lib/validation/schemas';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { getStack } from '@/lib/content/stack';

interface StackSectionProps {
  projects: Project[];
}

// Server component tanpa JS client. Gaya berulang di globals.css (.st-*), alasan sama dengan .mc-* di ModelCard.
export async function StackSection({ projects }: StackSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  const { columns, also } = getStack(projects);

  return (
    <section id="skills" className="section-y content-visibility-auto">
      <div className="max-w-content mx-auto px-5">
        <SectionHeading section="skills" label={t.nav.skills} title={t.skills.title} description={t.skills.subtitle} />

        <div className="st-grid">
          {columns.map((col) => (
            <div key={col.id} className="st-col">
              <h3 className="st-col-label">{t.skills.columns[col.id]}</h3>
              <ul>
                {col.entries.map((entry) => (
                  <li key={entry.name} className="st-entry">
                    <span className="st-name">{entry.name}</span>
                    <p className="st-used">
                      {t.skills.usedIn}{' '}
                      {/* Koma menempel di tautan sebelumnya, jadi pemisah tidak tertinggal sendirian saat baris dipecah. */}
                      {entry.projects.map((p, i) => (
                        <span key={p.slug}>
                          {i > 0 && ', '}
                          <a href={`#project-${p.slug}`} className="st-link">
                            {p.title}
                          </a>
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {also.length > 0 && (
          <div className="st-also">
            <h3 className="st-also-label">{t.skills.alsoWorkedWith}</h3>
            <ul>
              {also.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
