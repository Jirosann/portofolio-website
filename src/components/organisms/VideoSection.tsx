import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { driveFileId, type VideoSectionData } from '@/lib/content/videos';
import { videoCopy } from '@/lib/videos/copy';

interface VideoSectionProps {
  data: VideoSectionData;
}

// Dibaca sekali per proses server (berkas ikut tracing build karena path statis dari process.cwd()); komentar dan
// spasi dibuang.
let css: string | undefined;
function videoCss(): string {
  css ??= fs
    .readFileSync(path.join(process.cwd(), 'src/components/organisms/video-section.css'), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return css;
}

// Tanpa JS: ikon putar disembunyikan dan tile tidak tampak bisa diklik (poster/judul tetap terlihat).
const NO_SCRIPT_CSS = '.vd-play{display:none}.vd-facade{cursor:default;pointer-events:none}';

// Video Creation (sesi 13). Hanya dirender bila getVideoSection() mengembalikan item berlink asli (page.tsx).
// Tanpa komponen klien: gaya (video-section.css, sebagai <style> di dalam section) dan facade
// (public/video-facade.js, async) hanya dikirim dari sini, jadi selama data masih draf halaman utama tidak bertambah
// byte JS/CSS. Bukan import CSS (ikut ke CSS rute di setiap request) dan bukan <link> (React menambah preload
// berprioritas tinggi di <head> yang bersaing dengan CSS utama sebelum FCP: +147 ms FCP mobile, terukur).
// Sebelum klik hanya poster (atau latar solid berjudul) dan tombol; iframe Drive baru dibuat saat diklik.
// Field kosong (tools [], tiktokUrl null, konteks/peran tidak diisi) tidak dirender. Pemisah " ·" menempel ke kata
// sebelumnya (NBSP, seperti fakta About), jadi baris baru tidak diawali pemisah.
export async function VideoSection({ data }: VideoSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];
  const copy = videoCopy[lang];
  const id = lang === 'id';

  return (
    <section id="videos" className="section-y">
      <style dangerouslySetInnerHTML={{ __html: videoCss() }} />
      <script src="/video-facade.js" async />
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <Container>
        <SectionHeading section="videos" label={copy.label} title={copy.title} />

        <ul className="vd-grid">
          {data.videos.map((video) => {
            const title = (id && video.titleId) || video.title;
            const meta = [(id && video.contextId) || video.context, (id && video.roleId) || video.role].filter(Boolean);
            return (
              <li key={video.id} className="vd-tile">
                <div className="vd-frame">
                  <button
                    type="button"
                    className={video.poster ? 'vd-facade' : 'vd-facade vd-facade--solid'}
                    aria-label={copy.play.replace('{title}', title)}
                    data-vd-file={driveFileId(video.driveUrl)}
                    data-vd-title={copy.iframeTitle.replace('{title}', title)}
                  >
                    {video.poster ? (
                      <img src={video.poster} alt="" width={1280} height={720} loading="lazy" decoding="async" className="vd-poster" />
                    ) : (
                      <span className="vd-solid font-serif" aria-hidden="true">
                        {title}
                      </span>
                    )}
                    <span className="vd-play" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M5 3.2v11.6a.8.8 0 0 0 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2z" />
                      </svg>
                    </span>
                  </button>
                </div>
                <h3 className="vd-title font-serif">{title}</h3>
                {meta.length > 0 && <p className="vd-meta">{meta.join('\u00a0· ')}</p>}
                {video.tools.length > 0 && <p className="vd-meta">{video.tools.join('\u00a0· ')}</p>}
                {video.tiktokUrl && (
                  <a href={video.tiktokUrl} target="_blank" rel="noopener noreferrer" className="vd-link">
                    {copy.tiktok} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> {t.contactLabel.opensInNewTab}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <p className="vd-folder">
          <a href={data.folderUrl} target="_blank" rel="noopener noreferrer" className="vd-link">
            {copy.folder} <span aria-hidden="true">↗</span>
            <span className="sr-only"> {t.contactLabel.opensInNewTab}</span>
          </a>
        </p>
      </Container>
    </section>
  );
}
