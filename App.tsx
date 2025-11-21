import { useEffect, useState, lazy, Suspense } from 'react';
import { AppData, ViewState, Transaction, Goal, Account, CreditCard, Investment, Property, Debt } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
// Removido: import { SettingsPanel } from './components/SettingsPanel';
import { loadData, saveData, addTransaction, addMultipleTransactions, deleteTransaction, addGoal, updateGoal, addAccount, deleteAccount, addCreditCard, deleteCreditCard, addInvestment, addInvestmentMovement, deleteInvestment, addProperty, deleteProperty, addDebt, deleteDebt, addCustomCategory } from './services/storageService';

// Lazy load dos componentes pesados
const TransactionList = lazy(() => import('./components/TransactionList'));
const Goals = lazy(() => import('./components/Goals'));
const Reports = lazy(() => import('./components/Reports'));
const FinancialCalendar = lazy(() => import('./components/FinancialCalendar'));
const BankList = lazy(() => import('./components/BankList'));
const CreditCardList = lazy(() => import('./components/CreditCardList'));
const InvestmentDashboard = lazy(() => import('./components/InvestmentDashboard'));
const BalanceSheet = lazy(() => import('./components/BalanceSheet'));
const AIChat = lazy(() => import('./components/AIChat'));
const Settings = lazy(() => import('./components/Settings'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
  </div>
);

function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  // Save data when it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Transaction Handlers
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = addTransaction(t);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, newT] }));
  };

  const handleAddMultipleTransactions = (ts: Omit<Transaction, 'id'>[]) => {
    const newTs = addMultipleTransactions(ts);
    setData(prev => ({ ...prev, transactions: [...prev.transactions, ...newTs] }));
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  // Goal Handlers
  const handleAddGoal = (g: Omit<Goal, 'id'>) => {
    const newG = addGoal(g);
    setData(prev => ({ ...prev, goals: [...prev.goals, newG] }));
  };

  const handleUpdateGoal = (g: Goal) => {
    updateGoal(g);
    setData(prev => ({ ...prev, goals: prev.goals.map(goal => goal.id === g.id ? g : goal) }));
  };

  // Account Handlers
  const handleAddAccount = (a: Omit<Account, 'id'>) => {
    const newA = addAccount(a);
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newA] }));
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  };

  // Credit Card Handlers
  const handleAddCreditCard = (c: Omit<CreditCard, 'id'>) => {
    const newC = addCreditCard(c);
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newC] }));
  };

  const handleDeleteCreditCard = (id: string) => {
    deleteCreditCard(id);
    setData(prev => ({ ...prev, creditCards: prev.creditCards.filter(c => c.id !== id) }));
  };

  // Investment Handlers
  const handleAddInvestment = (i: Omit<Investment, 'id' | 'history'>) => {
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
  const handleAddProperty = (p: Omit<Property, 'id'>) => {
    const newP = addProperty(p);
    setData(prev => ({ ...prev, properties: [...prev.properties, newP] }));
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setData(prev => ({ ...prev, properties: prev.properties.filter(p => p.id !== id) }));
  };

  // Debt Handlers
  const handleAddDebt = (d: Omit<Debt, 'id'>) => {
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

  const handleLogout = () => {
    // Clear sensitive data if needed
    console.log('Logout realizado');
  };

  const renderCurrentView = () => {
    const viewComponent = (() => {
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
              currentUserId="user1" // You can implement user management later
            />
          );
        case 'BANKS':
          return (
            <BankList 
              accounts={data.accounts}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              onUpdateAccount={(account: Account) => {
                // For now, delete and re-add since we don't have updateAccount
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
    })();

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {viewComponent}
      </Suspense>
    );
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
