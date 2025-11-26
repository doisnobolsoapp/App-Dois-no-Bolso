// src/components/Layout.tsx
import { useState } from 'react';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  Landmark, 
  MessageSquare, 
  Settings,
  PieChart,
  Menu,
  X,
  LogOut,
  Wallet,
  Banknote,
  House
} from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as ViewState, label: 'Visão Geral', icon: Home },
    { id: 'transactions' as ViewState, label: 'Transações', icon: CreditCard },
    { id: 'calendar' as ViewState, label: 'Calendário', icon: Calendar },

    // Configurações de Contas seguindo a estrutura da imagem
    { 
      id: 'accountSettings' as ViewState, 
      label: 'Configurações de Contas',
      icon: Landmark,
      subItems: [
        // ATIVOS - Banco
        { 
          id: 'bankAccounts' as ViewState, 
          label: 'Banco', 
          icon: Landmark,
          subItems: [
            { id: 'checkingAccount' as ViewState, label: 'Conta Corrente', icon: Banknote },
            { id: 'savingsAccount' as ViewState, label: 'Poupança', icon: PieChart }
          ]
        },
        // ATIVOS - Dinheiro
        { 
          id: 'cashAccounts' as ViewState, 
          label: 'Dinheiro', 
          icon: Wallet,
          subItems: [
            { id: 'wallet' as ViewState, label: 'Carteira', icon: Wallet }
          ]
        },
        // PASSIVOS - Cartão de Crédito
        { 
          id: 'creditCards' as ViewState, 
          label: 'Cartão de Crédito', 
          icon: CreditCard,
          subItems: [
            { id: 'creditCard' as ViewState, label: 'Cartão de Crédito', icon: CreditCard }
          ]
        },
        // PASSIVOS - Hipotecas
        { 
          id: 'mortgages' as ViewState, 
          label: 'Hipotecas', 
          icon: House,
          subItems: [
            { id: 'houseMortgage' as ViewState, label: 'Hipoteca da Casa', icon: House }
          ]
        }
      ]
    },

    { id: 'chat' as ViewState, label: 'Assistente IA', icon: MessageSquare },
    { id: 'settings' as ViewState, label: 'Configurações do App', icon: Settings },
  ];

  const renderMenuItem = (item: any, level = 0) => {
    const Icon = item.icon;
    const paddingLeft = level * 16;

    // Se não tiver submenu
    if (!item.subItems) {
      return (
        <button
          key={item.id}
          onClick={() => {
            onViewChange(item.id);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap w-full text-left ${
            currentView === item.id
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <Icon size={18} />
          <span className="font-medium text-sm">{item.label}</span>
        </button>
      );
    }

    // Se tiver submenus (menu com dropdown)
    return (
      <div key={item.id} className="relative group">
        <button
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap w-full ${
            currentView === item.id
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <Icon size={18} />
          <span className="font-medium text-sm">{item.label}</span>
        </button>

        {/* Dropdown Submenu */}
        <div 
          className={`absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 border border-slate-200 z-50 min-w-[220px] ${
            level > 0 ? 'ml-1' : ''
          }`}
          style={{ 
            left: level === 0 ? '0' : '100%',
            top: level > 0 ? '0' : '100%'
          }}
        >
          {/* Headers para ATIVOS e PASSIVOS no primeiro nível */}
          {level === 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50">
                ATIVOS
              </div>
              {item.subItems.slice(0, 2).map((sub: any) => renderMenuItem(sub, level + 1))}
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50 border-t border-slate-200 mt-1">
                PASSIVOS
              </div>
              {item.subItems.slice(2).map((sub: any) => renderMenuItem(sub, level + 1))}
            </>
          )}
          
          {level > 0 && (
            <>
              {item.subItems.map((sub: any) => renderMenuItem(sub, level + 1))}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Dois no Bolso</h1>
          <p className="text-sm text-slate-500">Controle financeiro</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 w-full text-left"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Dois no Bolso</h1>
            <p className="text-xs text-slate-500">Controle financeiro</p>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg max-h-[80vh] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {menuItems.map(item => renderMenuItem(item))}
              
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 w-full text-left border-t border-slate-200 mt-4 pt-4"
              >
                <LogOut size={18} />
                <span className="font-medium text-sm">Sair</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Mude para default export
export default Layout;
