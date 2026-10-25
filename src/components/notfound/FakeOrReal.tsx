'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/i18n';
import type { FakeNewsModel } from '@/lib/fake-news/infer';
import { gameCopy } from '@/lib/fake-news/game-copy';
import { fullAccuracy, gameTitles, titleAccuracy, type GameTitle } from '@/lib/fake-news/game-titles';
import styles from './FakeOrReal.module.css';

// Teks dan judul diimpor di sini (chunk lazy), bukan dikirim sebagai props dari not-found.tsx: root not-found
// ikut diserialisasi di payload RSC setiap halaman, jadi props-nya akan terbayar di dokumen /.
interface FakeOrRealProps {
  lang: Language;
  cardHref: string;
}

type Label = GameTitle['label'];
// pReal per judul; 'loading' sampai loadEngine() selesai.
type Engine = ((title: string) => number) | 'loading' | 'error' | null;

const ROUND = 5;

function shuffle<T>(xs: T[]) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 2 atau 3 judul asli per ronde, sisanya palsu, urutan acak.
function pickRound(pool: GameTitle[]) {
  const nReal = Math.random() < 0.5 ? 2 : 3;
  const real = shuffle(pool.filter((t) => t.label === 'real')).slice(0, nReal);
  const fake = shuffle(pool.filter((t) => t.label === 'fake')).slice(0, ROUND - nReal);
  return shuffle([...real, ...fake]);
}

// infer.ts + bobot model, sama dengan panel "Try the model". Mengembalikan pReal untuk satu judul.
function loadEngine() {
  return Promise.all([
    import('@/lib/fake-news/infer'),
    fetch('/models/fake-news/model.json').then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<FakeNewsModel>;
    }),
  ]).then(([m, json]) => {
    const prepared = m.prepare(json);
    return (title: string) => m.predict(prepared, title).pReal;
  });
}

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k]));

// Game halaman 404 (sesi 12): pemain menebak 5 judul ISOT, lalu skornya dibandingkan dengan tebakan model atas judul yang sama.
// Dimuat oleh PlayFakeOrReal saat "Play" diklik, jadi ronde pertama langsung dimulai saat komponen dipasang.
export function FakeOrReal({ lang, cardHref }: FakeOrRealProps) {
  const copy = gameCopy[lang];
  const [round, setRound] = useState(() => pickRound(gameTitles));
  const [step, setStep] = useState(0);
  const [guesses, setGuesses] = useState<Label[]>([]);
  const [done, setDone] = useState(false);
  const [engine, setEngine] = useState<Engine>('loading');
  const [live, setLive] = useState('');
  const focusRef = useRef<HTMLElement | null>(null);
  const [focusKey, setFocusKey] = useState(0);

  const num = (n: number, digits: number) =>
    n.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const labelText = (l: Label) => (l === 'real' ? copy.real : copy.fake);

  // Fokus pindah ke judul/tombol berikutnya setelah setiap langkah, termasuk saat game baru dipasang.
  useEffect(() => {
    focusRef.current?.focus();
  }, [focusKey]);

  const fetchEngine = () =>
    loadEngine().then(
      (fn) => setEngine(() => fn),
      () => setEngine('error')
    );

  useEffect(() => {
    loadEngine().then(
      (fn) => setEngine(() => fn),
      () => setEngine('error')
    );
  }, []);

  const start = () => {
    setRound(pickRound(gameTitles));
    setStep(0);
    setGuesses([]);
    setDone(false);
    setLive('');
    if (engine === 'error') {
      setEngine('loading');
      fetchEngine();
    }
    setFocusKey((k) => k + 1);
  };

  const modelLabel = (title: string): Label | null =>
    typeof engine === 'function' ? (engine(title) > 0.5 ? 'real' : 'fake') : null;

  const guess = (g: Label) => {
    const item = round[step];
    setGuesses((gs) => [...gs, g]);
    const m = modelLabel(item.title);
    setLive(
      `${copy.you}: ${labelText(g)}, ${g === item.label ? copy.right : copy.wrong}. ${copy.isot}: ${labelText(item.label)}.` +
        (m ? ` ${copy.model}: ${labelText(m)}, ${m === item.label ? copy.right : copy.wrong}.` : '')
    );
    setFocusKey((k) => k + 1);
  };

  const next = () => {
    setLive('');
    if (step + 1 < ROUND) setStep(step + 1);
    else setDone(true);
    setFocusKey((k) => k + 1);
  };

  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };

  const scoreYou = guesses.filter((g, i) => g === round[i].label).length;
  const scoreModel = typeof engine === 'function' ? round.filter((t) => modelLabel(t.title) === t.label).length : null;

  const note = (
    <p className={styles.note}>
      {fill(copy.note, { title: `${num(titleAccuracy, 2)}%`, full: `${num(fullAccuracy, 2)}%` })}
    </p>
  );

  if (done) {
    return (
      <div className={styles.game}>
        <h2 ref={setFocus} tabIndex={-1} className={`${styles.score} font-serif`}>
          {scoreModel === null
            ? fill(copy.scoreNoModel, { a: scoreYou, total: ROUND })
            : fill(copy.score, { a: scoreYou, b: scoreModel, total: ROUND })}
        </h2>
        {engine === 'loading' && <p className={styles.muted}>{copy.loading}</p>}
        {engine === 'error' && <p className={styles.muted}>{copy.error}</p>}
        {note}
        <div className={styles.actions}>
          <Link href="/" className="mc-link mc-link--primary">
            {copy.home}
          </Link>
          <Link href={cardHref} className="mc-link">
            {copy.card}
          </Link>
          <button type="button" className="mc-link" onClick={start}>
            {copy.again}
          </button>
        </div>
      </div>
    );
  }

  const item = round[step];
  const answered = guesses.length > step;
  const g = guesses[step];
  const m = modelLabel(item.title);
  const verdict = (x: Label) => (
    <span className={x === item.label ? styles.right : styles.wrong}>
      <span aria-hidden="true">{x === item.label ? '✓ ' : '✗ '}</span>
      {x === item.label ? copy.right : copy.wrong}
    </span>
  );

  return (
    <div className={styles.game}>
      <p className={styles.progress}>{fill(copy.progress, { n: step + 1, total: ROUND })}</p>
      {/* Judul ISOT berbahasa Inggris, juga di halaman id */}
      <h2 ref={answered ? undefined : setFocus} tabIndex={-1} lang="en" className={`${styles.headline} font-serif`}>
        “{item.title}”
      </h2>

      {!answered ? (
        <fieldset className={styles.choices}>
          <legend className={styles.question}>{copy.question}</legend>
          <button type="button" className="mc-link" onClick={() => guess('real')}>
            {copy.real}
          </button>
          <button type="button" className="mc-link" onClick={() => guess('fake')}>
            {copy.fake}
          </button>
        </fieldset>
      ) : (
        <>
          <dl className={styles.reveal}>
            <div>
              <dt>{copy.isot}</dt>
              <dd>{labelText(item.label)}</dd>
            </div>
            <div>
              <dt>{copy.you}</dt>
              <dd>
                {labelText(g)} · {verdict(g)}
              </dd>
            </div>
            <div>
              <dt>{copy.model}</dt>
              <dd>
                {m ? (
                  <>
                    {labelText(m)} · {verdict(m)}
                    <span className={styles.p}> · p(real) {num(typeof engine === 'function' ? engine(item.title) : 0, 2)}</span>
                  </>
                ) : engine === 'error' ? (
                  copy.error
                ) : (
                  copy.loading
                )}
              </dd>
            </div>
          </dl>
          <button ref={setFocus} type="button" className="mc-link mc-link--primary" onClick={next}>
            {step + 1 < ROUND ? copy.next : copy.finish}
          </button>
        </>
      )}
      <p role="status" className="sr-only">
        {live}
      </p>
    </div>
  );
}
