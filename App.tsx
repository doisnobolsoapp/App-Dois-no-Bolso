// App.tsx - VERSÃO CORRIGIDA
import { useEffect, useState } from 'react';
import { AppData, ViewState, Account, CreditCard } from './types';
import Layout from "./components/Layout";
import { Dashboard } from './components/Dashboard';
// ... outros imports (manter os mesmos)

// CORREÇÃO: Hook usePWA seguro para SSR
const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Apenas executa no client-side
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    setIsStandalone(
      typeof window !== 'undefined' && 
      window.matchMedia('(display-mode: standalone)').matches
    );

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isStandalone, showUpdatePrompt: false, updateApp: () => {} };
};

function App(): JSX.Element {
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // ← NOVO: controle de mount

  const { isOnline, isStandalone } = usePWA();

  useEffect(() => {
    setMounted(true); // ← Marcar que o componente montou no client
    
    const checkAuth = () => {
      try {
        // CORREÇÃO: Verificar se authService existe
        if (typeof authService?.getCurrentUser === 'function') {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser as User);
          }
        }
      } catch (error) {
        console.warn('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // CORREÇÃO: Service Worker apenas se estiver no client e em produção
    if (mounted && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const isLocalhost = 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('192.168.');
      
      if (!isLocalhost) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('✅ Service Worker registrado:', registration);
          })
          .catch(error => {
            console.warn('⚠️ Service Worker não registrado:', error);
          });
      }
    }
  }, [mounted]); // ← Dependência do mounted

  // CORREÇÃO: Salvar dados apenas se mounted
  useEffect(() => {
    if (mounted) {
      try {
        saveData(data);
      } catch (err) {
        console.warn('⚠️ Erro ao salvar dados:', err);
      }
    }
  }, [data, mounted]);

  // ... manter as outras funções (handleLogin, handleAddTransaction, etc.)

  // CORREÇÃO: Loading melhorado
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4" />
          <p className="text-slate-600">Carregando Dois no Bolso...</p>
        </div>
      </div>
    );
  }

  // CORREÇÃO: Login apenas se mounted
  if (!user && mounted) {
    return (
      <>
        <OnlineStatus />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // ... resto do código (manter igual)
}

export default App;
