
import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Goals } from './components/Goals';
import { Reports } from './components/Reports';
import { AIChat } from './components/AIChat';
import { Settings } from './components/Settings';
import { BankList } from './components/BankList';
import { CreditCardList } from './components/CreditCardList';
import { InvestmentDashboard } from './components/InvestmentDashboard';
import { BalanceSheet } from './components/BalanceSheet';
import { FinancialCalendar } from './components/FinancialCalendar';
import { Login } from './components/Login';
import { 
    loadData, saveData, addTransaction, addMultipleTransactions, 
    addGoal, updateGoal, deleteTransaction, addAccount, 
    deleteAccount, addCreditCard, deleteCreditCard,
    addInvestment, addInvestmentMovement, deleteInvestment,
    addCustomCategory, addProperty, deleteProperty, addDebt, deleteDebt
} from './services/storageService';
import { getCurrentUser, logoutUser } from './services/authService';
import { requestNotificationPermission, checkAndSendNotifications } from './services/notificationService';
import { AppData, ViewState, Transaction, Goal, Account, CreditCard, Investment, User, Property, Debt, Language } from './types';

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // App State
  const [data, setData] = useState<AppData>({ 
    transactions: [], 
    goals: [], 
    accounts: [], 
    creditCards: [],
    investments: [],
    properties: [],
    debts: [],
    customCategories: [],
    userMode: 'INDIVIDUAL',
    language: 'PT'
  });
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for logged in user on mount
  useEffect(() => {
      const currentUser = getCurrentUser();
      if (currentUser) {
          setUser(currentUser);
      }
  }, []);

  // Load Data only when User is set
  useEffect(() => {
    if (user) {
        const loaded = loadData();
        // Sync user mode preference from auth to app data
        setData({ 
            ...loaded, 
            userMode: user.mode,
            userName: user.name 
        });
        setIsInitialized(true);

        // Initialize Notifications
        requestNotificationPermission();
        checkAndSendNotifications(loaded.transactions);
    }
  }, [user]);

  // Persist Data
  useEffect(() => {
    if (isInitialized && user) {
        saveData(data);
    }
  }, [data, isInitialized, user]);

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
  };

  const handleLogout = () => {
      if (confirm("Deseja realmente sair?")) {
        logoutUser();
        setUser(null);
        setIsInitialized(false);
      }
  };

  // Data Handlers
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    // Attach createdBy for calendar filtering
    const transactionWithUser = { ...t, createdBy: user?.id };
    const newT = addTransaction(transactionWithUser);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, newT] }));
  };

  const handleAddMultipleTransactions = (ts: Omit<Transaction, 'id'>[]) => {
    const transactionsWithUser = ts.map(t => ({ ...t, createdBy: user?.id }));
    const newTs = addMultipleTransactions(transactionsWithUser);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, ...newTs] }));
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const handleAddCategory = (category: string) => {
      addCustomCategory(category);
      setData(prev => ({
          ...prev,
          customCategories: [...prev.customCategories, category]
      }));
  };

  const handleAddGoal = (g: Omit<Goal, 'id'>) => {
    const newG = addGoal(g);
    setData(prev => ({ ...prev, goals: [...prev.goals, newG] }));
  };

  const handleUpdateGoal = (g: Goal) => {
    updateGoal(g);
    setData(prev => ({
        ...prev,
        goals: prev.goals.map(goal => goal.id === g.id ? g : goal)
    }));
  };

  const handleAddAccount = (a: Omit<Account, 'id'>) => {
    const newA = addAccount(a);
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newA] }));
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    setData(prev => ({ 
      ...prev, 
      accounts: prev.accounts.filter(a => a.id !== id),
      transactions: prev.transactions.map(t => t.accountId === id ? { ...t, accountId: undefined } : t)
    }));
  };

  const handleAddCard = (c: Omit<CreditCard, 'id'>) => {
    const newC = addCreditCard(c);
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newC] }));
  };

  const handleDeleteCard = (id: string) => {
    deleteCreditCard(id);
    setData(prev => ({ 
      ...prev, 
      creditCards: prev.creditCards.filter(c => c.id !== id),
      transactions: prev.transactions.map(t => t.cardId === id ? { ...t, cardId: undefined } : t)
    }));
  };

  const handleAddInvestment = (i: Omit<Investment, 'id' | 'history'>) => {
      const newInv = addInvestment(i);
      setData(prev => ({ ...prev, investments: [...prev.investments, newInv] }));
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

  // Balance Sheet Handlers
  const handleAddProperty = (p: Omit<Property, 'id'>) => {
      const newP = addProperty(p);
      setData(prev => ({ ...prev, properties: [...prev.properties, newP] }));
  };

  const handleDeleteProperty = (id: string) => {
      deleteProperty(id);
      setData(prev => ({ ...prev, properties: prev.properties.filter(p => p.id !== id) }));
  };

  const handleAddDebt = (d: Omit<Debt, 'id'>) => {
      const newD = addDebt(d);
      setData(prev => ({ ...prev, debts: [...prev.debts, newD] }));
  };

  const handleDeleteDebt = (id: string) => {
      deleteDebt(id);
      setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  };

  const handleRestore = (newData: AppData) => {
      setData({ ...newData, userMode: user?.mode || 'INDIVIDUAL' });
      saveData(newData);
      setCurrentView('DASHBOARD');
  };

  const handleUpdateLanguage = (lang: Language) => {
      setData(prev => ({ ...prev, language: lang }));
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard data={data} onViewDetails={() => setCurrentView('REPORTS')} />;
      case 'CALENDAR':
        return <FinancialCalendar 
            data={data} 
            onAddTransaction={handleAddTransaction} 
            onDeleteTransaction={handleDeleteTransaction} 
            currentUserId={user?.id || ''}
        />;
      case 'TRANSACTIONS':
        return <TransactionList 
          data={data} 
          onAddTransaction={handleAddTransaction} 
          onAddMultipleTransactions={handleAddMultipleTransactions}
          onDeleteTransaction={handleDeleteTransaction} 
          onAddCategory={handleAddCategory}
        />;
      case 'BANKS':
        return <BankList data={data} onAddAccount={handleAddAccount} onDeleteAccount={handleDeleteAccount} />;
      case 'CARDS':
        return <CreditCardList data={data} onAddCard={handleAddCard} onDeleteCard={handleDeleteCard} />;
      case 'INVESTMENTS':
        return <InvestmentDashboard 
            data={data} 
            onAddInvestment={handleAddInvestment} 
            onAddMovement={handleAddInvestmentMovement} 
            onDeleteInvestment={handleDeleteInvestment}
            onAddTransaction={handleAddTransaction}
        />;
      case 'GOALS':
        return <Goals goals={data.goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} />;
      case 'BALANCE':
        return <BalanceSheet 
            data={data} 
            onAddProperty={handleAddProperty} 
            onDeleteProperty={handleDeleteProperty} 
            onAddDebt={handleAddDebt} 
            onDeleteDebt={handleDeleteDebt} 
        />;
      case 'REPORTS':
        return <Reports data={data} />;
      case 'CHAT':
        return <AIChat data={data} onAddTransaction={handleAddTransaction} onAddGoal={handleAddGoal} />;
      case 'SETTINGS':
        return <Settings data={data} onRestore={handleRestore} onUpdateLanguage={handleUpdateLanguage} />;
      default:
        return <Dashboard data={data} onViewDetails={() => setCurrentView('REPORTS')} />;
    }
  };

  // --- RENDER ---

  if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!isInitialized) return null;

  return (
    <div className="relative">
         <Layout currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </Layout>
    </div>
  );
}

export default App;
