// Lưu sẵn "vỏ app" để mở nhanh; dữ liệu kho luôn lấy trực tiếp từ máy chủ
const BAN = 'kho-btht-v1';
const VO_APP = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(BAN).then(c => c.addAll(VO_APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== BAN).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Chỉ xử lý file của vỏ app (cùng tên miền); ưu tiên bản mới từ mạng, mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(BAN).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
