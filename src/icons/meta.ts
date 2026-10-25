// Data tampilan ikon #skills, dipakai StackIcon dan scripts/export-icons.tsx. Kunci = kunci getIcon.

/** Logo monokrom (fill currentColor/hitam di <img>): dibalik di tema gelap lewat CSS (.stack-icon--mono). */
export const MONO = new Set(['GitHub', 'Flask', 'Nextjs']);

/** Ikon berwarna dengan bagian gelap yang tenggelam di kartu gelap: export-icons menulis <kunci>-dark.svg dengan
 *  warna ini diganti, dan StackIcon memasang kedua berkas (satu disembunyikan per tema). */
export const DARK: Record<string, Record<string, string>> = {
  GNUBash: { '#293138': '#d5dbe0' },
  Scikitlearn: { '#010101': '#e8e3e0' },
  OpenAPI: { '#3f3f42': '#d4d4d8', '#4c5930': '#b7c78f' },
  Playwright: { '#2D4552': '#a9c1cf' },
  Java: { '#0074BD': '#5aa7e3' },
};

/** Kebalikan DARK: warna terang yang hilang di kartu putih diganti di <kunci>.svg; <kunci>-dark.svg memakai warna asli.
 *  React: warna logo react.dev untuk latar terang. Komponen TechIcons tidak diubah (TechTag merender inline). */
export const LIGHT: Record<string, Record<string, string>> = {
  React: { '#61DAFB': '#087EA4' },
};

/** Logo yang tinta gelapnya bagian dari merek (badan Tux, jas Jenkins): garis tepi terang tipis di tema gelap. */
export const HALO = new Set(['Linux', 'Jenkins']);

/** Glyph (bukan logo) dirender sebagai mask CSS dengan warna aksen, jadi mengikuti tema. */
export const GLYPH = new Set(['FileText']);

/** Skala optis: sqrt(lebar x tinggi) bbox tinta disamakan ke 0,92 kotak, sisi terpanjang <= 1,1 kotak,
 *  dibulatkan ke 0,05 (diukur dari public/icons). Ikon yang tidak tercantum: 1. */
export const SCALE: Record<string, number> = {
  Pytest: 1.65,
  Playwright: 1.25,
  Kotlin: 1.2,
  Docker: 1.15,
  Golang: 1.15,
  MongoDB: 1.15,
  Python: 1.15,
  Figma: 1.1,
  FileText: 1.1,
  Flask: 1.1,
  Java: 1.1,
  Jenkins: 1.1,
  Linux: 1.1,
  Sass: 1.1,
  Scikitlearn: 1.1,
  TailwindCSS: 1.1,
  Git: 0.95,
  JavaScript: 0.95,
  Supabase: 0.95,
  Swift: 0.95,
  TypeScript: 0.95,
  Vitest: 0.95,
  FastAPI: 0.9,
  InsightFace: 0.9,
  JUnit: 0.9,
  Keras: 0.9,
  MediaPipe: 0.9,
  Nextjs: 0.9,
  OpenAPI: 0.9,
  SpringBoot: 0.9,
};
