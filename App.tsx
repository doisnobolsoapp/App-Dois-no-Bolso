// App.tsx - VERSÃO FUNCIONAL
import { useEffect, useState } from 'react';
import { AppData, ViewState, User } from './types';

// Hook usePWA simplificado
const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    setIsStandalone(
      typeof window !== 'undefined' && 
      window.matchMedia('(display-mode: standalone)').matches
    );
  }, []);

  return { isOnline, isStandalone, showUpdatePrompt: false, updateApp: () => {} };
};

function App(): JSX.Element {
  const [data, setData] = useState<AppData>({ 
    transactions: [], 
    accounts: [], 
    goals: [], 
    creditCards: [], 
    investments: [], 
    properties: [], 
    debts: [] 
  });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOnline, isStandalone } = usePWA();

  useEffect(() => {
    // Simular verificação de auth
    const timer = setTimeout(() => {
      setUser({ id: '1', name: 'Usuário', email: 'user@email.com' });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Se usuário não estiver logado, mostrar login simplificado
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Dois no Bolso</h1>
          <button 
            onClick={() => handleLogin({ id: '1', name: 'Usuário', email: 'user@email.com' })}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Carregando Dois no Bolso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Simples */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Dois no Bolso</h1>
            <div className="flex items-center space-x-4">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Simples */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {(['dashboard', 'transactions', 'goals'] as ViewState[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`py-3 px-1 border-b-2 whitespace-nowrap ${
                  currentView === view 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </h2>
          
          {currentView === 'dashboard' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-4">Bem-vindo ao Dois no Bolso!</h3>
              <p className="text-gray-600">Seu app de finanças pessoais</p>
            </div>
          )}

          {currentView === 'transactions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transações</h3>
              <p className="text-gray-600">Aqui você verá suas transações</p>
            </div>
          )}

          {currentView === 'goals' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Metas</h3>
              <p className="text-gray-600">Aqui você gerenciará suas metas financeiras</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-xs mt-8 border-t border-slate-200">
        <div className="flex items-center justify-center space-x-4">
          <p>Dois no Bolso {new Date().getFullYear()}</p>
          <span className="flex items-center space-x-1">
            {isOnline ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Offline</span>
              </>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
