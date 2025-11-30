// src/App.tsx - VERSÃO 100% FUNCIONAL
import React, { useState, useEffect } from 'react';

// Interface para o usuário
interface User {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    console.log('✅ React App carregado com sucesso!');
    
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setUser({
        name: 'João Silva',
        email: 'joao@email.com'
      });
      setLoading(false);
    }, 2000);

    // Verificar status online
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Conexão restaurada');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📶 Modo offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = () => {
    setUser({
      name: 'Maria Santos',
      email: 'maria@email.com'
    });
  };

  const handleLogout = () => {
    setUser(null);
    setLoading(true);
    // Simular novo carregamento
    setTimeout(() => setLoading(false), 1000);
  };

  // Tela de Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold mb-2">Dois no Bolso</h1>
          <p className="text-white/80">Carregando seu app financeiro...</p>
        </div>
      </div>
    );
  }

  // Tela de Login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">💰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dois no Bolso</h1>
            <p className="text-gray-600">Controle suas finanças de forma simples</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>Entrar no App</span>
            </span>
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isOnline ? '✅ Conectado e pronto' : '⚠️ Modo offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // App Principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dois no Bolso</h1>
                <p className="text-sm text-gray-500">Controle financeiro pessoal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${
                isOnline 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold mb-4">Tudo Pronto!</h2>
              <p className="text-xl opacity-90 mb-6">
                Seu aplicativo <strong>Dois no Bolso</strong> está funcionando perfeitamente
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Dashboard Inteligente</h3>
                <p className="text-blue-600 text-sm">
                  Visão completa da sua situação financeira
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Controle de Gastos</h3>
                <p className="text-green-600 text-sm">
                  Acompanhe todas as suas transações
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Metas Financeiras</h3>
                <p className="text-purple-600 text-sm">
                  Defina e acompanhe seus objetivos
                </p>
              </div>
            </div>

            {/* Success Message */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-lg">App Funcionando!</p>
                  <p className="opacity-90">React + TypeScript + Vite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Dois no Bolso</span>
            </div>
            <p className="text-gray-600 mb-2">
              {new Date().getFullYear()} • Controle financeiro pessoal
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Status:</span>
              <span className={`flex items-center space-x-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isOnline ? 'Sistema Online' : 'Sistema Offline'}</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
