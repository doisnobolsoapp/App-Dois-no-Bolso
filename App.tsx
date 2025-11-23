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
  loadData, saveData, addTransaction, addMultipleTransactions, deleteTransaction,
  addGoal, updateGoal,
  addAccount, deleteAccount,
  addCreditCard, deleteCreditCard,
  addInvestment, addInvestmentMovement, deleteInvestment,
  addProperty, deleteProperty,
  addDebt, deleteDebt,
  addCustomCategory
} from './services/storageService';

// Versão temporária para deploy
const OnlineStatus = () => null;
const PWAInstallPrompt = () => null;
const usePWA = () => ({
  isOnline: true,
  isStandalone: false,
  showUpdatePrompt: false,
  updateApp: () => {}
});

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

  const { isOnline, isStandalone } = usePWA();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser as User);
    setIsLoading(false);

    if ('serviceWorker' in navigator) {
      const isProd =
        !window.location.href.includes('localhost') &&
        !window.location.href.includes('127.0.0.1');

      if (isProd) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(reg => console.log('Service Worker registrado:', reg))
          .catch(err => console.log('Erro SW:', err));
      }
    }
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

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
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const handleAddGoal = (g: any) => {
    const newG = addGoal(g);
    setData(prev => ({ ...prev, goals: [...prev.goals, newG] }));
  };

  const handleUpdateGoal = (g: any) => {
    updateGoal(g);
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => (goal.id === g.id ? g : goal))
    }));
  };

  const handleAddAccount = (a: any) => {
    const newA = addAccount(a);
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newA] }));
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id)
    }));
  };

  const handleAddCreditCard = (c: any) => {
    const newC = addCreditCard(c);
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newC] }));
  };

  const handleDeleteCreditCard = (id: string) => {
    deleteCreditCard(id);
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(cc => cc.id !== id)
    }));
  };

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
    const updated = addInvestmentMovement(invId, type, qty, price, date, notes);
    if (updated) {
      setData(prev => ({
        ...prev,
        investments: prev.investments.map(i =>
          i.id === invId ? updated : i
        )
      }));
    }
  };

  const handleDeleteInvestment = (id: string) => {
    deleteInvestment(id);
    setData(prev => ({
      ...prev,
      investments: prev.investments.filter(i => i.id !== id)
    }));
  };

  const handleAddProperty = (p: any) => {
    const newP = addProperty(p);
    setData(prev => ({ ...prev, properties: [...prev.properties, newP] }));
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setData(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== id)
    }));
  };

  const handleAddDebt = (d: any) => {
    const newD = addDebt(d);
    setData(prev => ({ ...prev, debts: [...prev.debts, newD] }));
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };

  const handleAddCategory = (cat: string) => {
    addCustomCategory(cat);
    setData(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, cat]
    }));
  };

  if (!user) {
    return (
      <>
        <OnlineStatus />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-brand-500 ro
