const CACHE_NAME = 'dois-no-bolso-v1.0';
const APP_PREFIX = 'DNB_';

// URLs para cachear
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // URLs relativas dos seus assets
  '/src/index.tsx',
  // Adicione outros recursos importantes
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🟢 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando recursos essenciais');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Todos recursos foram cacheados');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('🔵 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remove caches antigos
          if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativado e pronto');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições não GET ou de terceiros
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) {
          console.log('📦 Retornando do cache:', event.request.url);
          return response;
        }
        
        // Se não estiver no cache, busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Não cacheamos tudo, apenas recursos importantes
            const shouldCache = 
              event.request.url.includes('/static/') ||
              event.request.url.includes('/icons/') ||
              event.request.url.endsWith('.css') ||
              event.request.url.endsWith('.js') ||
              event.request.url.endsWith('.png');
            
            if (shouldCache) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            
            return networkResponse;
          })
          .catch(() => {
            // Fallback para páginas - retorna index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Fallback para ícones
            if (event.request.url.includes('/icons/')) {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#667eea"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Notificações Push
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Novas atualizações disponíveis!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Dois no Bolso',
      options
    )
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
