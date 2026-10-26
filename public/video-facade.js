// Video Creation (sesi 13): facade klik-untuk-memuat. Dimuat <script async> dari VideoSection, jadi hanya
// terkirim bila section dirender. Tidak mengubah DOM sebelum klik (aman terhadap hidrasi React). Saat tombol
// diklik: iframe Drive /preview ditambahkan ke .vd-frame (16:9), tombol disembunyikan lewat [data-playing],
// fokus pindah ke iframe, lalu sekali lagi saat dokumennya dimuat.
(function () {
  if (window.__vdFacade) return;
  window.__vdFacade = true;
  document.addEventListener('click', function (event) {
    var btn = event.target instanceof Element && event.target.closest('button[data-vd-file]');
    if (!btn) return;
    var frame = btn.parentElement;
    if (frame.hasAttribute('data-playing')) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://drive.google.com/file/d/' + encodeURIComponent(btn.getAttribute('data-vd-file')) + '/preview';
    iframe.title = btn.getAttribute('data-vd-title');
    iframe.allow = 'autoplay; fullscreen; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', function () { iframe.focus(); }, { once: true });
    frame.appendChild(iframe);
    frame.setAttribute('data-playing', '');
    iframe.focus();
  });
})();
