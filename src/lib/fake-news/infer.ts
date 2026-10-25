// Inferensi Fake News Detector di browser dari bobot asli (public/models/fake-news/model.json).
// Padanan persis clean_text di notebook/app.py + TfidfVectorizer(max_features=5000) + LogisticRegression scikit-learn.
// Kesetaraan dengan Python diuji oleh scripts/check-fake-news-parity.ts.

export interface FakeNewsModel {
  meta: { accuracy: number; testSize: number; sourceCommit: string; exportedAt: string; [key: string]: unknown };
  stopwords: string[];
  terms: string[];        // indeks term = posisi (vocabulary_ scikit-learn)
  idf: number[];
  coef: number[];         // koefisien kelas 1 (real)
  intercept: number;
}

export type Direction = 'real' | 'fake';

export interface TermInfluence {
  term: string;
  contribution: number;   // tfidf × koefisien; positif mendorong ke real
  dir: Direction;
}

export interface Prediction {
  pReal: number;
  label: Direction;
  knownTerms: number;     // jumlah term berbeda dari kosakata model; 0 = skor hanya dari intercept
  top: TermInfluence[];
}

// Regex dibuat lewat RegExp: target tsconfig ES2017 tidak mengenal escape \p{…} pada literal.
// \w dan \d Python (str, Unicode) = huruf (L*), angka (N*), underscore; \d = Nd.
const W = '[\\p{L}\\p{N}_]';
const BRACKETS = /\[[^\n]*?\]/g;                       // '.' Python hanya mengecualikan \n
const PUNCT = /[!-/:-@[-`{-~]/g;                      // string.punctuation (32 karakter ASCII)
const DIGIT_WORD = new RegExp(`${W}*\\p{Nd}${W}*`, 'gu');
// Whitespace str.split() Python: berbeda dari \s JS (\x1c-\x1f dan \x85 termasuk, ﻿ tidak).
const PY_SPACE = '[\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
const SPLIT = new RegExp(`${PY_SPACE}+`, 'u');
const SPLIT_KEEP = new RegExp(`(${PY_SPACE}+)`, 'u');
const TOKEN = new RegExp(`${W}{2,}`, 'gu');            // token_pattern (?u)\b\w\w+\b

export interface PreparedModel {
  model: FakeNewsModel;
  index: Map<string, number>;
  stop: Set<string>;
}

export function prepare(model: FakeNewsModel): PreparedModel {
  return { model, index: new Map(model.terms.map((t, i) => [t, i])), stop: new Set(model.stopwords) };
}

const stripWord = (s: string) => s.toLowerCase().replace(PUNCT, '').replace(DIGIT_WORD, '');

export function cleanText(text: string, stop: Set<string>): string {
  const t = text.toLowerCase().replace(BRACKETS, '').replace(PUNCT, '').replace(DIGIT_WORD, '');
  return t.split(SPLIT).filter((w) => w !== '' && !stop.has(w)).join(' ');
}

// TfidfVectorizer melakukan lowercase lagi sebelum tokenisasi.
const tokens = (clean: string) => clean.toLowerCase().match(TOKEN) ?? [];

export function predict(p: PreparedModel, text: string, k = 5): Prediction {
  const { model, index, stop } = p;
  const counts = new Map<number, number>();
  for (const tok of tokens(cleanText(text, stop))) {
    const j = index.get(tok);
    if (j !== undefined) counts.set(j, (counts.get(j) ?? 0) + 1);
  }

  let norm = 0;
  for (const [j, c] of counts) norm += (c * model.idf[j]) ** 2;
  norm = Math.sqrt(norm) || 1;

  let z = model.intercept;
  const contrib: { j: number; c: number }[] = [];
  for (const [j, c] of counts) {
    const v = ((c * model.idf[j]) / norm) * model.coef[j];
    z += v;
    contrib.push({ j, c: v });
  }
  // Urut |kontribusi| menurun, seri diputus indeks term menaik (sama dengan skrip ekspor).
  contrib.sort((a, b) => Math.abs(b.c) - Math.abs(a.c) || a.j - b.j);

  const pReal = 1 / (1 + Math.exp(-z));
  return {
    pReal,
    label: z > 0 ? 'real' : 'fake',
    knownTerms: counts.size,
    top: contrib.slice(0, k).map(({ j, c }) => ({ term: model.terms[j], contribution: c, dir: c > 0 ? 'real' : 'fake' })),
  };
}

export interface Segment {
  text: string;
  mark?: TermInfluence;
}

// Teks asli dipecah per kata (spasi tetap utuh). Kata ditandai bila salah satu token bersihnya termasuk `top`.
// Bagian di dalam [...] dibuang oleh model, jadi tidak ditandai.
export function highlight(p: PreparedModel, text: string, top: TermInfluence[]): Segment[] {
  const byTerm = new Map(top.map((t) => [t.term, t]));
  const hidden = new Uint8Array(text.length);
  for (const m of text.matchAll(BRACKETS)) hidden.fill(1, m.index, m.index + m[0].length);

  const out: Segment[] = [];
  let pos = 0;
  for (const part of text.split(SPLIT_KEEP)) {
    const start = pos;
    pos += part.length;
    if (part === '') continue;
    let visible = '';
    for (let i = 0; i < part.length; i++) if (!hidden[start + i]) visible += part[i];
    const word = stripWord(visible);
    const hit = word && !p.stop.has(word) ? (word.toLowerCase().match(TOKEN) ?? []).find((t) => byTerm.has(t)) : undefined;
    const mark = hit ? byTerm.get(hit) : undefined;
    const last = out[out.length - 1];
    if (!mark && last && !last.mark) last.text += part;
    else out.push(mark ? { text: part, mark } : { text: part });
  }
  return out;
}
