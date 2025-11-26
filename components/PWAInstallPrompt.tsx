// src/components/PWAInstallPrompt.tsx
import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Evento para capturar o prompt de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar o prompt apenas se não for iOS e não estiver já instalado
      if (!isIOS && !isStandalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, [isIOS, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();
    
    // Esperar pela decisão do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuário aceitou a instalação');
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      console.log('❌ Usuário recusou a instalação');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  // Não mostrar se já estiver instalado ou se for iOS
  if (isStandalone || isIOS) {
    return null;
  }

  // Instruções para iOS
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone size={20} />
            <span className="font-semibold">Instalar App</span>
          </div>
          <button onClick={handleDismiss} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm mb-3">
          Para instalar o Dois no Bolso no seu iPhone:
        </p>
        <ol className="text-sm space-y-1 mb-3">
          <li>1. Toque no ícone de <strong>Compartilhar</strong> 📱</li>
          <li>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
          <li>3. Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
        </ol>
        <div className="text-xs text-blue-100">
          Tenha seu controle financeiro sempre à mão!
        </div>
      </div>
    );
  }

  // Prompt padrão para Android/Desktop
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Download size={20} />
          <span className="font-semibold">Instalar App</span>
        </div>
        <button onClick={handleDismiss} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm mb-3">
        Instale o <strong>Dois no Bolso</strong> no seu dispositivo para uma experiência mais rápida e acesso offline!
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
        >
          Instalar Agora
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-white/80 hover:text-white transition-colors text-sm"
        >
          Agora Não
        </button>
      </div>
    </div>
  );
};
