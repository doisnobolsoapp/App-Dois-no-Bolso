// types.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
}

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  creditCards: CreditCard[];
  investments: Investment[];
  properties: Property[];
  debts: Debt[];
  customCategories?: string[];
  userMode?: 'INDIVIDUAL' | 'COUPLE';
  language?: string;
  userPreferences?: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  accountId?: string;
  cardId?: string;
  installments?: {
    current: number;
    total: number;
  };
  notificationSent?: boolean;
  createdBy?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  initialBalance: number;
  institution?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  initialValue: number;
  currentValue: number;
  purchaseDate: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  broker?: string;
  strategy?: string;
  history?: any[];
}

export interface Property {
  id: string;
  name: string;
  value: number;
  purchaseDate: string;
  currentValue?: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
}

export type TransactionType = 'income' | 'expense' | 'investment' | 'loan';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer' | 'pix';
export type ViewState = 'dashboard' | 'transactions' | 'goals' | 'investments' | 'balance' | 'settings' | 'reports' | 'calendar' | 'banks' | 'cards' | 'chat';
export type InvestmentType = 'FIXED_INCOME' | 'STOCK' | 'FII' | 'CRYPTO' | 'FUND' | 'PENSION' | 'SAVINGS' | 'INTERNATIONAL' | 'OTHER';
export type InvestmentStrategy = 'RESERVE' | 'LONG_TERM' | 'SHORT_TERM' | 'SWING_TRADE' | 'HOLD';
export type Category = string;
