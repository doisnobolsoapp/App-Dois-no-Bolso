import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se o app já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    
    window.addEventListener('appinstalled', () => {
      console.log('🎉 App instalado com sucesso!');
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      
      if (outcome === 'accepted') {
        console.log('✅ Usuário aceitou a instalação');
        // Aqui você pode enviar analytics
      }
    } catch (error) {
      console.error('❌ Erro na instalação:', error);
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowPrompt(false);
    // Não mostrar novamente por 7 dias
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 max-w-sm animate-in slide-in-from-bottom-8">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-sm">Instalar App</h3>
          <p className="text-xs text-slate-600 mt-1">
            Instale o Dois no Bolso para acesso rápido e uso offline!
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-sm"
            >
              📲 Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 border border-slate-300 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
