import { useEffect, useState, lazy, Suspense } from 'react';
import { AppData, ViewState, Transaction, Goal, Account, CreditCard, Investment, Property, Debt } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

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
  // ... resto do código permanece igual

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
    })();

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {viewComponent}
      </Suspense>
    );
  };

  // ... resto do código
}
