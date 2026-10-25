import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Experience } from "@/types";
import { cookies } from "next/headers";
import { dictionaries, resolveLocale } from "@/lib/i18n";

interface ExperienceSectionProps {
  experiences: Experience[];
}

// Workshop dan seminar dilipat menjadi satu entri <details> (redesign-v2 §6.3).
const FOLDED_TYPES: Experience["type"][] = ["WORKSHOP", "SEMINAR"];

export async function ExperienceSection({
  experiences,
}: ExperienceSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  const t = dictionaries[lang];
  const id = lang === "id";

  // experiences sudah terurut `order` (getExperience)
  const visible = experiences.filter((exp) => exp.visible);
  const timeline = visible.filter((exp) => !FOLDED_TYPES.includes(exp.type));
  const workshops = visible.filter((exp) => FOLDED_TYPES.includes(exp.type));

  return (
    <section id="experience" className="section-y">
      <Container>
        <SectionHeading section="experience" label={t.nav.experience} title={t.experience.title} />

        {/* Kelas pendek .xp-* (globals.css), bukan utilitas Tailwind: alasan sama dengan .mc-* */}
        <ol className="xp-list">
          {timeline.map((exp) => (
            <li key={exp.id} className="xp-row">
              <p className="xp-date">{(id && exp.periodId) || exp.period}</p>
              <div>
                <h3 className="xp-role">{(id && exp.roleId) || exp.role}</h3>
                <p className="xp-org">
                  {(id && exp.organizationId) || exp.organization}
                  {exp.chip && <span className="mc-chip">{t.modelCard.chips[exp.chip]}</span>}
                </p>
                {exp.description && (
                  <p className="xp-desc">{(id && exp.descriptionId) || exp.description}</p>
                )}
              </div>
            </li>
          ))}

          {workshops.length > 0 && (
            <li>
              <details>
                <summary className="xp-row xp-summary">
                  <span className="xp-date">{t.experience.workshopsPeriod}</span>
                  <span className="xp-role">
                    {t.experience.workshops}
                    <svg className="xp-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <ul className="xp-sub">
                  {workshops.map((exp) => (
                    <li key={exp.id}>
                      <p className="xp-sub-title">{(id && exp.roleId) || exp.role}</p>
                      <p className="xp-sub-meta">
                        {(id && exp.organizationId) || exp.organization} · {(id && exp.periodId) || exp.period}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )}
        </ol>
      </Container>
    </section>
  );
}
