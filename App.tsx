import { useEffect, useState } from 'react';
import { AppData, ViewState, Account, CreditCard } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Goals } from './components/Goals';
import { Reports } from './components/Reports';
import { FinancialCalendar } from './components/FinancialCalendar';
import { BankList } from './components/BankList';
import { CreditCardList } from './components/CreditCardList';
import { InvestmentDashboard } from './components/InvestmentDashboard';
import { BalanceSheet } from './components/BalanceSheet';
import { AIChat } from './components/AIChat';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { authService } from './services/authService';
import {
  loadData,
  saveData,
  addTransaction,
  addMultipleTransactions,
  deleteTransaction,
  addGoal,
  updateGoal,
  addAccount,
  deleteAccount,
  addCreditCard,
  deleteCreditCard,
  addInvestment,
  addInvestmentMovement,
  deleteInvestment,
  addProperty,
  deleteProperty,
  addDebt,
  deleteDebt,
  addCustomCategory
} from './services/storageService';

// Minimal PWA helpers (local implementations to avoid missing imports)
import { OnlineStatus } from './components/OnlineStatus';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const usePWA = () => {
  // defensivo para SSR/ambientes sem window
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isStandalone =
    typeof window !== 'undefined' &&
    !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  return {
    isOnline,
    isStandalone,
    showUpdatePrompt: false,
    updateApp: () => {}
  };
};

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

function App(): JSX.Element {
  // carregar dados persistidos (storageService)
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOnline, isStandalone } = usePWA();

  useEffect(() => {
    // tenta pegar usuário logado
    const currentUser = authService.getCurrentUser?.();
    if (currentUser) {
      setUser(currentUser as User);
    }
    setIsLoading(false);

    // registra service worker apenas em produção (não local)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const isProduction =
        typeof window !== 'undefined' &&
        !window.location.href.includes('localhost') &&
        !window.location.href.includes('127.0.0.1');

      if (isProduction) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registrado:', registration);
          })
          .catch(error => {
            console.warn('Erro no Service Worker:', error);
          });
      }
    }
  }, []);

  // Salva automaticamente quando `data` muda
  useEffect(() => {
    try {
      saveData(data);
    } catch (err) {
      console.warn('Erro ao salvar dados:', err);
    }
  }, [data]);

  // Auth handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout?.();
    setUser(null);
  };

  // Transaction handlers (utilizam storageService)
  const handleAddTransaction = (t: any) => {
    const newT = addTransaction(t);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, newT] }));
  };

  const handleAddMultipleTransactions = (ts: any[]) => {
    const newTs = addMultipleTransactions(ts);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, ...newTs] }));
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(tx => tx.id !== id) }));
  };

  // Goals
  const handleAddGoal = (g: any) => {
    const newG = addGoal(g);
    setData(prev => ({ ...prev, goals: [...prev.goals, newG] }));
  };

  const handleUpdateGoal = (g: any) => {
    updateGoal(g);
    setData(prev => ({ ...prev, goals: prev.goals.map(goal => (goal.id === g.id ? g : goal)) }));
  };

  // Accounts
  const handleAddAccount = (a: any) => {
    const newA = addAccount(a);
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newA] }));
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    setData(prev => ({ ...prev, accounts: prev.accounts.filter(acc => acc.id !== id) }));
  };

  // Credit cards
  const handleAddCreditCard = (c: any) => {
    const newC = addCreditCard(c);
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newC] }));
  };

  const handleDeleteCreditCard = (id: string) => {
    deleteCreditCard(id);
    setData(prev => ({ ...prev, creditCards: prev.creditCards.filter(cc => cc.id !== id) }));
  };

  // Investments
  const handleAddInvestment = (i: any) => {
    const newI = addInvestment(i);
    setData(prev => ({ ...prev, investments: [...prev.investments, newI] }));
  };

  const handleAddInvestmentMovement = (
    invId: string,
    type: 'BUY' | 'SELL' | 'UPDATE',
    qty: number,
    price: number,
    date: string,
    notes?: string
  ) => {
    const updatedInv = addInvestmentMovement(invId, type, qty, price, date, notes);
    if (updatedInv) {
      setData(prev => ({ ...prev, investments: prev.investments.map(inv => (inv.id === invId ? updatedInv : inv)) }));
    }
  };

  const handleDeleteInvestment = (id: string) => {
    deleteInvestment(id);
    setData(prev => ({ ...prev, investments: prev.investments.filter(inv => inv.id !== id) }));
  };

  // Properties & Debts
  const handleAddProperty = (p: any) => {
    const newP = addProperty(p);
    setData(prev => ({ ...prev, properties: [...prev.properties, newP] }));
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setData(prev => ({ ...prev, properties: prev.properties.filter(pp => pp.id !== id) }));
  };

  const handleAddDebt = (d: any) => {
    const newD = addDebt(d);
    setData(prev => ({ ...prev, debts: [...prev.debts, newD] }));
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    setData(prev => ({ ...prev, debts: prev.debts.filter(dd => dd.id !== id) }));
  };

  // Custom categories
  const handleAddCategory = (category: string) => {
    addCustomCategory(category);
    // Removido customCategories que não existe em AppData
    // A função addCustomCategory já salva no localStorage
  };

  // If user not logged, show login
  if (!user) {
    return (
      <>
        <OnlineStatus />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4" />
          <p className="text-slate-600">Carregando Dois no Bolso...</p>
        </div>
      </div>
    );
  }

  // Render views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={data} onViewChange={setCurrentView} />;
      case 'transactions':
        return (
          <TransactionList
            data={data}
            onAddTransaction={handleAddTransaction}
            onAddMultipleTransactions={handleAddMultipleTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onAddCategory={handleAddCategory}
          />
        );
      case 'goals':
        return <Goals goals={data.goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} />;
      case 'reports':
        return <Reports data={data} />;
      case 'calendar':
        return (
          <FinancialCalendar
            data={data}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            currentUserId={user?.id || 'user1'}
          />
        );
      case 'banks':
        return (
          <BankList
            accounts={data.accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateAccount={(account: Account) => {
              // simple replace strategy
              deleteAccount(account.id);
              addAccount(account);
              setData(prev => ({ ...prev, accounts: prev.accounts.map(a => (a.id === account.id ? account : a)) }));
            }}
          />
        );
      case 'cards':
        return (
          <CreditCardList
            cards={data.creditCards}
            onAddCreditCard={handleAddCreditCard}
            onDeleteCreditCard={handleDeleteCreditCard}
            onUpdateCreditCard={(card: CreditCard) => {
              deleteCreditCard(card.id);
              addCreditCard(card);
              setData(prev => ({ ...prev, creditCards: prev.creditCards.map(c => (c.id === card.id ? card : c)) }));
            }}
          />
        );
      case 'investments':
        return (
          <InvestmentDashboard
            data={data}
            onAddInvestment={handleAddInvestment}
            onAddMovement={handleAddInvestmentMovement}
            onDeleteInvestment={handleDeleteInvestment}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'balance':
        return (
          <BalanceSheet
            data={data}
            onAddProperty={handleAddProperty}
            onDeleteProperty={handleDeleteProperty}
            onAddDebt={handleAddDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        );
      case 'chat':
        return (
          <AIChat
            data={data}
            onAddTransaction={handleAddTransaction}
            onAddGoal={handleAddGoal}
            onAddInvestment={handleAddInvestment}
          />
        );
      case 'settings':
        return <Settings data={data} onDataUpdate={setData} />;
      default:
        return <Dashboard data={data} onViewChange={setCurrentView} />;
    }
  };

  return (
    <>
      <OnlineStatus />
      <PWAInstallPrompt />

      <Layout currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout}>
        {renderCurrentView()}

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
            {isStandalone && <span className="bg-brand-100 text-brand-700 px-2 py-1 rounded-full text-xs">App</span>}
          </div>
        </footer>
      </Layout>
    </>
  );
}

export default App;
