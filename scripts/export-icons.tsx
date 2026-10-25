// Ekspor ikon TechIcons yang dipakai #skills (skills.json yang visible + tools.json) ke public/icons/<kunci>.svg.
// Ikon dimuat sebagai <img>/mask, bukan SVG inline: halaman dirender per request, jadi SVG inline ikut dua kali
// (HTML + payload RSC). Jalankan ulang setelah menambah ikon: npx tsx scripts/export-icons.tsx
import fs from 'fs';
import path from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getIcon } from '../src/icons';

const root = process.cwd();
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf-8'));
const skills: { icon?: string; visible: boolean }[] = readJson('content/skills/skills.json');
const tools: { icon?: string }[] = fs.existsSync(path.join(root, 'content/tools/tools.json')) ? readJson('content/tools/tools.json') : [];

const keys = [...new Set([...skills.filter((s) => s.visible && s.icon).map((s) => s.icon!), ...tools.flatMap((t) => (t.icon ? [t.icon] : []))])];
const outDir = path.join(root, 'public/icons');

for (const key of keys) {
  const file = path.join(outDir, `${key.toLowerCase()}.svg`);
  // Linux sudah berupa aset statis (712 path); komponennya hanya membungkus <img>.
  if (key === 'Linux') continue;
  const Icon = getIcon(key);
  if (!Icon) throw new Error(`Ikon tidak ditemukan: ${key}`);
  let svg = renderToStaticMarkup(createElement(Icon));
  // ID dari useId (mis. «R1») diganti nama sederhana; di berkas sendiri tidak bisa bentrok.
  const ids = [...new Set([...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))];
  ids.forEach((id, i) => { svg = svg.split(id).join(`i${i}`); });
  svg = svg
    .replace(/ aria-hidden="true"| focusable="false"/g, '')
    // Berkas berdiri sendiri harus XML valid: xlink:href tanpa xmlns:xlink membuat <img> gagal dimuat (Go).
    .replace(/xlink:href=/g, 'href=')
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync(file, svg + '\n');
  console.log(`${path.relative(root, file)} ${Buffer.byteLength(svg)} B`);
}
