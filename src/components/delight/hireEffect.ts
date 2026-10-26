// Efek easter egg "hire" (sesi 12), dimuat malas oleh DelightRoot saat kata cocok.
// Salin email -> toast (ikon salin berubah menjadi centang yang tergambar, kembali setelah 1,5 detik) -> semburan konfeti.
// Clipboard gagal: toast menampilkan email yang sudah terseleksi, tanpa konfeti (belum ada yang tersalin).
// Reduced motion: toast saja, tanpa konfeti.
import styles from './hireEffect.module.css';

export interface HireCopy {
  email: string;
  copied: string;
  fallback: string;
}

const COLORS = ['--color-highlight', '--color-burgundy-accent', '--color-eyebrow', '--color-blue-accent', '--color-text-secondary'];
const PIECES = 24;

// Ikon statis (tanpa data pengguna): dua persegi salin + centang dengan pathLength=1 untuk animasi stroke-dashoffset.
const ICON =
  `<svg viewBox="0 0 24 24" aria-hidden="true" class="${styles.icon}">` +
  `<g class="${styles.copy}"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></g>` +
  `<path class="${styles.check}" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

let region: HTMLDivElement | null = null;
let hideTimer = 0;

function liveRegion() {
  if (!region) {
    region = document.createElement('div');
    region.className = styles.region;
    region.setAttribute('role', 'status');
    document.body.append(region);
  }
  return region;
}

function confetti(anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect();
  const wrap = document.createElement('div');
  wrap.className = styles.confetti;
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.left = `${r.left + r.width / 2}px`;
  wrap.style.top = `${r.top}px`;
  for (let i = 0; i < PIECES; i++) {
    // Kipas ke atas ±70°, jarak 60-150 px
    const a = ((-90 + (Math.random() * 140 - 70)) * Math.PI) / 180;
    const d = 60 + Math.random() * 90;
    const p = document.createElement('i');
    p.style.setProperty('--x', `${(Math.cos(a) * d).toFixed(1)}px`);
    p.style.setProperty('--y', `${(Math.sin(a) * d).toFixed(1)}px`);
    p.style.setProperty('--r', `${Math.round(Math.random() * 540 - 270)}deg`);
    p.style.setProperty('--d', `${Math.round(Math.random() * 80)}ms`);
    p.style.setProperty('--c', `var(${COLORS[i % COLORS.length]})`);
    wrap.append(p);
  }
  let done = 0;
  const remove = () => wrap.remove();
  wrap.addEventListener('animationend', () => {
    if (++done === PIECES) remove();
  });
  setTimeout(remove, 2000);
  document.body.append(wrap);
}

export async function celebrate({ email, copied, fallback }: HireCopy) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(email);
    ok = true;
  } catch {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = liveRegion();
  clearTimeout(hideTimer);
  box.replaceChildren();
  // Isi dimasukkan sesaat setelah region ada di DOM, supaya pembaca layar mengumumkannya.
  setTimeout(() => {
    const toast = document.createElement('div');
    toast.className = styles.toast;
    const text = document.createElement('span');
    let emailEl: HTMLSpanElement | null = null;
    if (ok) {
      toast.innerHTML = ICON;
      text.textContent = copied;
      toast.append(text);
    } else {
      text.textContent = `${fallback}: `;
      emailEl = document.createElement('span');
      emailEl.className = styles.email;
      emailEl.textContent = email;
      toast.append(text, emailEl);
    }
    box.replaceChildren(toast);
    if (ok) {
      void toast.offsetWidth; // mulai transisi centang dari keadaan awal
      toast.setAttribute('data-done', '');
      setTimeout(() => toast.removeAttribute('data-done'), 1500);
    } else if (emailEl) {
      getSelection()?.selectAllChildren(emailEl);
    }
    if (ok && !reduced) confetti(toast);
    hideTimer = window.setTimeout(() => {
      toast.setAttribute('data-out', '');
      setTimeout(() => toast.remove(), 250);
    }, ok ? 3000 : 8000);
  }, 50);
}
