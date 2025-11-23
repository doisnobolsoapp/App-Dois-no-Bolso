// src/components/Layout.tsx
import React from 'react';
import { ViewState } from '../types';
import { 
  Home, 
  CreditCard, 
  Target, 
  BarChart3, 
  Calendar,
  Landmark,
  PieChart,
  MessageSquare,
  Settings,
  Menu,
  MoreVertical
} from 'lucide-react';

// Definir a interface LayoutProps localmente
interface LayoutProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onViewChange, 
  onLogout, 
  children 
}) => {
  // Itens PRINCIPAIS que sempre aparecem no bottom navigation
  const mainItems = [
    { id: 'dashboard' as ViewState, label: 'Visão Geral', icon: Home },
    { id: 'transactions' as ViewState, label: 'Transações', icon: CreditCard },
    { id: 'goals' as ViewState, label: 'Metas', icon: Target },
    { id: 'investments' as ViewState, label: 'Investir', icon: BarChart3 },
  ];

  // Outros itens que vão no menu "Mais"
  const otherItems = [
    { id: 'banks' as ViewState, label: 'Bancos', icon: Landmark },
    { id: 'cards' as ViewState, label: 'Cartões', icon: PieChart },
    { id: 'balance' as ViewState, label: 'Patrimônio', icon: Landmark },
    { id: 'reports' as ViewState, label: 'Relatórios', icon: BarChart3 },
    { id: 'calendar' as ViewState, label: 'Calendário', icon: Calendar },
    { id: 'chat' as ViewState, label: 'Assistente', icon: MessageSquare },
    { id: 'settings' as ViewState, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h1 className="font-semibold text-slate-800">Dois no Bolso</h1>
          </div>
          
          {/* Menu Hambúrguer para TODAS as opções */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle">
              <Menu size={20} />
            </button>
            <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
              <li className="text-xs text-slate-500 px-4 py-2">Navegação</li>
              
              {/* Visão Geral sempre no topo */}
              <li>
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    currentView === 'dashboard' 
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home size={20} />
                  <span className="font-medium">Visão Geral</span>
                </button>
              </li>

              {/* Demais opções */}
              {[...mainItems.filter(item => item.id !== 'dashboard'), ...otherItems].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                        currentView === item.id 
                          ? 'bg-brand-50 text-brand-600' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}

              <li className="border-t border-slate-200 mt-2 pt-2">
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Settings size={20} />
                  <span className="font-medium">Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Mobile - COM VISÃO GERAL SEMPRE VISÍVEL */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 lg:hidden">
        <div className="flex justify-around items-center py-2">
          {/* VISÃO GERAL - SEMPRE PRIMEIRO ÍCONE */}
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
              currentView === 'dashboard' 
                ? 'text-brand-600 bg-brand-50' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Home size={22} />
            <span className="text-xs mt-1 font-medium">Visão</span>
          </button>

          {/* TRANSAÇÕES */}
          <button
            onClick={() => onViewChange('transactions')}
            className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
              currentView === 'transactions' 
                ? 'text-brand-600 bg-brand-50' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <CreditCard size={22} />
            <span className="text-xs mt-1 font-medium">Gastos</span>
          </button>

          {/* METAS */}
          <button
            onClick={() => onViewChange('goals')}
            className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
              currentView === 'goals' 
                ? 'text-brand-600 bg-brand-50' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Target size={22} />
            <span className="text-xs mt-1 font-medium">Metas</span>
          </button>

          {/* INVESTIMENTOS */}
          <button
            onClick={() => onViewChange('investments')}
            className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
              currentView === 'investments' 
                ? 'text-brand-600 bg-brand-50' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-xs mt-1 font-medium">Investir</span>
          </button>

          {/* MENU "MAIS" - para outras opções incluindo CONFIGURAÇÕES */}
          <div className="dropdown dropdown-top">
            <button 
              tabIndex={0} 
              className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
                otherItems.some(item => item.id === currentView)
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <MoreVertical size={22} />
              <span className="text-xs mt-1 font-medium">Mais</span>
            </button>
            
            <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-56 mb-16">
              <li className="text-xs text-slate-500 px-4 py-2">Mais Opções</li>
              
              {otherItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                        currentView === item.id 
                          ? 'bg-brand-50 text-brand-600' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
};
