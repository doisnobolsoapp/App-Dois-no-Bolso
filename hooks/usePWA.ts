// src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

export interface PWAStatus {
  isOnline: boolean;
  isStandalone: boolean;
  showUpdatePrompt: boolean;
  waitingWorker: ServiceWorker | null;
}

export const usePWA = (): PWAStatus & { updateApp: () => void } => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Verificar modo standalone
    const checkStandalone = () => {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    };

    checkStandalone();

    // Listeners de conectividade
    const handleOnline = () => {
      console.log('🌐 Conexão online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('🔴 Conexão offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('load', checkStandalone);

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
                  setShowUpdatePrompt(true);
                  setWaitingWorker(newWorker);
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
      window.removeEventListener('load', checkStandalone);
    };
  }, []);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
      window.location.reload();
    } else {
      setShowUpdatePrompt(false);
      window.location.reload();
    }
  };

  return {
    isOnline,
    isStandalone,
    showUpdatePrompt,
    waitingWorker,
    updateApp
  };
};
