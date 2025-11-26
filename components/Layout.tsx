// components/Layout.tsx
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
  Menu
} from 'lucide-react';

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
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const menuItems = [
    { id: 'dashboard' as ViewState, label: 'Visão Geral', icon: Home },
    { id: 'transactions' as ViewState, label: 'Transações', icon: CreditCard },
    { id: 'calendar' as ViewState, label: 'Calendário', icon: Calendar },

    // Novo item agrupando Bancos + Carteiras + Cartões
    { 
      id: 'accountSettings' as ViewState, 
      label: 'Configurações de Contas',
      icon: Landmark,
      subItems: [
        { id: 'banks' as ViewState, label: 'Bancos', icon: Landmark },
        { id: 'wallets' as ViewState, label: 'Carteira', icon: CreditCard },
        { id: 'cards' as ViewState, label: 'Cartões', icon: PieChart }
      ]
    },

    { id: 'chat' as ViewState, label: 'Assistente IA', icon: MessageSquare },
    { id: 'settings' as ViewState, label: 'Configurações do App', icon: Settings },
  ];
const renderMenuItem = (item: any) => {
  const Icon = item.icon;

  // Se não tiver submenu
  if (!item.subItems) {
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
          currentView === item.id
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'text-slate-600 hover:bg-slate-100 border border-transparent'
        }`}
      >
        <Icon size={18} />
        <span className="font-medium text-sm">{item.label}</span>
      </button>
    );
  }

  // Se tiver submenus
  return (
    <div key={item.id} className="relative group">
      <button
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
          currentView === item.id
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'text-slate-600 hover:bg-slate-100 border border-transparent'
        }`}
      >
        <Icon size={18} />
        <span className="font-medium text-sm">{item.label}</span>
      </button>

      {/* Dropdown Submenu */}
      <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 border border-slate-200">
        {item.subItems.map((sub: any) => {
          const SubIcon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => onViewChange(sub.id)}
              className="flex items-center px-3 py-2 gap-2 text-sm text-slate-700 hover:bg-slate-100 w-full"
            >
              <SubIcon size={16} />
              {sub.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h1 className="font-semibold text-slate-800">Dois no Bolso</h1>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-b border-slate-200">
            <div className="px-4 py-2 space-y-1 max-h-96 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left ${
                      currentView === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              <div className="border-t border-slate-200 pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Settings size={20} />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Menu */}
        <div className="hidden lg:flex border-t border-slate-200">
          <div className="flex overflow-x-auto px-4 space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                    currentView === item.id 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
