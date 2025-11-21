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
import { loadData, saveData, addTransaction, addMultipleTransactions, deleteTransaction, addGoal, updateGoal, addAccount, deleteAccount, addCreditCard, deleteCreditCard, addInvestment, addInvestmentMovement, deleteInvestment, addProperty, deleteProperty, addDebt, deleteDebt, addCustomCategory } from './services/storageService';

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser as User);
    }
    setIsLoading(false);
  }, []);

  // Save data when it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Login handler
  const handleLogin = (userData: User) => {
    setUser(userData as User);
  };

  // Logout handler
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    console.log('Logout realizado');
  };

  // Transaction Handlers
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
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  // Goal Handlers
  const handleAddGoal = (g: any) => {
    const newG = addGoal(g);
    setData(prev => ({ ...prev, goals: [...prev.goals, newG] }));
  };

  const handleUpdateGoal = (g: any) => {
    updateGoal(g);
    setData(prev => ({ ...prev, goals: prev.goals.map(goal => goal.id === g.id ? g : goal) }));
  };

  // Account Handlers
  const handleAddAccount = (a: any) => {
    const newA = addAccount(a);
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newA] }));
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  };

  // Credit Card Handlers
  const handleAddCreditCard = (c: any) => {
    const newC = addCreditCard(c);
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newC] }));
  };

  const handleDeleteCreditCard = (id: string) => {
    deleteCreditCard(id);
    setData(prev => ({ ...prev, creditCards: prev.creditCards.filter(c => c.id !== id) }));
  };

  // Investment Handlers
  const handleAddInvestment = (i: any) => {
    const newI = addInvestment(i);
    setData(prev => ({ ...prev, investments: [...prev.investments, newI] }));
  };

  const handleAddInvestmentMovement = (invId: string, type: 'BUY' | 'SELL' | 'UPDATE', qty: number, price: number, date: string, notes?: string) => {
    const updatedInv = addInvestmentMovement(invId, type, qty, price, date, notes);
    if (updatedInv) {
      setData(prev => ({
        ...prev,
        investments: prev.investments.map(inv => inv.id === invId ? updatedInv : inv)
      }));
    }
  };

  const handleDeleteInvestment = (id: string) => {
    deleteInvestment(id);
    setData(prev => ({ ...prev, investments: prev.investments.filter(i => i.id !== id) }));
  };

  // Property Handlers
  const handleAddProperty = (p: any) => {
    const newP = addProperty(p);
    setData(prev => ({ ...prev, properties: [...prev.properties, newP] }));
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setData(prev => ({ ...prev, properties: prev.properties.filter(p => p.id !== id) }));
  };

  // Debt Handlers
  const handleAddDebt = (d: any) => {
    const newD = addDebt(d);
    setData(prev => ({ ...prev, debts: [...prev.debts, newD] }));
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  };

  // Category Handler
  const handleAddCategory = (category: string) => {
    addCustomCategory(category);
    setData(prev => ({ 
      ...prev, 
      customCategories: [...prev.customCategories, category] 
    }));
  };

  // Se não estiver logado, mostra login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Se estiver carregando, mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard data={data} onViewChange={setCurrentView} />;
      case 'TRANSACTIONS':
        return (
          <TransactionList 
            data={data}
            onAddTransaction={handleAddTransaction}
            onAddMultipleTransactions={handleAddMultipleTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onAddCategory={handleAddCategory}
          />
        );
      case 'GOALS':
        return (
          <Goals 
            goals={data.goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        );
      case 'REPORTS':
        return <Reports data={data} />;
      case 'CALENDAR':
        return (
          <FinancialCalendar 
            data={data}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            currentUserId="user1"
          />
        );
      case 'BANKS':
        return (
          <BankList 
            accounts={data.accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateAccount={(account: Account) => {
              handleDeleteAccount(account.id);
              handleAddAccount(account);
            }}
          />
        );
      case 'CARDS':
        return (
          <CreditCardList 
            cards={data.creditCards}
            onAddCreditCard={handleAddCreditCard}
            onDeleteCreditCard={handleDeleteCreditCard}
            onUpdateCreditCard={(card: CreditCard) => {
              handleDeleteCreditCard(card.id);
              handleAddCreditCard(card);
            }}
          />
        );
      case 'INVESTMENTS':
        return (
          <InvestmentDashboard 
            data={data}
            onAddInvestment={handleAddInvestment}
            onAddMovement={handleAddInvestmentMovement}
            onDeleteInvestment={handleDeleteInvestment}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'BALANCE':
        return (
          <BalanceSheet 
            data={data}
            onAddProperty={handleAddProperty}
            onDeleteProperty={handleDeleteProperty}
            onAddDebt={handleAddDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        );
      case 'CHAT':
        return (
          <AIChat 
            data={data}
            onAddTransaction={handleAddTransaction}
            onAddGoal={handleAddGoal}
            onAddInvestment={handleAddInvestment}
          />
        );
      case 'SETTINGS':
        return (
          <Settings 
            data={data}
            onDataUpdate={setData}
          />
        );
      default:
        return <Dashboard data={data} onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;
