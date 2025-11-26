// src/components/Layout.tsx
import { useState } from 'react';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  Landmark, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  LogOut
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
    { id: 'accountSettings' as ViewState, label: 'Configurações de Contas', icon: Landmark },
    { id: 'chat' as ViewState, label: 'Assistente IA', icon: MessageSquare },
    { id: 'settings' as ViewState, label: 'Configurações do App', icon: Settings },
  ];

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;

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
      >
        <Icon size={18} />
        <span className="font-medium text-sm">{item.label}</span>
      </button>
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
          {menuItems.map(renderMenuItem)}
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
              {menuItems.map(renderMenuItem)}
              
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

export default Layout;
