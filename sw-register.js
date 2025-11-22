// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('🎉 Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações a cada 30 minutos
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      })
      .catch(function(error) {
        console.log('❌ Falha no registro do ServiceWorker:', error);
      });
  });
}

// Detectar modo standalone e adicionar classe CSS
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.documentElement.classList.add('pwa-standalone');
}

// Detectar se é iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
  document.documentElement.classList.add('ios-device');
}
