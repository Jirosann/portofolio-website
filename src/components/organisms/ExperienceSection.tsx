import fs from "fs";
import path from "path";
import { Container } from "@/components/layout/Container";
import { AnimatedUnderline } from "@/components/atoms/AnimatedUnderline";
import { ScrollReveal } from "@/components/atoms/ScrollReveal";
import { getProfile } from "@/lib/content/profile";
import { getCompletedProjectsCount } from "@/lib/content/projects";
import type { Experience } from "@/types";
import { cookies } from "next/headers";
import { dictionaries, resolveLocale } from "@/lib/i18n";

interface ExperienceSectionProps {
  experiences: Experience[];
}

interface WhatIBuildItem {
  title: string;
  description: string;
  tags: string[];
}

function getWhatIBuild(): WhatIBuildItem[] {
  const filePath = path.join(process.cwd(), "content/site/what-i-build.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as WhatIBuildItem[];
  } catch {
    return [];
  }
}

export async function ExperienceSection({
  experiences,
}: ExperienceSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  const t = dictionaries[lang];

  const visibleExperiences = experiences.filter((exp) => exp.visible);
  const profile = getProfile();
  const whatIBuild = getWhatIBuild();

  const projectsAndOrgs = visibleExperiences.filter((exp) =>
    ["kasirai-cofounder", "bnec-hrd", "bncc-bnec-committee"].includes(exp.id),
  );
  const workshops = visibleExperiences.filter((exp) =>
    [
      "advanced-tech-ai-workshops",
      "agile-software-design",
      "global-strategy-seminars",
    ].includes(exp.id),
  );

  // Count published projects for the auto-computed card
  const publishedCount = getCompletedProjectsCount();

  return (
    <section id="experience" className="py-16 md:py-24 content-visibility-auto">
      <Container>
        <div className="pt-12 md:pt-16 mb-16">
          <h2
            className="text-4xl md:text-6xl font-black mb-4 tracking-tighter"
            style={{ color: "var(--color-text)" }}
          >
            {t.experience.title}
          </h2>
          <AnimatedUnderline className="w-16 h-1 rounded-full mb-6 bg-accent dark:bg-highlight" />
          <p
            className="text-lg md:text-xl font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Highlighting my engineering journey, technical projects, and
            collaborative experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Block 1: Current Status (col-span-4) */}
          <ScrollReveal
            className="col-span-1 lg:col-span-4 flex flex-col gap-6"
            delay={100}
          >
            <div className="bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 transition-all duration-300 hover:border-[var(--color-highlight)] hover:-translate-y-1 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)] flex flex-col justify-center flex-1 min-h-[180px]">
              <div className="text-xs font-bold tracking-widest mb-3 text-[var(--color-highlight)] uppercase">
                {t.experience.currentStatus}
              </div>
              <div className="text-xl font-bold text-[var(--color-text)]">
                Software Engineering Student, BINUS University
              </div>
              <div className="text-sm mt-2 text-[var(--color-text-secondary)]">
                Sep 2024 — Expected 2028
              </div>
            </div>

            <div className="bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 transition-all duration-300 hover:border-[var(--color-highlight)] hover:-translate-y-1 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)] flex flex-col justify-center items-center text-center flex-1 min-h-[160px]">
              <div className="text-xs font-bold tracking-widest mb-2 text-[var(--color-highlight)] uppercase">
                BUILT
              </div>
              <div className="text-6xl font-black text-[var(--color-text)] tracking-tighter">
                {publishedCount}
              </div>
              <div className="text-sm mt-1 text-[var(--color-text-secondary)] font-medium uppercase tracking-widest">
                Completed Project{publishedCount !== 1 ? "s" : ""}
              </div>
            </div>
          </ScrollReveal>

          {/* Block 2: What I Build (col-span-8) */}
          {whatIBuild.length > 0 && (
            <ScrollReveal
              className="col-span-1 lg:col-span-8 flex flex-col"
              delay={200}
            >
              <div className="bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 transition-all duration-300 hover:border-[var(--color-highlight)] hover:-translate-y-1 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)] flex flex-col flex-grow">
                <div className="text-xs font-bold tracking-widest mb-6 text-[var(--color-highlight)] uppercase">
                  {t.experience.whatIBuild}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-grow">
                  {whatIBuild.map((item, index) => (
                    <div key={index} className="flex flex-col h-full">
                      <h3 className="text-xl font-bold mb-3 text-[var(--color-text)]">
                        {item.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] mb-5 flex-grow leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs font-semibold rounded-full bg-[color-mix(in_srgb,var(--color-text)6%,transparent)] text-[var(--color-text)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Block 3: Education */}
          {profile.education && profile.education.length > 0 && (
            <ScrollReveal className="col-span-1 lg:col-span-12" delay={300}>
              <div className="bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 transition-all duration-300 hover:border-[var(--color-highlight)] hover:-translate-y-1 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)]">
                <div className="text-xs font-bold tracking-widest mb-6 text-[var(--color-highlight)] uppercase">
                  {t.experience.education}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="flex flex-col h-full">
                      <div className="flex flex-col xl:flex-row xl:items-baseline xl:justify-between gap-1 mb-2">
                        <h3 className="text-lg font-bold text-[var(--color-text)]">
                          {edu.degree}
                        </h3>
                        <span className="text-sm font-mono text-[var(--color-text-secondary)]">
                          {edu.year}
                        </span>
                      </div>
                      <p className="text-base font-semibold mb-4 text-[var(--color-text-secondary)]">
                        {edu.institution}
                      </p>
                      {edu.coursework && edu.coursework.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {edu.coursework.map((course) => (
                            <span
                              key={course}
                              className="px-3 py-1 text-xs font-semibold rounded-full bg-[color-mix(in_srgb,var(--color-text)6%,transparent)] text-[var(--color-text)]"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Block 4 & 5: Experience & Workshops (Bento Cards) */}
          {[...projectsAndOrgs, ...workshops].map((exp, idx) => (
            <ScrollReveal
              key={exp.id}
              className="col-span-1 lg:col-span-6 flex flex-col"
              delay={(4 + idx) * 100}
            >
              <div className="bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)] hover:border-[var(--color-highlight)] flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[color-mix(in_srgb,var(--color-highlight)15%,transparent)] text-[var(--color-highlight)]">
                    {exp.type}
                  </span>
                  <span className="text-sm font-mono text-[var(--color-text-secondary)] text-right">
                    {exp.period}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1 text-[var(--color-text)]">
                  {exp.role}
                </h3>
                <p className="text-lg font-medium text-[var(--color-text-secondary)] mb-4">
                  {exp.organization}
                </p>

                {exp.description && (
                  <p className="leading-relaxed text-[var(--color-text-secondary)] mb-5">
                    {exp.description}
                  </p>
                )}

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul
                    className="list-disc pl-5 space-y-2 mb-6"
                    aria-label="Key highlights"
                  >
                    {exp.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="text-[var(--color-text-secondary)] leading-relaxed"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-[color-mix(in_srgb,var(--color-text)6%,transparent)] text-[var(--color-text)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
