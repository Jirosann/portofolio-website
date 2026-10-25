import type { CSSProperties } from 'react';
import { cookies } from 'next/headers';
import type { Project } from '@/lib/validation/schemas';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StackCards } from '@/components/molecules/StackCards';
import { StackIcon } from '@/components/atoms/StackIcon';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { getStack, normalizeTech } from '@/lib/content/stack';
import { getTools } from '@/lib/content/tools';

interface StackSectionProps {
  projects: Project[];
}

// Posisi kartu di kipas: --i/--y untuk satu baris, --j/--yj untuk dua baris (container sempit, `cols` per baris;
// baris terakhir bisa lebih pendek). Jarak dari tengah dikuadratkan untuk lengkung; nilainya angka tanpa satuan,
// CSS yang memberi deg/px.
function fanPosition(i: number, count: number, cols: number): CSSProperties {
  const i0 = i - (count - 1) / 2;
  const rowLen = Math.min(cols, count - Math.floor(i / cols) * cols);
  const j0 = (i % cols) - (rowLen - 1) / 2;
  return { '--i': i0, '--y': i0 * i0, '--j': j0, '--yj': j0 * j0 } as CSSProperties;
}

// Tanpa JS: "Used in" tampil di bawah setiap kartu dan tombol tetap nonaktif. Hanya berlaku saat skrip mati, jadi
// browser dengan JS selalu memakai tata letak flip sejak cat pertama (tanpa layout shift saat hidrasi).
const NO_SCRIPT_CSS = `
.sc-inner{transform:none!important;gap:.25rem}
.sc-face{-webkit-backface-visibility:visible;backface-visibility:visible}
.sc-back{grid-area:2/1;transform:none;visibility:visible!important;pointer-events:auto!important}
.sc-btn{cursor:default}`;

// Server component. Kartu dan ikon dirender di sini; StackCards (klien) mengaktifkan tombol flip, Esc, kilau,
// dan ketukan kartu Tools. Gaya berulang di globals.css (.sc-* kartu, .tl-* Tools I use), alasan sama dengan .mc-*.
export async function StackSection({ projects }: StackSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  const { columns, also } = getStack(projects);
  const tools = getTools();
  const toolCols = Math.ceil(tools.length / 2);
  // Yang sudah tampil di Tools I use tidak diulang di "Also worked with" (data skill tetap).
  const toolKeys = new Set(tools.map((tool) => normalizeTech(tool.name)));
  const alsoShown = also.filter((entry) => !toolKeys.has(normalizeTech(entry.name)));

  return (
    <section id="skills" className="section-y content-visibility-auto">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <div className="max-w-content mx-auto px-5">
        <SectionHeading section="skills" label={t.nav.skills} title={t.skills.title} description={t.skills.subtitle} />

        <StackCards className="sc-groups">
          {columns.map((col) => (
            <div key={col.id} className="sc-group">
              <h3 className="sc-label">{t.skills.columns[col.id]}</h3>
              <ul className="sc-grid">
                {col.entries.map((entry) => (
                  <li key={entry.id} className="sc">
                    <div className="sc-inner">
                      {/* Nonaktif sampai StackCards terpasang (lalu aktif dengan aria-expanded); tanpa JS tidak ada tombol mati di urutan Tab. */}
                      <button type="button" className="sc-face sc-front sc-btn" aria-controls={`sc-back-${entry.id}`} disabled>
                        <StackIcon name={entry.name} icon={entry.icon} />
                        <span className="sc-name">{entry.name}</span>
                        {/* Satu titik per proyek; jumlahnya dibacakan lewat teks sr-only ("used in 2 projects"). */}
                        <span className="sc-dots" aria-hidden="true">
                          {entry.projects.map((p) => (
                            <i key={p.slug} />
                          ))}
                        </span>
                        <span className="sr-only">
                          {`${t.skills.usedIn} ${(entry.projects.length === 1 ? t.skills.projectCountOne : t.skills.projectCountMany).replace(
                            '{n}',
                            String(entry.projects.length),
                          )}`}
                        </span>
                      </button>
                      <div id={`sc-back-${entry.id}`} className="sc-face sc-back">
                        <span className="sc-used">{t.skills.usedIn}</span>
                        <ul>
                          {entry.projects.map((p) => (
                            <li key={p.slug}>
                              <a href={`#project-${p.slug}`} className="sc-link">
                                {p.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {alsoShown.length > 0 && (
            <div className="sc-group sc-group--also">
              <h3 className="sc-label">{t.skills.alsoWorkedWith}</h3>
              <ul className="sc-also-grid">
                {alsoShown.map((entry) => (
                  <li key={entry.id} className="sc-also">
                    <StackIcon name={entry.name} icon={entry.icon} />
                    <span>{entry.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tools.length > 0 && (
            <div className="sc-group tl">
              <h3 className="sc-label">{t.skills.toolsTitle}</h3>
              <div className="tl-wrap">
                <ul className="tl-fan" style={{ '--n': tools.length, '--cols': toolCols } as CSSProperties}>
                  {tools.map((tool, i) => (
                    <li key={tool.id} style={fanPosition(i, tools.length, toolCols)}>
                      {/* Bukan tab stop (tidak ada aksi). Hover atau ketukan mengangkat kartu; nama selalu ada
                          di DOM, tersembunyi secara visual sampai kartu terangkat, jadi tetap terbaca screen reader. */}
                      <span className="tl-card">
                        <StackIcon name={tool.name} icon={tool.icon} />
                        <span className="tl-name">
                          {tool.name}
                          {tool.maker && <span className="tl-by">{tool.maker}</span>}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </StackCards>
      </div>
    </section>
  );
}
