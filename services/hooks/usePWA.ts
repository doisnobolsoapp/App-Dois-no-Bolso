import { useState, useEffect } from 'react';

export interface PWAStatus {
  isOnline: boolean;
  isStandalone: boolean;
  showUpdatePrompt: boolean;
  waitingWorker: ServiceWorker | null;
}

export const usePWA = (): PWAStatus & { updateApp: () => void } => {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    showUpdatePrompt: false,
    waitingWorker: null
  });

  useEffect(() => {
    // Listeners de conectividade
    const handleOnline = () => {
      console.log('🌐 Conexão online');
      setStatus(prev => ({ ...prev, isOnline: true }));
    };
    
    const handleOffline = () => {
      console.log('🔴 Conexão offline');
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker e updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nova versão disponível');
                  setStatus(prev => ({ 
                    ...prev, 
                    showUpdatePrompt: true,
                    waitingWorker: newWorker 
                  }));
                }
              });
            }
          });
        }
      }).catch(error => {
        console.log('❌ Service Worker não está pronto:', error);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    if (status.waitingWorker) {
      status.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setStatus(prev => ({ ...prev, showUpdatePrompt: false }));
      window.location.reload();
    }
  };

  return {
    ...status,
    updateApp
  };
};
