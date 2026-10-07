import { cn } from "@/lib/utils/cn";
import { SkillCard } from "@/components/molecules/SkillCard";
import { ScrollReveal } from "@/components/atoms/ScrollReveal";
import { AnimatedUnderline } from "@/components/atoms/AnimatedUnderline";
import { SkillsMarquee } from "@/components/molecules/SkillsMarquee";
import { getSkills } from "@/lib/content/skills";
import { ToolsRow } from "@/components/molecules/ToolsRow";
import { SkillsTooltip } from "@/components/molecules/SkillsTooltip";
import { cookies } from "next/headers";
import { dictionaries, resolveLocale } from "@/lib/i18n";

// PRD v1.2 Section 3: These 6 categories render as auto-scroll marquee
const MARQUEE_CATEGORY_IDS = [
  "frontend",
  "backend",
  "database",
  "api-security",
  "mobile",
  "ai-ml",
];

// Tool categories that go into the fan-row display
const TOOL_CATEGORY_IDS = ["ui-ux", "version-control", "testing", "devops"];

export async function SkillsBentoGrid() {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  const t = dictionaries[lang];

  const categories = getSkills();

  const marqueeCategories = categories.filter((c) =>
    MARQUEE_CATEGORY_IDS.includes(c.id),
  );
  const bentoCategories = categories.filter(
    (c) =>
      !MARQUEE_CATEGORY_IDS.includes(c.id) && !TOOL_CATEGORY_IDS.includes(c.id),
  );
  const toolSkills = categories
    .filter((c) => TOOL_CATEGORY_IDS.includes(c.id))
    .flatMap((c) => c.skills)
    .filter((s) => s.icon);

  return (
    <section
      id="skills"
      className="py-16 md:py-24 overflow-x-hidden content-visibility-auto"
    >
      <ScrollReveal className="max-w-content mx-auto px-5">
        <div className="mb-16">
          <h2
            className="text-4xl md:text-6xl font-black mb-4 tracking-tighter"
            style={{ color: "var(--color-text)" }}
          >
            {t.skills.title}
          </h2>
          <AnimatedUnderline className="w-16 h-1 rounded-full mb-6 bg-accent dark:bg-highlight" />
          <p
            className="text-lg md:text-xl font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t.skills.subtitle}
          </p>
        </div>

        {/* Marquee rows for combined categories */}
        {marqueeCategories.length > 0 && (
          <div className="mb-16 flex flex-col gap-8">
            <SkillsMarquee
              categoryName="Frontend & Mobile"
              skills={marqueeCategories
                .filter((c) => ["frontend", "mobile"].includes(c.id))
                .flatMap((c) => c.skills)
                .filter((s) => s.icon)}
              speed={1.2}
            />
            <SkillsMarquee
              categoryName="Backend, Data & AI"
              skills={marqueeCategories
                .filter((c) =>
                  ["backend", "database", "api-security", "ai-ml"].includes(
                    c.id,
                  ),
                )
                .flatMap((c) => c.skills)
                .filter((s) => s.icon)}
              speed={1.0}
            />
          </div>
        )}

        {/* Bento grid for remaining categories (if any) */}
        {bentoCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {bentoCategories.map((category) => {
              const primarySkills = category.skills.filter(
                (s) => s.primaryFocus,
              );
              const otherSkills = category.skills.filter(
                (s) => !s.primaryFocus,
              );
              const isPrimary = category.isPrimary;

              return (
                <div
                  key={category.id}
                  className={cn(
                    "bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-[16px] border border-[var(--border-color)] rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:border-[var(--color-highlight)] hover:-translate-y-1 flex flex-col",
                    isPrimary
                      ? "md:col-span-2 lg:col-span-2 lg:row-span-2"
                      : "col-span-1",
                  )}
                >
                  <h3
                    className="text-xl font-bold mb-6"
                    style={{ color: "var(--color-text)" }}
                  >
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    {primarySkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        variant="primary"
                      />
                    ))}
                    {otherSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {toolSkills.length > 0 && <ToolsRow tools={toolSkills} />}
      </ScrollReveal>
      <SkillsTooltip />
    </section>
  );
}
