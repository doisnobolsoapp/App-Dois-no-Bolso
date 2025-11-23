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
}

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  creditCards: CreditCard[];
  investments: Investment[];
  properties: Property[];
  debts: Debt[];
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
  // remova createdAt se não existe na interface original
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  // remova createdAt se não existe
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  // remova createdAt se não existe
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
  // remova createdAt se não existe
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  initialValue: number;
  currentValue?: number; // torne opcional se não é usado
  purchaseDate: string;
}

export interface Property {
  id: string;
  name: string;
  value: number;
  purchaseDate: string;
  // remova createdAt se não existe
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  // remova createdAt se não existe
}

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer';
export type ViewState = 'dashboard' | 'transactions' | 'goals' | 'investments' | 'debts' | 'settings';
