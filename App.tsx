// App.tsx - VERSÃO SIMPLIFICADA E FUNCIONAL
import { useEffect, useState } from 'react';

// Interfaces básicas
interface AppData {
  transactions: any[];
  accounts: any[];
  goals: any[];
  creditCards: any[];
  investments: any[];
  properties: any[];
  debts: any[];
}

type ViewState = 
  | 'dashboard' 
  | 'transactions' 
  | 'goals' 
  | 'reports' 
  | 'calendar' 
  | 'banks' 
  | 'cards' 
  | 'investments' 
  | 'balance' 
  | 'chat' 
  | 'settings' 
  | 'accountSettings';

interface User {
  id: string;
  name: string;
  email: string;
}

function App(): JSX.Element {
  const [data] = useState<AppData>({ 
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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simular verificação de auth
    const timer = setTimeout(() => {
      setUser({ 
        id: '1', 
        name: 'Usuário Teste', 
        email: 'usuario@email.com' 
      });
      setIsLoading(false);
    }, 1500);

    // Verificar status online
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Se usuário não estiver logado, mostrar login
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">💸</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Dois no Bolso</h1>
            <p className="text-slate-600 mt-2">Controle suas finanças de forma simples</p>
          </div>
          
          <button 
            onClick={() => handleLogin({ 
              id: '1', 
              name: 'Usuário Demo', 
              email: 'demo@doisnobolso.com' 
            })}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>🎯</span>
            <span>Entrar no App</span>
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isOnline ? 'Conectado' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Dois no Bolso</h2>
          <p className="text-slate-500">Preparando seu ambiente financeiro...</p>
        </div>
      </div>
    );
  }

  // Conteúdo principal do app
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">💸</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Dois no Bolso</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {[
              { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
              { id: 'transactions', label: 'Transações', emoji: '💰' },
              { id: 'goals', label: 'Metas', emoji: '🎯' },
              { id: 'banks', label: 'Bancos', emoji: '🏦' },
              { id: 'cards', label: 'Cartões', emoji: '💳' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewState)}
                className={`flex items-center space-x-2 py-2 px-3 rounded-lg whitespace-nowrap transition-colors duration-200 ${
                  currentView === item.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{item.emoji}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {currentView === 'dashboard' && '📊 Dashboard'}
              {currentView === 'transactions' && '💰 Transações'}
              {currentView === 'goals' && '🎯 Metas Financeiras'}
              {currentView === 'banks' && '🏦 Contas Bancárias'}
              {currentView === 'cards' && '💳 Cartões de Crédito'}
            </h2>
            
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>Olá,</span>
              <span className="font-semibold text-blue-600">{user?.name}</span>
            </div>
          </div>

          {/* Conteúdo dinâmico baseado na view */}
          <div className="space-y-6">
            {currentView === 'dashboard' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Bem-vindo ao Dois no Bolso!
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Seu aplicativo completo para controle financeiro pessoal. 
                  Comece explorando as diferentes seções no menu acima.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-semibold text-green-800">Transações</h4>
                    <p className="text-green-600 text-sm">Controle entradas e saídas</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-blue-800">Metas</h4>
                    <p className="text-blue-600 text-sm">Alcance seus objetivos</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-semibold text-purple-800">Relatórios</h4>
                    <p className="text-purple-600 text-sm">Analise seus dados</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'transactions' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Controle de Transações
                </h3>
                <p className="text-slate-500">
                  Em breve você poderá adicionar e gerenciar todas as suas transações aqui.
                </p>
              </div>
            )}

            {currentView === 'goals' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Metas Financeiras
                </h3>
                <p className="text-slate-500">
                  Defina e acompanhe suas metas de economia e investimentos.
                </p>
              </div>
            )}

            {currentView === 'banks' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏦</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Contas Bancárias
                </h3>
                <p className="text-slate-500">
                  Gerencie todas as suas contas bancárias em um só lugar.
                </p>
              </div>
            )}

            {currentView === 'cards' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Cartões de Crédito
                </h3>
                <p className="text-slate-500">
                  Acompanhe limites, faturas e gastos dos seus cartões.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">💸</span>
              </div>
              <span className="font-semibold text-slate-700">Dois no Bolso</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span>{new Date().getFullYear()} • Todos os direitos reservados</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Sistema {isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
