// App.tsx
import { useEffect, useState } from 'react';
import { AppData, ViewState, Account, CreditCard } from './types';
import Layout from "./components/Layout";
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

import { OnlineStatus } from './components/OnlineStatus';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import AccountSettings from './components/AccountSettings';

const usePWA = () => {
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
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOnline, isStandalone } = usePWA();

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = () => {
      try {
        const currentUser = authService?.getCurrentUser ? authService.getCurrentUser() : null;
        if (currentUser) {
          setUser(currentUser as User);
        }
      } catch (error) {
        console.warn('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Configurar Service Worker apenas em produção
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const isProduction =
        typeof window !== 'undefined' &&
        !window.location.href.includes('localhost') &&
        !window.location.href.includes('127.0.0.1');

      if (isProduction) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('✅ Service Worker registrado:', registration);
          })
          .catch(error => {
            console.warn('⚠️ Erro no Service Worker:', error);
          });
      }
    }
  }, []);

  // Salvar dados quando houver mudanças
  useEffect(() => {
    try {
      saveData(data);
    } catch (err) {
      console.warn('⚠️ Erro ao salvar dados:', err);
    }
  }, [data]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    try {
      if (authService && typeof authService.logout === 'function') {
        authService.logout();
      }
    } catch (error) {
      console.warn('Erro durante logout:', error);
    } finally {
      setUser(null);
    }
  };

  // Transaction handlers
  const handleAddTransaction = (transactionData: any) => {
    try {
      const newTransaction = addTransaction(transactionData);
      setData(prev => ({ 
        ...prev, 
        transactions: [...prev.transactions, newTransaction] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const handleAddMultipleTransactions = (transactions: any[]) => {
    try {
      const newTransactions = addMultipleTransactions(transactions);
      setData(prev => ({ 
        ...prev, 
        transactions: [...prev.transactions, ...newTransactions] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar múltiplas transações:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = (id: string) => {
    try {
      deleteTransaction(id);
      setData(prev => ({ 
        ...prev, 
        transactions: prev.transactions.filter(tx => tx.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar transação:', error);
      throw error;
    }
  };

  // Goals
  const handleAddGoal = (goalData: any) => {
    try {
      const newGoal = addGoal(goalData);
      setData(prev => ({ 
        ...prev, 
        goals: [...prev.goals, newGoal] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar meta:', error);
      throw error;
    }
  };

  const handleUpdateGoal = (goalData: any) => {
    try {
      updateGoal(goalData);
      setData(prev => ({ 
        ...prev, 
        goals: prev.goals.map(goal => 
          goal.id === goalData.id ? goalData : goal
        ) 
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar meta:', error);
      throw error;
    }
  };

  // Accounts
  const handleAddAccount = (accountData: any) => {
    try {
      const newAccount = addAccount(accountData);
      setData(prev => ({ 
        ...prev, 
        accounts: [...prev.accounts, newAccount] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar conta:', error);
      throw error;
    }
  };

  const handleDeleteAccount = (id: string) => {
    try {
      deleteAccount(id);
      setData(prev => ({ 
        ...prev, 
        accounts: prev.accounts.filter(acc => acc.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar conta:', error);
      throw error;
    }
  };

  // NOVA FUNÇÃO: Atualizar conta
  const handleUpdateAccount = (accountData: any) => {
    try {
      // Primeiro deleta a conta antiga
      deleteAccount(accountData.id);
      // Depois adiciona a conta atualizada
      const updatedAccount = addAccount(accountData);
      setData(prev => ({
        ...prev,
        accounts: prev.accounts.map(acc => 
          acc.id === accountData.id ? updatedAccount : acc
        )
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar conta:', error);
      throw error;
    }
  };

  // Credit cards
  const handleAddCreditCard = (cardData: any) => {
    try {
      const newCard = addCreditCard(cardData);
      setData(prev => ({ 
        ...prev, 
        creditCards: [...prev.creditCards, newCard] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar cartão:', error);
      throw error;
    }
  };

  const handleDeleteCreditCard = (id: string) => {
    try {
      deleteCreditCard(id);
      setData(prev => ({ 
        ...prev, 
        creditCards: prev.creditCards.filter(cc => cc.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar cartão:', error);
      throw error;
    }
  };

  // Investments - CORRIGIDO: função com apenas 1 parâmetro
  const handleAddInvestment = (investmentData: any) => {
    try {
      const newInvestment = addInvestment(investmentData);
      setData(prev => ({ 
        ...prev, 
        investments: [...prev.investments, newInvestment] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar investimento:', error);
      throw error;
    }
  };

  // CORREÇÃO: Esta função agora recebe apenas 1 argumento
  const handleAddInvestmentMovement = (invId: string) => {
    try {
      const updatedInv = addInvestmentMovement(invId); // APENAS 1 ARGUMENTO
      if (updatedInv) {
        setData(prev => ({ 
          ...prev, 
          investments: prev.investments.map(inv => 
            inv.id === invId ? updatedInv : inv
          ) 
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar movimento de investimento:', error);
      throw error;
    }
  };

  const handleDeleteInvestment = (id: string) => {
    try {
      deleteInvestment(id);
      setData(prev => ({ 
        ...prev, 
        investments: prev.investments.filter(inv => inv.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar investimento:', error);
      throw error;
    }
  };

  // Properties & Debts
  const handleAddProperty = (propertyData: any) => {
    try {
      const newProperty = addProperty(propertyData);
      setData(prev => ({ 
        ...prev, 
        properties: [...prev.properties, newProperty] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar propriedade:', error);
      throw error;
    }
  };

  const handleDeleteProperty = (id: string) => {
    try {
      deleteProperty(id);
      setData(prev => ({ 
        ...prev, 
        properties: prev.properties.filter(pp => pp.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar propriedade:', error);
      throw error;
    }
  };

  const handleAddDebt = (debtData: any) => {
    try {
      const newDebt = addDebt(debtData);
      setData(prev => ({ 
        ...prev, 
        debts: [...prev.debts, newDebt] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar dívida:', error);
      throw error;
    }
  };

  const handleDeleteDebt = (id: string) => {
    try {
      deleteDebt(id);
      setData(prev => ({ 
        ...prev, 
        debts: prev.debts.filter(dd => dd.id !== id) 
      }));
    } catch (error) {
      console.error('❌ Erro ao deletar dívida:', error);
      throw error;
    }
  };

  // Custom categories
  const handleAddCategory = (category: string) => {
    try {
      addCustomCategory(category);
      // Recarregar dados para incluir a nova categoria
      setData(loadData());
    } catch (error) {
      console.error('❌ Erro ao adicionar categoria:', error);
      throw error;
    }
  };

  // Se usuário não estiver logado, mostrar login
  if (!user && !isLoading) {
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

  // FUNÇÃO PARA LIDAR COM ADIÇÃO DE CONTAS NO AccountSettings
  const handleAddAccountFromSettings = (accountData: any) => {
    try {
      // A função addAccount já deve lidar com a criação do ID e estrutura completa
      const newAccount = addAccount(accountData);
      setData(prev => ({ 
        ...prev, 
        accounts: [...prev.accounts, newAccount] 
      }));
    } catch (error) {
      console.error('❌ Erro ao adicionar conta do AccountSettings:', error);
      throw error;
    }
  };

  // Render views
  const renderCurrentView = () => {
    const viewProps = {
      dashboard: <Dashboard data={data} onViewChange={setCurrentView} />,
      transactions: (
        <TransactionList
          data={data}
          onAddTransaction={handleAddTransaction}
          onAddMultipleTransactions={handleAddMultipleTransactions}
          onDeleteTransaction={handleDeleteTransaction}
          onAddCategory={handleAddCategory}
        />
      ),
      goals: (
        <Goals 
          goals={data.goals} 
          onAddGoal={handleAddGoal} 
          onUpdateGoal={handleUpdateGoal} 
        />
      ),
      reports: <Reports data={data} />,
      calendar: (
        <FinancialCalendar
          data={data}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          currentUserId={user?.id || 'user1'}
        />
      ),
      banks: (
        <BankList
          accounts={data.accounts}
          onAddAccount={handleAddAccount}
          onDeleteAccount={handleDeleteAccount}
          onUpdateAccount={(account: Account) => {
            deleteAccount(account.id);
            addAccount(account);
            setData(prev => ({
              ...prev,
              accounts: prev.accounts.map(a => (a.id === account.id ? account : a))
            }));
          }}
        />
      ),
      cards: (
        <CreditCardList
          cards={data.creditCards}
          onAddCreditCard={handleAddCreditCard}
          onDeleteCreditCard={handleDeleteCreditCard}
          onUpdateCreditCard={(card: CreditCard) => {
            deleteCreditCard(card.id);
            addCreditCard(card);
            setData(prev => ({
              ...prev,
              creditCards: prev.creditCards.map(c => (c.id === card.id ? card : c))
            }));
          }}
        />
      ),
      investments: (
        <InvestmentDashboard
          data={data}
          onAddInvestment={handleAddInvestment}
          onAddMovement={handleAddInvestmentMovement}
          onDeleteInvestment={handleDeleteInvestment}
          onAddTransaction={handleAddTransaction}
        />
      ),
      balance: (
        <BalanceSheet
          data={data}
          onAddProperty={handleAddProperty}
          onDeleteProperty={handleDeleteProperty}
          onAddDebt={handleAddDebt}
          onDeleteDebt={handleDeleteDebt}
        />
      ),
      chat: (
        <AIChat
          data={data}
          onAddTransaction={handleAddTransaction}
          onAddGoal={handleAddGoal}
          onAddInvestment={handleAddInvestment}
        />
      ),
      settings: <Settings data={data} onDataUpdate={setData} />,
      // AccountSettings com todas as props necessárias
      accountSettings: (
        <AccountSettings 
          accounts={data.accounts}
          onAddAccount={handleAddAccountFromSettings}
          onDeleteAccount={handleDeleteAccount}
          onUpdateAccount={handleUpdateAccount}
        />
      )
    };

    return viewProps[currentView] || viewProps.dashboard;
  };

  return (
    <>
      <OnlineStatus />
      <PWAInstallPrompt />

      <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout}
      >
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
            {isStandalone && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">App</span>
            )}
          </div>
        </footer>
      </Layout>
    </>
  );
}

export default App;
