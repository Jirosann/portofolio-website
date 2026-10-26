'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Language } from '@/lib/i18n';
import { prepare, predict, highlight, type FakeNewsModel, type Prediction } from '@/lib/fake-news/infer';
import { tryModelCopy } from '@/lib/fake-news/copy';
import { samples } from '@/lib/fake-news/samples';
import s from './TryModelPanel.module.css';

interface TryModelPanelProps {
  model: FakeNewsModel;
  lang: Language;
  open: boolean;
}

type Outcome = { kind: 'empty' } | { kind: 'unknown' } | { kind: 'ok'; text: string; pred: Prediction };

// Dimuat lambat oleh TryModel. Kelas dari CSS module (bukan utilitas Tailwind) agar CSS awal halaman tidak bertambah.
export function TryModelPanel({ model, lang, open }: TryModelPanelProps) {
  const t = tryModelCopy[lang];
  const id = useId();
  const prepared = useMemo(() => prepare(model), [model]);
  const [text, setText] = useState('');
  // Label ISOT contoh yang sedang dimuat; hilang begitu pengguna mengubah teks.
  const [sampleLabel, setSampleLabel] = useState<'real' | 'fake' | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  // Fokus ke textarea setiap panel dibuka (termasuk saat bobot selesai dimuat).
  useEffect(() => {
    if (open) area.current?.focus();
  }, [open]);

  const pct = useMemo(() => {
    const f = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return (p: number) => (p > 0.999 ? `>${f.format(0.999)}` : p < 0.001 ? `<${f.format(0.001)}` : f.format(p));
  }, [lang]);

  const run = (value: string) => {
    if (!value.trim()) return setOutcome({ kind: 'empty' });
    const pred = predict(prepared, value);
    setOutcome(pred.knownTerms === 0 ? { kind: 'unknown' } : { kind: 'ok', text: value, pred });
  };

  const counter = { real: 0, fake: 0 };
  const sampleButtons = samples.map((sample, i) => {
    const n = ++counter[sample.label];
    const value = `${sample.title}\n\n${sample.text}`;
    return (
      <button
        key={i}
        type="button"
        className={s.sample}
        onClick={() => {
          setText(value);
          setSampleLabel(sample.label);
          run(value);
        }}
      >
        {t.sample[sample.label].replace('{n}', String(n))}
      </button>
    );
  });

  let live = '';
  if (outcome?.kind === 'empty') live = t.empty;
  else if (outcome?.kind === 'unknown') live = t.unknown;
  else if (outcome?.kind === 'ok') {
    const { pred } = outcome;
    const p = pred.label === 'real' ? pred.pReal : 1 - pred.pReal;
    live = t.live.replace('{label}', t.label[pred.label]).replace('{p}', pct(p));
  }

  return (
    <section className={s.panel} aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`} className={s.eyebrow}>{t.eyebrow}</p>

      <form
        className={s.form}
        onSubmit={(e) => {
          e.preventDefault();
          run(text);
        }}
      >
        <label htmlFor={`${id}-text`} className={s.label}>{t.textareaLabel}</label>
        <p id={`${id}-hint`} className={s.hint}>{t.hint}</p>
        {sampleLabel && (
          <p id={`${id}-isot`} className={s.isot}>
            {t.isotLabel.replace('{label}', t.label[sampleLabel].toLowerCase())}
          </p>
        )}
        <textarea
          id={`${id}-text`}
          ref={area}
          className={s.textarea}
          rows={6}
          lang="en"
          spellCheck={false}
          aria-describedby={sampleLabel ? `${id}-hint ${id}-isot` : `${id}-hint`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSampleLabel(null);
          }}
        />
        <div role="group" aria-labelledby={`${id}-samples`} className={s.samples}>
          <span id={`${id}-samples`} className={s.samplesLabel}>{t.samples}</span>
          <div className={s.sampleRow}>{sampleButtons}</div>
        </div>
        <div>
          <button type="submit" className="mc-link mc-link--primary">{t.run}</button>
        </div>
      </form>

      <p aria-live="polite" className={outcome?.kind === 'ok' ? s.srOnly : s.message}>{live}</p>

      {outcome?.kind === 'ok' && <Result outcome={outcome} t={t} pct={pct} prepared={prepared} id={id} />}

      <div className={s.note}>
        {t.note.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}

function Result({
  outcome,
  t,
  pct,
  prepared,
  id,
}: {
  outcome: Extract<Outcome, { kind: 'ok' }>;
  t: (typeof tryModelCopy)[Language];
  pct: (p: number) => string;
  prepared: ReturnType<typeof prepare>;
  id: string;
}) {
  const { pred, text } = outcome;
  const segments = useMemo(() => highlight(prepared, text, pred.top), [prepared, text, pred.top]);
  const p = pred.label === 'real' ? pred.pReal : 1 - pred.pReal;

  return (
    <div className={s.result}>
      <div>
        <p className={s.verdict}>
          <span className={s.verdictValue}>{pct(p)}</span> {t.label[pred.label]}
        </p>
        <div className={s.bar} aria-hidden="true">
          <span className={s.barReal} style={{ width: `${pred.pReal * 100}%` }} />
          <span className={s.barFake} />
        </div>
        <p className={s.barLabels}>
          <span>{t.label.real} {pct(pred.pReal)}</span>
          <span>{t.label.fake} {pct(1 - pred.pReal)}</span>
        </p>

        <h4 className={s.subhead}>
          {pred.top.length === 1 ? t.top.one : t.top.other.replace('{n}', String(pred.top.length))}
        </h4>
        <ol className={s.terms}>
          {pred.top.map((term) => (
            <li key={term.term} data-dir={term.dir}>
              <span className={s.term}>{term.term}</span>
              <span className={s.toward}>{t.toward.replace('{label}', t.label[term.dir].toLowerCase())}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h4 id={`${id}-marked`} className={s.subhead}>{t.highlight}</h4>
        <p className={s.legend}>{t.legend}</p>
        {/* Bisa di-scroll: tabIndex agar terjangkau keyboard. */}
        <div className={s.marked} tabIndex={0} role="region" aria-labelledby={`${id}-marked`}>
          {segments.map((seg, i) =>
            seg.mark ? (
              <mark key={i} data-dir={seg.mark.dir}>{seg.text}</mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
