import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Receipt, Target, PieChart, MessageSquare, Settings, Landmark, CreditCard as CreditCardIcon, TrendingUp, LogOut, Scale, CalendarDays } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-colors ${
      active ? 'bg-brand-100 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex md:flex-col">
        <div className="p-6 flex justify-center border-b border-slate-50 pb-8">
          <Logo size="md" showText={true} />
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Principal</p>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Visão Geral" 
            active={currentView === 'DASHBOARD'} 
            onClick={() => onViewChange('DASHBOARD')} 
          />
           <NavItem 
            icon={<CalendarDays size={20} />} 
            label="Calendário" 
            active={currentView === 'CALENDAR'} 
            onClick={() => onViewChange('CALENDAR')} 
          />
          <NavItem 
            icon={<Receipt size={20} />} 
            label="Transações" 
            active={currentView === 'TRANSACTIONS'} 
            onClick={() => onViewChange('TRANSACTIONS')} 
          />
          <NavItem 
            icon={<Landmark size={20} />} 
            label="Minhas Contas" 
            active={currentView === 'BANKS'} 
            onClick={() => onViewChange('BANKS')} 
          />
          <NavItem 
            icon={<CreditCardIcon size={20} />} 
            label="Cartões" 
            active={currentView === 'CARDS'} 
            onClick={() => onViewChange('CARDS')} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Investimentos" 
            active={currentView === 'INVESTMENTS'} 
            onClick={() => onViewChange('INVESTMENTS')} 
          />
          <NavItem 
            icon={<Target size={20} />} 
            label="Metas" 
            active={currentView === 'GOALS'} 
            onClick={() => onViewChange('GOALS')} 
          />
          <NavItem 
            icon={<Scale size={20} />} 
            label="Balanço" 
            active={currentView === 'BALANCE'} 
            onClick={() => onViewChange('BALANCE')} 
          />
          <NavItem 
            icon={<PieChart size={20} />} 
            label="Relatórios" 
            active={currentView === 'REPORTS'} 
            onClick={() => onViewChange('REPORTS')} 
          />
          
          <div className="my-4 border-t border-slate-100"></div>
          
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assistente</p>
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Chat Inteligente" 
            active={currentView === 'CHAT'} 
            onClick={() => onViewChange('CHAT')} 
          />
          
          <div className="my-4 border-t border-slate-100"></div>
           <NavItem 
            icon={<Settings size={20} />} 
            label="Configurações" 
            active={currentView === 'SETTINGS'} 
            onClick={() => onViewChange('SETTINGS')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
           >
             <LogOut size={20} className="mr-3" />
             <span>Sair</span>
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-4">
         <div className="flex items-center">
           <div className="w-8 h-8 mr-2">
                <Logo size="sm" showText={false} />
           </div>
           <span className="font-bold text-slate-800">Dois no Bolso</span>
         </div>
         <button onClick={onLogout} className="p-2 text-red-500" title="Sair">
           <LogOut size={20} />
         </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-20 flex justify-around items-center">
        <button onClick={() => onViewChange('TRANSACTIONS')} className={`p-2 flex flex-col items-center ${currentView === 'TRANSACTIONS' ? 'text-brand-600' : 'text-slate-400'}`}>
          <Receipt size={20} />
          <span className="text-[10px] mt-1">Extrato</span>
        </button>
        <button onClick={() => onViewChange('CALENDAR')} className={`p-2 flex flex-col items-center ${currentView === 'CALENDAR' ? 'text-brand-600' : 'text-slate-400'}`}>
          <CalendarDays size={20} />
          <span className="text-[10px] mt-1">Agenda</span>
        </button>
        <button onClick={() => onViewChange('CHAT')} className={`p-2 flex flex-col items-center ${currentView === 'CHAT' ? 'text-brand-600' : 'text-slate-400'}`}>
          <div className="bg-brand-500 text-white p-2 rounded-full -mt-8 shadow-lg">
             <MessageSquare size={24} />
          </div>
          <span className="text-[10px] mt-1 font-bold text-brand-600">IA</span>
        </button>
        <button onClick={() => onViewChange('BANKS')} className={`p-2 flex flex-col items-center ${currentView === 'BANKS' ? 'text-brand-600' : 'text-slate-400'}`}>
          <Landmark size={20} />
          <span className="text-[10px] mt-1">Contas</span>
        </button>
        <button onClick={() => onViewChange('GOALS')} className={`p-2 flex flex-col items-center ${currentView === 'GOALS' ? 'text-brand-600' : 'text-slate-400'}`}>
          <Target size={20} />
          <span className="text-[10px] mt-1">Metas</span>
        </button>
      </div>
    </div>
  );
};
