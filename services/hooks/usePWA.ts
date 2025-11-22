import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', checkStandalone);
    };
  }, []);

  const updateApp = () => {
    setShowUpdatePrompt(false);
    window.location.reload();
  };

  return {
    isOnline,
    isStandalone,
    showUpdatePrompt,
    updateApp
  };
};
