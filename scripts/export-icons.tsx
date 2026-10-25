// Ekspor ikon TechIcons yang dipakai #skills (skills.json yang visible) ke public/icons/<kunci>.svg. Tools I use memakai
// ikon aplikasi resmi berupa berkas (field `image` di tools.json), tidak lewat skrip ini.
// Ikon dimuat sebagai <img>/mask, bukan SVG inline: halaman dirender per request, jadi SVG inline ikut dua kali
// (HTML + payload RSC). Jalankan ulang setelah menambah ikon: npx tsx scripts/export-icons.tsx
import fs from 'fs';
import path from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getIcon } from '../src/icons';
import { DARK, LIGHT } from '../src/icons/meta';

const root = process.cwd();
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf-8'));
const skills: { icon?: string; visible: boolean }[] = readJson('content/skills/skills.json');

const keys = [...new Set(skills.filter((s) => s.visible && s.icon).map((s) => s.icon!))];
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
  // Varian per tema (meta.ts): DARK mengganti warna di <kunci>-dark.svg, LIGHT di <kunci>.svg (-dark = warna asli).
  write(file, recolor(svg, LIGHT[key]));
  if (DARK[key] || LIGHT[key]) write(path.join(outDir, `${key.toLowerCase()}-dark.svg`), recolor(svg, DARK[key]));
}

function recolor(svg: string, map: Record<string, string> = {}) {
  for (const [from, to] of Object.entries(map)) svg = svg.replace(new RegExp(`"${from}"`, 'gi'), `"${to}"`);
  return svg;
}

// Berkas yang isinya sama (abaikan CRLF dari checkout Windows) tidak ditulis ulang, supaya diff tetap bersih.
function write(file: string, svg: string) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n') === svg + '\n') return;
  fs.writeFileSync(file, svg + '\n');
  console.log(`${path.relative(root, file)} ${Buffer.byteLength(svg)} B`);
}
