// ============================================================
// LUMINA PLAYER — Service Worker v2 (Caché Offline Inteligente)
// Estrategia: Cache-First para vídeos, Network-First para datos
// ============================================================

const CACHE_NAME = 'lumina-media-v2';
const DATA_CACHE = 'lumina-data-v1';
const OFFLINE_LOG_QUEUE = 'lumina-offline-logs';

// Rutas que siempre van a red
const NETWORK_ONLY = [
  '/api/',
  'supabase.co/rest/',
  'supabase.co/auth/',
];

// ——————————————————————————————————————————
// INSTALL: Pre-cachear el esqueleto del player
// ——————————————————————————————————————————
self.addEventListener('install', (event) => {
  console.log('[Lumina SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([]);
    })
  );
  self.skipWaiting();
});

// ——————————————————————————————————————————
// ACTIVATE: Limpiar caches antiguas
// ——————————————————————————————————————————
self.addEventListener('activate', (event) => {
  console.log('[Lumina SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList
          .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE)
          .map((key) => {
            console.log('[Lumina SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// ——————————————————————————————————————————
// FETCH: Estrategia inteligente por tipo de recurso
// ——————————————————————————————————————————
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Network-only para llamadas a API y Supabase
  const isNetworkOnly = NETWORK_ONLY.some((pattern) => request.url.includes(pattern));
  if (isNetworkOnly) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Cache-first para vídeos e imágenes (los archivos de media de Supabase Storage)
  const isMedia = /\.(mp4|webm|ogg|mov|jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url.pathname);
  if (isMedia) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          console.log('[Lumina SW] Sirviendo desde caché:', url.pathname);
          return cached;
        }
        // Si no está en caché, descargar y guardar
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            console.log('[Lumina SW] Descargado y cacheado:', url.pathname);
          }
          return networkResponse;
        } catch {
          console.error('[Lumina SW] Sin conexión y sin caché para:', url.pathname);
          // Devolver respuesta vacía para que el player maneje el error graciosamente
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // 3. Network-first para el resto (páginas HTML, JS, etc.)
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ——————————————————————————————————————————
// SYNC: Sincronizar logs de reproducción offline
// Cuando vuelve la conexión, envía los pings pendientes
// ——————————————————————————————————————————
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playback-logs') {
    console.log('[Lumina SW] Sincronizando logs offline...');
    event.waitUntil(syncOfflineLogs());
  }
});

async function syncOfflineLogs() {
  const cache = await caches.open(OFFLINE_LOG_QUEUE);
  const keys = await cache.keys();
  
  for (const request of keys) {
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        await cache.delete(request);
        console.log('[Lumina SW] Log sincronizado y eliminado de la cola.');
      }
    } catch (err) {
      console.warn('[Lumina SW] Falló la sincronización del log, se reintentará:', err);
    }
  }
}

// Escuchar mensajes desde el cliente para gestión manual de caché
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_MEDIA') {
    const { urls } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      urls.forEach((url) => {
        fetch(url)
          .then((res) => { if (res.ok) cache.put(url, res); })
          .catch(() => {});
      });
    });
  }

  if (event.data?.type === 'CLEAR_OLD_MEDIA') {
    const { keepUrls } = event.data;
    caches.open(CACHE_NAME).then(async (cache) => {
      const keys = await cache.keys();
      keys.forEach((key) => {
        if (!keepUrls.includes(key.url)) {
          cache.delete(key);
          console.log('[Lumina SW] Media antigua eliminada de caché:', key.url);
        }
      });
    });
  }
});
