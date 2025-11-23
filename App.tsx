import React, { useEffect, useState } from 'react';
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


const usePWA = () => ({
isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
isStandalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
showUpdatePrompt: false,
updateApp: () => {}
});


interface User {
id: string;
name: string;
email: string;
token?: string;
}


export default App;
