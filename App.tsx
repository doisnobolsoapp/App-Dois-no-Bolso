import { useEffect, useState } from 'react';
import { AppData, ViewState, Transaction, Goal, Account, CreditCard, Investment, Property, Debt } from './types';
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
import { Login } from './components/Login'; // ADICIONE ESTA LINHA
import { authService } from './services/authService'; // ADICIONE ESTA LINHA
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
  const [user, setUser] = useState<User | null>(null); // ADICIONE ESTE STATE
  const [isLoading, setIsLoading] = useState(true); // ADICIONE ESTE STATE

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

  // Logout handler - ATUALIZE ESTA FUNÇÃO
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    console.log('Logout realizado');
  };

  // ... (mantenha TODOS os handlers existentes de transações, metas, etc.)

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
