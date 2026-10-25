// Uji kesetaraan Python (pipeline_fake_news.pkl) vs src/lib/fake-news/infer.ts.
// usage: npx tsx scripts/check-fake-news-parity.ts <fixtures dir dari export-fake-news-model.py> [model.json]
// Lolos bila prediksi sama ≥ 99,5% dan max |Δp| ≤ 0,001 (300 artikel uji). Exit 1 bila gagal.
import fs from 'fs';
import path from 'path';
import { prepare, predict, cleanText, type FakeNewsModel } from '../src/lib/fake-news/infer';

interface Fixture {
  text: string;
  label: number;
  pReal: number;
  top5: { term: string; contribution: number }[];
  clean?: string;
  nnz?: number;
}

const [dir, modelPath = 'public/models/fake-news/model.json'] = process.argv.slice(2);
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8')) as FakeNewsModel;
const p = prepare(model);
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Fixture[];

function run(name: string, rows: Fixture[]) {
  let same = 0, correct = 0, topSame = 0, cleanSame = 0, maxDp = 0, worst = -1;
  rows.forEach((r, i) => {
    const out = predict(p, r.text);
    const pyLabel = r.pReal > 0.5 ? 1 : 0;
    if ((out.label === 'real' ? 1 : 0) === pyLabel) same++;
    if ((out.label === 'real' ? 1 : 0) === r.label) correct++;
    const dp = Math.abs(out.pReal - r.pReal);
    if (dp > maxDp) { maxDp = dp; worst = i; }
    if (out.top.map((t) => t.term).join() === r.top5.map((t) => t.term).join()) topSame++;
    if (r.clean !== undefined && cleanText(r.text, p.stop) === r.clean) cleanSame++;
  });
  const n = rows.length;
  console.log(`${name}: n=${n}`);
  console.log(`  prediksi sama ${same}/${n} (${((same / n) * 100).toFixed(2)}%)`);
  console.log(`  max |Δp| ${maxDp.toExponential(3)} (baris ${worst})`);
  console.log(`  top-5 term sama (urutan) ${topSame}/${n}`);
  if (rows[0]?.clean !== undefined) console.log(`  clean_text identik ${cleanSame}/${n}`);
  else console.log(`  akurasi terhadap label ISOT ${correct}/${n}`);
  return { same: same / n, maxDp };
}

const parity = run('parity (300 artikel split uji)', read('parity.json'));
run('edge (string tepi)', read('edge.json'));

// Contoh UI persis seperti dimuat panel (judul + baris kosong + isi) vs pReal Python atas full_text asli.
interface SampleMeta { label: 'real' | 'fake'; title: string; text: string; testPosition: number; pReal: number }
const samples = JSON.parse(fs.readFileSync(path.join(dir, 'samples-meta.json'), 'utf8')) as SampleMeta[];
let samplesOk = true;
console.log(`contoh UI: n=${samples.length}`);
for (const s of samples) {
  const out = predict(p, `${s.title}\n\n${s.text}`);
  const dp = Math.abs(out.pReal - s.pReal);
  const pass = out.label === (s.pReal > 0.5 ? 'real' : 'fake') && dp <= 0.001;
  samplesOk &&= pass;
  console.log(`  pos ${s.testPosition} ${s.label}: TS pReal ${out.pReal.toFixed(6)} Python ${s.pReal.toFixed(6)} |Δp| ${dp.toExponential(2)} label TS ${out.label} ${pass ? 'OK' : 'BEDA'}`);
}
const ok = parity.same >= 0.995 && parity.maxDp <= 0.001 && samplesOk;
console.log(ok ? 'LOLOS' : 'GAGAL');
process.exit(ok ? 0 : 1);
