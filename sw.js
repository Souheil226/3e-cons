const CACHE_NAME = '3e-consulting-v1';
const OFFLINE_URL = '/index.html';

const PRECACHE_ASSETS = [
  '/index.html',
  '/Logo-cropped.png',
  '/manifest.json'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// تفعيل وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتيجية: Network First مع fallback للكاش (مناسبة لموقع فيه محتوى ديناميكي PHP)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // لا نتدخل فطلبات API/PHP الديناميكية (تسجيل الدخول، الفورمات...)
  if (event.request.url.includes('.php')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
