import type { Project, ModelCard } from '@/lib/validation/schemas';
import { getSkills } from '@/lib/content/skills';

// Urutan baris kartu di #skills. Kolom "Tools" dihapus di sesi 10 (keputusan pemilik): alat harian tampil di
// Tools I use, dan kategori alat/infra masuk "Backend & infra" (Docker satu-satunya yang punya proyek).
export const STACK_COLUMNS = ['languages', 'web', 'backend', 'ai'] as const;
export type StackColumnId = (typeof STACK_COLUMNS)[number];

// Kolom bawaan per kategori data; OVERRIDES memindahkan skill tertentu (mis. bahasa yang dicatat di kategori backend).
const CATEGORY_COLUMN: Record<string, StackColumnId> = {
  frontend: 'web',
  mobile: 'languages',
  backend: 'backend',
  database: 'backend',
  'api-security': 'backend',
  'ai-ml': 'ai',
  'ui-ux': 'backend',
  'version-control': 'backend',
  testing: 'backend',
  devops: 'backend',
};
const OVERRIDES: Record<string, StackColumnId> = {
  python: 'languages',
  java: 'languages',
  go: 'languages',
  javascript: 'languages',
  typescript: 'languages',
  'react-native': 'web',
};

// Penulisan lain yang tidak tertangkap norm() (mis. singkatan).
const ALIASES: Record<string, string> = {
  sklearn: 'scikitlearn',
  golang: 'go',
  js: 'javascript',
  ts: 'typescript',
  html5: 'html',
  css3: 'css',
  postgres: 'postgresql',
  node: 'nodejs',
  reactjs: 'react',
};

/** "Next.js"/"NextJS" -> "nextjs", "Scikit-Learn" -> "scikitlearn", "InsightFace (Buffalo_L)" -> "insightface". */
export function normalizeTech(name: string): string {
  const key = name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9+#]/g, '');
  return ALIASES[key] ?? key;
}

type CardProject = Project & { card: ModelCard };

export interface StackProjectRef {
  slug: string;
  title: string;
}
export interface StackEntry {
  id: string; // id skill pertama dengan nama ini (dipakai untuk id elemen kartu)
  name: string;
  icon?: string; // kunci getIcon; tanpa ikon -> monogram
  projects: StackProjectRef[];
}
export interface StackColumn {
  id: StackColumnId;
  entries: StackEntry[]; // hanya teknologi yang dipakai proyek di halaman
}
export interface StackMatch {
  project: string;
  item: string;
  skill: string | null; // null: tidak ada di data skill
}

export function getStack(projects: Project[]) {
  // Sama dengan FeaturedProjects: hanya proyek ber-model card, urut card.order, field Stack yang tampil di kartu.
  const cards = projects
    .filter((p): p is CardProject => !!p.card)
    .sort((a, b) => a.card.order - b.card.order);

  // Visibilitas hanya dari `visible` di skills.json (sudah disaring getSkills), tidak dari ada/tidaknya ikon.
  const skills = getSkills().flatMap((c) => c.skills);

  const matches: StackMatch[] = [];
  const usedBy = new Map<string, StackProjectRef[]>(); // kunci: norm(nama skill)
  for (const p of cards) {
    for (const item of p.card.stack?.items ?? []) {
      const key = normalizeTech(item);
      const skill = skills.find((s) => normalizeTech(s.name) === key || normalizeTech(s.id) === key);
      matches.push({ project: p.title, item, skill: skill?.name ?? null });
      if (!skill) continue;
      const k = normalizeTech(skill.name);
      const list = usedBy.get(k) ?? [];
      if (!list.some((r) => r.slug === p.slug)) list.push({ slug: p.slug, title: p.title });
      usedBy.set(k, list);
    }
  }

  // Satu entri per nama per kolom (Java dan Java mobile digabung).
  const byColumn = new Map<StackColumnId, StackEntry[]>(STACK_COLUMNS.map((id) => [id, []]));
  for (const s of skills) {
    const column = OVERRIDES[s.id] ?? CATEGORY_COLUMN[s.categoryId] ?? 'backend';
    const entries = byColumn.get(column)!;
    const k = normalizeTech(s.name);
    if (entries.some((e) => normalizeTech(e.name) === k)) continue;
    entries.push({ id: s.id, name: s.name, icon: s.icon, projects: usedBy.get(k) ?? [] });
  }

  // Bukti terbanyak dulu; sort stabil, jadi seri tetap mengikuti urutan data.
  const columns: StackColumn[] = STACK_COLUMNS.map((id) => ({
    id,
    entries: byColumn
      .get(id)!
      .filter((e) => e.projects.length > 0)
      .sort((a, b) => b.projects.length - a.projects.length),
  })).filter((c) => c.entries.length > 0);
  const also = STACK_COLUMNS.flatMap((id) => byColumn.get(id)!.filter((e) => e.projects.length === 0));

  return { columns, also, matches };
}
