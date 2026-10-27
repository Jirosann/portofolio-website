// Reload dan Back/Forward: browser memulihkan posisi scroll terakhir (lihat ScrollToTop), tetapi HTML datang bertahap
// dan Chrome sudah melukis selagi parser baru sampai hero. Restorasi menunggu dokumen cukup tinggi, jadi hero tampil
// sesaat lalu meloncat (terukur ±170 ms di produksi, sebelum hidrasi). Skrip ini berjalan di <head>, sebelum <body> ada
// (syarat elemen render-blocking), dan pada reload/Back menahan render sampai penanda di akhir markup selesai di-parse
// (<link rel="expect" blocking="render">, Chrome 124+). Layout pertama sudah setinggi penuh, jadi frame pertama sudah
// di posisi terakhir. Kunjungan baru tidak ditahan; browser tanpa dukungan mengabaikan tautannya.

/** Penanda di akhir isi <body> (root layout): render reload/Back dilepas setelah elemen ini di-parse. */
export const PAGE_END_ID = 'page-end';

export const holdRenderScript = `(function(){try{var n=performance.getEntriesByType('navigation')[0];if(n&&(n.type==='reload'||n.type==='back_forward')){var l=document.createElement('link');l.rel='expect';l.href='#${PAGE_END_ID}';l.setAttribute('blocking','render');document.head.appendChild(l)}}catch(e){}})()`;
